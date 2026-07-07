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

const FAROL_URL = "https://production.d1ljmz1utniczm.amplifyapp.com/";

type ModoId =
  | "gip"
  | "presencas"
  | "metas"
  | "planejamento"
  | "estagios"
  | "checkpoint";

const MODOS: {
  id: ModoId;
  label: string;
  sigla: string;
  accent: string;
  buildUrl: (id: string) => string;
}[] = [
  {
    id: "gip",
    label: "Visão Geral (GIP)",
    sigla: "GIP",
    accent: "bg-sky-600 hover:bg-sky-500",
    buildUrl: (id) => `https://gip.eduquest.dev/diretorio/turmas/${id}`,
  },
  {
    id: "presencas",
    label: "Modo Chamada (Presenças)",
    sigla: "Presenças",
    accent: "bg-violet-600 hover:bg-violet-500",
    buildUrl: (id) => `https://gip.eduquest.dev/presencas/turma/${id}`,
  },
  {
    id: "metas",
    label: "Metas de Aprendizagem",
    sigla: "Metas",
    accent: "bg-rose-600 hover:bg-rose-500",
    buildUrl: (id) => `https://gip.eduquest.dev/metasdeaprendizagem/turma/${id}`,
  },
  {
    id: "planejamento",
    label: "Planejamento de Aula",
    sigla: "Planejamento",
    accent: "bg-amber-600 hover:bg-amber-500",
    buildUrl: (id) => `https://gip.eduquest.dev/planejamento-aula/turma/${id}`,
  },
  {
    id: "estagios",
    label: "Estágios de Vida",
    sigla: "Estágios",
    accent: "bg-teal-600 hover:bg-teal-500",
    buildUrl: (id) => `https://gip.eduquest.dev/estagios-de-vida/turma/${id}`,
  },
  {
    id: "checkpoint",
    label: "Checkpoint",
    sigla: "Checkpoint",
    accent: "bg-indigo-600 hover:bg-indigo-500",
    buildUrl: (id) => `https://gip.eduquest.dev/portfolio-atividades/turma/${id}`,
  },
];

type View = { type: "escola"; index: number } | { type: "farol" };

export default function Home() {
  const [view, setView] = useState<View>({ type: "escola", index: 0 });

  function abrirTodas(modo: (typeof MODOS)[number], turmas: string[]) {
    turmas.forEach((id) => window.open(modo.buildUrl(id), "_blank"));
  }

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-10 sm:flex-row sm:px-8 sm:py-12">
      <aside className="mb-8 flex shrink-0 flex-row gap-2 overflow-x-auto sm:mb-0 sm:mr-8 sm:w-56 sm:flex-col sm:gap-1 sm:overflow-visible">
        <h1 className="hidden text-lg font-semibold tracking-tight text-white sm:mb-4 sm:block">
          Turmas — GIP
        </h1>

        {ESCOLAS.map((escola, index) => {
          const ativa = view.type === "escola" && view.index === index;
          return (
            <button
              key={escola.nome}
              onClick={() => setView({ type: "escola", index })}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:w-full ${
                ativa
                  ? "bg-white text-neutral-900"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {escola.nome}
            </button>
          );
        })}

        <div className="hidden border-t border-neutral-800 sm:my-3 sm:block" />

        <button
          onClick={() => setView({ type: "farol" })}
          className={`shrink-0 rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:w-full ${
            view.type === "farol"
              ? "bg-orange-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          Farol de Aprendizagem
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        {view.type === "farol" ? (
          <div className="max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
            <h3 className="text-lg font-semibold text-white">
              Acompanhamento de Metas por Quinzena
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Acesse o sistema externo para validar as metas e analisar os sprints
              de todas as turmas centralizadas.
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
          (() => {
            const escola = ESCOLAS[view.index];
            return (
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {escola.nome}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {MODOS.map((modo) => (
                    <button
                      key={modo.id}
                      onClick={() => abrirTodas(modo, escola.turmas)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-colors ${modo.accent}`}
                    >
                      Abrir todas — {modo.sigla}
                    </button>
                  ))}
                </div>

                <div className="mt-6 divide-y divide-neutral-800 rounded-xl border border-neutral-800">
                  {escola.turmas.map((id) => (
                    <div
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                      <span className="text-sm font-semibold text-white">
                        Turma {id}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {MODOS.map((modo) => (
                          <a
                            key={modo.id}
                            href={modo.buildUrl(id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-colors ${modo.accent}`}
                          >
                            {modo.sigla}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </main>
  );
}
