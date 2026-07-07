import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { texto } = await req.json();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || !texto) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: texto }),
  });

  const data = await res.json();
  return NextResponse.json({ ok: data.ok === true }, { status: data.ok ? 200 : 502 });
}
