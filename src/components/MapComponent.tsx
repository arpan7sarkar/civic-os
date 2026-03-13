"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not showing
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons for Statuses
const pendingIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><span class="material-symbols-outlined text-sm">priority_high</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const inProgressIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-amber-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><span class="material-symbols-outlined text-sm">engineering</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const resolvedIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><span class="material-symbols-outlined text-sm">check</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center);
    return null;
}

interface MapComponentProps {
    grievances: any[];
    userLocation: [number, number] | null;
}

export default function MapComponent({ grievances, userLocation }: MapComponentProps) {
    const defaultCenter: [number, number] = [28.6139, 77.2090]; // Delhi
    
    return (
        <MapContainer 
            center={userLocation || defaultCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {userLocation && <ChangeView center={userLocation} />}

            {grievances.map((g) => {
                const icon = g.status === 'Pending' ? pendingIcon : g.status === 'In Progress' ? inProgressIcon : resolvedIcon;
                return (
                    <Marker 
                        key={g.$id || g.id} 
                        position={[g.lat, g.lng]} 
                        icon={icon}
                    >
                        <Popup className="premium-popup">
                            <div className="p-2 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`w-2 h-2 rounded-full ${g.status === 'Pending' ? 'bg-red-500' : g.status === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{g.status}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm mb-1">{g.category}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{g.description}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{g.id}</span>
                                    <button className="text-[10px] font-black text-gov-blue uppercase tracking-widest hover:underline">View Details</button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
