import { useState, useEffect, useRef } from "react";
import type { GeoPosition } from "../adapters/location";
import { browserLocationAdapter } from "../adapters/location";

export interface UseGeolocationOptions {
  /** 監視を開始するか */
  watch?: boolean;
}

export interface UseGeolocationResult {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  requestPosition: () => void;
}

export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationResult {
  const { watch = true } = options;
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const lastRequestRef = useRef<number>(0);

  const requestPosition = () => {
    setLoading(true);
    setError(null);
    browserLocationAdapter
      .getCurrentPosition()
      .then((p) => {
        setPosition(p);
        lastRequestRef.current = Date.now();
      })
      .catch((err: GeolocationPositionError) => {
        const message =
          err.code === 1
            ? "位置情報の利用が許可されていません"
            : err.code === 2
              ? "位置情報を取得できませんでした"
              : "位置情報の取得がタイムアウトしました";
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    requestPosition();
  }, []);

  useEffect(() => {
    if (!watch || !position) return;
    const cleanup = browserLocationAdapter.watchPosition((p) => {
      setPosition(p);
    });
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [watch]);

  return { position, error, loading, requestPosition };
}
