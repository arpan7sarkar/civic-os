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

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Streetlight': return 'lightbulb';
        case 'Garbage': return 'delete';
        case 'Water Leakage': return 'water_drop';
        case 'Road Damage': return 'construction';
        case 'Encroachment': return 'domain_disabled';
        case 'Illegal Parking': return 'local_parking';
        default: return 'report_problem';
    }
};

const createCustomIcon = (status: string, category: string) => {
    const color = status === 'Pending' ? 'bg-red-500' : status === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500';
    const ringColor = status === 'Pending' ? 'ring-red-500/30' : status === 'In Progress' ? 'ring-amber-500/30' : 'ring-emerald-500/30';
    const iconName = getCategoryIcon(category);
    
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative group">
                <div class="absolute -inset-2 ${color} bg-opacity-20 rounded-full blur-sm group-hover:bg-opacity-40 transition-all duration-300"></div>
                <div class="w-12 h-12 ${color} rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center text-white ring-4 ${ringColor} transition-transform duration-300 group-hover:scale-110 active:scale-95 relative z-10">
                    <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1, 'wght' 600">${iconName}</span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md z-20">
                    <div class="w-3 h-3 ${color} rounded-full animate-pulse-slow"></div>
                </div>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });
};

const userLocationIcon = L.divIcon({
    className: 'user-location-icon',
    html: `
        <div class="relative">
            <div class="absolute -inset-6 bg-blue-500/20 rounded-full animate-ping"></div>
            <div class="absolute -inset-4 bg-blue-500/10 rounded-full blur-md"></div>
            <div class="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white relative z-10 ring-4 ring-blue-500/30">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">navigation</span>
            </div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [center, map]);
    return null;
}

interface MapComponentProps {
    grievances: any[];
    userLocation: [number, number] | null;
    onTrackTicket?: (ticketId: string) => void;
}

export default function MapComponent({ grievances, userLocation, onTrackTicket }: MapComponentProps) {
    const defaultCenter: [number, number] = [20.5937, 78.9629]; // India Center
    const indiaBounds: L.LatLngBoundsExpression = [
        [6.4626999, 68.1097], // Southwest (near Kanyakumari/Arabian Sea)
        [35.513327, 97.3953586] // Northeast (near Ladakh/Arunachal)
    ];
    
    return (
        <MapContainer 
            center={defaultCenter} 
            zoom={5} 
            minZoom={4}
            maxBounds={indiaBounds}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            preferCanvas={true}
            worldCopyJump={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
                keepBuffer={12}
                updateWhenIdle={true}
                updateWhenZooming={false}
            />
            
            {userLocation && (
                <>
                    <ChangeView center={userLocation} />
                    <Marker position={userLocation} icon={userLocationIcon}>
                        <Popup className="premium-popup">
                            <div className="p-3 text-center min-w-[150px]">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600">
                                    <span className="material-symbols-outlined text-lg">my_location</span>
                                </div>
                                <p className="text-xs font-black uppercase text-gov-blue tracking-widest">Your Location</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">Tracking active grievances in your vicinity.</p>
                            </div>
                        </Popup>
                    </Marker>
                </>
            )}

            {grievances
                .filter(g => typeof g.lat === 'number' && typeof g.lng === 'number' && !isNaN(g.lat) && !isNaN(g.lng))
                .map((g) => {
                    const icon = createCustomIcon(g.status, g.category);
                    return (
                        <Marker 
                            key={g.$id || g.id} 
                            position={[g.lat, g.lng]} 
                            icon={icon}
                        >
                        <Popup className="premium-popup">
                            <div className="p-2 min-w-[240px]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-xl ${g.status === 'Pending' ? 'bg-red-50 text-red-500' : g.status === 'In Progress' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{getCategoryIcon(g.category)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${g.status === 'Pending' ? 'bg-red-500' : g.status === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-inter">{g.status}</span>
                                        </div>
                                        <h3 className="font-ex-bold text-slate-800 text-sm">{g.category}</h3>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed bg-slate-50/50 p-3 rounded-2xl italic">"{g.description}"</p>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">REFERENCE No.</span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter tabular-nums">{g.id}</span>
                                    </div>
                                    <button 
                                        onClick={() => onTrackTicket?.(g.id)}
                                        className="px-4 py-2 bg-gov-blue text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 shadow-md"
                                    >
                                        Track Ticket
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
