'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Location } from '@/types';
import { getProjectDurationInfo, formatDate, exportToCsv } from '@/lib/utils';
import {
  MapPin,
  Users,
  Search,
  Download,
  Plus,
  ShieldCheck,
  Shield,
  Eye,
  UserCheck,
  ChevronDown,
  Calendar,
  X,
} from 'lucide-react';

function RoleIcon({ role }: { role: string }) {
  const lower = role.toLowerCase();
  if (lower.includes('danru') || lower.includes('commander') || lower.includes('chief')) {
    return <Shield className="h-3.5 w-3.5 text-blue-600" />;
  }
  if (lower.includes('supervisor')) {
    return <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />;
  }
  if (lower.includes('cctv') || lower.includes('surveillance')) {
    return <Eye className="h-3.5 w-3.5 text-teal-600" />;
  }
  if (lower.includes('vip') || lower.includes('escort') || lower.includes('close protection')) {
    return <UserCheck className="h-3.5 w-3.5 text-amber-600" />;
  }
  return <Users className="h-3.5 w-3.5 text-slate-600" />;
}
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

function DeploymentsContent() {
  const searchParams = useSearchParams();
  const assignPersonnelIdParam = searchParams.get('assignPersonnelId');

  const {
    locations,
    projects,
    assignments,
    personnelList,
    role,
    getAssignmentsForLocation,
    assignPersonnel,
    closeAssignment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');
  const [collapsedRoles, setCollapsedRoles] = useState<Record<string, boolean>>({});

  const toggleRole = (role: string) => {
    setCollapsedRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const expandAllRoles = () => setCollapsedRoles({});
  const collapseAllRoles = (roles: string[]) => {
    const next: Record<string, boolean> = {};
    roles.forEach((r) => { next[r] = true; });
    setCollapsedRoles(next);
  };

  const [isDeployModalOpen, setIsDeployModalOpen] = useState(!!assignPersonnelIdParam);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState(assignPersonnelIdParam || '');
  const [targetLocationId, setTargetLocationId] = useState(locations[0]?.id || '');
  const [positionOnSite, setPositionOnSite] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    if (assignPersonnelIdParam) {
      setSelectedPersonnelId(assignPersonnelIdParam);
      setIsDeployModalOpen(true);
    }
  }, [assignPersonnelIdParam]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(locations.map((l) => l.clientName))).sort();
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const proj = projects.find((p) => p.id === loc.projectId);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesClient = loc.clientName.toLowerCase().includes(q);
        const matchesProj = proj?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesClient && !matchesProj) return false;
      }

      if (clientFilter !== 'ALL' && loc.clientName !== clientFilter) {
        return false;
      }

      if (statusFilter !== 'ALL' && proj?.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [locations, projects, searchQuery, clientFilter, statusFilter]);

  const handleExportDeployments = () => {
    const headers = [
      'Location ID',
      'Location / Site Name',
      'Address',
      'Client Name',
      'Project Name',
      'Project Code',
      'Project Status',
      'Start Date',
      'End Date',
      'Remaining Duration',
      'Assigned Personnel Count',
    ];

    const rows = filteredLocations.map((loc) => {
      const proj = projects.find((p) => p.id === loc.projectId);
      const assigned = getAssignmentsForLocation(loc.id);
      const duration = getProjectDurationInfo(proj?.endDate);

      return [
        loc.id,
        loc.name,
        loc.address,
        loc.clientName,
        proj?.name || '-',
        proj?.projectCode || '-',
        proj?.status || '-',
        proj?.startDate || '-',
        proj?.endDate || 'Not set',
        duration.label,
        assigned.length,
      ];
    });

    exportToCsv('PT_JISS_Deployments_Roster', headers, rows);
  };

  const handleExportLocationPersonnel = (loc: Location) => {
    const assigned = getAssignmentsForLocation(loc.id);
    const headers = [
      'Personnel ID',
      'Full Name',
      'Position',
      'Position on Site',
      'Assignment Start Date',
      'Assignment End Date',
      'Status',
    ];
    const rows = assigned.map((a) => [
      a.personnelNumber,
      a.personnelName,
      a.personnelPosition,
      a.positionOnSite || '-',
      a.startDate,
      a.endDate || 'Ongoing',
      a.status,
    ]);
    exportToCsv(`Site_Roster_${loc.name.replace(/\s+/g, '_')}`, headers, rows);
  };

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = locations.find((l) => l.id === targetLocationId);
    if (!loc) return;

    assignPersonnel({
      personnelId: selectedPersonnelId,
      projectId: loc.projectId,
      locationId: targetLocationId,
      positionOnSite: positionOnSite.trim() || undefined,
      startDate,
      endDate: endDate || null,
    });

    setIsDeployModalOpen(false);
    setSelectedPersonnelId('');
    setPositionOnSite('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Deployment Locations & Project Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active client sites, guarding strength, assignment dates, and project duration countdowns
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {role !== 'READ_ONLY' && (
            <Button
              variant="subtle"
              size="sm"
              onClick={handleExportDeployments}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Export Roster CSV</span>
            </Button>
          )}

          {role === 'ADMIN' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSelectedPersonnelId(personnelList.find((p) => p.employmentStatus === 'ACTIVE')?.id || '');
                setIsDeployModalOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Deploy Personnel</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, client, or project..."
              className="pl-10 text-slate-900 placeholder:text-slate-400 border-slate-200"
            />
          </div>

          <div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            >
              <option value="ALL">All Clients</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            >
              <option value="ALL">All Project Statuses</option>
              <option value="ACTIVE">Active Projects</option>
              <option value="COMPLETED">Completed Projects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deployments Site Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLocations.map((loc) => {
          const proj = projects.find((p) => p.id === loc.projectId);
          const assigned = getAssignmentsForLocation(loc.id);
          const duration = getProjectDurationInfo(proj?.endDate);

          const isOverdue = duration.status === 'ended';
          const isUrgentOrWarning = duration.status === 'urgent' || duration.status === 'warning';

          return (
            <Card
              key={loc.id}
              className="p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-sm"
            >
              <div className="space-y-4">
                {/* Site Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{loc.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{loc.clientName} &bull; {loc.city}</p>
                    </div>
                  </div>

                  {/* Contract Condition Alert (Red for overdue, Amber for <=30d, Neutral otherwise) */}
                  {isOverdue ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      {duration.label}
                    </span>
                  ) : isUrgentOrWarning ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      {duration.label}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {duration.label}
                    </span>
                  )}
                </div>

                {/* Project Info & Combined Contract Timeline */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-900 font-bold">
                    <span className="truncate">{proj?.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px] text-slate-700 bg-white">
                      {proj?.projectCode}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between font-medium">
                    <span>
                      {proj?.endDate ? `Contract: ${formatDate(proj.endDate)} · ${duration.label}` : 'Indefinite contract duration'}
                    </span>
                    <Badge variant="outline" className="text-[9px] bg-white text-slate-700 font-bold">
                      {loc.status === 'ACTIVE' ? 'OPERATIONAL' : 'INACTIVE'}
                    </Badge>
                  </div>
                </div>

                {/* Assigned Headcount Section */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      Assigned Headcount ({assigned.length})
                    </span>
                    {assigned.length > 0 && role !== 'READ_ONLY' && (
                      <button
                        onClick={() => handleExportLocationPersonnel(loc)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export Site Guards</span>
                      </button>
                    )}
                  </div>

                  {assigned.length === 0 ? (
                    <div className="py-4 text-center rounded-xl bg-slate-50 text-xs text-slate-400 border border-dashed border-slate-200 font-medium">
                      No guards currently assigned to this location.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assigned.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={a.personnelPhoto}
                              alt={a.personnelName}
                              className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                href={`/personnel/${a.personnelId}`}
                                className="font-bold text-xs text-slate-900 truncate hover:text-blue-600 block transition"
                              >
                                {a.personnelName}
                              </Link>
                              <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                {a.positionOnSite || a.personnelPosition} &bull; since {formatDate(a.startDate)}
                              </div>
                            </div>
                          </div>

                          {role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                if (confirm(`End assignment for ${a.personnelName} at ${loc.name}?`)) {
                                  closeAssignment(a.id);
                                }
                              }}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 transition shrink-0 ml-2"
                            >
                              End Duty
                            </button>
                          )}
                        </div>
                      ))}

                      {assigned.length > 3 && (
                        <div className="text-center text-[11px] font-semibold text-slate-500 pt-1">
                          + {assigned.length - 3} additional assigned officers
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono font-medium">Site ID: {loc.id}</span>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setSelectedLocation(loc)}
                  className="font-semibold text-xs text-slate-800"
                >
                  Inspect Full Site Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* SHADCN DIALOG: Location Details */}
      {selectedLocation && (() => {
        const assignedAll = getAssignmentsForLocation(selectedLocation.id);
        const filtered = assignedAll.filter((asg) => {
          if (!rosterSearch.trim()) return true;
          const q = rosterSearch.toLowerCase();
          return (
            asg.personnelName.toLowerCase().includes(q) ||
            (asg.positionOnSite || asg.personnelPosition || '').toLowerCase().includes(q)
          );
        });

        const rolePriority = (r: string) => {
          const lower = r.toLowerCase();
          if (lower.includes('danru') || lower.includes('commander') || lower.includes('chief')) return 1;
          if (lower.includes('supervisor')) return 2;
          if (lower.includes('vip') || lower.includes('close protection') || lower.includes('escort')) return 3;
          if (lower.includes('cctv') || lower.includes('surveillance')) return 4;
          if (lower.includes('access') || lower.includes('lobby')) return 5;
          if (lower.includes('k9') || lower.includes('k-9')) return 6;
          if (lower.includes('utama')) return 7;
          if (lower.includes('madya')) return 8;
          if (lower.includes('pratama')) return 9;
          return 10;
        };

        const groupedRolesMap = new Map<string, typeof filtered>();
        for (const asg of filtered) {
          const role = asg.positionOnSite || asg.personnelPosition || 'General Security Officer';
          if (!groupedRolesMap.has(role)) {
            groupedRolesMap.set(role, []);
          }
          groupedRolesMap.get(role)!.push(asg);
        }

        const roleGroups = Array.from(groupedRolesMap.entries())
          .map(([role, items]) => ({ role, items }))
          .sort((a, b) => rolePriority(a.role) - rolePriority(b.role) || a.role.localeCompare(b.role));

        return (
          <Dialog
            open={!!selectedLocation}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedLocation(null);
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
                    <DialogTitle className="text-slate-900 font-bold">{selectedLocation.name}</DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs">
                      {selectedLocation.clientName} &bull; {selectedLocation.address}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 text-xs flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-700" />
                    Full Site Personnel Roster ({assignedAll.length} Guards)
                  </h4>
                  {role !== 'READ_ONLY' && (
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => handleExportLocationPersonnel(selectedLocation)}
                      className="gap-1 font-semibold"
                    >
                      <Download className="h-3 w-3" /> Export CSV
                    </Button>
                  )}
                </div>

                {/* Search Bar for Guards in Site */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
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

                {/* Roster Counter & Expand/Collapse Controls */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5">
                  <span>
                    Showing {filtered.length} of {assignedAll.length} guards across {roleGroups.length} roles
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={expandAllRoles}
                      className="text-slate-600 hover:text-slate-900 font-semibold underline text-[11px]"
                    >
                      Expand All
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => collapseAllRoles(roleGroups.map((g) => g.role))}
                      className="text-slate-600 hover:text-slate-900 font-semibold underline text-[11px]"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* Role Accordion List */}
                <div className="space-y-2.5 overflow-y-auto max-h-[48vh] pr-1 flex-1">
                  {roleGroups.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                      <p className="font-medium">No guards found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name or position</p>
                    </div>
                  ) : (
                    roleGroups.map((group) => {
                      const isSearching = rosterSearch.trim().length > 0;
                      const isOpen = isSearching || !collapsedRoles[group.role];

                      return (
                        <div
                          key={group.role}
                          className="rounded-xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs transition-all"
                        >
                          {/* Accordion Role Header */}
                          <button
                            type="button"
                            onClick={() => toggleRole(group.role)}
                            className="w-full px-3.5 py-2.5 bg-slate-50/90 hover:bg-slate-100/90 transition-colors flex items-center justify-between text-left select-none"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-6 w-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                <RoleIcon role={group.role} />
                              </div>
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

                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                                {isOpen ? 'Hide' : 'Show'}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>

                          {/* Accordion Role Content: Guards List */}
                          {isOpen && (
                            <div className="p-2 space-y-2 bg-slate-50/40 border-t border-slate-100">
                              {group.items.map((asg) => (
                                <div
                                  key={asg.id}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={asg.personnelPhoto}
                                      alt={asg.personnelName}
                                      className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
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

                                  <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <Link href={`/personnel/${asg.personnelId}`}>
                                      <Button variant="subtle" size="sm" className="h-7 px-2.5 text-[11px] font-semibold">
                                        Profile
                                      </Button>
                                    </Link>
                                    {role === 'ADMIN' && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          if (confirm(`Conclude assignment for ${asg.personnelName}?`)) {
                                            closeAssignment(asg.id);
                                          }
                                        }}
                                        className="h-7 px-2.5 text-[11px] font-semibold"
                                      >
                                        End Duty
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-slate-100">
                <Button variant="subtle" onClick={() => { setSelectedLocation(null); setRosterSearch(''); }}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* SHADCN DIALOG: Deploy Personnel */}
      {isDeployModalOpen && (
        <Dialog open={isDeployModalOpen} onOpenChange={(open) => !open && setIsDeployModalOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-slate-900 font-bold">Deploy Personnel to Site</DialogTitle>
                  <DialogDescription className="text-slate-500">Create new site assignment record</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleDeploySubmit} className="space-y-4 text-xs">
              <div>
                <Label htmlFor="officer-select" className="block mb-1.5 font-bold text-slate-700">Select Officer / Guard</Label>
                <select
                  id="officer-select"
                  value={selectedPersonnelId}
                  onChange={(e) => setSelectedPersonnelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
                  required
                >
                  <option value="">-- Choose Personnel --</option>
                  {personnelList
                    .filter((p) => p.employmentStatus === 'ACTIVE')
                    .map((p) => {
                      const isDeployed = assignments.some((a) => a.personnelId === p.id && a.status === 'ACTIVE');
                      return (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.personnelNumber}) &mdash; {p.position} {isDeployed ? '[Currently Deployed]' : '[Available / Ready]'}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <Label htmlFor="loc-select" className="block mb-1.5 font-bold text-slate-700">Target Deployment Site</Label>
                <select
                  id="loc-select"
                  value={targetLocationId}
                  onChange={(e) => setTargetLocationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
                  required
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} &mdash; {loc.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="pos-site" className="block mb-1.5 font-bold text-slate-700">Duty Position On Site</Label>
                <Input
                  id="pos-site"
                  type="text"
                  value={positionOnSite}
                  onChange={(e) => setPositionOnSite(e.target.value)}
                  placeholder="e.g. Chief of Post, Perimeter Patroller..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dep-start" className="block mb-1.5 font-bold text-slate-700">Start Date</Label>
                  <Input
                    id="dep-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dep-end" className="block mb-1.5 font-bold text-slate-700">End Date (Optional)</Label>
                  <Input
                    id="dep-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => setIsDeployModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  Confirm Assignment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function DeploymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading deployments...</div>}>
      <DeploymentsContent />
    </Suspense>
  );
}
