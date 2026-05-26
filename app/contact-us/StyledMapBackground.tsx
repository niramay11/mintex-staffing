"use client";
import React, { useEffect, useRef, useState } from "react";

interface LabelInfo { x: number; y: number }
interface Props {
  onPinReady?: (x: number, y: number) => void;
  onPinClick?: () => void;
}

export default function StyledMapBackground({ onPinReady, onPinClick }: Props) {
  const wrapRef        = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [pinPos,   setPinPos]   = useState<LabelInfo | null>(null);
  const [labelPos, setLabelPos] = useState<LabelInfo | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const pinLocation: [number, number] = [40.5768852, -74.384442];
      const mapCenter:   [number, number] = [40.5768852, -74.384442 - 0.0015];

      const map = L.default.map(mapRef.current!, {
        center: mapCenter, zoom: 17,
        zoomControl: false, attributionControl: false,
        scrollWheelZoom: false, doubleClickZoom: false,
        boxZoom: false, keyboard: false, touchZoom: false,
        minZoom: 17, maxZoom: 17,
      });

      const tilePane = map.getPane("tilePane");
      if (tilePane) tilePane.style.filter = "brightness(0.3) contrast(1.2)";

      L.default.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri", maxZoom: 19 }
      ).addTo(map);

      mapInstanceRef.current = map;

      if (!document.getElementById("road-glow-anim")) {
        const s = document.createElement("style");
        s.id = "road-glow-anim";
        s.textContent = `
          @keyframes roadDashFlow { to { stroke-dashoffset: -24; } }
          @keyframes floatPin {
            0%, 100% { transform: translate(-50%, -91.7%) translateY(0px); }
            50%       { transform: translate(-50%, -91.7%) translateY(-8px); }
          }
          @keyframes pinGlow {
            0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1); }
            50%       { opacity: 0;   transform: translate(-50%,-50%) scale(2.5); }
          }
        `;
        document.head.appendChild(s);
      }

      const dist = (a: [number, number], b: [number, number]) =>
        Math.hypot(a[0] - b[0], a[1] - b[1]);

      const animateDraw = (line: any, duration: number, delay: number) => {
        const el = line.getElement() as SVGPathElement | null;
        if (!el) return;
        const len = el.getTotalLength();
        el.style.transition = "none";
        el.style.strokeDasharray  = `${len}`;
        el.style.strokeDashoffset = `${len}`;
        el.style.willChange = "stroke-dashoffset";
        void el.getBoundingClientRect();
        setTimeout(() => {
          el.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4,0,0.2,1)`;
          el.style.strokeDashoffset = "0";
        }, delay);
      };

      const drawRoadGlow = (rawCoords: [number, number][], delay: number) => {
        if (rawCoords.length < 2) return;
        let coords = rawCoords;
        if (dist(coords[0], pinLocation) < dist(coords[coords.length - 1], pinLocation))
          coords = [...coords].reverse();
        const dur = 800;
        const halo = L.default.polyline(coords, { color: "#93C5FD", weight: 18, opacity: 0.18, lineCap: "round", lineJoin: "round" }).addTo(map);
        animateDraw(halo, dur, delay);
        const core = L.default.polyline(coords, { color: "#BFDBFE", weight: 2.5, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(map);
        animateDraw(core, dur, delay + 40);
        const dash = L.default.polyline(coords, { color: "#FFFFFF", weight: 1.5, opacity: 0, lineCap: "round", lineJoin: "round", dashArray: "10 14" }).addTo(map);
        setTimeout(() => {
          const el = dash.getElement() as SVGPathElement | null;
          if (!el) return;
          el.style.opacity   = "0.55";
          el.style.animation = "roadDashFlow 0.6s linear infinite";
        }, delay + dur + 80);
      };

      map.whenReady(() => {
        if (!mapInstanceRef.current) return;

        const pt = map.latLngToContainerPoint(L.default.latLng(pinLocation[0], pinLocation[1]));
        setPinPos({ x: pt.x, y: pt.y });
        setLabelPos({ x: pt.x, y: pt.y + 44 });
        onPinReady?.(pt.x, pt.y);

        const b   = map.getBounds();
        const pad = 0.001;
        const bbox = `${b.getSouth()-pad},${b.getWest()-pad},${b.getNorth()+pad},${b.getEast()+pad}`;
        const q   = `[out:json][timeout:20];way["highway"](${bbox});out geom tags;`;

        fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`)
          .then(r => r.json())
          .then((data: any) => {
            if (!data.elements || !mapInstanceRef.current) return;
            data.elements
              .filter((el: any) => el.geometry?.length >= 2)
              .map((el: any) => el.geometry.map((p: any) => [p.lat, p.lon] as [number, number]))
              .forEach((coords: [number, number][], i: number) => drawRoadGlow(coords, i * 20));
          })
          .catch(() => {});
      });
    });

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [isClient]);

  if (!isClient) return <div className="w-full h-full bg-[#0e1626]" />;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapRef} className="w-full h-full" style={{ isolation: "isolate" }} />

      {/* Lucide-style MapPin rendered in same coordinate space as Leaflet — always exact */}
      {pinPos && (
        <div
          onClick={onPinClick}
          style={{
            position:  "absolute",
            left:      pinPos.x,
            top:       pinPos.y,
            transform: "translate(-50%, -91.7%)",
            animation: "floatPin 4s ease-in-out infinite",
            cursor:    "pointer",
            zIndex:    25,
          }}
        >
          {/* Pulse glow ring at pin tip */}
          <div style={{
            position:     "absolute",
            left:         "50%",
            top:          "91.7%",
            width:        "48px",
            height:       "48px",
            borderRadius: "50%",
            background:   "rgba(255,90,90,0.45)",
            animation:    "pinGlow 2s ease-out infinite",
            pointerEvents:"none",
          }} />
          {/* The MapPin icon — identical stroke/fill to the original lucide MapPin */}
          <svg
            width="64" height="64"
            viewBox="0 0 24 24"
            fill="rgba(255,90,90,0.2)"
            stroke="#ff5a5a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 20px rgba(255,90,90,0.9))" }}
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
      )}

      {/* MINTEX STAFFING label */}
      {labelPos && (
        <span
          style={{
            position:      "absolute",
            left:          labelPos.x,
            top:           labelPos.y,
            transform:     "translate(-50%, -50%)",
            whiteSpace:    "nowrap",
            fontFamily:    "'Inter','Helvetica Neue',Arial,sans-serif",
            fontSize:      "18px",
            fontWeight:    700,
            letterSpacing: "2px",
            color:         "#ffffff",
            textShadow:    [
              "0 0 6px #fd9393","0 0 16px #f63b3b",
              "1px 1px 0 #000","-1px -1px 0 #000",
              "1px -1px 0 #000","-1px 1px 0 #000",
            ].join(", "),
            pointerEvents: "none",
            userSelect:    "none",
            zIndex:        20,
          }}
        >
          MINTEX STAFFING
        </span>
      )}
    </div>
  );
}
