import "@supabase/functions-js/edge-runtime.d.ts";

export const ALAN_CLIENT_ID = Deno.env.get("ALAN_CLIENT_ID");

const ALAN_API_URL =
  "https://kdt-api-function.azurewebsites.net/api/v1/question";

export const ANALYSIS_VERSION = "v1";

export type MissionCandidate = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  category_code: string | null;
  target_type: string;
  target_value: number | null;
  unit: string | null;
};

export type AlanAnalysisResult = {
  summary: string;
  detail: string;
  insight: string;
};

export type AlanActionResult = {
  prediction: string;
  actionSuggestion: string;
  feedback: string;
  mission: {
    templateCode: string;
    message: string;
  } | null;
};

export type AlanResult = {
  summary: string;
  detail: string;
  insight: string;
  prediction: string;
  actionSuggestion: string;
  feedback: string;
  mission: {
    templateCode: string;
    message: string;
  } | null;
};

export function extractJson(text: string): unknown {
  const trimmed = text.trim();

  // 정상 JSON
  try {
    return JSON.parse(trimmed);
  } catch {
    // markdown code fence
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  // 앞뒤 설명이 붙은 경우 마지막 방어
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start !== -1 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new Error("INVALID_JSON");
}

export function validateAlanAnalysisResult(value: unknown): AlanAnalysisResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_ANALYSIS_RESPONSE");
  }

  const result = value as Record<string, unknown>;

  if (
    typeof result.summary !== "string" ||
    typeof result.detail !== "string" ||
    typeof result.insight !== "string"
  ) {
    throw new Error("INVALID_ANALYSIS_RESPONSE");
  }

  return {
    summary: result.summary,
    detail: result.detail,
    insight: result.insight,
  };
}

export function validateAlanActionResult(
  value: unknown,
  allowedMissionCodes: Set<string>,
): AlanActionResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_ACTION_RESPONSE");
  }

  const result = value as Record<string, unknown>;

  if (
    typeof result.prediction !== "string" ||
    typeof result.actionSuggestion !== "string" ||
    typeof result.feedback !== "string"
  ) {
    throw new Error("INVALID_ACTION_RESPONSE");
  }

  let mission: AlanActionResult["mission"] = null;

  if (result.mission !== null && result.mission !== undefined) {
    if (typeof result.mission !== "object" || Array.isArray(result.mission)) {
      throw new Error("INVALID_MISSION_RESPONSE");
    }

    const missionValue = result.mission as Record<string, unknown>;

    if (
      typeof missionValue.templateCode !== "string" ||
      typeof missionValue.message !== "string"
    ) {
      throw new Error("INVALID_MISSION_RESPONSE");
    }

    if (!allowedMissionCodes.has(missionValue.templateCode)) {
      throw new Error("UNALLOWED_MISSION");
    }

    mission = {
      templateCode: missionValue.templateCode,
      message: missionValue.message,
    };
  }

  return {
    prediction: result.prediction,
    actionSuggestion: result.actionSuggestion,
    feedback: result.feedback,
    mission,
  };
}

export async function createDataFingerprint(value: unknown): Promise<string> {
  const text = JSON.stringify(value);
  const bytes = new TextEncoder().encode(text);

  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function callAlan(
  prompt: string,
  label: string,
): Promise<
  | { success: true; answer: string }
  | {
      success: false;
      status: number;
      reason: string;
      message: string;
    }
> {
  console.log(`${label} prompt length:`, prompt.length);

  const alanUrl = new URL(ALAN_API_URL);

  alanUrl.searchParams.set("content", prompt);
  alanUrl.searchParams.set("client_id", ALAN_CLIENT_ID!);

  const response = await fetch(alanUrl.toString(), {
    method: "GET",
  });

  const rawText = await response.text();

  let json: unknown;

  try {
    json = JSON.parse(rawText);
  } catch {
    console.error(
      `${label} response JSON parse failed:`,
      rawText.slice(0, 2000),
    );

    return {
      success: false,
      status: 502,
      reason: "invalid_ai_response",
      message: "AI 응답을 확인할 수 없습니다.",
    };
  }

  console.log(`${label} response:`, JSON.stringify(json).slice(0, 2000));

  if (!response.ok) {
    if (response.status === 429) {
      return {
        success: false,
        status: 429,
        reason: "rate_limited",
        message:
          "AI 요청이 많아 잠시 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    return {
      success: false,
      status: 502,
      reason: "ai_request_failed",
      message: "AI 소비 분석 요청을 처리하지 못했습니다.",
    };
  }

  const result = json as Record<string, unknown>;

  if (typeof result.answer !== "string" || !result.answer.trim()) {
    return {
      success: false,
      status: 502,
      reason: "invalid_ai_response",
      message: "AI 분석 결과를 확인할 수 없습니다.",
    };
  }

  return {
    success: true,
    answer: result.answer,
  };
}
