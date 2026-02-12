import { Link } from "react-router-dom";
import { useSettings, THRESHOLD_OPTIONS } from "../contexts/SettingsContext";
import "./SettingsScreen.css";

export function SettingsScreen() {
  const { thresholdMeters, setThresholdMeters } = useSettings();

  return (
    <main className="settings-screen">
      <h1 className="settings-title">設定</h1>

      <section className="settings-section">
        <h2 className="settings-heading">通知する距離</h2>
        <p className="settings-desc">この距離以内に事故地点があるとお知らせします。</p>
        <div className="threshold-options">
          {THRESHOLD_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              className={`btn-threshold ${thresholdMeters === m ? "active" : ""}`}
              onClick={() => setThresholdMeters(m)}
            >
              {m}m
            </button>
          ))}
        </div>
      </section>

      <Link to="/" className="settings-back">
        戻る
      </Link>
    </main>
  );
}
