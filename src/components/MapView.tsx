import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Accident, AccidentWithDistance } from "../types/accident";
import "./MapView.css";

interface MapViewProps {
  currentPosition: { latitude: number; longitude: number } | null;
  accidents: Accident[];
  nearbyAccidents: AccidentWithDistance[];
  thresholdMeters: number;
}

export function MapView({
  currentPosition,
  accidents,
  nearbyAccidents,
  thresholdMeters,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const accidentLayersRef = useRef<L.LayerGroup | null>(null);

  // マップの初期化（マウント時のみ）
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // デフォルトの中心位置を決定
    const center: [number, number] = currentPosition
      ? [currentPosition.latitude, currentPosition.longitude]
      : accidents.length > 0
        ? [accidents[0].latitude, accidents[0].longitude]
        : [37.1788597, 138.9253202]; // フォールバック（国道17号の中心付近）

    // マップを作成
    const map = L.map(mapContainerRef.current).setView(center, 15);

    // OpenStreetMapタイルレイヤーを追加
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
    accidentLayersRef.current = L.layerGroup().addTo(map);

    // クリーンアップ
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 現在地マーカーの更新
  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;

    // 既存のマーカーを削除
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
    }

    // 現在地マーカーのアイコンを作成
    const icon = L.divIcon({
      className: "current-position-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // 現在地マーカーを追加
    const marker = L.marker(
      [currentPosition.latitude, currentPosition.longitude],
      { icon }
    ).addTo(mapRef.current);

    currentMarkerRef.current = marker;

    // 現在地に地図の中心を移動（アニメーション付き）
    mapRef.current.setView(
      [currentPosition.latitude, currentPosition.longitude],
      mapRef.current.getZoom(),
      { animate: true, duration: 0.5 }
    );
  }, [currentPosition]);

  // 事故マーカーと警告円の更新
  useEffect(() => {
    if (!mapRef.current || !accidentLayersRef.current) return;

    // 既存のレイヤーをクリア
    accidentLayersRef.current.clearLayers();

    // 各事故地点にマーカーを追加
    accidents.forEach((accident) => {
      const isNearby = nearbyAccidents.some((n) => n.id === accident.id);
      const nearbyData = nearbyAccidents.find((n) => n.id === accident.id);

      // マーカーアイコンを作成
      const icon = L.divIcon({
        className: isNearby
          ? "accident-marker accident-marker-warning"
          : "accident-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        html: '<div class="accident-marker-inner"></div>',
      });

      // マーカーを作成
      const marker = L.marker([accident.latitude, accident.longitude], {
        icon,
      });

      // ポップアップの内容を作成
      const popupContent = `
        <div class="accident-popup">
          <div class="accident-popup-category">${accident.category}</div>
          <div class="accident-popup-date">${accident.occurred_at}</div>
          <div class="accident-popup-description">${accident.description}</div>
          ${
            nearbyData
              ? `<div class="accident-popup-distance"><strong>距離: 約${Math.round(nearbyData.distanceMeters)}m</strong></div>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(accidentLayersRef.current!);

      // 近接している場合は警告円を追加
      if (isNearby) {
        L.circle([accident.latitude, accident.longitude], {
          radius: thresholdMeters,
          color: "#f00",
          fillColor: "#f00",
          fillOpacity: 0.15,
          weight: 2,
          opacity: 0.5,
        }).addTo(accidentLayersRef.current!);
      }
    });
  }, [accidents, nearbyAccidents, thresholdMeters]);

  return (
    <div className="map-view">
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
}
