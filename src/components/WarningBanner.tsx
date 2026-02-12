import { useState } from "react";
import type { AccidentWithDistance } from "../types/accident";
import "./WarningBanner.css";

interface WarningBannerProps {
  nearbyAccidents: AccidentWithDistance[];
}

export function WarningBanner({ nearbyAccidents }: WarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || nearbyAccidents.length === 0) return null;

  const nearest = nearbyAccidents[0];

  return (
    <div className="warning-banner">
      <button
        className="warning-banner-close"
        onClick={() => setDismissed(true)}
        aria-label="閉じる"
        type="button"
      >
        ×
      </button>
      <div className="warning-banner-content">
        <strong className="warning-banner-title">⚠ 警告</strong>
        <p className="warning-banner-message">
          約{Math.round(nearest.distanceMeters)}m先に事故履歴があります
          {nearbyAccidents.length > 1 &&
            `（他${nearbyAccidents.length - 1}件）`}
        </p>
      </div>
    </div>
  );
}
