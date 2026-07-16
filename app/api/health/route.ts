import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { ok: false, erro: "Variáveis de ambiente do Telegram não configuradas" },
      { status: 503 },
    );
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const data = await res.json();

  if (!data.ok) {
    return NextResponse.json(
      { ok: false, erro: "Token do bot do Telegram inválido" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, bot: data.result.username });
}
