// Tiny CSV serializer. Values are stringified and quote-escaped.

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(
  rows: Record<string, unknown>[],
  columns: { key: string; header: string }[],
): string {
  const head = columns.map((c) => cell(c.header)).join(",");
  const body = rows
    .map((r) => columns.map((c) => cell(r[c.key])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
