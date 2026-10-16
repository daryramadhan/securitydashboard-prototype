'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Location, Project, Client } from '@/types';
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
  Building2,
  FolderKanban,
  Info,
  Calendar,
  Sun,
  Moon,
  CornerDownRight,
  Phone,
  Layers,
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
  const { locations, projects, clients, getAssignmentsForLocation } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');
  
  // Track open / expanded companies in the collapsible table
  // 'proj-1' (Menara Astra) open by default as requested
  const [openCompanyIds, setOpenCompanyIds] = useState<Record<string, boolean>>({
    'proj-1': true,
  });

  const toggleCompany = (projectId: string) => {
    setOpenCompanyIds((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Group locations by Project / Company
  const groupedCompanyProjects = useMemo(() => {
    const list: Array<{
      project: Project;
      client: Client | undefined;
      locations: Location[];
      totalGuards: number;
      durationInfo: ReturnType<typeof getProjectDurationInfo>;
    }> = [];

    projects.forEach((proj) => {
      const projLocs = locations.filter((l) => l.projectId === proj.id);
      if (projLocs.length === 0) return;
      const client = clients.find((c) => c.id === proj.clientId || c.name === proj.clientName);
      const totalGuards = projLocs.reduce(
        (sum, l) => sum + getAssignmentsForLocation(l.id).length,
        0
      );
      const durationInfo = getProjectDurationInfo(proj.endDate);

      list.push({
        project: proj,
        client,
        locations: projLocs,
        totalGuards,
        durationInfo,
      });
    });

    return list;
  }, [projects, locations, clients, getAssignmentsForLocation]);

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    groupedCompanyProjects.forEach((g) => { all[g.project.id] = true; });
    setOpenCompanyIds(all);
  };

  const collapseAll = () => {
    setOpenCompanyIds({});
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm space-y-0">
      {/* Table Header Section */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-700" />
              Active Deployments by Company & Site
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 text-slate-600">
              {groupedCompanyProjects.length} Companies &bull; {locations.length} Areas
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Collapsible company deployments &bull; Click Menara Astra or any company to reveal specific areas and project details
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={expandAll}
              className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
            >
              Expand All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition"
            >
              Collapse All
            </button>
          </div>

          <Link
            href="/deployments"
            className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80"
          >
            <span>All Sites</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Collapsible Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-600">
            <TableHead className="w-[340px]">Company / Project Group</TableHead>
            <TableHead className="w-[180px]">Deployment Areas</TableHead>
            <TableHead className="text-center w-[120px]">Total Guards</TableHead>
            <TableHead className="w-[180px]">Contract Timeline</TableHead>
            <TableHead className="w-[130px]">Status</TableHead>
            <TableHead className="text-right w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {groupedCompanyProjects.map(({ project, client, locations: projLocs, totalGuards, durationInfo }) => {
            const isExpanded = !!openCompanyIds[project.id];
            const isOverdue = durationInfo.status === 'ended';
            const isUrgentOrWarning = durationInfo.status === 'urgent' || durationInfo.status === 'warning';

            return (
              <React.Fragment key={project.id}>
                {/* Level 1: Company / Project Row (Clickable to Expand / Collapse) */}
                <TableRow
                  onClick={() => toggleCompany(project.id)}
                  className={`cursor-pointer transition-colors border-b border-slate-100 ${
                    isExpanded ? 'bg-slate-50/80' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* 1. Company / Project Group */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Chevron Indicator */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompany(project.id);
                        }}
                        className="h-6 w-6 rounded-lg hover:bg-slate-200/80 text-slate-500 flex items-center justify-center transition-transform shrink-0"
                        title={isExpanded ? 'Collapse specific areas' : 'Expand specific areas'}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-0 text-slate-900' : '-rotate-90 text-slate-400'
                          }`}
                        />
                      </button>

                      {/* Icon */}
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isExpanded ? 'bg-[#FFF100] text-slate-950 border-yellow-300 shadow-2xs' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <Building2 className="h-4 w-4" />
                      </div>

                      {/* Company Name & Client */}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors truncate">
                          {project.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                          <span>{client?.name || project.clientName}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="font-mono text-[10px] text-slate-400">{project.projectCode}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Specific Areas Count */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                        <Layers className="h-3 w-3 text-slate-500" />
                        <span>{projLocs.length} Area{projLocs.length > 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  </TableCell>

                  {/* 3. Total Guards */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950 text-[#FFF100] border border-slate-800 shadow-2xs">
                      <Users className="h-3 w-3" />
                      <span>{totalGuards} Guards</span>
                    </span>
                  </TableCell>

                  {/* 4. Contract Timeline */}
                  <TableCell className="whitespace-nowrap">
                    {project.endDate ? (
                      <div className="space-y-0.5">
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
                      <span className="text-xs text-slate-500 font-medium">Indefinite &bull; Active</span>
                    )}
                  </TableCell>

                  {/* 5. Status */}
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="font-bold text-[10px] text-slate-700 uppercase tracking-wide border-slate-200 bg-white"
                    >
                      {project.status}
                    </Badge>
                  </TableCell>

                  {/* 6. Action: View Specific Project Details */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                        className="h-7 px-3 text-[11px] font-bold bg-[#FFF100] text-slate-950 hover:bg-[#ebd900] border border-yellow-300 shadow-2xs gap-1.5"
                        title="View Full Project Details, Shift Schedules & Hierarchy"
                      >
                        <Eye className="h-3 w-3 text-slate-950" />
                        <span>Project Details</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Level 2: Expanded Specific Areas in this Company */}
                {isExpanded && (
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200/90">
                    <TableCell colSpan={6} className="p-0">
                      <div className="py-3 px-4 sm:px-8 space-y-2.5 border-l-4 border-l-[#FFF100] bg-slate-50/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            Specific Deployment Areas in {project.name.split('-')[0].trim()} ({projLocs.length})
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Click any area to inspect guard rosters & post assignments
                          </span>
                        </div>

                        {/* List of Specific Deployment Areas */}
                        <div className="space-y-1.5">
                          {projLocs.map((loc) => {
                            const locGuards = getAssignmentsForLocation(loc.id);
                            const cmdr = locGuards.find((a) =>
                              a.positionOnSite?.toLowerCase().includes('danru') ||
                              a.positionOnSite?.toLowerCase().includes('commander') ||
                              a.positionOnSite?.toLowerCase().includes('chief') ||
                              a.positionOnSite?.toLowerCase().includes('supervisor')
                            ) || locGuards[0];

                            return (
                              <div
                                key={loc.id}
                                onClick={() => setSelectedLocation(loc)}
                                className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group/area"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 group-hover/area:bg-blue-50 group-hover/area:text-blue-600 transition-colors">
                                    <MapPin className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-slate-900 group-hover/area:text-blue-600 transition-colors truncate">
                                      {loc.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                                      <span>{loc.address}</span>
                                      <span className="text-slate-300">&bull;</span>
                                      <span className="text-slate-600 font-semibold">{loc.city}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                  {cmdr && (
                                    <div className="text-right text-[11px] hidden md:block">
                                      <span className="text-slate-400 block text-[10px]">Site Commander</span>
                                      <span className="font-bold text-slate-800">{cmdr.personnelName}</span>
                                    </div>
                                  )}

                                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-xs text-slate-800 border border-slate-200">
                                    {locGuards.length} Guards
                                  </span>

                                  <Button
                                    variant="subtle"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLocation(loc);
                                    }}
                                    className="h-7 px-2.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200"
                                  >
                                    Inspect Area
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {/* MODAL 1: Specific Project Details Modal */}
      {selectedProject && (() => {
        const proj = selectedProject;
        const client = clients.find((c) => c.id === proj.clientId || c.name === proj.clientName);
        const duration = getProjectDurationInfo(proj.endDate);
        const projectLocs = locations.filter((l) => l.projectId === proj.id);
        const allAssignedInGroup = projectLocs.flatMap((l) => getAssignmentsForLocation(l.id));

        return (
          <Dialog open={true} onOpenChange={(open) => !open && setSelectedProject(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
              <DialogHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#FFF100] text-slate-950 border border-yellow-300 flex items-center justify-center shrink-0 shadow-2xs">
                    <FolderKanban className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                        {proj.name}
                      </DialogTitle>
                      <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-700">
                        {proj.projectCode}
                      </Badge>
                      <Badge variant="default" className="text-[11px] bg-slate-950 text-[#FFF100] font-bold border border-slate-800">
                        {proj.status}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 mt-0.5">
                      Client Group Security Operations Overview & Personnel Deployment
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {/* 3-Column Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>Client Details</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{client?.name || proj.clientName}</div>
                    <div className="text-xs text-slate-500">{client?.industry || 'Commercial Client'}</div>
                    {client?.contactPerson && (
                      <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/60 mt-1">
                        Contact: <span className="font-medium">{client.contactPerson}</span>
                        {client.contactPhone && <span className="block text-[11px] text-slate-500">{client.contactPhone}</span>}
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Contract Lifecycle</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {formatDate(proj.startDate)} &rarr; {proj.endDate ? formatDate(proj.endDate) : 'Indefinite'}
                    </div>
                    <div className="pt-1">
                      {duration.daysRemaining !== null ? (
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                          duration.daysRemaining < 0
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : duration.daysRemaining <= 30
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {duration.label}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Ongoing active term</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>Deployment Strength</span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">{allAssignedInGroup.length} Guards</div>
                    <div className="text-xs text-slate-500">
                      Across {projectLocs.length} Deployment Area{projectLocs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <Info className="h-3.5 w-3.5 text-blue-600" />
                    <span>Operational Scope & Mandate</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {proj.description || 'Comprehensive perimeter patrol, physical screening, visitor badge management, and 24/7 security incident response.'}
                  </p>
                </div>

                {/* Specific Deployment Areas in this Project */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Deployment Areas in this Project ({projectLocs.length})
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {projectLocs.map((l) => {
                      const locGuards = getAssignmentsForLocation(l.id);
                      return (
                        <div key={l.id} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-blue-600" />
                              <span>{l.name}</span>
                              <span className="text-slate-400 font-normal">({l.city})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{l.address}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">
                              {locGuards.length} Guards
                            </span>
                            <Button
                              variant="subtle"
                              size="sm"
                              onClick={() => {
                                setSelectedProject(null);
                                setSelectedLocation(l);
                              }}
                              className="h-7 text-xs font-semibold"
                            >
                              Inspect Roster
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link href="/deployments">
                  <Button variant="default" size="sm" className="font-bold gap-1 text-xs">
                    <span>Manage in Deployments Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* MODAL 2: Specific Location / Site Roster Dialog */}
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
            open={!!selectedLocation}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedLocation(null);
                setRosterSearch('');
              }
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
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

              {/* Search & Filter within Roster */}
              <div className="space-y-3 py-2 flex-1 overflow-hidden flex flex-col">
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

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5">
                  <span>
                    Showing {filtered.length} of {assignedAll.length} guards across {roleGroups.length} roles
                  </span>
                </div>

                {/* Guards List */}
                <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1 flex-1">
                  {roleGroups.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                      <p className="font-medium">No guards found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name or position</p>
                    </div>
                  ) : (
                    roleGroups.map((group) => (
                      <div
                        key={group.role}
                        className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/60 space-y-2 p-2.5"
                      >
                        <div className="flex items-center justify-between px-2 py-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
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
                        </div>

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
