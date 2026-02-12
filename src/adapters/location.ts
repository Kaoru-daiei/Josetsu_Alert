/** 位置（緯度・経度） */
export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

/** 位置取得の抽象化（ブラウザ / ネイティブで実装を差し替え） */
export interface LocationAdapter {
  getCurrentPosition(): Promise<GeoPosition>;
  watchPosition(onUpdate: (position: GeoPosition) => void): (() => void) | void;
}

/** ブラウザ用: Geolocation API */
export const browserLocationAdapter: LocationAdapter = {
  getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("お使いの環境では位置情報を利用できません"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolve({
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
            accuracy: p.coords.accuracy,
            timestamp: p.timestamp,
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    });
  },

  watchPosition(onUpdate: (position: GeoPosition) => void): () => void {
    if (!navigator.geolocation) return () => {};
    const id = navigator.geolocation.watchPosition(
      (p) =>
        onUpdate({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          accuracy: p.coords.accuracy,
          timestamp: p.timestamp,
        }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  },
};
