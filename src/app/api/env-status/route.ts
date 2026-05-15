import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ENV_VARS = [
  { key: "OPENAI_API_KEY",                  required: true,  hint: "Powers AI finding enrichment" },
  { key: "OPENAI_MODEL",                    required: false, hint: "Default: gpt-4o-mini" },
  { key: "NEXT_PUBLIC_ETHERSCAN_API_KEY",   required: false, hint: "On-chain contract fetch" },
  { key: "CREATEOS_APP_ID",                 required: false, hint: "CreateOS deployment identifier" },
  { key: "CREATEOS_ENV",                    required: false, hint: "production | staging | development" },
  { key: "CREATEOS_REGION",                 required: false, hint: "Deployment region e.g. us-east-1" },
];

export async function GET() {
  const result = ENV_VARS.map((v) => ({
    ...v,
    set: Boolean(process.env[v.key]),
  }));
  return NextResponse.json(result);
}
