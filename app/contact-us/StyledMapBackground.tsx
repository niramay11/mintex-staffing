"use client";
import React, { useEffect, useRef, useState } from "react";

interface LabelInfo { x: number; y: number; angle: number }

export default function StyledMapBackground() {
  const wrapRef        = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isClient,  setIsClient]  = useState(false);
  const [oakLabel,  setOakLabel]  = useState<LabelInfo | null>(null);

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
        s.textContent = `@keyframes roadDashFlow { to { stroke-dashoffset: -24; } }`;
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
          el.style.willChange = "opacity";
          el.style.opacity   = "0.55";
          el.style.animation = "roadDashFlow 0.6s linear infinite";
        }, delay + dur + 80);
      };

      map.whenReady(() => {
        if (!mapInstanceRef.current) return;

        // Oak Tree Rd runs nearly E-W through the pin.
        // Use two points straddling the pin to get the exact road angle.
        const west: [number, number] = [40.57690, -74.38650];
        const east: [number, number] = [40.57682, -74.38220];
        const px1 = map.latLngToContainerPoint(L.default.latLng(west[0], west[1]));
        const px2 = map.latLngToContainerPoint(L.default.latLng(east[0], east[1]));
        let angleDeg = Math.atan2(px2.y - px1.y, px2.x - px1.x) * (180 / Math.PI);
        if (angleDeg >  90) angleDeg -= 180;
        if (angleDeg < -90) angleDeg += 180;

        // Use a direct geographic coordinate on Oak Tree Rd east of the pin.
        // +0.0004 lat = ~44m north (puts label on road centerline above pin anchor)
        // +0.0018 lng = ~130m east (right of pin, on the visible road stretch)
        const roadPt = map.latLngToContainerPoint(
          L.default.latLng(pinLocation[0] + 0.0004, pinLocation[1] + 0.0018)
        );
        setOakLabel({ x: roadPt.x, y: roadPt.y, angle: angleDeg });

        // ── Fetch + glow all roads ─────────────────────────────────────────────
        const b    = map.getBounds();
        const pad  = 0.001;
        const bbox = `${b.getSouth()-pad},${b.getWest()-pad},${b.getNorth()+pad},${b.getEast()+pad}`;
        const q    = `[out:json][timeout:20];way["highway"](${bbox});out geom tags;`;

        fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`)
          .then((r) => r.json())
          .then((data: any) => {
            if (!data.elements || !mapInstanceRef.current) return;
            const ways: [number, number][][] = data.elements
              .filter((el: any) => el.geometry?.length >= 2)
              .map((el: any) =>
                el.geometry.map((p: any) => [p.lat, p.lon] as [number, number])
              );
            // Draw glow on every road — does NOT touch oakLabel state
            ways.forEach((coords, i) => drawRoadGlow(coords, i * 20));
          })
          .catch(() => {});
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  if (!isClient) return <div className="w-full h-full bg-[#0e1626]" />;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Leaflet map */}
      <div ref={mapRef} className="w-full h-full" style={{ isolation: "isolate" }} />

      {/* Oak Tree Road — outside Leaflet's overflow:hidden, always visible */}
      {oakLabel && (
        <span
          style={{
            position:        "absolute",
            left:             oakLabel.x,
            top:              oakLabel.y,
            transform:       `translate(-50%, -50%) rotate(${oakLabel.angle}deg)`,
            transformOrigin: "center center",
            whiteSpace:      "nowrap",
            fontFamily:      "'Inter','Helvetica Neue',Arial,sans-serif",
            fontSize:        "12px",
            fontWeight:      700,
            letterSpacing:   "2px",
            color:           "#ffffff",
            textShadow:      [
              "0 0 6px #93C5FD",
              "0 0 16px #3B82F6",
              "1px  1px 0 #000",
              "-1px -1px 0 #000",
              "1px -1px 0 #000",
              "-1px  1px 0 #000",
            ].join(", "),
            pointerEvents:   "none",
            userSelect:      "none",
            zIndex:          20,
          }}
        >
          OAK TREE RD
        </span>
      )}
    </div>
  );
}
