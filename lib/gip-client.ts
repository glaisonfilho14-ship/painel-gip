const GIP_API_URL = "https://lms-production-api.alicerceedu.com";

type AulaDoDia = { attendance_given: boolean };

function hojeNoBrasil() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function bearer(token: string) {
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

async function buscarAulasDoDia(
  turmaId: string,
  data: string,
  token: string,
): Promise<AulaDoDia[]> {
  try {
    const res = await fetch(
      `${GIP_API_URL}/daily-class?order=dc.start_time&size=9999&class_id=${turmaId}&date=${data}`,
      {
        headers: {
          Authorization: bearer(token),
          Accept: "application/json, text/plain, */*",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.items ?? [];
  } catch {
    return [];
  }
}

export type ChamadasPendentes = {
  pendentes: number;
  total: number;
  diasPendentes: string[];
};

export async function buscarChamadasPendentes(
  turmaId: string,
  token: string,
): Promise<ChamadasPendentes> {
  const hoje = hojeNoBrasil();
  const [ano, mes, diaHoje] = hoje.split("-").map(Number);
  const datas = Array.from(
    { length: diaHoje },
    (_, i) => `${ano}-${String(mes).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  );

  const resultados = await Promise.all(
    datas.map(async (data) => ({ data, aulas: await buscarAulasDoDia(turmaId, data, token) })),
  );

  const diasComAula = resultados.filter((d) => d.aulas.length > 0);
  const aulas = diasComAula.flatMap((d) => d.aulas);
  const diasPendentes = diasComAula
    .filter((d) => d.aulas.some((a) => !a.attendance_given))
    .map((d) => d.data);

  return {
    total: aulas.length,
    pendentes: aulas.filter((a) => !a.attendance_given).length,
    diasPendentes,
  };
}

export async function buscarQuantidadeAlunos(
  turmaId: string,
  token: string,
): Promise<number | null> {
  try {
    const res = await fetch(`${GIP_API_URL}/class/${turmaId}`, {
      headers: {
        Authorization: bearer(token),
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.enrollments) ? json.enrollments.length : null;
  } catch {
    return null;
  }
}

export type Planejamento = { feito: boolean; periodo: string } | null;

type Periodo = {
  name: string;
  start_date: string;
  end_date: string;
  plan: { document_link: string } | null;
};

export async function buscarPlanejamento(
  turmaId: string,
  token: string,
): Promise<Planejamento> {
  try {
    const res = await fetch(
      `${GIP_API_URL}/sprint/periods?page=0&size=10&class_id=${turmaId}`,
      {
        headers: {
          Authorization: bearer(token),
          Accept: "application/json, text/plain, */*",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const periodos: Periodo[] = json.items?.sprint?.periods ?? [];
    const hoje = new Date();
    const atual = periodos.find(
      (p) => hoje >= new Date(p.start_date) && hoje <= new Date(p.end_date),
    );
    if (!atual) return null;
    return { feito: Boolean(atual.plan?.document_link), periodo: atual.name };
  } catch {
    return null;
  }
}
