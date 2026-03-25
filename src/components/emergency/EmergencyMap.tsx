"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapFocus({ userLoc, destLoc }: { userLoc: [number, number] | null, destLoc: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (userLoc && destLoc) {
            const bounds = L.latLngBounds([userLoc, destLoc]);
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        } else if (userLoc) {
            map.setView(userLoc, 14, { animate: true });
        }
    }, [map, userLoc, destLoc]);
    return null;
}

export default function EmergencyMap({ 
    userLocation, 
    destination,
    serviceType
}: { 
    userLocation: [number, number] | null, 
    destination: [number, number] | null,
    serviceType: string | null
}) {
    // We use standard light mode tiles since the dashboard is light
    return (
        <div className="w-full h-full min-h-[300px] rounded-3xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative z-0">
            {userLocation ? (
                <MapContainer center={userLocation} zoom={14} className="w-full h-full z-0" zoomControl={false}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <MapFocus userLoc={userLocation} destLoc={destination} />
                    
                    {/* User Marker */}
                    <Marker position={userLocation}>
                        <Popup className="font-inter font-bold text-xs"><span className="text-[#145369]">You are here</span></Popup>
                    </Marker>

                    {/* Destination Marker & Route */}
                    {destination && (
                        <>
                            <Marker position={destination}>
                                <Popup className="font-inter font-bold text-xs"><span className="text-red-600">{serviceType || "Destination"}</span></Popup>
                            </Marker>
                            <Polyline
                                positions={[userLocation, destination]}
                                color="#0B6E6D" // CivicOS Teal
                                weight={5}
                                opacity={0.8}
                                dashArray="12, 12"
                                className="animate-pulse"
                            />
                        </>
                    )}
                </MapContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <div className="w-8 h-8 border-4 border-[#0B6E6D] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
