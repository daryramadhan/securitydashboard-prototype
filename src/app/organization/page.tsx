'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Personnel } from '@/types';
import {
  Network,
  ChevronDown,
  ChevronRight,
  Shield,
  ExternalLink,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Move,
  Maximize2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface TreeNodeProps {
  person: Personnel;
  allPersonnel: Personnel[];
  level: number;
  forceExpand: boolean | null;
  searchQuery: string;
}

function hasMatchingDescendant(person: Personnel, allPersonnel: Personnel[], query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase();
  const subordinates = allPersonnel.filter((p) => p.supervisorId === person.id);
  return subordinates.some(
    (sub) =>
      sub.fullName.toLowerCase().includes(q) ||
      sub.position.toLowerCase().includes(q) ||
      sub.personnelNumber.toLowerCase().includes(q) ||
      hasMatchingDescendant(sub, allPersonnel, query)
  );
}

function TreeNode({ person, allPersonnel, level, forceExpand, searchQuery }: TreeNodeProps) {
  // Default expanded for top 2 levels (Chief Security & Squad Supervisors)
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [showAllSubordinates, setShowAllSubordinates] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Personnel | null>(null);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [squadSearch, setSquadSearch] = useState('');

  const subordinates = allPersonnel.filter((p) => p.supervisorId === person.id);
  const hasSubordinates = subordinates.length > 0;

  const isDanru =
    person.position.toLowerCase().includes('danru') ||
    person.position.toLowerCase().includes('field commander');

  // React to forceExpand
  useEffect(() => {
    if (forceExpand !== null) {
      setIsExpanded(forceExpand);
      if (!forceExpand) {
        setShowAllSubordinates(false);
      }
    }
  }, [forceExpand]);

  // If a child matches search, auto-expand so it is visible
  useEffect(() => {
    if (searchQuery && hasMatchingDescendant(person, allPersonnel, searchQuery)) {
      setIsExpanded(true);
    }
  }, [searchQuery, person, allPersonnel]);

  const isMatched =
    Boolean(searchQuery) &&
    (person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.personnelNumber.toLowerCase().includes(searchQuery.toLowerCase()));

  // Subordinates display logic: Show top 2 only, unless showAllSubordinates or matching search query
  let visibleSubordinates = subordinates;
  let hiddenSubordinates: Personnel[] = [];

  if (subordinates.length > 2 && !showAllSubordinates) {
    visibleSubordinates = subordinates.slice(0, 2);

    // If search query matches any subordinate beyond index 1, keep it visible
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const extraMatches = subordinates.slice(2).filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.position.toLowerCase().includes(q) ||
          s.personnelNumber.toLowerCase().includes(q)
      );
      if (extraMatches.length > 0) {
        visibleSubordinates = [...visibleSubordinates, ...extraMatches];
      }
    }

    hiddenSubordinates = subordinates.filter((s) => !visibleSubordinates.some((v) => v.id === s.id));
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="relative group">
        <div
          className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 bg-white shadow-sm min-w-[260px] max-w-[320px] ${
            isMatched
              ? 'ring-2 ring-blue-600 bg-blue-50/90 shadow-md border-blue-400'
              : level === 0
              ? 'border-slate-400/80 shadow-md ring-1 ring-slate-200'
              : isDanru
              ? 'border-amber-300/80 bg-amber-50/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <img
              src={person.photoUrl}
              alt={person.fullName}
              className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                person.employmentStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {person.fullName}
              </span>
              <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 shrink-0">
                {person.personnelNumber}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-blue-600 font-medium truncate">
                {person.position}
              </span>
              {isDanru && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-amber-100/80 text-amber-900 border border-amber-200 text-[8.5px] font-bold shrink-0">
                  Danru
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center justify-between">
              <span className="truncate max-w-[130px]">{person.organizationalUnitName}</span>
              {hasSubordinates && (
                <span className="font-semibold text-slate-700 shrink-0 ml-1">
                  {subordinates.length} {isDanru ? 'troops' : 'reports'}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/personnel/${person.id}`}
            title="Inspect Personnel Profile"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {hasSubordinates && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse team branch' : 'Expand team branch'}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center h-6 px-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold shadow-sm transition"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="ml-1">{subordinates.length}</span>
          </button>
        )}
      </div>

      {/* Subordinates Branch */}
      {hasSubordinates && isExpanded && (
        <div className="flex flex-col items-center pt-6 relative before:absolute before:top-0 before:left-1/2 before:w-0.5 before:h-6 before:bg-slate-200">
          <div className="flex flex-wrap items-start justify-center gap-6 pt-4 relative">
            {/* Visible Subordinate Nodes */}
            {visibleSubordinates.map((sub) => (
              <TreeNode
                key={sub.id}
                person={sub}
                allPersonnel={allPersonnel}
                level={level + 1}
                forceExpand={forceExpand}
                searchQuery={searchQuery}
              />
            ))}

            {/* Hub Card: When only Top 2 are displayed, show interactive selector card */}
            {hiddenSubordinates.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="p-3.5 rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 shadow-xs min-w-[280px] max-w-[320px] flex flex-col justify-between gap-3 text-left">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-lg bg-blue-600 text-white shrink-0">
                        <Shield className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          +{hiddenSubordinates.length} More Security
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {person.fullName.split(' ')[0]}&apos;s team members
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 text-[9px] font-bold shrink-0">
                      {subordinates.length} Total
                    </Badge>
                  </div>

                  {/* Dropdown Selector to select & open officer */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Select officer to open
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const found = allPersonnel.find((p) => p.id === e.target.value);
                        if (found) setSelectedOfficer(found);
                      }}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="" disabled>
                        Choose an officer ({hiddenSubordinates.length})...
                      </option>
                      {hiddenSubordinates.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          [{sub.personnelNumber}] {sub.fullName} — {sub.position}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllSubordinates(true)}
                      className="flex-1 text-[11px] h-7 bg-white hover:bg-slate-50 font-bold border-slate-200 text-slate-700"
                    >
                      Show All ({subordinates.length})
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setIsSquadModalOpen(true)}
                      className="text-[11px] h-7 px-3 font-bold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Squad List
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* When all subordinates are shown, provide button to collapse back to top 2 */}
            {subordinates.length > 2 && showAllSubordinates && (
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 bg-white/90 shadow-2xs min-w-[220px] max-w-[260px] h-[105px] gap-2">
                <div className="text-[11px] font-medium text-slate-600 text-center">
                  Showing all <span className="font-bold text-slate-900">{subordinates.length}</span> troops
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllSubordinates(false)}
                  className="text-[11px] h-7 font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200"
                >
                  Show Top 2 Only
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Officer Detail Dialog */}
      <Dialog open={selectedOfficer !== null} onOpenChange={(open) => !open && setSelectedOfficer(null)}>
        <DialogContent className="max-w-md">
          {selectedOfficer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedOfficer.photoUrl}
                      alt={selectedOfficer.fullName}
                      className="h-12 w-12 rounded-full object-cover border border-slate-200"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        selectedOfficer.employmentStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base font-bold text-slate-900 truncate">
                      {selectedOfficer.fullName}
                    </DialogTitle>
                    <div className="text-xs text-blue-600 font-semibold truncate">
                      {selectedOfficer.position}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {selectedOfficer.personnelNumber} • {selectedOfficer.organizationalUnitName}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3.5 pt-2 text-xs">
                {/* Danru / Command info */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Reporting Field Commander (Danru)</span>
                  <span className="font-bold text-slate-900">{selectedOfficer.supervisorName || person.fullName}</span>
                </div>

                {/* Kaporlap sizing */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Kaporlap & Sizing
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[9px] text-slate-500">Shoes</div>
                      <div className="font-bold text-slate-900">{selectedOfficer.shoesSize || '-'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[9px] text-slate-500">Shirt</div>
                      <div className="font-bold text-slate-900">{selectedOfficer.shirtSize || '-'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[9px] text-slate-500">Pants</div>
                      <div className="font-bold text-slate-900">{selectedOfficer.pantsSize || '-'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[9px] text-slate-500">Duty Belt</div>
                      <div className="font-bold text-slate-900 truncate">{selectedOfficer.dutyBeltSize?.split(' ')[0] || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                {selectedOfficer.qualifications && selectedOfficer.qualifications.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Qualifications
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOfficer.qualifications.map((q) => (
                        <Badge key={q.id} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                          {q.qualificationName} ({q.status})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOfficer(null)}
                  >
                    Close
                  </Button>
                  <Link href={`/personnel/${selectedOfficer.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1">
                      Open Full Profile
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Squad Full Directory Modal */}
      <Dialog open={isSquadModalOpen} onOpenChange={setIsSquadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Squad Force under {person.fullName}
            </DialogTitle>
            <DialogDescription>
              {person.position} • {subordinates.length} officers reporting in this command unit
            </DialogDescription>
          </DialogHeader>

          {/* Search Filter */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search officer in this squad..."
              value={squadSearch}
              onChange={(e) => setSquadSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Roster Grid */}
          <div className="overflow-y-auto flex-1 max-h-[50vh] space-y-2 pr-1 mt-3">
            {subordinates
              .filter((s) => {
                if (!squadSearch) return true;
                const q = squadSearch.toLowerCase();
                return (
                  s.fullName.toLowerCase().includes(q) ||
                  s.position.toLowerCase().includes(q) ||
                  s.personnelNumber.toLowerCase().includes(q)
                );
              })
              .map((sub, idx) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-right">
                      #{idx + 1}
                    </span>
                    <img
                      src={sub.photoUrl}
                      alt={sub.fullName}
                      className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {sub.fullName}
                        </span>
                        <Badge variant="outline" className="font-mono text-[9px] px-1 py-0">
                          {sub.personnelNumber}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-blue-600 font-medium truncate">
                        {sub.position}
                      </div>
                    </div>
                  </div>

                  <Link href={`/personnel/${sub.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold gap-1">
                      Open Profile
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrganizationPage() {
  const { personnelList } = useApp();
  const [zoom, setZoom] = useState(1);
  const [isAllExpanded, setIsAllExpanded] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Drag-to-pan state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const topLeaders = personnelList.filter((p) => !p.supervisorId);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.8, Math.round((prev + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.25, Math.round((prev - 0.15) * 100) / 100));
  };

  const handleResetZoom = () => {
    setZoom(1);
    if (containerRef.current) {
      // Center scroll horizontally
      const container = containerRef.current;
      container.scrollTo({
        left: (container.scrollWidth - container.clientWidth) / 2,
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    if (!containerRef.current) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    containerRef.current.scrollLeft = panStart.scrollLeft - dx;
    containerRef.current.scrollTop = panStart.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom with Ctrl or Meta key
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  const toggleExpandAll = () => {
    setIsAllExpanded((prev) => (prev === true ? false : true));
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-600" />
            Organizational Command Hierarchy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal reporting relationships and supervision chain across PT. JISS security force
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Users className="h-3.5 w-3.5 text-blue-600" />
          <span>Total Officers in Chain: <strong className="text-slate-900">{personnelList.length}</strong></span>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-800 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Shield className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
          <div>
            <strong>Command Integrity:</strong> Organizational reporting relationships reflect the permanent chain of command and supervision within PT. JISS, distinct from temporary client site deployments.
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-blue-700/80 shrink-0 font-medium">
          <Move className="h-3 w-3" />
          <span>Click & drag to pan &bull; Ctrl+Scroll to zoom</span>
        </div>
      </div>

      {/* Interactive Controls Toolbar: Zoom In, Zoom Out, Presets, Search & Expand */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        {/* Left Side: Zoom in/out, Presets, Reset */}
        <div className="flex items-center gap-2.5">
          {/* Zoom Buttons Group */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.25}
              title="Zoom Out (Ctrl + Scroll Down)"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span className="px-2.5 py-0.5 text-xs font-bold font-mono text-slate-800 min-w-[54px] text-center select-none">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 1.8}
              title="Zoom In (Ctrl + Scroll Up)"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
            {[
              { label: '35%', value: 0.35 },
              { label: '50%', value: 0.5 },
              { label: '75%', value: 0.75 },
              { label: '100%', value: 1.0 },
              { label: '125%', value: 1.25 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setZoom(preset.value)}
                className={`px-2 py-1 rounded-lg text-xs transition ${
                  Math.abs(zoom - preset.value) < 0.05
                    ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Reset Zoom Button */}
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom to 100%"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

        {/* Right Side: Search in tree + Expand All */}
        <div className="flex items-center gap-2">
          {/* Search Input to locate guard in tree */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find officer in hierarchy..."
              className="pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 w-48 sm:w-56"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            )}
          </div>

          {/* Expand / Collapse All */}
          <button
            type="button"
            onClick={toggleExpandAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            {isAllExpanded ? (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                <span>Expand All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Tree Canvas */}
      <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-sm overflow-hidden">
        {/* Scrollable & Draggable Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full overflow-auto min-h-[580px] max-h-[760px] p-10 select-none ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Scalable Container */}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
            className="inline-block min-w-full text-center"
          >
            <div className="flex flex-col items-center gap-8 min-w-max mx-auto py-2">
              {topLeaders.map((leader) => (
                <TreeNode
                  key={leader.id}
                  person={leader}
                  allPersonnel={personnelList}
                  level={0}
                  forceExpand={isAllExpanded}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Quick Zoom overlay on bottom right of the canvas */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.25}
            className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-800 px-2 min-w-[46px] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 1.8}
            className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            title="Reset Zoom to 100%"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
