"use client";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Tactical Icons
const createTacIcon = (color: string, isUser: boolean = false) => {
    if (typeof window === "undefined") return null;
    
    const html = isUser ? `
        <div class="user-tac-marker">
            <div class="pulse" style="background: ${color}44"></div>
            <div class="dot" style="background: ${color}"></div>
            <div class="label">YOU</div>
        </div>
    ` : `
        <div class="dest-tac-marker">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${color}"/>
            </svg>
        </div>
    `;

    return L.divIcon({
        className: 'custom-tac-icon',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
};

function MapFocus({ userLoc, destLoc, boundsData }: { userLoc: [number, number] | null, destLoc: [number, number] | null, boundsData: [number, number][] | null }) {
    const map = useMap();
    useEffect(() => {
        if (boundsData && boundsData.length > 0) {
            const bounds = L.latLngBounds(boundsData);
            map.fitBounds(bounds, { padding: [100, 100], animate: true });
        } else if (userLoc && destLoc) {
            const bounds = L.latLngBounds([userLoc, destLoc]);
            map.fitBounds(bounds, { padding: [100, 100], animate: true });
        } else if (userLoc) {
            map.setView(userLoc, 15, { animate: true });
        }
    }, [map, userLoc, destLoc, boundsData]);
    return null;
}

export default function EmergencyMap({ 
    userLocation, 
    serviceLocation,
    route,
    distance,
    eta 
}: { 
    userLocation: [number, number] | null, 
    serviceLocation?: [number, number] | null,
    route?: [number, number][] | null,
    distance?: string | null,
    eta?: string | null
}) {
    const userIcon = useMemo(() => createTacIcon("#3b82f6", true), []);
    const destIcon = useMemo(() => createTacIcon("#ef4444", false), []);

    return (
        <div className="w-full h-full min-h-[300px] rounded-3xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative z-0">
            {userLocation ? (
                <>
                    <MapContainer 
                        center={userLocation} 
                        zoom={15} 
                        className="w-full h-full z-0" 
                        zoomControl={false}
                        // Unique keys can cause flashes, but here we prefer to ensure fresh mounting 
                        // if the container is "stuck". However, a stable key is better for performance.
                        // We use a combination of location to reset only when absolutely necessary.
                        key="emergency-map-container"
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        <MapFocus userLoc={userLocation} destLoc={serviceLocation || null} boundsData={route || null} />
                        
                        <Marker position={userLocation} icon={userIcon as any} />

                        {serviceLocation && (
                            <>
                                <Marker position={serviceLocation} icon={destIcon as any} />
                                <Polyline
                                    positions={route || [userLocation, serviceLocation]}
                                    color="#dc2626"
                                    weight={6}
                                    opacity={0.7}
                                    dashArray="1, 10" // Tactical dash look
                                />
                            </>
                        )}
                    </MapContainer>

                    <style jsx global>{`
                        .user-tac-marker {
                            position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .user-tac-marker .pulse {
                            position: absolute;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            animation: tac-pulse 2s infinite;
                        }
                        .user-tac-marker .dot {
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            border: 2px solid white;
                            box-shadow: 0 0 10px rgba(0,0,0,0.3);
                        }
                        .user-tac-marker .label {
                            position: absolute;
                            top: -22px;
                            background: white;
                            padding: 2px 6px;
                            border-radius: 8px;
                            font-size: 10px;
                            font-weight: 900;
                            color: #1d4ed8;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            white-space: nowrap;
                        }
                        @keyframes tac-pulse {
                            0% { transform: scale(0.5); opacity: 1; }
                            100% { transform: scale(2.5); opacity: 0; }
                        }
                        .leaflet-container {
                            background: #f8fafc !important;
                        }
                    `}</style>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-4">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400">Locking Tactical Position...</p>
                </div>
            )}
        </div>
    );
}
