'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Location, Project, Client } from '@/types';
import { getProjectDurationInfo, formatDate, exportToCsv } from '@/lib/utils';
import {
  MapPin,
  Users,
  Search,
  Download,
  Plus,
  ShieldCheck,
  Check,
  Shield,
  Eye,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
  Building2,
  ChevronRight,
  FolderKanban,
  Info,
  Phone,
  Briefcase,
  FileSpreadsheet,
  MoreHorizontal,
  CheckCircle2,
  Star,
  Clock,
  Sun,
  Sunset,
  Moon,
  CornerDownRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

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

const DEFAULT_DUTY_POSITIONS = [
  'Site Commander (Danru)',
  'Shift Supervisor',
  'Access Control & Lobby Specialist',
  'Perimeter Patrol Officer',
  'CCTV & Surveillance Specialist',
  'Loading Dock & X-Ray Screener',
  'VIP Close Protection Officer',
  'Traffic & Ingress Controller',
];

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
    clients,
    getAssignmentsForLocation,
    assignPersonnel,
    closeAssignment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ONGOING' | 'DRAFT' | 'COMPLETED'>('ONGOING');
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<string[]>(['proj-1']);

  const toggleFavoriteProject = (projectId: string, projectName: string) => {
    if (favoriteProjectIds.includes(projectId)) {
      setFavoriteProjectIds((prev) => prev.filter((id) => id !== projectId));
      toast.info(`"${projectName}" removed from favorites.`);
    } else {
      if (favoriteProjectIds.length >= 3) {
        toast.warning('Maximum 3 favorite projects allowed. Unstar another project first.');
        return;
      }
      setFavoriteProjectIds((prev) => [...prev, projectId]);
      toast.success(`"${projectName}" starred and pinned to the top.`);
    }
  };

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
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(
    assignPersonnelIdParam ? [assignPersonnelIdParam] : []
  );
  const [isOfficerPickerOpen, setIsOfficerPickerOpen] = useState(false);
  const [officerSearchQuery, setOfficerSearchQuery] = useState('');
  const [pinnedSelectedIds, setPinnedSelectedIds] = useState<string[]>([]);
  const officerPickerRef = useRef<HTMLDivElement>(null);
  const selectedPersonnelId = selectedPersonnelIds[0] || '';

  const [targetLocationId, setTargetLocationId] = useState(locations[0]?.id || '');
  const [positionOnSite, setPositionOnSite] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [deployTargetProjectId, setDeployTargetProjectId] = useState<string | null>(null);

  // Close officer dropdown when clicking outside (e.g. clicking target site, duty position, or date)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (officerPickerRef.current && !officerPickerRef.current.contains(event.target as Node)) {
        setIsOfficerPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // When opening the dropdown: snapshot current selected IDs to pin them on top.
  // While the dropdown stays open, list order remains completely locked/stable so the scroll position never jumps.
  React.useEffect(() => {
    if (isOfficerPickerOpen) {
      setPinnedSelectedIds(selectedPersonnelIds);
    }
  }, [isOfficerPickerOpen]);

  const toggleOfficerSelection = (id: string) => {
    setSelectedPersonnelIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Collapsible role groups in dropdown: collapsed by default (empty expanded state)
  const [expandedDropdownRoles, setExpandedDropdownRoles] = useState<Record<string, boolean>>({});

  const toggleDropdownRole = (role: string) => {
    setExpandedDropdownRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const expandAllDropdownRoles = () => {
    const next: Record<string, boolean> = {};
    groupedOfficersByRole.forEach((g) => {
      next[g.roleName] = true;
    });
    setExpandedDropdownRoles(next);
  };

  const collapseAllDropdownRoles = () => {
    setExpandedDropdownRoles({});
  };

  // Multi-selector search and sort:
  // Sorts by pinnedSelectedIds (snapshotted when dropdown opened), so active selections don't shift positions
  const filteredAndSortedOfficers = useMemo(() => {
    const q = officerSearchQuery.trim().toLowerCase();
    return personnelList
      .filter((p) => p.employmentStatus === 'ACTIVE')
      .filter((p) => {
        if (!q) return true;
        const matchName = p.fullName.toLowerCase().includes(q);
        const matchNumber = p.personnelNumber.toLowerCase().includes(q);
        const matchPos = p.position.toLowerCase().includes(q);
        const matchSkill = p.qualifications.some((qual) =>
          qual.qualificationName.toLowerCase().includes(q)
        );
        return matchName || matchNumber || matchPos || matchSkill;
      })
      .sort((a, b) => {
        const aPinned = pinnedSelectedIds.includes(a.id);
        const bPinned = pinnedSelectedIds.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return a.fullName.localeCompare(b.fullName);
      });
  }, [personnelList, pinnedSelectedIds, officerSearchQuery]);

  // Group officers by role/position for collapsible role sections in the dropdown.
  // Within each role group, pinned selected officers appear first.
  // Roles with pinned selected officers appear first on dropdown open.
  const groupedOfficersByRole = useMemo(() => {
    const map = new Map<string, typeof filteredAndSortedOfficers>();
    filteredAndSortedOfficers.forEach((p) => {
      const roleName = p.position || 'General Security Personnel';
      if (!map.has(roleName)) {
        map.set(roleName, []);
      }
      map.get(roleName)!.push(p);
    });

    return Array.from(map.entries())
      .map(([roleName, officers]) => {
        const hasPinnedSelected = officers.some((o) => pinnedSelectedIds.includes(o.id));
        return {
          roleName,
          officers,
          hasPinnedSelected,
        };
      })
      .sort((a, b) => {
        if (a.hasPinnedSelected && !b.hasPinnedSelected) return -1;
        if (!a.hasPinnedSelected && b.hasPinnedSelected) return 1;
        return a.roleName.localeCompare(b.roleName);
      });
  }, [filteredAndSortedOfficers, pinnedSelectedIds]);

  // Scoped locations for deployment: limits to child sites of the selected project group
  const availableTargetLocations = useMemo(() => {
    if (deployTargetProjectId) {
      const childLocations = locations.filter((loc) => loc.projectId === deployTargetProjectId);
      if (childLocations.length > 0) return childLocations;
    }
    return locations;
  }, [locations, deployTargetProjectId]);

  const deployTargetProject = useMemo(() => {
    if (!deployTargetProjectId) return null;
    return projects.find((p) => p.id === deployTargetProjectId) || null;
  }, [projects, deployTargetProjectId]);

  // Keep targetLocationId in sync with availableTargetLocations
  React.useEffect(() => {
    if (availableTargetLocations.length > 0 && !availableTargetLocations.some((l) => l.id === targetLocationId)) {
      setTargetLocationId(availableTargetLocations[0].id);
    }
  }, [availableTargetLocations, targetLocationId]);

  React.useEffect(() => {
    if (assignPersonnelIdParam) {
      setSelectedPersonnelIds([assignPersonnelIdParam]);
      setIsDeployModalOpen(true);
    }
  }, [assignPersonnelIdParam]);

  // Fast Auto-fill: when a guard is selected, pre-fill duty position if empty
  React.useEffect(() => {
    if (selectedPersonnelId) {
      const p = personnelList.find((person) => person.id === selectedPersonnelId);
      if (p && !positionOnSite) {
        setPositionOnSite(p.position || DEFAULT_DUTY_POSITIONS[2]);
      }
    }
  }, [selectedPersonnelId, personnelList, positionOnSite]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.clientName))).sort();
  }, [projects]);

  // Tab Counters
  const ongoingCount = useMemo(() => {
    return projects.filter((p) => p.status === 'ACTIVE').length;
  }, [projects]);

  const draftCount = useMemo(() => {
    return projects.filter((p) => p.status === 'DRAFT' || p.status === 'UPCOMING' || p.status === 'ON_HOLD').length;
  }, [projects]);

  const completedCount = useMemo(() => {
    return projects.filter((p) => p.status === 'COMPLETED').length;
  }, [projects]);

  // Filtered projects based on activeTab, clientFilter, and searchQuery
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // 1. Tab filter
      if (activeTab === 'ONGOING' && proj.status !== 'ACTIVE') return false;
      if (activeTab === 'DRAFT' && proj.status !== 'DRAFT' && proj.status !== 'UPCOMING' && proj.status !== 'ON_HOLD') return false;
      if (activeTab === 'COMPLETED' && proj.status !== 'COMPLETED') return false;

      // 2. Client filter
      if (clientFilter !== 'ALL' && proj.clientName !== clientFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = proj.name.toLowerCase().includes(q);
        const matchClient = proj.clientName.toLowerCase().includes(q);
        const matchCode = proj.projectCode.toLowerCase().includes(q);
        const projectLocs = locations.filter((l) => l.projectId === proj.id);
        const matchLoc = projectLocs.some(
          (l) => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
        );
        if (!matchName && !matchClient && !matchCode && !matchLoc) return false;
      }

      return true;
    });
  }, [projects, locations, activeTab, clientFilter, searchQuery]);

  // Grouped projects with favorite projects pinned to the top
  const groupedProjects = useMemo(() => {
    const list = filteredProjects.map((proj) => {
      const projectLocations = locations.filter((loc) => loc.projectId === proj.id);
      return {
        project: proj,
        locations: projectLocations,
      };
    });

    return list.sort((a, b) => {
      const aFav = favoriteProjectIds.includes(a.project.id);
      const bFav = favoriteProjectIds.includes(b.project.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [filteredProjects, locations, favoriteProjectIds]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'proj-1': true,
  });
  const [selectedGroupModal, setSelectedGroupModal] = useState<Project | null>(null);

  const toggleGroup = (projectId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const expandAllGroups = () => {
    const next: Record<string, boolean> = {};
    groupedProjects.forEach(({ project }) => {
      next[project.id] = true;
    });
    setOpenGroups(next);
  };

  const collapseAllGroups = () => {
    setOpenGroups({});
  };

  const handleExportProjectGroup = (proj: Project, locs: Location[]) => {
    const headers = [
      'Project Name',
      'Project Code',
      'Client Name',
      'Location / Site Name',
      'Location Address',
      'Personnel ID',
      'Full Name',
      'Position',
      'Position on Site',
      'Assignment Start Date',
      'Assignment End Date',
      'Status',
    ];

    const rows: (string | number)[][] = [];
    locs.forEach((loc) => {
      const assigned = getAssignmentsForLocation(loc.id);
      assigned.forEach((a) => {
        rows.push([
          proj.name,
          proj.projectCode,
          proj.clientName,
          loc.name,
          loc.address,
          a.personnelNumber,
          a.personnelName,
          a.personnelPosition,
          a.positionOnSite || '-',
          a.startDate,
          a.endDate || 'Ongoing',
          a.status,
        ]);
      });
    });

    exportToCsv(`Group_Roster_${proj.projectCode}`, headers, rows);
  };

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

    const rows = groupedProjects.flatMap(({ project: proj, locations: projectLocations }) => {
      return projectLocations.map((loc) => {
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
    if (selectedPersonnelIds.length === 0) {
      toast.warning('Please select at least one officer or guard to deploy.');
      return;
    }

    const loc = locations.find((l) => l.id === targetLocationId);
    if (!loc) return;

    selectedPersonnelIds.forEach((pId) => {
      assignPersonnel({
        personnelId: pId,
        projectId: loc.projectId,
        locationId: targetLocationId,
        positionOnSite: positionOnSite.trim() || undefined,
        startDate,
        endDate: endDate || null,
      });
    });

    toast.success(
      `Successfully deployed ${selectedPersonnelIds.length} security personnel to ${loc.name}.`
    );

    setIsDeployModalOpen(false);
    setSelectedPersonnelIds([]);
    setPositionOnSite('');
    setDeployTargetProjectId(null);
    setOfficerSearchQuery('');
    setIsOfficerPickerOpen(false);
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
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
      </div>

      {/* Tabs Below Search & Filter: On Going Projects | Draft | Complete Projects */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('ONGOING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            activeTab === 'ONGOING'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <div className={`h-2 w-2 rounded-full ${activeTab === 'ONGOING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>On Going Projects</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'ONGOING' ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/70 text-slate-600'}`}>
            {ongoingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DRAFT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            activeTab === 'DRAFT'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <div className={`h-2 w-2 rounded-full ${activeTab === 'DRAFT' ? 'bg-amber-500' : 'bg-slate-400'}`} />
          <span>Draft</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'DRAFT' ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/70 text-slate-600'}`}>
            {draftCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            activeTab === 'COMPLETED'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <div className={`h-2 w-2 rounded-full ${activeTab === 'COMPLETED' ? 'bg-blue-500' : 'bg-slate-400'}`} />
          <span>Complete Projects</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'COMPLETED' ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/70 text-slate-600'}`}>
            {completedCount}
          </span>
        </button>
      </div>

      {/* Group List Header Bar with Count and Collapse/Expand All controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">
            {groupedProjects.length} Project Group{groupedProjects.length > 1 ? 's' : ''}
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-xs text-slate-500">
            {groupedProjects.reduce((acc, g) => acc + g.locations.length, 0)} Deployment Area{groupedProjects.reduce((acc, g) => acc + g.locations.length, 0) > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAllGroups}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition"
          >
            Expand All Groups
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={collapseAllGroups}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition"
          >
            Collapse All Groups
          </button>
        </div>
      </div>

      {/* Grouped Projects & Deployment Areas */}
      <div className="space-y-6">
        {groupedProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 font-medium">
            No deployment areas found matching your filters.
          </div>
        ) : (
          groupedProjects.map(({ project: proj, locations: projectLocations }) => {
            const isOpen = !!openGroups[proj.id];
            const isFav = favoriteProjectIds.includes(proj.id);
            const client = clients.find((c) => c.id === proj.clientId || c.name === proj.clientName);
            const projectDuration = getProjectDurationInfo(proj?.endDate);
            const totalProjectGuards = projectLocations.reduce(
              (acc, l) => acc + getAssignmentsForLocation(l.id).length,
              0
            );
            const showProjectRemainingBadge =
              projectDuration.daysRemaining !== null && projectDuration.daysRemaining <= 30;

            return (
              <div
                key={proj.id}
                className={`rounded-3xl border transition-all space-y-4 p-5 ${
                  isFav
                    ? 'border-amber-300/80 bg-amber-50/20 shadow-xs'
                    : 'border-slate-200/90 bg-slate-50/70 shadow-xs'
                }`}
              >
                {/* Project Group Header - Entirely Clickable */}
                <div
                  onClick={() => toggleGroup(proj.id)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none group/hdr p-1.5 -m-1.5 rounded-2xl hover:bg-white/60 transition-colors ${
                    isOpen ? 'pb-3 border-b border-slate-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Left Star Button for Favorite Project (Max 3, Auto Make Top) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteProject(proj.id, proj.name);
                      }}
                      className="p-1.5 -ml-1 rounded-xl hover:bg-white/90 text-slate-400 hover:text-amber-500 transition-all shrink-0"
                      title={isFav ? "Favorited project (pinned to top) - Click to unstar" : "Star as favorite project (Max 3, pins to top)"}
                      aria-label="Toggle favorite project"
                    >
                      <Star
                        className={`h-4 w-4 transition-transform ${
                          isFav
                            ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow-xs'
                            : 'text-slate-300 hover:text-amber-400 hover:scale-110'
                        }`}
                      />
                    </button>

                    <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-blue-600 shadow-2xs shrink-0 group-hover/hdr:border-blue-300 group-hover/hdr:bg-blue-50/50 transition-colors">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight group-hover/hdr:text-blue-700 transition-colors truncate">
                          {proj.name}
                        </h2>
                        {isFav && (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-900 border-amber-300 font-semibold gap-1 shrink-0">
                            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            Favorite
                          </Badge>
                        )}
                        {proj.status === 'DRAFT' && (
                          <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-900 border-amber-300 font-semibold">
                            Draft
                          </Badge>
                        )}
                        {proj.status === 'COMPLETED' && (
                          <Badge variant="outline" className="text-[10px] bg-slate-200 text-slate-700 border-slate-300 font-semibold">
                            Completed
                          </Badge>
                        )}
                      </div>
                      {/* Subtitle: No 'Client:' prefix */}
                      <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">
                        <strong className="text-slate-800">{proj.clientName}</strong> &bull;{' '}
                        <span>{projectLocations.length} Deployment Area{projectLocations.length > 1 ? 's' : ''}</span> &bull;{' '}
                        <span><strong className="text-slate-800">{totalProjectGuards}</strong> Total Guards</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Contract Duration on Project Level: No 'Contract:' prefix */}
                    <div className="text-xs text-slate-500 hidden md:block">
                      <strong className="text-slate-700">
                        {formatDate(proj.startDate)} – {proj.endDate ? formatDate(proj.endDate) : 'Ongoing'}
                      </strong>
                    </div>

                    {showProjectRemainingBadge && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                          projectDuration.daysRemaining! < 0
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : projectDuration.daysRemaining! <= 7
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {projectDuration.daysRemaining! < 0 ? 'Contract Ended' : `${projectDuration.daysRemaining} days remaining`}
                      </span>
                    )}

                    {/* Dropdown Menu for Group Options */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-xl">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-md rounded-xl p-1 z-50">
                        <DropdownMenuItem
                          onClick={() => setSelectedGroupModal(proj)}
                          className="text-xs cursor-pointer rounded-lg flex items-center px-2 py-1.5 focus:bg-slate-100"
                        >
                          <Info className="h-3.5 w-3.5 mr-2 text-blue-600" />
                          <span>View Group Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportProjectGroup(proj, projectLocations)}
                          className="text-xs cursor-pointer rounded-lg flex items-center px-2 py-1.5 focus:bg-slate-100"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                          <span>Export Group CSV</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleGroup(proj.id)}
                          className="text-xs cursor-pointer rounded-lg flex items-center px-2 py-1.5 focus:bg-slate-100"
                        >
                          {isOpen ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5 mr-2 text-slate-500" />
                              <span>Collapse Group</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5 mr-2 text-slate-500" />
                              <span>Expand Group</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* ONLY CHEVRON ARROW BUTTON - No "Show Details" text */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleGroup(proj.id)}
                      className="h-8 w-8 bg-white border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl shadow-2xs shrink-0"
                      title={isOpen ? "Collapse group" : "Expand group"}
                      aria-label={isOpen ? "Collapse group" : "Expand group"}
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {/* Dropdown Content: Group Details & Sub-areas */}
                {isOpen && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Project Group Operational Details Box */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Info className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Project Group Details & Operational Scope
                          </h3>
                          <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 text-slate-800 font-bold border-slate-300 ml-1">
                            Code: {proj.projectCode}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {role === 'ADMIN' && projectLocations.length > 0 && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setDeployTargetProjectId(proj.id);
                                setTargetLocationId(projectLocations[0].id);
                                const firstActive = personnelList.find((p) => p.employmentStatus === 'ACTIVE')?.id;
                                setSelectedPersonnelIds(firstActive ? [firstActive] : []);
                                setIsDeployModalOpen(true);
                              }}
                              className="h-7 text-xs gap-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Deploy Personnel</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGroupModal(proj)}
                            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 px-2.5 font-medium rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Full Details Modal</span>
                          </Button>
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => handleExportProjectGroup(proj, projectLocations)}
                            className="h-7 text-xs gap-1 px-2.5 rounded-lg text-slate-700"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Export Group CSV</span>
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Scope of Work */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Scope of Work
                          </span>
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {proj.description ||
                              'Comprehensive facility access control, checkpoint management, and 24/7 guard patrol.'}
                          </p>
                        </div>

                        {/* Client Intelligence */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Client & Contact
                          </span>
                          <p className="font-bold text-slate-900">{client?.name || proj.clientName}</p>
                          <p className="text-slate-500 text-[11px]">
                            {client?.industry && <span className="text-slate-600 font-medium">{client.industry} &bull; </span>}
                            {client?.contactPerson || 'Security Directorate'}
                          </p>
                          {client?.contactPhone && (
                            <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{client.contactPhone}</span>
                            </p>
                          )}
                        </div>

                        {/* Contract Lifecycle & Commanders */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Contract & Command
                          </span>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Contract Term:</span>
                            <strong className="text-slate-800">
                              {formatDate(proj.startDate)} – {proj.endDate ? formatDate(proj.endDate) : 'Indefinite'}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Status:</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Active Contract
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 pt-0.5 truncate">
                            <span className="font-medium text-slate-700">Site Commanders: </span>
                            {projectLocations
                              .map((l) => {
                                const locAssigned = getAssignmentsForLocation(l.id);
                                const cmdr =
                                  locAssigned.find(
                                    (a) =>
                                      a.positionOnSite?.toLowerCase().includes('danru') ||
                                      a.positionOnSite?.toLowerCase().includes('commander') ||
                                      a.positionOnSite?.toLowerCase().includes('chief') ||
                                      a.positionOnSite?.toLowerCase().includes('supervisor')
                                  ) || locAssigned[0];
                                return cmdr
                                  ? `${cmdr.personnelName} (${l.name.replace(proj.clientName, '').trim() || l.name})`
                                  : null;
                              })
                              .filter(Boolean)
                              .join(', ') || 'Assigned per shift'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-areas / Locations Grid inside this project group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectLocations.map((loc) => {
                    const assigned = getAssignmentsForLocation(loc.id);
                    const duration = getProjectDurationInfo(proj?.endDate);
                    const showRemainingBadge = duration.daysRemaining !== null && duration.daysRemaining <= 30;

                    // Site Commander at the first left
                    const siteCommander =
                      assigned.find(
                        (a) =>
                          a.positionOnSite?.toLowerCase().includes('danru') ||
                          a.positionOnSite?.toLowerCase().includes('commander') ||
                          a.positionOnSite?.toLowerCase().includes('chief') ||
                          a.positionOnSite?.toLowerCase().includes('supervisor')
                      ) || assigned[0];

                    // Exclude site commander from the group of avatar icons
                    const guardsList = assigned.filter((a) => a.id !== siteCommander?.id);
                    const displayedAvatars = guardsList.slice(0, 6);
                    const remainingGuardsCount = Math.max(0, guardsList.length - 6);

                    return (
                      <Card
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc)}
                        className="p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all shadow-xs rounded-2xl bg-white space-y-4 cursor-pointer group/card"
                      >
                        {/* Top Location & Contract Header */}
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 shadow-2xs group-hover/card:bg-blue-600 group-hover/card:text-white transition-colors">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm leading-snug truncate group-hover/card:text-blue-600 transition-colors">
                                  {loc.name}
                                </h3>
                                <p className="text-xs text-slate-700 font-semibold mt-0.5 truncate">
                                  {loc.clientName} &bull; <span className="text-slate-500 font-normal">{loc.city}</span> &bull;{' '}
                                  <span className="text-blue-600 font-semibold">{assigned.length} Guards</span>
                                </p>
                              </div>
                            </div>

                            {/* Remaining days pill: ONLY show if under 30 days */}
                            {showRemainingBadge && (
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                                  duration.daysRemaining! < 0
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : duration.daysRemaining! <= 7
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}
                              >
                                {duration.daysRemaining! < 0 ? 'Contract Ended' : `${duration.daysRemaining} days remaining`}
                              </span>
                            )}
                          </div>

                          {/* Location Address & Contract Duration */}
                          <div className="space-y-1 pt-0.5 text-xs text-slate-600 pl-[52px]">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{loc.address}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>
                                Contract Duration: {proj?.startDate ? formatDate(proj.startDate) : 'Start'} –{' '}
                                {proj?.endDate ? formatDate(proj.endDate) : 'Indefinite'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Users Info: Site Commander on the left + Max 6 Avatars Stack + Rest of Total Security */}
                        <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Site Commander at the first left */}
                          {siteCommander ? (
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={siteCommander.personnelPhoto}
                                  alt={siteCommander.personnelName}
                                  className="h-9 w-9 rounded-full object-cover border-2 border-blue-600 shadow-xs"
                                />
                                <span
                                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full shadow-2xs"
                                  title="Site Commander (Danru)"
                                >
                                  <Shield className="h-2.5 w-2.5" />
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                                  Site Commander
                                </div>
                                <Link
                                  href={`/personnel/${siteCommander.personnelId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 block transition"
                                  title={siteCommander.personnelName}
                                >
                                  {siteCommander.personnelName}
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 italic">No commander assigned</div>
                          )}

                          {/* Overlapping Avatars stack (max 6 people) + total remaining */}
                          <div className="flex items-center gap-2.5 self-start sm:self-auto">
                            <div
                              className="flex items-center -space-x-2.5 hover:-space-x-1 transition-all cursor-pointer py-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLocation(loc);
                              }}
                              title={`Inspect full roster (${assigned.length} guards)`}
                            >
                              {displayedAvatars.map((person) => (
                                <img
                                  key={person.id}
                                  src={person.personnelPhoto}
                                  alt={person.personnelName}
                                  title={`${person.personnelName} (${person.positionOnSite || person.personnelPosition})`}
                                  className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-xs transition-transform hover:scale-110 hover:z-20"
                                />
                              ))}

                              {remainingGuardsCount > 0 && (
                                <div
                                  className="h-8 w-8 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center border-2 border-white shadow-xs shrink-0 hover:scale-110 transition-transform"
                                  title={`+${remainingGuardsCount} additional security guards`}
                                >
                                  +{remainingGuardsCount}
                                </div>
                              )}
                            </div>

                            {/* Deploy Personnel directly to this site */}
                            {role === 'ADMIN' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeployTargetProjectId(proj.id);
                                  setTargetLocationId(loc.id);
                                  const firstActive = personnelList.find((p) => p.employmentStatus === 'ACTIVE')?.id;
                                  setSelectedPersonnelIds(firstActive ? [firstActive] : []);
                                  setIsDeployModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1 shrink-0"
                                title={`Deploy personnel to ${loc.name}`}
                              >
                                <Plus className="h-3.5 w-3.5 text-blue-600" />
                                <span>Deploy</span>
                              </button>
                            )}

                            {/* View Details action button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLocation(loc);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover/card:bg-blue-50 text-slate-700 group-hover/card:text-blue-700 text-xs font-bold transition flex items-center gap-1 shrink-0"
                              title="Click to view full roster and location details"
                            >
                              <span>View Details</span>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover/card:text-blue-600 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })
    )}
  </div>

  {/* SHADCN DIALOG: Group & Project Details */}
  {selectedGroupModal && (() => {
    const proj = selectedGroupModal;
    const projectLocs = locations.filter((l) => l.projectId === proj.id);
    const client = clients.find((c) => c.id === proj.clientId || c.name === proj.clientName);
    const duration = getProjectDurationInfo(proj.endDate);
    const allAssignedInGroup = projectLocs.flatMap((l) => getAssignmentsForLocation(l.id));

    const totalGuards = allAssignedInGroup.length;
    const morningGuards = Math.round(totalGuards * 0.4);
    const afternoonGuards = Math.round(totalGuards * 0.35);
    const nightGuards = Math.max(0, totalGuards - morningGuards - afternoonGuards);

    const nowHour = new Date().getHours();
    const isMorningActive = nowHour >= 7 && nowHour < 15;
    const isAfternoonActive = nowHour >= 15 && nowHour < 23;
    const isNightActive = nowHour >= 23 || nowHour < 7;
    const currentShiftName = isMorningActive ? 'Shift 1 (Pagi 07:00–15:00)' : isAfternoonActive ? 'Shift 2 (Siang 15:00–23:00)' : 'Shift 3 (Malam 23:00–07:00)';

    // Organizational Structure: Sequential Roles & Direct Reporting Hierarchy (No grouping, pure roles)
    const chiefPerson = personnelList.find(
      (p) => p.position.toLowerCase().includes('chief') || p.position.toLowerCase().includes('director')
    ) || {
      id: 'p-cso',
      fullName: 'Kol. (Purn) Hartono Sutanto',
      position: 'Chief Security Officer (CSO)',
      personnelNumber: 'JISS-001',
      phone: '+62 811-2345-6789',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces',
    };

    const siteCommanderAsg = allAssignedInGroup.find((a) =>
      a.positionOnSite?.toLowerCase().includes('danru') ||
      a.positionOnSite?.toLowerCase().includes('commander') ||
      a.positionOnSite?.toLowerCase().includes('chief') ||
      a.positionOnSite?.toLowerCase().includes('supervisor')
    ) || allAssignedInGroup[0];

    const siteCommanderPerson = siteCommanderAsg
      ? {
          id: siteCommanderAsg.personnelId,
          fullName: siteCommanderAsg.personnelName,
          position: siteCommanderAsg.positionOnSite || siteCommanderAsg.personnelPosition || 'Site Commander (Danru Utama)',
          personnelNumber: siteCommanderAsg.personnelNumber,
          phone: '+62 812-3456-7890',
          photoUrl: siteCommanderAsg.personnelPhoto,
        }
      : {
          id: 'p-danru',
          fullName: 'Dewi Kusuma',
          position: 'Site Commander (Danru Utama)',
          personnelNumber: 'JISS-102',
          phone: '+62 812-3456-7890',
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
        };

    const supervisorAsg = allAssignedInGroup.find(
      (a) =>
        a.personnelId !== siteCommanderPerson.id &&
        (a.positionOnSite?.toLowerCase().includes('supervisor') ||
          a.personnelPosition?.toLowerCase().includes('supervisor') ||
          a.positionOnSite?.toLowerCase().includes('patrol'))
    );

    const supervisorPerson = supervisorAsg
      ? {
          id: supervisorAsg.personnelId,
          fullName: supervisorAsg.personnelName,
          position: supervisorAsg.positionOnSite || supervisorAsg.personnelPosition || 'Shift Duty Supervisor (Danru Shift)',
          personnelNumber: supervisorAsg.personnelNumber,
          phone: '+62 813-8877-6655',
          photoUrl: supervisorAsg.personnelPhoto,
        }
      : {
          id: 'p-spv',
          fullName: 'Bambang Trihatmodjo',
          position: 'Shift Duty Supervisor (Danru Shift)',
          personnelNumber: 'JISS-115',
          phone: '+62 813-8877-6655',
          photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
        };

    const cctvAsg = allAssignedInGroup.find(
      (a) =>
        a.personnelId !== siteCommanderPerson.id &&
        a.personnelId !== supervisorPerson.id &&
        (a.positionOnSite?.toLowerCase().includes('cctv') ||
          a.personnelPosition?.toLowerCase().includes('cctv') ||
          a.positionOnSite?.toLowerCase().includes('surveillance'))
    );

    const cctvPerson = cctvAsg
      ? {
          id: cctvAsg.personnelId,
          fullName: cctvAsg.personnelName,
          position: cctvAsg.positionOnSite || cctvAsg.personnelPosition || 'CCTV & Alarm Operations Lead',
          personnelNumber: cctvAsg.personnelNumber,
          phone: '+62 812-9988-7711',
          photoUrl: cctvAsg.personnelPhoto,
        }
      : {
          id: 'p-cctv',
          fullName: 'Citra Pertiwi',
          position: 'CCTV & Alarm Operations Lead',
          personnelNumber: 'JISS-142',
          phone: '+62 812-9988-7711',
          photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces',
        };

    const projectOrgRoles = [
      {
        tier: 'Tier 1',
        roleTitle: 'Chief Project Commander (Penanggung Jawab Operasi)',
        roleTag: 'Executive Leadership',
        badgeColor: 'bg-blue-600 text-white',
        person: chiefPerson,
        reportsTo: 'Client Directorate & PT JISS Ops Directorate',
        reportsToRole: 'Executive Command',
        reportsToId: '',
        scope: 'Overall security contract compliance, strategic incident escalation, client executive coordination.',
        spanOfControl: 'Directly oversees Site Commanders and all deployed assets.',
      },
      {
        tier: 'Tier 2',
        roleTitle: 'Site Commander / Danru Utama (Komandan Lapangan)',
        roleTag: 'Field Operations',
        badgeColor: 'bg-indigo-600 text-white',
        person: siteCommanderPerson,
        reportsTo: chiefPerson.fullName,
        reportsToRole: 'Chief Project Commander (CSO)',
        reportsToId: chiefPerson.id,
        scope: 'Daily guard parade briefing, post integrity inspection, disciplinary sanctions, incident emergency lead.',
        spanOfControl: 'Directly oversees Shift Supervisors, CCTV Operators, and Area Roving Patrols.',
      },
      {
        tier: 'Tier 3',
        roleTitle: 'Shift Duty Supervisors (Danru Shift Pagi, Siang, Malam)',
        roleTag: 'Tactical Shift Command',
        badgeColor: 'bg-amber-600 text-white',
        person: supervisorPerson,
        reportsTo: siteCommanderPerson.fullName,
        reportsToRole: 'Site Commander / Danru Utama',
        reportsToId: siteCommanderPerson.id,
        scope: '8-hour shift execution, equipment/HT radio checklists, incident logbook handover, dynamic post relief.',
        spanOfControl: `Supervises ${Math.max(1, Math.round(totalGuards / 3))} guards per shift on active rotation.`,
      },
      {
        tier: 'Tier 4',
        roleTitle: 'Control Room & CCTV Surveillance Lead',
        roleTag: 'Technical Intelligence',
        badgeColor: 'bg-teal-600 text-white',
        person: cctvPerson,
        reportsTo: siteCommanderPerson.fullName,
        reportsToRole: 'Site Commander / Danru Utama',
        reportsToId: siteCommanderPerson.id,
        scope: '24/7 video analytics, intrusion perimeter alarm verification, access turnstile card logs, backup archives.',
        spanOfControl: 'Oversees CCTV console desk, alarm sensors, and panic button dispatch.',
      },
      {
        tier: 'Tier 5',
        roleTitle: 'Frontline Security Personnel (Satpam Pelaksana & Patroli)',
        roleTag: 'Ground Operations',
        badgeColor: 'bg-slate-700 text-white',
        person: {
          id: 'tier5-guards',
          fullName: `${totalGuards} Assigned Security Officers`,
          position: 'Static Sentry & Mobile Roving',
          personnelNumber: `Guarding ${projectLocs.length} Deployment Areas`,
          phone: 'HT Radio Channel 1 (Site Primary)',
          photoUrl: '',
        },
        reportsTo: supervisorPerson.fullName,
        reportsToRole: 'Shift Duty Supervisor (Danru Shift)',
        reportsToId: supervisorPerson.id,
        scope: 'Physical visitor screening, vehicle barrier ticketing, RFID key-point clocking sweeps, customer assistance.',
        spanOfControl: 'Stationed at Turnstiles, Vehicle Ingress, Loading Dock, and Perimeter Patrol.',
      },
    ];

    return (
      <Dialog open={true} onOpenChange={(open) => !open && setSelectedGroupModal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
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
                  <Badge variant="default" className="text-[11px] bg-emerald-600 text-white">
                    {proj.status}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Client Group Security Operations Overview & Personnel Deployment
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-3">
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
                    <span className="text-xs text-slate-500">Ongoing active term</span>
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
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <Info className="h-3.5 w-3.5 text-blue-600" />
                <span>Operational Scope & Mandate</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {proj.description || 'Comprehensive perimeter patrol, physical screening, visitor badge management, and 24/7 security incident response.'}
              </p>
            </div>

            {/* Project Organizational Structure & Chain of Command */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Project Organizational Structure & Chain of Command
                    </h4>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Direct reporting hierarchy &bull; Pure operational roles
                </div>
              </div>

              {/* Sequential Pure Roles with Clear "Reports To" */}
              <div className="space-y-2.5">
                {projectOrgRoles.map((role) => (
                  <div
                    key={role.tier}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-all space-y-2.5"
                  >
                    {/* Role Header & Tier */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${role.badgeColor}`}>
                          {role.tier}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {role.roleTitle}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {role.roleTag}
                      </span>
                    </div>

                    {/* Role Officer & Reporting Channel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                      {/* Assigned Officer */}
                      <div className="flex items-center gap-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {role.person.photoUrl ? (
                          <img
                            src={role.person.photoUrl}
                            alt={role.person.fullName}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0 text-xs">
                            <Shield className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {role.person.fullName}
                            </span>
                            {role.person.id.startsWith('p-') || role.person.id.length > 5 ? null : (
                              <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 h-4 bg-white text-slate-600">
                                {role.person.id}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {role.person.personnelNumber}
                          </div>
                          {role.person.phone && (
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5" />
                              <span>{role.person.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reporting Chain (Who to report to) */}
                      <div className="flex flex-col justify-center bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/70">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                          <CornerDownRight className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>Reports Directly To:</span>
                        </div>
                        <div className="mt-1 font-bold text-xs text-slate-900 pl-4">
                          {role.reportsTo}
                        </div>
                        <div className="text-[11px] text-blue-700/80 font-medium pl-4">
                          {role.reportsToRole}
                        </div>
                      </div>
                    </div>

                    {/* Operational Mandate & Escalation scope */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                      <div className="leading-snug">
                        <strong className="text-slate-700 font-semibold">Duties:</strong> {role.scope}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Shift Schedules Feature */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Security Shift Schedules & Duty Rotations (Pola 3 Shift / 24 Jam)
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Shift: {currentShiftName}</span>
                  </span>
                </div>
              </div>

              {/* 3 Shift Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Shift 1: Pagi (Morning) */}
                <div className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  isMorningActive ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20 shadow-xs' : 'bg-white border-slate-200/90'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Sun className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Shift 1 (Pagi)</div>
                        <div className="text-[10px] text-slate-500 font-mono">07:00 – 15:00 WIB</div>
                      </div>
                    </div>
                    {isMorningActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white tracking-wide uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Guards on Duty:</span>
                    <strong className="text-slate-900 font-bold">{morningGuards} Guards (40%)</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Access control & rush-hour screening, VIP lobby turnstiles, and incoming contractor clearance.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">Main Lobby</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">Cargo Gate</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">Basement</span>
                  </div>
                </div>

                {/* Shift 2: Siang (Afternoon) */}
                <div className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  isAfternoonActive ? 'bg-orange-50/40 border-orange-300 ring-2 ring-orange-400/20 shadow-xs' : 'bg-white border-slate-200/90'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Sunset className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Shift 2 (Siang)</div>
                        <div className="text-[10px] text-slate-500 font-mono">15:00 – 23:00 WIB</div>
                      </div>
                    </div>
                    {isAfternoonActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white tracking-wide uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Guards on Duty:</span>
                    <strong className="text-slate-900 font-bold">{afternoonGuards} Guards (35%)</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Evening egress dispersal, outer perimeter mobile roving, tenant closing sweep, and dock intake closeout.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">Outer Perimeter</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">CCTV Command</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">Traffic Ingress</span>
                  </div>
                </div>

                {/* Shift 3: Malam (Night) */}
                <div className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  isNightActive ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-400/20 shadow-xs' : 'bg-white border-slate-200/90'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Moon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Shift 3 (Malam)</div>
                        <div className="text-[10px] text-slate-500 font-mono">23:00 – 07:00 WIB</div>
                      </div>
                    </div>
                    {isNightActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white tracking-wide uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Guards on Duty:</span>
                    <strong className="text-slate-900 font-bold">{nightGuards} Guards (25%)</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Total facility lockdown, guard tour RFID checkpoint tap sweeps, motion intrusion monitoring, and anti-ram barriers.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">RFID Patrol Sweep</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">Night Sentry</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">Server/Vault Lock</span>
                  </div>
                </div>
              </div>

              {/* Weekly Shift Squad Rotation Table (3 Regu Rotasi) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-600" />
                    <span>Weekly 3-Squad Rotation Schedule (Regu Alpha, Bravo, Charlie)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">8-Hour Shift Cycle (2-2-2-Off)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-[10px] uppercase font-bold text-slate-500">
                        <th className="text-left py-1.5 px-2 font-bold text-slate-700">Squad / Regu</th>
                        <th className="py-1.5 px-2">Mon (Sen)</th>
                        <th className="py-1.5 px-2">Tue (Sel)</th>
                        <th className="py-1.5 px-2">Wed (Rab)</th>
                        <th className="py-1.5 px-2">Thu (Kam)</th>
                        <th className="py-1.5 px-2">Fri (Jum)</th>
                        <th className="py-1.5 px-2">Sat (Sab)</th>
                        <th className="py-1.5 px-2">Sun (Min)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="text-left py-2 px-2 font-bold text-slate-900">Regu Alpha (Danru 1)</td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">Pagi</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">Pagi</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 font-semibold text-[10px]">Siang</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 font-semibold text-[10px]">Siang</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-semibold text-[10px]">Malam</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-semibold text-[10px]">Malam</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]">OFF</span></td>
                      </tr>
                      <tr>
                        <td className="text-left py-2 px-2 font-bold text-slate-900">Regu Bravo (Danru 2)</td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 font-semibold text-[10px]">Siang</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 font-semibold text-[10px]">Siang</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-semibold text-[10px]">Malam</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-semibold text-[10px]">Malam</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]">OFF</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">Pagi</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">Pagi</span></td>
                      </tr>
                      <tr>
                        <td className="text-left py-2 px-2 font-bold text-slate-900">Regu Charlie (Danru 3)</td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-semibold text-[10px]">Malam</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-semibold text-[10px]">Malam</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]">OFF</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">Pagi</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">Pagi</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 font-semibold text-[10px]">Siang</span></td>
                        <td className="py-2 px-1"><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 font-semibold text-[10px]">Siang</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Deployment Areas in this Group */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Deployment Areas in this Group ({projectLocs.length})
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {projectLocs.map((l) => {
                  const locGuards = getAssignmentsForLocation(l.id);
                  const cmdr = locGuards.find((a) =>
                    a.positionOnSite?.toLowerCase().includes('danru') ||
                    a.positionOnSite?.toLowerCase().includes('commander') ||
                    a.positionOnSite?.toLowerCase().includes('chief') ||
                    a.positionOnSite?.toLowerCase().includes('supervisor')
                  ) || locGuards[0];

                  return (
                    <div key={l.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-blue-600" />
                          <span>{l.name}</span>
                          <span className="text-slate-400 font-normal">({l.city})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{l.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {cmdr && (
                          <div className="text-right text-[11px]">
                            <span className="text-slate-400 block">Site Commander</span>
                            <span className="font-bold text-slate-800">{cmdr.personnelName}</span>
                          </div>
                        )}
                        <div className="px-2.5 py-1 rounded-xl bg-slate-100 font-bold text-xs text-slate-700">
                          {locGuards.length} Guards
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between sm:justify-between w-full">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => handleExportProjectGroup(proj, projectLocs)}
              className="gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export Group CSV</span>
            </Button>
            <div className="flex items-center gap-2">
              {role === 'ADMIN' && projectLocs.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setDeployTargetProjectId(proj.id);
                    setTargetLocationId(projectLocs[0].id);
                    const firstActive = personnelList.find((p) => p.employmentStatus === 'ACTIVE')?.id;
                    setSelectedPersonnelIds(firstActive ? [firstActive] : []);
                    setIsDeployModalOpen(true);
                  }}
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Deploy Personnel</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGroupModal(null)}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  })()}

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

        const groupedRolesMap = new Map<string, typeof filtered>();
        for (const asg of filtered) {
          const role = asg.positionOnSite || asg.personnelPosition || 'General Security Officer';
          if (!groupedRolesMap.has(role)) {
            groupedRolesMap.set(role, []);
          }
          groupedRolesMap.get(role)!.push(asg);
        }

        // Auto sort by the job A-Z, and secondary sort by personnel name A-Z
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
                  <div className="flex items-center gap-2">
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
                    {role === 'ADMIN' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setDeployTargetProjectId(selectedLocation.projectId || null);
                          setTargetLocationId(selectedLocation.id);
                          const firstActive = personnelList.find((p) => p.employmentStatus === 'ACTIVE')?.id;
                          setSelectedPersonnelIds(firstActive ? [firstActive] : []);
                          setIsDeployModalOpen(true);
                        }}
                        className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Personnel</span>
                      </Button>
                    )}
                  </div>
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
                      </div>
                    ))
                  )}
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between w-full">
                {role === 'ADMIN' ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setDeployTargetProjectId(selectedLocation.projectId || null);
                      setTargetLocationId(selectedLocation.id);
                      const firstActive = personnelList.find((p) => p.employmentStatus === 'ACTIVE')?.id;
                      setSelectedPersonnelIds(firstActive ? [firstActive] : []);
                      setIsDeployModalOpen(true);
                    }}
                    className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Personnel to this Site</span>
                  </Button>
                ) : <div />}
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
        <Dialog open={isDeployModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsDeployModalOpen(false);
            setDeployTargetProjectId(null);
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-slate-900 font-bold">Deploy Personnel to Site</DialogTitle>
                  <DialogDescription className="text-slate-500">
                    {deployTargetProject ? (
                      <span>Assign security personnel to <strong>{deployTargetProject.name}</strong></span>
                    ) : (
                      <span>Create new site assignment record</span>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleDeploySubmit} className="space-y-4 text-xs">
              {/* Multiple Officer / Guard Selector Field */}
              <div ref={officerPickerRef} className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="officer-search-input" className="font-bold text-slate-700">
                    Select Officers / Guards <span className="text-rose-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    {selectedPersonnelIds.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {selectedPersonnelIds.length} Selected
                      </span>
                    )}
                    {selectedPersonnelIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedPersonnelIds([])}
                        className="text-[10px] text-slate-400 hover:text-rose-600 font-medium transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Interactive Field Box (Clickable, transforms to search bar, max 3 lines) */}
                <div
                  onClick={() => setIsOfficerPickerOpen(true)}
                  className={`w-full min-h-[46px] p-2.5 rounded-xl bg-white border transition-all cursor-pointer ${
                    isOfficerPickerOpen
                      ? 'border-blue-500 ring-2 ring-blue-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Selected Officers Preview Chips: Maximised to 3 lines (~88px), then scrollable */}
                  {selectedPersonnelIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto mb-2 pr-1 scrollbar-thin">
                      {selectedPersonnelIds.map((pId) => {
                        const person = personnelList.find((p) => p.id === pId);
                        if (!person) return null;
                        return (
                          <span
                            key={person.id}
                            className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={person.photoUrl}
                              alt={person.fullName}
                              className="h-4 w-4 rounded-full object-cover shrink-0"
                            />
                            <span className="max-w-[130px] truncate">{person.fullName}</span>
                            <span className="text-[9px] font-mono text-slate-500">({person.personnelNumber})</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOfficerSelection(person.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 ml-0.5 transition"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Search Bar Input inside the field */}
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      id="officer-search-input"
                      type="text"
                      value={officerSearchQuery}
                      onChange={(e) => {
                        setOfficerSearchQuery(e.target.value);
                        if (!isOfficerPickerOpen) setIsOfficerPickerOpen(true);
                      }}
                      onFocus={() => setIsOfficerPickerOpen(true)}
                      placeholder={
                        selectedPersonnelIds.length === 0
                          ? 'Click to search by name, ID, position, or skills...'
                          : 'Search more officers to add...'
                      }
                      className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    {officerSearchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOfficerSearchQuery('');
                        }}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOfficerPickerOpen(!isOfficerPickerOpen);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0"
                      title={isOfficerPickerOpen ? 'Close officer list' : 'Open officer list'}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOfficerPickerOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Dropdown Profile Rows List (Grouped & Collapsible by Roles, Selected on top) */}
                {isOfficerPickerOpen && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                    <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 text-[11px] text-slate-500 font-medium">
                      <span>
                        Showing {filteredAndSortedOfficers.length} personnel &bull; {groupedOfficersByRole.length} roles
                      </span>
                      <div className="flex items-center gap-2">
                        {groupedOfficersByRole.length > 1 && (() => {
                          const allExpanded = groupedOfficersByRole.every((g) => expandedDropdownRoles[g.roleName]);
                          return (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (allExpanded) {
                                    collapseAllDropdownRoles();
                                  } else {
                                    expandAllDropdownRoles();
                                  }
                                }}
                                className="text-[10px] text-slate-500 hover:text-slate-800 underline font-semibold transition"
                              >
                                {allExpanded ? 'Collapse All' : 'Expand All'}
                              </button>
                              <span className="text-slate-300">&bull;</span>
                            </>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => setIsOfficerPickerOpen(false)}
                          className="text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 rounded-lg hover:bg-blue-50 transition"
                        >
                          Done ({selectedPersonnelIds.length})
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
                      {filteredAndSortedOfficers.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No active security guards found matching &quot;{officerSearchQuery}&quot;
                        </div>
                      ) : (
                        groupedOfficersByRole.map((group) => {
                          // Default is collapsed (only expanded if explicitly opened or during search)
                          const isExpanded = officerSearchQuery.trim() ? true : !!expandedDropdownRoles[group.roleName];
                          const isCollapsed = !isExpanded;
                          const selectedInGroupCount = group.officers.filter((p) =>
                            selectedPersonnelIds.includes(p.id)
                          ).length;

                          return (
                            <div
                              key={group.roleName}
                              className="rounded-xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs"
                            >
                              {/* Collapsible Role Section Header (Collapsed by default) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownRole(group.roleName);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 transition text-left select-none ${
                                  isExpanded ? 'border-b border-slate-100' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="h-5 w-5 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                                    <RoleIcon role={group.roleName} />
                                  </div>
                                  <span className="font-bold text-xs text-slate-800 truncate">
                                    {group.roleName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    ({group.officers.length})
                                  </span>
                                  {selectedInGroupCount > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                      {selectedInGroupCount} selected
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <span className="text-[10px] font-medium hidden sm:inline text-slate-400">
                                    {isCollapsed ? 'Expand' : 'Collapse'}
                                  </span>
                                  <ChevronDown
                                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                      isCollapsed ? '-rotate-90' : 'rotate-0'
                                    }`}
                                  />
                                </div>
                              </button>

                              {/* Officer Rows inside Role Section (Hidden by default) */}
                              {isExpanded && (
                                <div className="divide-y divide-slate-100">
                                  {group.officers.map((person) => {
                                    const isSelected = selectedPersonnelIds.includes(person.id);
                                    const isDeployed = assignments.some(
                                      (a) => a.personnelId === person.id && a.status === 'ACTIVE'
                                    );

                                    return (
                                      <div
                                        key={person.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleOfficerSelection(person.id);
                                        }}
                                        className={`p-2.5 px-3 flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                                          isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'
                                        }`}
                                      >
                                        {/* Left Profile Info: Photo, ID, Full Name, Skills */}
                                        <div className="flex items-center gap-3 min-w-0">
                                          <img
                                            src={person.photoUrl}
                                            alt={person.fullName}
                                            className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                                          />
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-xs text-slate-900 truncate">
                                                {person.fullName}
                                              </span>
                                              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                                                {person.personnelNumber}
                                              </span>
                                              <span
                                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                                  isDeployed
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}
                                              >
                                                {isDeployed ? 'Deployed' : 'Available'}
                                              </span>
                                            </div>

                                            {person.qualifications && person.qualifications.length > 0 && (
                                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                {person.qualifications.map((q) => (
                                                  <span
                                                    key={q.id}
                                                    className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0"
                                                  >
                                                    {q.qualificationName}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Right Checkmark: Shows green checkmark and stays open */}
                                        <div className="shrink-0 pl-2">
                                          {isSelected ? (
                                            <div className="h-5.5 w-5.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                              <Check className="h-3.5 w-3.5" />
                                            </div>
                                          ) : (
                                            <div className="h-5.5 w-5.5 rounded-full border-2 border-slate-300 hover:border-slate-400" />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="loc-select" className="font-bold text-slate-700">
                    Target Deployment Site
                  </Label>
                  {deployTargetProject && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Scoped to {deployTargetProject.name}
                    </span>
                  )}
                </div>
                <select
                  id="loc-select"
                  value={targetLocationId}
                  onChange={(e) => setTargetLocationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
                  required
                >
                  {availableTargetLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} &mdash; {loc.clientName}
                    </option>
                  ))}
                </select>
                {deployTargetProject && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Showing only child deployment areas of <strong>{deployTargetProject.name}</strong> ({availableTargetLocations.length} area{availableTargetLocations.length > 1 ? 's' : ''}).
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="pos-site" className="font-bold text-slate-700">
                    Duty Position On Site
                  </Label>
                  {selectedPersonnelId && (() => {
                    const selectedGuard = personnelList.find((p) => p.id === selectedPersonnelId);
                    if (!selectedGuard) return null;
                    return (
                      <button
                        type="button"
                        onClick={() => setPositionOnSite(selectedGuard.position)}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition underline"
                        title="Use guard's official job position"
                      >
                        Default: {selectedGuard.position}
                      </button>
                    );
                  })()}
                </div>
                <Input
                  id="pos-site"
                  list="duty-position-suggestions"
                  type="text"
                  value={positionOnSite}
                  onChange={(e) => setPositionOnSite(e.target.value)}
                  placeholder="Select a quick choice below or type custom..."
                  className="mb-2"
                />
                <datalist id="duty-position-suggestions">
                  {DEFAULT_DUTY_POSITIONS.map((pos) => (
                    <option key={pos} value={pos} />
                  ))}
                </datalist>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {DEFAULT_DUTY_POSITIONS.map((pos) => {
                    const isSelected = positionOnSite === pos;
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPositionOnSite(pos)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {pos}
                      </button>
                    );
                  })}
                </div>
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
                  onClick={() => {
                    setIsDeployModalOpen(false);
                    setDeployTargetProjectId(null);
                  }}
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
