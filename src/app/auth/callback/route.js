import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/sub-home";

  if (!next.startsWith("/")) {
    next = "/sub-home";
  }

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("OAuth 세션 교환 실패:", error);
  }

  return NextResponse.redirect(`${origin}/login`);
}
