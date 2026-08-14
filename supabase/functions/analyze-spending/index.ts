import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  ALAN_CLIENT_ID,
  ANALYSIS_VERSION,
  type MissionCandidate,
  type AlanAnalysisResult,
  type AlanActionResult,
  type AlanResult,
  extractJson,
  validateAlanAnalysisResult,
  validateAlanActionResult,
  createDataFingerprint,
  callAlan,
} from "./helpers.ts";

import { createAnalysisPrompt, createActionPrompt } from "./prompts.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return jsonResponse(
        {
          success: false,
          reason: "method_not_allowed",
          message: "POST 요청만 사용할 수 있습니다.",
        },
        405,
      );
    }

    try {
      // 1. ALAN 설정 확인
      if (!ALAN_CLIENT_ID) {
        return jsonResponse(
          {
            success: false,
            reason: "missing_alan_client_id",
            message: "AI 설정을 확인할 수 없습니다.",
          },
          500,
        );
      }

      // 2. 요청값
      const body = await req.json();

      const analysisType = body?.analysisType ?? "monthly";
      const periodStart = body?.periodStart;
      const periodEnd = body?.periodEnd;

      if (!["weekly", "monthly", "custom"].includes(analysisType)) {
        return jsonResponse(
          {
            success: false,
            reason: "invalid_analysis_type",
            message: "분석 유형을 확인할 수 없습니다.",
          },
          400,
        );
      }

      if (typeof periodStart !== "string" || typeof periodEnd !== "string") {
        return jsonResponse(
          {
            success: false,
            reason: "invalid_period",
            message: "분석 기간을 확인할 수 없습니다.",
          },
          400,
        );
      }

      // 3. DB 집계 RPC
      const { data: calculatedData, error: calculationError } =
        await ctx.supabase.rpc("get_spending_analysis_data", {
          p_analysis_type: analysisType,
          p_period_start: periodStart,
          p_period_end: periodEnd,
        });

      if (calculationError || !calculatedData) {
        console.error(
          "spending calculation failed:",
          calculationError?.message,
        );

        return jsonResponse(
          {
            success: false,
            reason: "calculation_failed",
            message: "소비 분석 데이터를 계산하지 못했습니다.",
          },
          500,
        );
      }

      const expenseCategories = Array.isArray(calculatedData.expenseCategories)
        ? calculatedData.expenseCategories
        : [];

      const expenseCategoryCount = expenseCategories.length;

      const {
        data: { user },
        error: userError,
      } = await ctx.supabase.auth.getUser();

      if (userError || !user) {
        return jsonResponse(
          {
            success: false,
            reason: "auth_user_not_found",
            message: "로그인 사용자 정보를 확인할 수 없습니다.",
          },
          401,
        );
      }

      // 소비 자체가 없음
      if (calculatedData.dataQuality?.currentStatus === "NO_DATA") {
        return jsonResponse({
          success: true,
          analysisAvailable: false,
          reason: "NO_DATA",
          calculatedData,
          analysis: null,
        });
      }

      const dataFingerprint = await createDataFingerprint({
        version: ANALYSIS_VERSION,
        analysisType,
        periodStart,
        periodEnd,
        calculatedData,
      });

      // 4. AI Capability 결정
      const currentStatus = calculatedData.dataQuality?.currentStatus;

      const canUseStrongPatternLanguage = currentStatus === "SUFFICIENT";

      const canComparePeriods = calculatedData.comparison?.available === true;

      const canCompareCategories = expenseCategoryCount >= 2;

      const focusGoal =
        Array.isArray(calculatedData.focusGoals) &&
        calculatedData.focusGoals.length > 0
          ? calculatedData.focusGoals[0]
          : null;

      const canPredictGoal = focusGoal?.prediction?.status === "AVAILABLE";

      // 5. 미션 후보 조회
      const candidateCategories =
        calculatedData.missionContext?.candidateCategories ?? [];

      const categoryCodes = Array.isArray(candidateCategories)
        ? candidateCategories
            .map((item: { code?: string }) => item?.code)
            .filter((code: unknown): code is string => typeof code === "string")
        : [];

      let missionCandidates: MissionCandidate[] = [];

      if (categoryCodes.length > 0) {
        const { data: missionRows, error: missionError } = await ctx.supabase
          .from("mission_templates")
          .select(
            `
                id,
                code,
                title,
                description,
                category_code,
                target_type,
                target_value,
                unit
              `,
          )
          .eq("is_active", true)
          .in("category_code", categoryCodes)
          .order("sort_order", { ascending: true });

        if (missionError) {
          console.error(
            "mission candidate query failed:",
            missionError.message,
          );
        } else {
          missionCandidates = (missionRows ?? []) as MissionCandidate[];
        }
      }

      const allowedMissionCodes = new Set(
        missionCandidates.map(mission => mission.code),
      );

      const { data: existingReport, error: existingReportError } =
        await ctx.supabase
          .from("analysis_reports")
          .select(
            `
      id,
      analysis_type,
      period_start,
      period_end,
      home_summary,
      summary,
      detail,
      insight,
      prediction,
      action_suggestion,
      feedback,
      recommended_mission_template_id,
      mission_message,
      model_name,
      status,
      created_at,
      data_fingerprint
    `,
          )
          .eq("user_id", user.id)
          .eq("analysis_type", analysisType)
          .eq("period_start", periodStart)
          .eq("period_end", periodEnd)
          .eq("data_fingerprint", dataFingerprint)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (existingReportError) {
        console.error(
          "existing analysis report query failed:",
          existingReportError.message,
        );

        return jsonResponse(
          {
            success: false,
            reason: "existing_report_query_failed",
            message: "기존 소비 분석 결과를 확인하지 못했습니다.",
          },
          500,
        );
      }
      if (existingReport) {
        const recommendedMission =
          existingReport.recommended_mission_template_id
            ? (missionCandidates.find(
                mission =>
                  mission.id === existingReport.recommended_mission_template_id,
              ) ?? null)
            : null;

        return jsonResponse({
          success: true,
          reused: true,
          calculatedData,

          analysis: {
            homeSummary: existingReport.home_summary ?? "",
            summary: existingReport.summary,
            detail: existingReport.detail ?? "",
            insight: existingReport.insight,
            prediction: existingReport.prediction ?? "",
            actionSuggestion: existingReport.action_suggestion ?? "",
            feedback: existingReport.feedback ?? "",

            mission: recommendedMission
              ? {
                  templateCode: recommendedMission.code,
                  message:
                    existingReport.mission_message ??
                    recommendedMission.description ??
                    recommendedMission.title,
                }
              : null,
          },

          recommendedMission,
          report: existingReport,
        });
      }

      // 6. ALAN 1차 - 소비 분석
      const analysisData = {
        reliability: currentStatus,

        expenseTotal: calculatedData.totals?.expenseAmount ?? 0,

        facts: {
          highestExpenseCategory:
            calculatedData.facts?.highestExpenseCategory ?? null,

          lowestExpenseCategory:
            calculatedData.facts?.lowestExpenseCategory ?? null,

          topContentInHighestCategory:
            calculatedData.facts?.topContentInHighestCategory ?? null,
        },

        categories: expenseCategories
          .slice(0, 5)
          .map(
            (category: {
              code: string;
              name: string;
              amount: number;
              count: number;
              sharePercent: number;
            }) => ({
              code: category.code,
              name: category.name,
              amount: category.amount,
              count: category.count,
              share: category.sharePercent,
            }),
          ),

        comparison: canComparePeriods
          ? {
              available: true,
              expenseChangePercent:
                calculatedData.comparison?.expenseChangePercent ?? null,
              categoryChanges:
                calculatedData.comparison?.categoryChanges?.slice(0, 3) ?? [],
            }
          : {
              available: false,
            },

        capabilities: {
          strongPattern: canUseStrongPatternLanguage,
          periodComparison: canComparePeriods,
          categoryComparison: canCompareCategories,
        },
      };

      const analysisPrompt = createAnalysisPrompt(analysisData);

      const firstAlan = await callAlan(analysisPrompt, "ALAN analysis");

      if (!firstAlan.success) {
        return jsonResponse(
          {
            success: false,
            reason: firstAlan.reason,
            message: firstAlan.message,
          },
          firstAlan.status,
        );
      }

      let firstParsed: unknown;

      try {
        firstParsed = extractJson(firstAlan.answer);
      } catch {
        console.error("ALAN analysis JSON parse failed:", firstAlan.answer);

        return jsonResponse(
          {
            success: false,
            reason: "invalid_analysis_json",
            message: "AI 소비 분석 결과 형식을 확인할 수 없습니다.",
          },
          502,
        );
      }

      let analysisPart: AlanAnalysisResult;

      try {
        analysisPart = validateAlanAnalysisResult(firstParsed);
      } catch (error) {
        console.error(
          "ALAN analysis validation failed:",
          error instanceof Error ? error.message : String(error),
        );

        return jsonResponse(
          {
            success: false,
            reason: "invalid_analysis_result",
            message: "AI 소비 분석 결과가 올바르지 않습니다.",
          },
          502,
        );
      }

      const actionData = {
        r: currentStatus,

        c: expenseCategories
          .slice(0, 3)
          .map(
            (category: {
              code: string;
              name: string;
              amount: number;
              sharePercent: number;
            }) => [
              category.code,
              category.name,
              category.amount,
              category.sharePercent,
            ],
          ),

        g: focusGoal
          ? [
              focusGoal.title,
              focusGoal.targetAmount,
              focusGoal.currentAmount,
              focusGoal.progressPercent,
              focusGoal.prediction?.status ?? null,
              canPredictGoal
                ? (focusGoal.prediction?.estimatedCompletionDate ?? null)
                : null,
              canPredictGoal
                ? (focusGoal.prediction?.scheduleStatus ?? null)
                : null,
            ]
          : null,

        p: canPredictGoal,

        m: missionCandidates.map(mission => mission.code),
      };

      const actionPrompt = createActionPrompt(actionData);

      const secondAlan = await callAlan(actionPrompt, "ALAN action");

      if (!secondAlan.success) {
        return jsonResponse(
          {
            success: false,
            reason: secondAlan.reason,
            message: secondAlan.message,
          },
          secondAlan.status,
        );
      }

      let secondParsed: unknown;

      try {
        secondParsed = extractJson(secondAlan.answer);
      } catch {
        console.error("ALAN action JSON parse failed:", secondAlan.answer);

        return jsonResponse(
          {
            success: false,
            reason: "invalid_action_json",
            message: "AI 실행 분석 결과 형식을 확인할 수 없습니다.",
          },
          502,
        );
      }

      let actionPart: AlanActionResult;

      try {
        actionPart = validateAlanActionResult(
          secondParsed,
          allowedMissionCodes,
        );
      } catch (error) {
        console.error(
          "ALAN action validation failed:",
          error instanceof Error ? error.message : String(error),
        );

        return jsonResponse(
          {
            success: false,
            reason: "invalid_action_result",
            message: "AI 실행 분석 결과가 허용 범위를 벗어났습니다.",
          },
          502,
        );
      }

      // 8. ALAN 두 응답 합치기
      const analysisResult: AlanResult = {
        homeSummary: analysisPart.homeSummary.trim(),
        summary: analysisPart.summary,
        detail: analysisPart.detail,
        insight: analysisPart.insight,

        prediction: actionPart.prediction,
        actionSuggestion: actionPart.actionSuggestion,
        feedback: actionPart.feedback,

        mission: actionPart.mission,
      };

      // 10. 추천 미션 FK 결정
      const recommendedMission = analysisResult.mission
        ? (missionCandidates.find(
            mission => mission.code === analysisResult.mission?.templateCode,
          ) ?? null)
        : null;

      // 11. analysis_reports 저장

      const { data: report, error: reportError } = await ctx.supabase
        .from("analysis_reports")
        .insert({
          user_id: user.id,

          analysis_type: analysisType,
          period_start: periodStart,
          period_end: periodEnd,

          data_fingerprint: dataFingerprint,
          calculated_data: calculatedData,

          home_summary: analysisResult.homeSummary,
          summary: analysisResult.summary,
          detail: analysisResult.detail,
          insight: analysisResult.insight,

          prediction: analysisResult.prediction,
          action_suggestion: analysisResult.actionSuggestion,
          feedback: analysisResult.feedback,

          recommended_mission_template_id: recommendedMission?.id ?? null,

          mission_message: analysisResult.mission?.message ?? null,

          model_name: "alan",
          status: "completed",
        })
        .select(
          `
              id,
              analysis_type,
              period_start,
              period_end,
              home_summary,
              summary,
              insight,
              detail,
              prediction,
              feedback,
              mission_message,
              data_fingerprint,
              action_suggestion,
              recommended_mission_template_id,
              model_name,
              status,
              created_at
            `,
        )
        .single();

      if (reportError?.code === "23505") {
        const { data: concurrentReport, error: concurrentError } =
          await ctx.supabase
            .from("analysis_reports")
            .select(
              `
        id,
        analysis_type,
        period_start,
        period_end,
        home_summary, 
        summary,
        detail,
        insight,
        prediction,
        action_suggestion,
        feedback,
        recommended_mission_template_id,
        mission_message,
        model_name,
        status,
        created_at,
        data_fingerprint
      `,
            )
            .eq("user_id", user.id)
            .eq("analysis_type", analysisType)
            .eq("period_start", periodStart)
            .eq("period_end", periodEnd)
            .eq("data_fingerprint", dataFingerprint)
            .eq("status", "completed")
            .maybeSingle();

        if (!concurrentError && concurrentReport) {
          const concurrentMission =
            concurrentReport.recommended_mission_template_id
              ? (missionCandidates.find(
                  mission =>
                    mission.id ===
                    concurrentReport.recommended_mission_template_id,
                ) ?? null)
              : null;

          return jsonResponse({
            success: true,
            reused: true,
            calculatedData,
            analysis: {
              homeSummary: concurrentReport.home_summary ?? "",
              summary: concurrentReport.summary,
              detail: concurrentReport.detail ?? "",
              insight: concurrentReport.insight,
              prediction: concurrentReport.prediction ?? "",
              actionSuggestion: concurrentReport.action_suggestion ?? "",
              feedback: concurrentReport.feedback ?? "",
              mission: concurrentMission
                ? {
                    templateCode: concurrentMission.code,
                    message:
                      concurrentReport.mission_message ??
                      concurrentMission.description ??
                      concurrentMission.title,
                  }
                : null,
            },
            recommendedMission: concurrentMission,
            report: concurrentReport,
          });
        }
      }

      if (reportError) {
        console.error("analysis report save failed:", reportError.message);

        return jsonResponse(
          {
            success: false,
            reason: "report_save_failed",
            message: "AI 분석 결과를 저장하지 못했습니다.",
          },
          500,
        );
      }

      // 12. 최종 반환
      return jsonResponse({
        success: true,
        calculatedData,
        analysis: analysisResult,
        recommendedMission,
        report,
      });
    } catch (error) {
      console.error(
        "analyze-spending server error:",
        error instanceof Error ? error.message : String(error),
      );

      return jsonResponse(
        {
          success: false,
          reason: "server_error",
          message: "소비 분석 요청을 처리하지 못했습니다.",
        },
        500,
      );
    }
  }),
};
