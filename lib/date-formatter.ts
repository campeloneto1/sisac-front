/**
 * Formata uma data para o formato brasileiro (dd/MM/yyyy)
 * @param date - String de data no formato ISO ou null/undefined
 * @returns Data formatada no padrão brasileiro ou "—" se não informado
 */
export function formatBrazilianDate(date?: string | null): string {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(new Date(date));
  } catch {
    return "—";
  }
}

/**
 * Formata uma data e hora para o formato brasileiro (dd/MM/yyyy HH:mm)
 * @param date - String de data no formato ISO ou null/undefined
 * @returns Data e hora formatadas no padrão brasileiro ou "—" se não informado
 */
export function formatBrazilianDateTime(date?: string | null): string {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return "—";
  }
}

/**
 * Formata um período de datas para o formato brasileiro
 * @param startDate - Data de início
 * @param endDate - Data de fim
 * @returns Período formatado (ex: "01/04/2026 até 13/04/2026")
 */
export function formatBrazilianDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  const start = formatBrazilianDate(startDate);
  const end = formatBrazilianDate(endDate);

  if (start === "—" && end === "—") return "—";
  if (start === "—") return `até ${end}`;
  if (end === "—") return `a partir de ${start}`;

  return `${start} até ${end}`;
}
