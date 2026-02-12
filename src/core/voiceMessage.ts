import type { AccidentWithDistance } from "../types/accident";

/**
 * 1件用の読み上げテキストを生成
 * テンプレート: 「{description}。ご注意ください。」
 */
export function buildVoiceMessage(accident: AccidentWithDistance): string {
  const desc = accident.description.trim();
  if (!desc) return "過去に事故が発生しています。ご注意ください。";
  return `${desc}。ご注意ください。`;
}

/**
 * 複数件用の読み上げテキストを生成（件数＋全件読み上げ）
 * 例: 「付近に2件の事故履歴があります。1件目。…。2件目。…。ご注意ください。」
 */
export function buildVoiceMessageForMultiple(accidents: AccidentWithDistance[]): string {
  if (accidents.length === 0) return "";
  if (accidents.length === 1) return buildVoiceMessage(accidents[0]);
  const intro = `付近に${accidents.length}件の事故履歴があります。`;
  const parts = accidents.map((a, i) => {
    const desc = a.description.trim() || "過去に事故が発生しています";
    return `${i + 1}件目。${desc}。`;
  });
  return intro + parts.join(" ") + "ご注意ください。";
}
