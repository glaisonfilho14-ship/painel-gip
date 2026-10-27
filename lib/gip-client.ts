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

export type ChamadasPendentes = { pendentes: number; total: number };

export async function buscarChamadasPendentes(
  turmaId: string,
  token: string,
): Promise<ChamadasPendentes> {
  const hoje = hojeNoBrasil();
  const [ano, mes] = hoje.split("-").map(Number);
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const datas = Array.from(
    { length: diasNoMes },
    (_, i) => `${ano}-${String(mes).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  );

  const resultados = await Promise.all(
    datas.map((data) => buscarAulasDoDia(turmaId, data, token)),
  );

  const aulas = resultados.flat();
  return {
    total: aulas.length,
    pendentes: aulas.filter((a) => !a.attendance_given).length,
  };
}
