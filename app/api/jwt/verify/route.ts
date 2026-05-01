import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt/index";
import type { VerifyOptions } from "@/lib/jwt/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, key, options } = body as {
      token: string;
      key: string;
      options?: VerifyOptions;
    };

    if (!token || !key) {
      return NextResponse.json(
        { error: "token and key are required" },
        { status: 400 }
      );
    }

    const result = await verifyJWT(token, key, options ?? {});
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verify failed" },
      { status: 500 }
    );
  }
}
