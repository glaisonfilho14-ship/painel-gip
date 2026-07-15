"use client";

import { useEffect, useState, type ReactNode } from "react";

const ESCOLAS = [
  {
    nome: "João Belchior",
    turmas: ["4329", "4328", "3425"],
  },
  {
    nome: "Décio Martins",
    turmas: ["3255", "3252", "3264", "3263", "3462", "3261"],
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
  solid: string;
  badge: string;
  icon: ReactNode;
  buildUrl: (id: string) => string;
}[] = [
  {
    id: "gip",
    label: "Visão Geral (GIP)",
    sigla: "GIP",
    solid: "bg-sky-600 hover:bg-sky-500",
    badge:
      "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/25 hover:bg-sky-500/20",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
        <path
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
        />
        <circle cx="10" cy="10" r="2.3" strokeWidth="1.6" />
      </svg>
    ),
    buildUrl: (id) => `https://gip.eduquest.dev/diretorio/turmas/${id}`,
  },
  {
    id: "presencas",
    label: "Modo Chamada (Presenças)",
    sigla: "Presenças",
    solid: "bg-violet-600 hover:bg-violet-500",
    badge:
      "bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/25 hover:bg-violet-500/20",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
        <path
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 10.5l3.5 3.5L16 5.5"
        />
      </svg>
    ),
    buildUrl: (id) => `https://gip.eduquest.dev/presencas/turma/${id}`,
  },
  {
    id: "metas",
    label: "Metas de Aprendizagem",
    sigla: "Metas",
    solid: "bg-rose-600 hover:bg-rose-500",
    badge:
      "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/25 hover:bg-rose-500/20",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
        <path
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 2.5v15M4.5 3.5h10l-2.3 3 2.3 3h-10"
        />
      </svg>
    ),
    buildUrl: (id) => `https://gip.eduquest.dev/metasdeaprendizagem/turma/${id}`,
  },
  {
    id: "planejamento",
    label: "Planejamento de Aula",
    sigla: "Planejamento",
    solid: "bg-amber-600 hover:bg-amber-500",
    badge:
      "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25 hover:bg-amber-500/20",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
        <rect x="2.5" y="4" width="15" height="13.5" rx="2" strokeWidth="1.6" />
        <path strokeWidth="1.6" strokeLinecap="round" d="M2.5 8h15M7 2.2v3M13 2.2v3" />
      </svg>
    ),
    buildUrl: (id) => `https://gip.eduquest.dev/planejamento-aula/turma/${id}`,
  },
  {
    id: "estagios",
    label: "Estágios de Vida",
    sigla: "Estágios",
    solid: "bg-teal-600 hover:bg-teal-500",
    badge:
      "bg-teal-500/10 text-teal-300 ring-1 ring-inset ring-teal-500/25 hover:bg-teal-500/20",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
        <path
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.5 14.5l5-5 3.2 3.2L18 5.5"
        />
        <path
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12.5 5.5H18v5.5"
        />
      </svg>
    ),
    buildUrl: (id) => `https://gip.eduquest.dev/estagios-de-vida/turma/${id}`,
  },
  {
    id: "checkpoint",
    label: "Checkpoint",
    sigla: "Checkpoint",
    solid: "bg-indigo-600 hover:bg-indigo-500",
    badge:
      "bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/25 hover:bg-indigo-500/20",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
        <rect x="4" y="3.2" width="12" height="14.5" rx="2" strokeWidth="1.6" />
        <path strokeWidth="1.6" d="M7.3 2.3h5.4v2.6H7.3z" />
        <path
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 11l2 2 4-4"
        />
      </svg>
    ),
    buildUrl: (id) => `https://gip.eduquest.dev/portfolio-atividades/turma/${id}`,
  },
];

type View = { type: "escola"; index: number } | { type: "farol" };

type StatusEnvio = "idle" | "enviando" | "enviado" | "erro";

function chaveDoDia() {
  return `relatorio-${new Date().toISOString().slice(0, 10)}`;
}

export default function Home() {
  const [view, setView] = useState<View>({ type: "escola", index: 0 });
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [statusEnvio, setStatusEnvio] = useState<StatusEnvio>("idle");

  useEffect(() => {
    const salvo = localStorage.getItem(chaveDoDia());
    if (salvo) setObservacoes(JSON.parse(salvo));
  }, []);

  useEffect(() => {
    localStorage.setItem(chaveDoDia(), JSON.stringify(observacoes));
  }, [observacoes]);

  function abrirTodas(modo: (typeof MODOS)[number], turmas: string[]) {
    turmas.forEach((id) => window.open(modo.buildUrl(id), "_blank"));
  }

  async function enviarRelatorioCompleto(escolaNome: string, turmas: string[]) {
    const preenchidas = turmas.filter((id) => (observacoes[id] || "").trim());
    if (preenchidas.length === 0) return;

    const linhas = preenchidas.map(
      (id) => `Turma ${id}: ${observacoes[id].trim()}`,
    );

    const mensagem = [
      "📋 Relatório de entrega",
      `Escola: ${escolaNome}`,
      "",
      ...linhas,
    ].join("\n");

    setStatusEnvio("enviando");
    try {
      const res = await fetch("/api/relatorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: mensagem }),
      });
      const data = await res.json();
      setStatusEnvio(data.ok ? "enviado" : "erro");
    } catch {
      setStatusEnvio("erro");
    }
    setTimeout(() => setStatusEnvio("idle"), 4000);
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:flex-row sm:gap-8 sm:px-8 sm:py-12">
      <aside className="flex shrink-0 flex-col gap-1 sm:w-60">
        <div className="mb-4 hidden sm:block">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Painel GIP
          </h1>
          <p className="text-xs text-neutral-500">Acessos por turma</p>
        </div>

        <div className="flex flex-row gap-1.5 overflow-x-auto rounded-xl bg-white/[0.03] p-1.5 ring-1 ring-inset ring-white/10 sm:flex-col sm:overflow-visible">
          {ESCOLAS.map((escola, index) => {
            const ativa = view.type === "escola" && view.index === index;
            return (
              <button
                key={escola.nome}
                onClick={() => setView({ type: "escola", index })}
                className={`shrink-0 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors sm:w-full ${
                  ativa
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                }`}
              >
                {escola.nome}
              </button>
            );
          })}

          <div className="mx-1 hidden border-t border-white/10 sm:my-1 sm:block" />

          <button
            onClick={() => setView({ type: "farol" })}
            className={`shrink-0 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors sm:w-full ${
              view.type === "farol"
                ? "bg-orange-500/15 text-orange-300"
                : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
            }`}
          >
            Farol de Aprendizagem
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {view.type === "farol" ? (
          <div className="max-w-xl rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent p-8 ring-1 ring-inset ring-orange-500/20">
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
            const revisadas = escola.turmas.filter((id) =>
              (observacoes[id] || "").trim(),
            ).length;

            return (
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {escola.nome}
                  </h2>
                  <span className="text-sm text-neutral-500">
                    {revisadas} de {escola.turmas.length} revisadas
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {MODOS.map((modo) => (
                    <button
                      key={modo.id}
                      onClick={() => abrirTodas(modo, escola.turmas)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/5 hover:text-neutral-200"
                    >
                      {modo.icon}
                      Abrir todas — {modo.sigla}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      enviarRelatorioCompleto(escola.nome, escola.turmas)
                    }
                    disabled={revisadas === 0 || statusEnvio === "enviando"}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3.5 w-3.5 fill-none stroke-current"
                    >
                      <path
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.5 17.5l2-5.8L2.5 2.5l15 7.5-15 7.5Z"
                      />
                    </svg>
                    {statusEnvio === "enviando"
                      ? "Enviando..."
                      : "Enviar relatório completo"}
                  </button>

                  {statusEnvio === "enviado" && (
                    <span className="text-xs font-medium text-emerald-400">
                      ✅ Enviado
                    </span>
                  )}
                  {statusEnvio === "erro" && (
                    <span className="text-xs font-medium text-red-400">
                      ⚠️ Falha ao enviar
                    </span>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {escola.turmas.map((id) => {
                    const revisada = Boolean((observacoes[id] || "").trim());
                    return (
                    <div
                      key={id}
                      className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10 transition-colors hover:ring-white/20"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          Turma {id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            revisada
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-neutral-800 text-neutral-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${revisada ? "bg-emerald-400" : "bg-neutral-500"}`}
                          />
                          {revisada ? "Revisado" : "Pendente"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {MODOS.map((modo) => (
                          <a
                            key={modo.id}
                            href={modo.buildUrl(id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${modo.badge}`}
                          >
                            {modo.icon}
                            {modo.sigla}
                          </a>
                        ))}
                      </div>

                      <div className="mt-3 border-t border-white/10 pt-3">
                        <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                          Observação da entrega
                        </label>
                        <textarea
                          value={observacoes[id] || ""}
                          onChange={(e) =>
                            setObservacoes((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                          placeholder="Escreva aqui o que encontrou na verificação..."
                          rows={2}
                          className="w-full resize-none rounded-lg bg-white/5 px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-white/25"
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </main>
  );
}
