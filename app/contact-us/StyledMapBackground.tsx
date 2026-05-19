"use client";

import React, { useEffect, useRef, useState } from "react";

export default function StyledMapBackground() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !mapRef.current || mapInstanceRef.current) return;

        // Dynamically import Leaflet only on client side
        import("leaflet").then((L) => {

            // Fix for default marker icon issue in Next.js
            if (typeof window !== "undefined" && L.default.Icon.Default.prototype) {
                delete (L.default.Icon.Default.prototype as any)._getIconUrl;
                L.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                });
            }

            // Initialize map - New York City, USA
            const map = L.default.map(mapRef.current!, {
                center: [40.7128, -74.0060], // New York City, USA
                zoom: 16, // Fixed zoom level to show street-level detail
                zoomControl: false,
                attributionControl: false,
                scrollWheelZoom: false, // Disable mouse wheel zoom
                doubleClickZoom: false, // Disable double-click zoom
                boxZoom: false, // Disable box zoom (shift+drag)
                keyboard: false, // Disable keyboard zoom
                touchZoom: false, // Disable pinch zoom on mobile
                minZoom: 16, // Lock minimum zoom
                maxZoom: 16, // Lock maximum zoom
            });

            // Esri World Imagery for satellite view (no API key required)
            const satelliteTileLayer = L.default.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
                    maxZoom: 19,
                }
            );

            // Add satellite layer
            satelliteTileLayer.addTo(map);

            // Store map instance
            mapInstanceRef.current = map;
        });

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isClient]);

    if (!isClient) {
        return <div className="w-full h-full bg-[#0e1626]" />;
    }

    return (
        <div 
            ref={mapRef} 
            className="w-full h-full"
            style={{ 
                filter: "brightness(0.3) contrast(1.2)", // Darken the satellite imagery for night effect
            }}
        />
    );
}
