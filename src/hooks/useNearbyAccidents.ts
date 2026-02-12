import type { Accident } from "../types/accident";
import { getNearbyAccidents } from "../core/nearby";

export interface UseNearbyAccidentsOptions {
  /** 現在地（null のときは何もしない） */
  position: { latitude: number; longitude: number } | null;
  /** 事故一覧 */
  accidents: Accident[];
  /** 通知する距離（m） */
  thresholdMeters: number;
}

/**
 * 現在地から閾値以内の近隣事故を返す。
 * 音声は自動再生せず、UIのボタン押下で再生する。
 */
export function useNearbyAccidents(options: UseNearbyAccidentsOptions) {
  const { position, accidents, thresholdMeters } = options;
  if (!position || accidents.length === 0) return [];
  return getNearbyAccidents(
    accidents,
    position.latitude,
    position.longitude,
    thresholdMeters
  );
}
