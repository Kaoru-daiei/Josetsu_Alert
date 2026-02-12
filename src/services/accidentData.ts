import type { Accident } from "../types/accident";

/** 事故データを取得（静的JSON。将来はAPIに差し替え可能） */
export async function fetchAccidents(): Promise<Accident[]> {
  const res = await fetch("/data/accidents.json");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** 既存データから次のIDを生成 */
export async function generateNextId(): Promise<string> {
  const accidents = await fetchAccidents();
  let maxNum = 0;
  for (const a of accidents) {
    const match = a.id.match(/(\d+)$/);
    if (match) {
      maxNum = Math.max(maxNum, Number(match[1]));
    }
  }
  return `route17-${maxNum + 1}`;
}

/** 事故データをdevサーバー経由で保存 */
export async function saveAccident(accident: Accident): Promise<void> {
  const res = await fetch("/api/accidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(accident),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "保存に失敗しました");
  }
}
