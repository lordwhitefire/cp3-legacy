import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const scriptPath = path.resolve(process.cwd(), "scripts/generate-data.ts");
    execSync(`npx tsx "${scriptPath}"`, {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 30000,
      env: { ...process.env },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Revalidation failed:", err);
    return NextResponse.json(
      { message: "Revalidation failed", error: err.message },
      { status: 500 }
    );
  }
}
