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
