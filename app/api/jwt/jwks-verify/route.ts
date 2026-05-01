import { NextRequest, NextResponse } from "next/server";
import { jwksVerify } from "@/lib/jwt/jwks";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }
    const result = await jwksVerify(token);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
