'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Location } from '@/types';
import { getProjectDurationInfo, formatDate } from '@/lib/utils';
import {
  MapPin,
  Users,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  X,
  Shield,
  ShieldCheck,
  Eye,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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

export function ActiveLocationsTable() {
  const { locations, projects, getAssignmentsForLocation } = useApp();
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

  const activeLocationsWithData = locations.map((loc) => {
    const project = projects.find((p) => p.id === loc.projectId);
    const assignedPersonnel = getAssignmentsForLocation(loc.id);
    const durationInfo = getProjectDurationInfo(project?.endDate);

    return {
      location: loc,
      project,
      assignedPersonnel,
      assignedCount: assignedPersonnel.length,
      durationInfo,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-700" />
            Deployment Locations & Guarding Strength
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time deployed guards, operational status, and combined contract expiration timelines
          </p>
        </div>
        <Link
          href="/deployments"
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <span>View all deployments</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location / Site</TableHead>
            <TableHead>Client & Project</TableHead>
            <TableHead className="text-center">Guards</TableHead>
            <TableHead>Contract Timeline</TableHead>
            <TableHead>Operational Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeLocationsWithData.map(({ location, project, assignedCount, durationInfo }) => {
            // Requirement 6: Use colors ONLY for critical conditions:
            // Red for overdue, Amber for approaching deadline, Neutral for normal
            const isOverdue = durationInfo.status === 'ended';
            const isUrgentOrWarning = durationInfo.status === 'urgent' || durationInfo.status === 'warning';

            return (
              <TableRow
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className="cursor-pointer hover:bg-slate-50/80"
              >
                {/* 1. Location / Site */}
                <TableCell>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div>{location.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{location.city}</div>
                    </div>
                  </div>
                </TableCell>

                {/* 2. Client & Project */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{location.clientName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs font-medium">{project?.name || '-'}</div>
                  </div>
                </TableCell>

                {/* 3. Guards Count (Neutral styling) */}
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    <Users className="h-3 w-3 text-slate-500" />
                    {assignedCount}
                  </span>
                </TableCell>

                {/* 4. Combined Project Period and Remaining Duration (e.g. "26 Oct 2026 · 12 days left") */}
                <TableCell className="whitespace-nowrap">
                  {project?.endDate ? (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">
                        {formatDate(project.endDate)}
                      </div>
                      <div>
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {durationInfo.label}
                          </span>
                        ) : isUrgentOrWarning ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock className="h-2.5 w-2.5" />
                            {durationInfo.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {durationInfo.label}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-medium">
                      Indefinite · No end date
                    </div>
                  )}
                </TableCell>

                {/* 5. Operational Status (Neutral badge - separated from contract timeline) */}
                <TableCell className="whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className="font-bold text-slate-700 uppercase tracking-wide border-slate-200 bg-slate-50"
                  >
                    {location.status === 'ACTIVE' ? 'OPERATIONAL' : 'INACTIVE'}
                  </Badge>
                </TableCell>

                {/* 6. Action */}
                <TableCell className="text-right">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation(location);
                    }}
                    className="font-bold text-xs text-slate-800"
                  >
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* SHADCN DIALOG: Location Details & Assigned Personnel */}
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
                    <Users className="h-4 w-4 text-slate-600" />
                    Assigned Personnel Roster ({assignedAll.length} Guards)
                  </h4>
                  <Link
                    href={`/deployments`}
                    className="text-xs text-slate-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Manage Site in Deployments</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Search Bar for Guards */}
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
    </div>
  );
}
