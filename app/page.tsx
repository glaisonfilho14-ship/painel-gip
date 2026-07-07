"use client";

import { useState } from "react";

const ESCOLAS = [
  {
    nome: "Chico Mendes",
    turmas: ["3454", "3462", "3452", "3465", "3456", "3464", "3466"],
  },
  {
    nome: "Victor Issler",
    turmas: ["3470", "3474", "3472", "3476", "3478", "3477", "3479"],
  },
];

const TURMAS = ESCOLAS.flatMap((escola) => escola.turmas);

const FAROL_URL = "https://production.d1ljmz1utniczm.amplifyapp.com/";

type Modo = "gip" | "presencas" | "metas" | "farol";

const MODOS: { id: Modo; label: string; buildUrl?: (id: string) => string }[] = [
  {
    id: "gip",
    label: "Visão Geral (GIP)",
    buildUrl: (id) => `https://gip.eduquest.dev/diretorio/turmas/${id}`,
  },
  {
    id: "presencas",
    label: "Modo Chamada (Presenças)",
    buildUrl: (id) => `https://gip.eduquest.dev/presencas/turma/${id}`,
  },
  {
    id: "metas",
    label: "Metas de Aprendizagem",
    buildUrl: (id) => `https://gip.eduquest.dev/metasdeaprendizagem/turma/${id}`,
  },
  { id: "farol", label: "Farol de Aprendizagem" },
];

const MODO_ACCENT: Record<Modo, string> = {
  gip: "bg-sky-600 hover:bg-sky-500 focus-visible:outline-sky-400",
  presencas: "bg-violet-600 hover:bg-violet-500 focus-visible:outline-violet-400",
  metas: "bg-rose-600 hover:bg-rose-500 focus-visible:outline-rose-400",
  farol: "bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-400",
};

const BATCH_SIZE = 3;

export default function Home() {
  const [modo, setModo] = useState<Modo>("gip");
  const [indice, setIndice] = useState(0);

  const modoAtual = MODOS.find((m) => m.id === modo)!;

  function mudarModo(novoModo: Modo) {
    setModo(novoModo);
    setIndice(0);
  }

  function abrirProximoBloco() {
    if (!modoAtual.buildUrl) return;

    if (indice >= TURMAS.length) {
      setIndice(0);
      return;
    }

    const limite = Math.min(indice + BATCH_SIZE, TURMAS.length);
    for (let i = indice; i < limite; i++) {
      window.open(modoAtual.buildUrl(TURMAS[i]), "_blank");
    }
    setIndice(limite);
  }

  const concluido = indice >= TURMAS.length;
  const proximoBloco = Math.floor(indice / BATCH_SIZE) + 1;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Gestão de Turmas — GIP
        </h1>
        <p className="mt-3 text-sm text-neutral-400 sm:text-base">
          Alterne entre os modos de trabalho para acessar rapidamente as páginas de
          cada turma.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {MODOS.map((m) => {
            const ativa = m.id === modo;
            return (
              <button
                key={m.id}
                onClick={() => mudarModo(m.id)}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  ativa
                    ? `${MODO_ACCENT[m.id]} text-white`
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {modo === "farol" ? (
          <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
            <h3 className="text-lg font-semibold text-white">
              Acompanhamento de Metas por Quinzena
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Acesse o sistema externo para validar as metas e analisar os sprints
              de todas as {TURMAS.length} turmas centralizadas.
            </p>
            <a
              href={FAROL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-xl bg-orange-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-orange-950/40 transition-colors hover:bg-orange-500"
            >
              Abrir Farol de Aprendizagem
            </a>
          </div>
        ) : (
          <>
            {ESCOLAS.map((escola) => (
              <div key={escola.nome} className="mt-10">
                <h2 className="mb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {escola.nome}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {escola.turmas.map((id) => (
                    <a
                      key={id}
                      href={modoAtual.buildUrl!(id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-lg px-3 py-3.5 text-sm font-semibold text-white transition-colors ${MODO_ACCENT[modo]}`}
                    >
                      Turma {id}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-10 border-t border-neutral-800 pt-8">
              <button
                onClick={abrirProximoBloco}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-500"
              >
                Abrir Próximas {BATCH_SIZE} Turmas
              </button>
              <p className="mt-3 text-sm text-neutral-400">
                {concluido
                  ? "Concluído! Todas as abas deste modo foram abertas."
                  : `Progresso: próximo clique abrirá o bloco ${proximoBloco}.`}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
