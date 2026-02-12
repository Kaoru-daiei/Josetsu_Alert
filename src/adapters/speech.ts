/** 音声読み上げの抽象化（ブラウザ / ネイティブで実装を差し替え） */
export interface SpeechAdapter {
  speak(text: string): void;
  cancel(): void;
}

/** 利用可能な日本語音声のうち、より自然なものを選ぶ（Google / Microsoft 等を優先） */
function selectJapaneseVoice(): SpeechSynthesisVoice | null {
  const voices = typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis.getVoices()
    : [];
  const ja = voices.filter((v) => v.lang === "ja-JP" || v.lang.startsWith("ja"));
  if (ja.length === 0) return null;
  const prefer = (v: SpeechSynthesisVoice) => {
    const n = (v.name || "").toLowerCase();
    if (n.includes("google")) return 3;
    if (n.includes("microsoft") || n.includes("online")) return 2;
    if (n.includes("premium") || n.includes("enhanced")) return 1;
    return 0;
  };
  ja.sort((a, b) => prefer(b) - prefer(a));
  return ja[0];
}

let cachedJapaneseVoice: SpeechSynthesisVoice | null | undefined = undefined;

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (cachedJapaneseVoice !== undefined) return cachedJapaneseVoice;
  const syn = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  if (!syn) return null;
  const voices = syn.getVoices();
  if (voices.length === 0) {
    cachedJapaneseVoice = null;
    syn.addEventListener("voiceschanged", () => {
      cachedJapaneseVoice = selectJapaneseVoice();
    }, { once: true });
    return null;
  }
  cachedJapaneseVoice = selectJapaneseVoice();
  return cachedJapaneseVoice;
}

/** アラート通知用の効果音（約1.2秒・低-高を2回繰り返して緊張感を出す） */
const BEEP_ON = 0.22;
const BEEP_OFF = 0.08;
const LOW_HZ = 540;
const HIGH_HZ = 820;
const ALERT_DURATION_SEC = (BEEP_ON + BEEP_OFF) * 4;

export function playAlertSound(): Promise<void> {
  return new Promise((resolve) => {
    const Ctx =
      typeof window !== "undefined" &&
      (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    if (!Ctx || typeof Ctx !== "function") {
      resolve();
      return;
    }
    const ctx = new (Ctx as typeof AudioContext)();
    const t0 = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";

    gain.gain.setValueAtTime(0, t0);
    for (let i = 0; i < 4; i++) {
      const start = t0 + i * (BEEP_ON + BEEP_OFF);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
      gain.gain.setValueAtTime(0.14, start + BEEP_ON - 0.02);
      gain.gain.linearRampToValueAtTime(0.01, start + BEEP_ON);
      if (i < 3) gain.gain.setValueAtTime(0.01, start + BEEP_ON + BEEP_OFF);
    }
    gain.gain.setValueAtTime(0, t0 + ALERT_DURATION_SEC);

    const freqs = [LOW_HZ, HIGH_HZ, LOW_HZ, HIGH_HZ];
    for (let i = 0; i < 4; i++) {
      const start = t0 + i * (BEEP_ON + BEEP_OFF);
      osc.frequency.setValueAtTime(freqs[i], start);
    }
    osc.frequency.setValueAtTime(HIGH_HZ, t0 + ALERT_DURATION_SEC);

    osc.start(t0);
    osc.stop(t0 + ALERT_DURATION_SEC);

    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      try { ctx.close(); } catch { /* ignore */ }
      resolve();
    };
    osc.onended = done;
    setTimeout(done, ALERT_DURATION_SEC * 1000 + 150);
  });
}

/** ブラウザ用: Web Speech API (SpeechSynthesis) */
export const browserSpeechAdapter: SpeechAdapter = {
  speak(text: string): void {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 1.08;
    u.pitch = 1;
    const voice = getJapaneseVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  },

  cancel(): void {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  },
};
