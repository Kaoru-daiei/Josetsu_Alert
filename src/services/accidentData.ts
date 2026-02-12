import type { Accident } from "../types/accident";

/** 事故データを取得（静的JSON。将来はAPIに差し替え可能） */
export async function fetchAccidents(): Promise<Accident[]> {
  const res = await fetch("/data/accidents.json");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
