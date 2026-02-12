import type { Accident, AccidentWithDistance } from "../types/accident";
import { distanceMeters } from "./distance";

/**
 * 現在地から閾値以内の事故を距離順で返す（コア層・プラットフォーム非依存）
 */
export function getNearbyAccidents(
  accidents: Accident[],
  currentLat: number,
  currentLon: number,
  thresholdMeters: number
): AccidentWithDistance[] {
  const withDistance: AccidentWithDistance[] = accidents.map((a) => ({
    ...a,
    distanceMeters: distanceMeters(currentLat, currentLon, a.latitude, a.longitude),
  }));
  return withDistance
    .filter((a) => a.distanceMeters <= thresholdMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
