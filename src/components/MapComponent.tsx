"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Complaint } from "@/lib/types";

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const RedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const OrangeIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const YellowIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const GreenIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const getIcon = (priority: string) => {
    switch (priority) {
        case 'Critical': return RedIcon;
        case 'High': return OrangeIcon;
        case 'Medium': return YellowIcon;
        case 'Low': return GreenIcon;
        default: return DefaultIcon;
    }
};

export default function MapComponent({ complaints }: { complaints: Complaint[] }) {
    return (
        <MapContainer
            center={[28.6139, 77.2090]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {complaints.map((c) => (
                <Marker
                    key={c.id}
                    position={[c.lat, c.lng]}
                    icon={getIcon(c.priority)}
                >
                    <Popup>
                        <div className="p-1 space-y-1">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-black text-mcd-navy">{c.id}</span>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${c.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>{c.status}</span>
                            </div>
                            <p className="text-xs font-bold text-gray-800">{c.category}</p>
                            <p className="text-[10px] text-gray-500">{c.ward}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
