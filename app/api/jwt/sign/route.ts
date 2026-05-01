import { NextRequest, NextResponse } from "next/server";
import { signJWT } from "@/lib/jwt/index";
import type { JWTPayload } from "@/lib/jwt/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payload, key, options } = body as {
      payload: JWTPayload;
      key: string;
      options?: Record<string, unknown>;
    };

    if (!payload || !key) {
      return NextResponse.json(
        { error: "payload and key are required" },
        { status: 400 }
      );
    }

    const token = await signJWT(payload, key, options ?? {});
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sign failed" },
      { status: 500 }
    );
  }
}
