'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Location } from '@/types';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MapPin,
  Building2,
  Users,
  Shield,
  ShieldCheck,
  Eye,
  ExternalLink,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Crosshair,
  Map as MapIcon,
  Search,
  X,
  ChevronRight,
} from 'lucide-react';

interface LocationGeo {
  lat: number;
  lng: number;
  category: string;
  zone: 'Jakarta Pusat' | 'Jakarta Selatan' | 'Jakarta Utara' | 'Bogor';
}

const LOCATION_GEO: Record<string, LocationGeo> = {
  'loc-1': {
    lat: -6.2088,
    lng: 106.8217,
    category: 'Corporate Tower',
    zone: 'Jakarta Pusat',
  },
  'loc-2': {
    lat: -6.2118,
    lng: 106.8248,
    category: 'Logistics & Cargo',
    zone: 'Jakarta Pusat',
  },
  'loc-3': {
    lat: -6.5510,
    lng: 106.8660,
    category: 'Mission-Critical DC',
    zone: 'Bogor',
  },
  'loc-4': {
    lat: -6.2255,
    lng: 106.8095,
    category: 'Commercial District',
    zone: 'Jakarta Selatan',
  },
  'loc-5': {
    lat: -6.1040,
    lng: 106.8830,
    category: 'Seaport Terminal',
    zone: 'Jakarta Utara',
  },
  'loc-6': {
    lat: -6.1575,
    lng: 106.9080,
    category: 'Retail Mall',
    zone: 'Jakarta Utara',
  },
};

// Geographical projection bounds for Jabodetabek (North Java Sea to South Sentul/Bogor)
const BOUNDS = {
  north: -6.04,
  south: -6.60,
  west: 106.72,
  east: 106.98,
};

function projectToPercentage(lat: number, lng: number) {
  const x = ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 100;
  const y = ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * 100;
  return {
    x: Math.max(6, Math.min(94, x)),
    y: Math.max(6, Math.min(94, y)),
  };
}

export function DeploymentMap() {
  const { locations, getAssignmentsForLocation } = useApp();

  const [activeZone, setActiveZone] = useState<string>('ALL');
  const [selectedLocId, setSelectedLocId] = useState<string>('loc-1');
  const [hoveredLocId, setHoveredLocId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'radar' | 'osm'>('radar');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedLocationForModal, setSelectedLocationForModal] = useState<Location | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');

  const activeLocations = useMemo(() => {
    return locations.filter((l) => l.status === 'ACTIVE');
  }, [locations]);

  const filteredLocations = useMemo(() => {
    if (activeZone === 'ALL') return activeLocations;
    return activeLocations.filter((loc) => {
      const geo = LOCATION_GEO[loc.id];
      return geo?.zone === activeZone || loc.city.toLowerCase().includes(activeZone.toLowerCase());
    });
  }, [activeLocations, activeZone]);

  const selectedLoc = useMemo(() => {
    return activeLocations.find((l) => l.id === selectedLocId) || activeLocations[0];
  }, [activeLocations, selectedLocId]);

  const totalGuardsDeployed = useMemo(() => {
    return activeLocations.reduce((sum, l) => sum + getAssignmentsForLocation(l.id).length, 0);
  }, [activeLocations, getAssignmentsForLocation]);

  const zones = [
    { id: 'ALL', label: 'All Areas', count: activeLocations.length },
    { id: 'Jakarta Pusat', label: 'Jakarta Pusat', count: activeLocations.filter((l) => l.city.includes('Pusat')).length },
    { id: 'Jakarta Selatan', label: 'Jakarta Selatan', count: activeLocations.filter((l) => l.city.includes('Selatan')).length },
    { id: 'Jakarta Utara', label: 'Jakarta Utara', count: activeLocations.filter((l) => l.city.includes('Utara')).length },
    { id: 'Bogor', label: 'Bogor / Sentul', count: activeLocations.filter((l) => l.city.includes('Bogor')).length },
  ];

  return (
    <Card className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4 overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Live Deployment Areas Geographic Map
              </h2>
              <Badge variant="outline" className="font-semibold text-[11px] bg-slate-50 text-slate-700">
                {activeLocations.length} Active Sites
              </Badge>
              <Badge variant="default" className="text-[11px] bg-blue-600 text-white">
                {totalGuardsDeployed} Guards Stationed
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive tactical radar & geographic positioning across Jabodetabek client facilities
            </p>
          </div>
        </div>

        {/* View Toggle (Tactical Radar vs OpenStreetMap) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMapMode('radar')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                mapMode === 'radar'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Crosshair className="h-3.5 w-3.5 text-blue-600" />
              <span>Tactical Radar</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode('osm')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                mapMode === 'osm'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-emerald-600" />
              <span>Street Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zone Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Navigation className="h-3 w-3" /> Filter Zone:
        </span>
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => setActiveZone(zone.id)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
              activeZone === zone.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {zone.label} <span className="opacity-70 text-[10px]">({zone.count})</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Map Canvas (Left 65%) + Active Sites Inspector (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Map Area */}
        <div className="lg:col-span-8 relative rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-950 min-h-[460px] flex flex-col justify-between shadow-inner">
          {mapMode === 'radar' ? (
            /* Tactical Radar Vector Map */
            <div className="relative w-full h-full min-h-[460px] overflow-hidden select-none bg-gradient-to-b from-[#0a1128] via-[#09152e] to-[#040817]">
              {/* SVG Map Cartography & Vector Grid */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="radarGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.15" strokeDasharray="0.8,0.8" />
                  </pattern>
                  <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Background Radar Grid */}
                <rect width="100" height="100" fill="url(#radarGrid)" />

                {/* Java Sea / Teluk Jakarta (Top Coastal Area) */}
                <path
                  d="M 0,0 L 100,0 L 100,14 Q 85,12 70,15 T 45,13 T 20,16 L 0,14 Z"
                  fill="url(#seaGrad)"
                  stroke="#38bdf8"
                  strokeWidth="0.3"
                  strokeOpacity="0.5"
                />

                {/* Tanjung Priok Port Basins (Top-Right) */}
                <rect x="60" y="8" width="12" height="4" fill="#0369a1" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="0.2" />
                <rect x="74" y="9" width="8" height="3" fill="#0369a1" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="0.2" />

                {/* Major Arteries / Highway Lines */}
                {/* Tol Jagorawi (North to South corridor connecting Jakarta to Sentul) */}
                <path
                  d="M 45,30 Q 50,55 56,91"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.6"
                  strokeOpacity="0.6"
                  strokeDasharray="2,1"
                />

                {/* Tol Dalam Kota / Inner Ring Road */}
                <path
                  d="M 25,25 Q 40,24 65,22 Q 80,26 85,32"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />

                {/* Sudirman - Thamrin Axis */}
                <line x1="38" y1="22" x2="35" y2="35" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.7" />

                {/* Ciliwung River Vector Path */}
                <path
                  d="M 52,95 Q 48,70 42,50 Q 38,35 44,14"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="0.4"
                  strokeOpacity="0.4"
                />

                {/* District Boundary Circles / Radar Concentrics */}
                <circle cx="50" cy="50" r="25" fill="none" stroke="#1e3a8a" strokeWidth="0.2" strokeOpacity="0.5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e3a8a" strokeWidth="0.2" strokeOpacity="0.3" />
              </svg>

              {/* Geographic Labels Overlay */}
              <div className="absolute top-2 left-3 text-[10px] font-mono tracking-widest text-sky-400/70 uppercase">
                &bull; TELUK JAKARTA / JAVA SEA
              </div>
              <div className="absolute top-10 right-4 text-[9px] font-mono text-slate-500 uppercase">
                TG. PRIOK PORT ZONE
              </div>
              <div className="absolute top-[28%] left-[20%] text-[9px] font-mono text-slate-500 uppercase">
                JAKARTA PUSAT (SUDIRMAN)
              </div>
              <div className="absolute top-[34%] left-[16%] text-[9px] font-mono text-slate-500 uppercase">
                SCBD SENAYAN
              </div>
              <div className="absolute bottom-5 right-[24%] text-[9px] font-mono text-slate-500 uppercase">
                BOGOR / SENTUL TECH PARK &bull;
              </div>

              {/* Interactive Deployment Pins / Dots */}
              <div
                className="absolute inset-0 transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                {filteredLocations.map((loc) => {
                  const geo = LOCATION_GEO[loc.id] || { lat: -6.2, lng: 106.8, category: 'Site', zone: 'Jakarta' };
                  const coords = projectToPercentage(geo.lat, geo.lng);
                  const isSelected = selectedLocId === loc.id;
                  const isHovered = hoveredLocId === loc.id;
                  const assigned = getAssignmentsForLocation(loc.id);

                  return (
                    <div
                      key={loc.id}
                      style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/pin"
                      onClick={() => setSelectedLocId(loc.id)}
                      onMouseEnter={() => setHoveredLocId(loc.id)}
                      onMouseLeave={() => setHoveredLocId(null)}
                    >
                      {/* Pulsing Radar Ring */}
                      <span className="absolute -inset-2.5 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />

                      {/* Second outer aura */}
                      <span
                        className={`absolute -inset-1.5 rounded-full transition-all duration-200 pointer-events-none ${
                          isSelected || isHovered
                            ? 'bg-blue-400/60 ring-2 ring-blue-400'
                            : 'bg-emerald-500/30'
                        }`}
                      />

                      {/* Main Location Pin Icon */}
                      <div
                        className={`relative h-7 w-7 rounded-full flex items-center justify-center font-bold text-white text-[10px] shadow-lg transition-transform duration-150 ${
                          isSelected
                            ? 'bg-blue-600 ring-4 ring-white/90 scale-125 z-30'
                            : isHovered
                            ? 'bg-blue-500 ring-2 ring-white scale-110 z-25'
                            : 'bg-slate-900 border-2 border-emerald-400 hover:scale-110'
                        }`}
                      >
                        <Building2 className="h-3.5 w-3.5" />
                      </div>

                      {/* Always visible label on tactical map */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 top-8 px-2 py-0.5 rounded-md whitespace-nowrap text-[10px] font-bold shadow-md transition-all pointer-events-none ${
                          isSelected
                            ? 'bg-blue-600 text-white z-40 scale-105'
                            : 'bg-slate-900/90 text-slate-200 border border-slate-700/80'
                        }`}
                      >
                        <span>{loc.name.split('-')[0].trim()}</span>
                        <span className="ml-1 opacity-75 font-normal">({assigned.length}G)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* OpenStreetMap Real Street Map Embed */
            <div className="relative w-full h-full min-h-[460px]">
              <iframe
                title="Jabodetabek Deployment Area Map"
                className="w-full h-full border-0 absolute inset-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=106.74%2C-6.58%2C106.96%2C-6.08&layer=mapnik&marker=${
                  selectedLoc ? LOCATION_GEO[selectedLoc.id]?.lat || -6.2088 : -6.2088
                }%2C${selectedLoc ? LOCATION_GEO[selectedLoc.id]?.lng || 106.8217 : 106.8217}`}
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2 py-1 rounded text-[10px] backdrop-blur-xs font-mono">
                Centered on: {selectedLoc?.name} ({selectedLoc?.city})
              </div>
            </div>
          )}

          {/* Map Controls Overlay (Zoom & Reset) */}
          {mapMode === 'radar' && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 shadow-md backdrop-blur-xs z-30">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                className="h-7 w-7 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center transition"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                className="h-7 w-7 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="h-7 w-7 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center transition"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Map Status Indicator Pill */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700/70 text-white text-[11px] font-mono z-30 backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RADAR ACTIVE</span>
          </div>
        </div>

        {/* Right: Selected Site Card & All Sites Directory */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          {/* Active Site Spotlight Box */}
          {selectedLoc && (() => {
            const assigned = getAssignmentsForLocation(selectedLoc.id);
            const geo = LOCATION_GEO[selectedLoc.id];
            const siteCommander = assigned.find(
              (a) =>
                a.positionOnSite?.toLowerCase().includes('danru') ||
                a.positionOnSite?.toLowerCase().includes('commander') ||
                a.positionOnSite?.toLowerCase().includes('chief') ||
                a.positionOnSite?.toLowerCase().includes('supervisor')
            ) || assigned[0];

            return (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {geo?.category || 'Security Facility'}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                        {selectedLoc.name}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                        {selectedLoc.clientName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exact Address & City */}
                <div className="space-y-1 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{selectedLoc.address}, <strong className="text-slate-900">{selectedLoc.city}</strong></span>
                  </div>
                  {geo && (
                    <div className="text-[11px] font-mono text-slate-400 pl-5">
                      GPS: {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* Site Commander & Guard Headcount */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                  {siteCommander ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={siteCommander.personnelPhoto}
                          alt={siteCommander.personnelName}
                          className="h-8 w-8 rounded-full object-cover border-2 border-blue-600"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white p-0.5 rounded-full shadow-2xs">
                          <Shield className="h-2 w-2" />
                        </span>
                      </div>
                      <div className="min-w-0 text-xs">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Site Commander</span>
                        <span className="font-bold text-slate-900 truncate block">{siteCommander.personnelName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No commander assigned</div>
                  )}

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Strength</span>
                    <span className="text-sm font-extrabold text-slate-900">{assigned.length} Guards</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedLocationForModal(selectedLoc)}
                    className="w-full text-xs font-semibold h-8 gap-1 rounded-xl"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Roster</span>
                  </Button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${geo?.lat || -6.2},${geo?.lng || 106.8}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Quick Location Selector List */}
          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[220px] pr-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Site to Focus ({filteredLocations.length}):
            </div>
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocId === loc.id;
              const assigned = getAssignmentsForLocation(loc.id);

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {loc.city} &bull; <strong className="text-slate-700">{loc.clientName}</strong>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {assigned.length}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Site Roster Details Modal (Integrated with Deployment Map) */}
      {selectedLocationForModal && (() => {
        const assignedAll = getAssignmentsForLocation(selectedLocationForModal.id);
        const filtered = assignedAll.filter((asg) => {
          if (!rosterSearch.trim()) return true;
          const q = rosterSearch.toLowerCase();
          return (
            asg.personnelName.toLowerCase().includes(q) ||
            (asg.positionOnSite || asg.personnelPosition || '').toLowerCase().includes(q)
          );
        });

        const groupedRolesMap = new Map<string, typeof filtered>();
        for (const asg of filtered) {
          const role = asg.positionOnSite || asg.personnelPosition || 'General Security Officer';
          if (!groupedRolesMap.has(role)) {
            groupedRolesMap.set(role, []);
          }
          groupedRolesMap.get(role)!.push(asg);
        }

        const roleGroups = Array.from(groupedRolesMap.entries())
          .map(([role, items]) => ({
            role,
            items: items.sort((a, b) => a.personnelName.localeCompare(b.personnelName)),
          }))
          .sort((a, b) => a.role.localeCompare(b.role));

        return (
          <Dialog
            open={!!selectedLocationForModal}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedLocationForModal(null);
                setRosterSearch('');
              }
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-slate-900 font-bold">{selectedLocationForModal.name}</DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs">
                      {selectedLocationForModal.clientName} &bull; {selectedLocationForModal.address}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 text-xs flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-600" />
                    Assigned Personnel Roster ({assignedAll.length} Guards)
                  </h4>
                  <Link
                    href={`/deployments`}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Manage in Deployments</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Search Bar for Guards in Site */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={rosterSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRosterSearch(e.target.value)}
                    placeholder="Search guards by name or position..."
                    className="pl-9 pr-8 h-9 text-xs text-slate-900 placeholder:text-slate-400 border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                  {rosterSearch && (
                    <button
                      type="button"
                      onClick={() => setRosterSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Roster Counter - Sorted by Job A-Z */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5">
                  <span>
                    Showing {filtered.length} of {assignedAll.length} guards across {roleGroups.length} jobs (Sorted A–Z)
                  </span>
                </div>

                {/* Open Job Groups List - Auto Sorted A-Z (No Accordion) */}
                <div className="space-y-3.5 overflow-y-auto max-h-[50vh] pr-1 flex-1">
                  {roleGroups.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                      <p className="font-medium">No guards found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name or position</p>
                    </div>
                  ) : (
                    roleGroups.map((group) => (
                      <div
                        key={group.role}
                        className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/60 shadow-2xs space-y-2 p-2.5"
                      >
                        {/* Open Non-accordion Job Header */}
                        <div className="flex items-center justify-between px-2 py-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {group.role}
                            </span>
                            <Badge
                              variant="outline"
                              className="px-2 py-0 text-[10px] font-semibold bg-white text-slate-700 border-slate-200"
                            >
                              {group.items.length} {group.items.length === 1 ? 'Guard' : 'Guards'}
                            </Badge>
                          </div>
                        </div>

                        {/* Guards List - Always visible without accordion */}
                        <div className="space-y-1.5">
                          {group.items.map((asg) => (
                            <div
                              key={asg.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={asg.personnelPhoto}
                                  alt={asg.personnelName}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs truncate">
                                    {asg.personnelName}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium truncate">
                                    On duty since {formatDate(asg.startDate)}
                                  </div>
                                </div>
                              </div>

                              <Link href={`/personnel/${asg.personnelId}`} className="shrink-0 ml-2">
                                <Button variant="subtle" size="sm" className="h-7 px-2.5 text-[11px] font-semibold">
                                  Profile
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-slate-100">
                <Button variant="subtle" onClick={() => { setSelectedLocationForModal(null); setRosterSearch(''); }}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </Card>
  );
}
