"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint } from '@/lib/types';
import { ShieldAlert, AlertCircle, CheckCircle, Navigation } from 'lucide-react';

// Fix Leaflet marker icon issues without using ReactDOMServer in client
const createCustomIcon = (status: string) => {
    const color = status === 'Resolved' ? '#10b981' : status === 'In Progress' ? '#f59e0b' : '#ef4444';
    const iconSvg = status === 'Resolved' 
        ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : status === 'In Progress'
        ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
        : '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    
    const html = `
        <div class="relative flex flex-col items-center">
            <div class="w-8 h-8 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300" style="background-color: ${color}">
                ${iconSvg}
            </div>
            <div class="w-1 h-3 shadow-lg -mt-0.5" style="background-color: ${color}"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-black/20 blur-[1px] mt-0.5"></div>
        </div>
    `;
    
    return L.divIcon({
        html,
        className: 'custom-leaflet-icon',
        iconSize: [32, 48],
        iconAnchor: [16, 48],
        popupAnchor: [0, -48]
    });
};

const UserLocationIcon = L.divIcon({
    html: `
        <div class="relative">
            <div class="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-pulse">
                <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div class="absolute inset-x-0 -bottom-4 flex justify-center">
                <div class="w-4 h-1 bg-black/20 blur-[2px] rounded-full"></div>
            </div>
        </div>
    `,
    className: 'user-location-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function MapSync({ center }: { center: [number, number] | null }) {
    const map = useMap();
    if (center) {
        map.setView(center, map.getZoom(), { animate: true });
    }
    return null;
}

interface MapComponentProps {
    grievances: Complaint[];
    userLocation: [number, number] | null;
    onTrackTicketAction: (id: string) => void;
    onSelectComplaint?: (complaint: Complaint) => void;
}

export default function MapComponent({ grievances, userLocation, onTrackTicketAction, onSelectComplaint }: MapComponentProps) {
    const defaultCenter: [number, number] = [28.6139, 77.2090]; // Delhi
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <MapContainer 
            key="civic-map-instance"
            center={userLocation || defaultCenter} 
            zoom={13} 
            className="w-full h-full z-0"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <MapSync center={userLocation} />

            {userLocation && (
                <Marker position={userLocation} icon={UserLocationIcon}>
                    <Popup className="premium-popup">
                        <div className="p-3">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">You are here</p>
                            <p className="text-xs font-bold text-slate-800">Current Position</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {grievances.map((g) => (
                <Marker 
                    key={g.id} 
                    position={[g.lat, g.lng]} 
                    icon={createCustomIcon(g.status)}
                    eventHandlers={{
                        click: () => onSelectComplaint?.(g)
                    }}
                >
                    <Popup className="premium-popup">
                        <div className="p-4 w-64">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                    g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                    g.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {g.status}
                                </span>
                                <span className="text-[8px] font-bold text-slate-400">#{g.id}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-800 mb-1">{g.category}</h3>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">{g.description}</p>
                            <button 
                                onClick={() => onTrackTicketAction(g.id)}
                                className="w-full py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-1"
                            >
                                Live Tracking <Navigation className="w-3 h-3" />
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
