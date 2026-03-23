import { NextResponse } from "next/server";
import { verifyAdminPassword, setAdminSession } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = adminLoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const { password } = result.data;

    // Verify password
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Set session cookie
    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
