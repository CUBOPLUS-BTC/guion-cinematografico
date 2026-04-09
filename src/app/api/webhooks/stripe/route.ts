import { NextResponse } from "next/server"

/** Placeholder — integrar Stripe CLI / eventos cuando exista billing. */
export async function POST() {
  return NextResponse.json(
    { error: "Webhook Stripe no implementado aún" },
    { status: 501 }
  )
}
