import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Accident, AccidentWithDistance } from "../types/accident";
import { distanceMeters } from "../core/distance";
import { useGeolocation } from "../hooks/useGeolocation";
import { fetchAccidents } from "../services/accidentData";
import "./ListScreen.css";

export function ListScreen() {
  const { position } = useGeolocation({ watch: false });
  const [accidents, setAccidents] = useState<Accident[]>([]);

  useEffect(() => {
    fetchAccidents().then(setAccidents);
  }, []);

  const sorted: AccidentWithDistance[] = position
    ? [...accidents]
        .map((a) => ({
          ...a,
          distanceMeters: distanceMeters(
            position.latitude,
            position.longitude,
            a.latitude,
            a.longitude
          ),
        }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
    : accidents.map((a) => ({ ...a, distanceMeters: Infinity }));

  return (
    <main className="list-screen">
      <h1 className="list-title">事故一覧</h1>
      <p className="list-subtitle">
        {position
          ? "現在地から近い順に表示しています"
          : "位置情報を許可すると、距離順で表示されます"}
      </p>

      <ul className="accident-list">
        {sorted.map((acc) => (
          <li key={acc.id} className="accident-item">
            <span className="accident-distance">
              {typeof acc.distanceMeters === "number" && acc.distanceMeters < 100000
                ? `約${Math.round(acc.distanceMeters)}m`
                : "—"}
            </span>
            <div className="accident-body">
              <span className="accident-category">{acc.category}</span>
              <span className="accident-date">{acc.occurred_at}</span>
              <p className="accident-description">{acc.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {accidents.length === 0 && (
        <p className="list-empty">登録されている事故はありません。</p>
      )}

      <Link to="/" className="list-back">
        戻る
      </Link>
    </main>
  );
}
