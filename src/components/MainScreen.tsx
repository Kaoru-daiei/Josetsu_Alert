import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Accident } from "../types/accident";
import { buildVoiceMessageForMultiple } from "../core/voiceMessage";
import { browserSpeechAdapter, playAlertSound } from "../adapters/speech";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyAccidents } from "../hooks/useNearbyAccidents";
import { useSettings } from "../contexts/SettingsContext";
import { fetchAccidents } from "../services/accidentData";
import "./MainScreen.css";

export function MainScreen() {
  const { position, error, loading, requestPosition } = useGeolocation({ watch: true });
  const { voiceEnabled, setVoiceEnabled, thresholdMeters } = useSettings();
  const [accidents, setAccidents] = useState<Accident[]>([]);

  useEffect(() => {
    fetchAccidents().then(setAccidents);
  }, []);

  const nearby = useNearbyAccidents({ position, accidents, thresholdMeters });
  const nearest = nearby[0];

  const handlePlayVoice = async () => {
    if (nearby.length === 0) return;
    await playAlertSound();
    browserSpeechAdapter.speak(buildVoiceMessageForMultiple(nearby));
  };

  return (
    <main className="main-screen">
      <h1 className="main-title">除雪アラート</h1>

      {loading && !position && (
        <p className="status status-loading">位置情報を取得しています…</p>
      )}
      {error && (
        <div className="status status-error">
          <p>{error}</p>
          <button type="button" className="btn-retry" onClick={requestPosition}>
            再試行
          </button>
        </div>
      )}
      {position && !error && (
        <>
          <section className="status-card">
            {nearby.length === 0 ? (
              <p className="status status-ok">
                今、近くに事故履歴はありません。
              </p>
            ) : (
              <p className="status status-warn">
                {nearby.length === 1
                  ? `約${Math.round(nearest.distanceMeters)}m先に事故履歴が1件あります。`
                  : `付近に事故履歴が${nearby.length}件あります。最も近いものは約${Math.round(nearest.distanceMeters)}m先です。`}
              </p>
            )}
          </section>

          {nearby.length > 0 && (
            <section className="voice-section">
              <button
                type="button"
                className="btn-play-voice"
                onClick={handlePlayVoice}
                disabled={!voiceEnabled}
                title={voiceEnabled ? "最も近い事故の内容を音声で再生します" : "音声をONにすると再生できます"}
              >
                音声を再生
              </button>
            </section>
          )}

          <section className="voice-toggle-section">
            <span className="voice-label">音声で注意を喚起する</span>
            <button
              type="button"
              className={`btn-toggle ${voiceEnabled ? "on" : "off"}`}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? "ON" : "OFF"}
            </button>
          </section>
        </>
      )}

      <nav className="main-nav">
        <Link to="/list" className="nav-link">
          事故一覧
        </Link>
        <Link to="/settings" className="nav-link">
          設定
        </Link>
      </nav>
    </main>
  );
}
