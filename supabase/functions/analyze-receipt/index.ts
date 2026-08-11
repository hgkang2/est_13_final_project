import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async () => {
    if (!OPENAI_API_KEY) {
      return Response.json(
        {
          ok: false,
          error: "OPENAI_API_KEY is missing",
        },
        { status: 500 },
      );
    }

    return Response.json({
      ok: true,
      message: "OPENAI_API_KEY loaded",
    });
  }),
};
