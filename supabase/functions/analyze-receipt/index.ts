import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async req => {
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
      if (!OPENAI_API_KEY) {
        return jsonResponse(
          {
            success: false,
            reason: "missing_openai_api_key",
            message: "AI 설정을 확인할 수 없습니다.",
          },
          500,
        );
      }

      const body = await req.json();

      const imageDataUrl = body?.imageDataUrl;
      const transactionTypes = body?.transactionTypes;
      const categories = body?.categories;
      const paymentMethods = body?.paymentMethods;

      if (!imageDataUrl || typeof imageDataUrl !== "string") {
        return jsonResponse(
          {
            success: false,
            reason: "missing_image",
            message: "분석할 이미지를 확인할 수 없습니다.",
          },
          400,
        );
      }

      if (!imageDataUrl.startsWith("data:image/")) {
        return jsonResponse(
          {
            success: false,
            reason: "unsupported_file",
            message: "이미지 파일만 분석할 수 있습니다.",
          },
          400,
        );
      }

      if (!Array.isArray(transactionTypes) || transactionTypes.length === 0) {
        return jsonResponse(
          {
            success: false,
            reason: "missing_transaction_types",
            message: "거래 구분 정보를 확인할 수 없습니다.",
          },
          400,
        );
      }

      if (!Array.isArray(categories) || categories.length === 0) {
        return jsonResponse(
          {
            success: false,
            reason: "missing_categories",
            message: "카테고리 정보를 확인할 수 없습니다.",
          },
          400,
        );
      }

      if (!Array.isArray(paymentMethods)) {
        return jsonResponse(
          {
            success: false,
            reason: "invalid_payment_methods",
            message: "결제수단 정보를 확인할 수 없습니다.",
          },
          400,
        );
      }

      return jsonResponse({
        success: true,
        message: "AI 분석 요청 데이터를 정상적으로 받았습니다.",
        received: {
          hasImage: true,
          transactionTypeCount: transactionTypes.length,
          categoryCount: categories.length,
          paymentMethodCount: paymentMethods.length,
        },
      });
    } catch (error) {
      console.error("analyze-receipt error:", error);

      return jsonResponse(
        {
          success: false,
          reason: "server_error",
          message: "AI 분석 요청을 처리하지 못했습니다.",
        },
        500,
      );
    }
  }),
};
