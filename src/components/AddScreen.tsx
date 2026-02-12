import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import L from "leaflet";
import { generateNextId, saveAccident } from "../services/accidentData";
import "./AddScreen.css";

/** 国道17号付近のデフォルト中心 */
const DEFAULT_CENTER: [number, number] = [37.1788597, 138.9253202];
const DEFAULT_ZOOM = 14;

export function AddScreen() {
  const navigate = useNavigate();
  const [nextId, setNextId] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    generateNextId().then(setNextId);
  }, []);

  // マップ初期化
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      DEFAULT_CENTER,
      DEFAULT_ZOOM,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      placeMarker(map, e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const placeMarker = (map: L.Map, lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }
    setPosition({ lat, lng });
  };

  const handleGps = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16, { animate: true });
          placeMarker(mapRef.current, latitude, longitude);
        }
        setGpsLoading(false);
      },
      () => {
        setError("位置情報を取得できませんでした");
        setGpsLoading(false);
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!occurredAt) {
      setError("発生日を入力してください");
      return;
    }
    if (!description) {
      setError("説明を入力してください");
      return;
    }
    if (!position) {
      setError("地図をタップして位置を指定してください");
      return;
    }

    setSaving(true);
    try {
      await saveAccident({
        id: nextId,
        occurred_at: occurredAt,
        description,
        latitude: position.lat,
        longitude: position.lng,
      });
      navigate("/list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
      setSaving(false);
    }
  };

  return (
    <main className="add-screen">
      <h1 className="add-title">事故情報の登録</h1>

      <form className="add-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <span className="form-label">ID</span>
          <span className="form-id">{nextId || "読み込み中…"}</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="occurred-at">
            発生日
          </label>
          <input
            id="occurred-at"
            className="form-input"
            type="date"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            説明（音声読み上げテキスト）
          </label>
          <textarea
            id="description"
            className="form-textarea"
            placeholder="例: 2024年1月に除雪作業中の転落事故が発生しています"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <span className="form-label">発生場所</span>
          <p className="form-hint">地図をタップしてピンを置いてください</p>
          <div className="picker-map-container">
            <div ref={mapContainerRef} className="picker-map" />
          </div>
          <button
            type="button"
            className="btn-gps"
            onClick={handleGps}
            disabled={gpsLoading}
          >
            {gpsLoading ? "取得中…" : "現在地に移動"}
          </button>
          {position && (
            <span className="form-coords">
              {position.lat.toFixed(7)}, {position.lng.toFixed(7)}
            </span>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-submit" disabled={saving}>
          {saving ? "登録中…" : "登録する"}
        </button>
      </form>

      <Link to="/" className="add-back">
        戻る
      </Link>
    </main>
  );
}
