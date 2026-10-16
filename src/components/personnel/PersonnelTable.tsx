'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Personnel } from '@/types';
import { exportToCsv, formatDate } from '@/lib/utils';
import {
  Search,
  Download,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck2,
  MapPin,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  Phone,
  Mail,
  Calendar,
  Building,
  Award,
  ArrowRight,
  User,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
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
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PersonnelTableProps {
  initialEmploymentStatus?: string;
  initialDeploymentStatus?: string;
  onOpenAddModal?: () => void;
}

export function PersonnelTable({
  initialEmploymentStatus,
  initialDeploymentStatus,
  onOpenAddModal,
}: PersonnelTableProps) {
  const router = useRouter();
  const {
    personnelList,
    locations,
    role,
    getActiveAssignmentForPersonnel,
    getAssignmentsHistoryForPersonnel,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState<string>(initialEmploymentStatus || 'ALL');
  const [deploymentFilter, setDeploymentFilter] = useState<string>(initialDeploymentStatus || 'ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [qualificationFilter, setQualificationFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Selected personnel for quick-view pop-up modal
  const [selectedPersonForModal, setSelectedPersonForModal] = useState<Personnel | null>(null);

  const uniquePositions = useMemo(() => {
    return Array.from(new Set(personnelList.map((p) => p.position))).sort();
  }, [personnelList]);

  const uniqueQualifications = useMemo(() => {
    const set = new Set<string>();
    personnelList.forEach((p) => p.qualifications.forEach((q) => set.add(q.qualificationName)));
    return Array.from(set).sort();
  }, [personnelList]);

  const moreFiltersCount =
    (locationFilter !== 'ALL' ? 1 : 0) +
    (qualificationFilter !== 'ALL' ? 1 : 0) +
    (genderFilter !== 'ALL' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setEmploymentFilter('ALL');
    setDeploymentFilter('ALL');
    setPositionFilter('ALL');
    setLocationFilter('ALL');
    setQualificationFilter('ALL');
    setGenderFilter('ALL');
    setCurrentPage(1);
  };

  const filteredPersonnel = useMemo(() => {
    return personnelList.filter((person) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = person.fullName.toLowerCase().includes(q);
        const matchesId = person.personnelNumber.toLowerCase().includes(q);
        const matchesPhone = person.phone.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesPhone) return false;
      }

      if (employmentFilter !== 'ALL' && person.employmentStatus !== employmentFilter) {
        return false;
      }

      const activeAsg = getActiveAssignmentForPersonnel(person.id);
      const isDeployed = !!activeAsg;
      const isAvailable = person.employmentStatus === 'ACTIVE' && !isDeployed;

      if (deploymentFilter === 'DEPLOYED' && !isDeployed) return false;
      if ((deploymentFilter === 'AVAILABLE' || deploymentFilter === 'IDLE') && !isAvailable) return false;

      if (positionFilter !== 'ALL' && person.position !== positionFilter) {
        return false;
      }

      if (genderFilter !== 'ALL' && person.gender !== genderFilter) {
        return false;
      }

      if (locationFilter !== 'ALL') {
        if (!activeAsg || activeAsg.locationId !== locationFilter) return false;
      }

      if (qualificationFilter !== 'ALL') {
        const hasQual = person.qualifications.some(
          (q) => q.qualificationName === qualificationFilter && q.status === 'VALID'
        );
        if (!hasQual) return false;
      }

      return true;
    });
  }, [
    personnelList,
    searchQuery,
    employmentFilter,
    deploymentFilter,
    positionFilter,
    genderFilter,
    locationFilter,
    qualificationFilter,
    getActiveAssignmentForPersonnel,
  ]);

  const totalPages = Math.ceil(filteredPersonnel.length / pageSize) || 1;
  const paginatedPersonnel = filteredPersonnel.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Helper to compute operational placement & days off for any personnel
  const getOperationalStatus = (person: Personnel) => {
    const activeAsg = getActiveAssignmentForPersonnel(person.id);
    const isDeployed = !!activeAsg;
    const isAvailable = person.employmentStatus === 'ACTIVE' && !isDeployed;

    const history = getAssignmentsHistoryForPersonnel(person.id);
    const pastAssignments = history.filter(
      (a) => a.id !== activeAsg?.id && (a.status === 'COMPLETED' || a.status === 'TERMINATED' || !!a.endDate)
    );
    const lastAsg = pastAssignments.length > 0 ? pastAssignments[0] : null;

    // Site determination
    let siteName = 'None';
    let siteSubtitle = '';
    let isCurrent = false;

    if (activeAsg) {
      siteName = activeAsg.locationName;
      siteSubtitle = activeAsg.clientName;
      isCurrent = true;
    } else if (lastAsg) {
      siteName = lastAsg.locationName;
      siteSubtitle = lastAsg.endDate ? `Last: ${formatDate(lastAsg.endDate)}` : lastAsg.clientName;
      isCurrent = false;
    } else {
      siteName = person.employmentStatus === 'ACTIVE' ? 'None (New recruit)' : 'No prior site';
      siteSubtitle = '';
    }

    // Days off determination
    let daysOffLabel = '-';
    let daysOffBadge = 'bg-slate-100 text-slate-500 border-slate-200';

    if (isDeployed) {
      daysOffLabel = 'On Duty';
      daysOffBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    } else if (isAvailable) {
      if (lastAsg?.endDate) {
        const msDiff = Date.now() - new Date(lastAsg.endDate).getTime();
        const days = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
        daysOffLabel = `${days}d off`;
        daysOffBadge = days > 30 ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' : 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
      } else {
        const msDiff = Date.now() - new Date(person.joinDate).getTime();
        const days = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
        daysOffLabel = `${days}d off`;
        daysOffBadge = 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
      }
    } else {
      daysOffLabel = 'Inactive';
      daysOffBadge = 'bg-slate-100 text-slate-400 border-slate-200';
    }

    return {
      activeAsg,
      lastAsg,
      isDeployed,
      isAvailable,
      siteName,
      siteSubtitle,
      isCurrent,
      daysOffLabel,
      daysOffBadge,
    };
  };

  const handleExport = () => {
    const headers = [
      'Personnel ID',
      'Full Name',
      'Position',
      'Availability',
      'Current / Last Site',
      'Days Off',
      'Skills',
      'Phone',
      'Email',
    ];

    const rows = filteredPersonnel.map((p) => {
      const op = getOperationalStatus(p);
      const skillsStr = p.qualifications.map((q) => `${q.qualificationName} (${q.status})`).join('; ');

      return [
        p.personnelNumber,
        p.fullName,
        p.position,
        op.isDeployed ? 'Deployed' : op.isAvailable ? 'Available' : 'Inactive',
        op.siteName,
        op.daysOffLabel,
        skillsStr || 'None',
        p.phone,
        p.email,
      ];
    });

    exportToCsv('PT_JISS_Personnel_Directory', headers, rows);
  };

  const hasActiveFilters =
    searchQuery ||
    employmentFilter !== 'ALL' ||
    deploymentFilter !== 'ALL' ||
    positionFilter !== 'ALL' ||
    genderFilter !== 'ALL' ||
    locationFilter !== 'ALL' ||
    qualificationFilter !== 'ALL';

  const modalOperationalStatus = selectedPersonForModal ? getOperationalStatus(selectedPersonForModal) : null;

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by personnel name or ID (e.g. Budi, JISS-101)..."
              className="pl-10 pr-12 text-slate-900 placeholder:text-slate-400 border-slate-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-800 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasActiveFilters && (
              <Button
                variant="subtle"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}

            <Button
              variant={showMoreFilters ? 'default' : 'subtle'}
              size="sm"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="gap-1.5 font-semibold text-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>More Filters</span>
              {moreFiltersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                  {moreFiltersCount}
                </span>
              )}
            </Button>

            {role !== 'READ_ONLY' && (
              <Button
                variant="subtle"
                size="sm"
                onClick={handleExport}
                className="gap-1.5 font-semibold text-xs"
                title="Export filtered records to CSV"
              >
                <Download className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            )}

            {role === 'ADMIN' && onOpenAddModal && (
              <Button
                variant="default"
                size="sm"
                onClick={onOpenAddModal}
                className="gap-1.5 font-semibold text-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Personnel</span>
              </Button>
            )}
          </div>
        </div>

        {/* Primary Filters (3 Core: Position, Availability, Employment) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Position</label>
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            >
              <option value="ALL">All Positions ({uniquePositions.length})</option>
              {uniquePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Availability</label>
            <select
              value={deploymentFilter}
              onChange={(e) => {
                setDeploymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            >
              <option value="ALL">All Availabilities</option>
              <option value="DEPLOYED">Deployed</option>
              <option value="AVAILABLE">Available</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Employment</label>
            <select
              value={employmentFilter}
              onChange={(e) => {
                setEmploymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            >
              <option value="ALL">All Employment</option>
              <option value="ACTIVE">Active Employee</option>
              <option value="INACTIVE">Inactive / Resigned</option>
            </select>
          </div>
        </div>

        {/* Progressive Disclosure: More Filters Collapsible Panel */}
        {showMoreFilters && (
          <div className="pt-3 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 p-4 rounded-b-2xl animate-fadeIn space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                Additional Filters
              </span>
              {(moreFiltersCount > 0 || employmentFilter !== 'ALL' || deploymentFilter !== 'ALL' || positionFilter !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Current Site</label>
                <select
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                >
                  <option value="ALL">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Qualification Badge</label>
                <select
                  value={qualificationFilter}
                  onChange={(e) => {
                    setQualificationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                >
                  <option value="ALL">All Badges</option>
                  {uniqueQualifications.map((qual) => (
                    <option key={qual} value={qual}>
                      {qual}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Gender Demographic</label>
                <select
                  value={genderFilter}
                  onChange={(e) => {
                    setGenderFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                >
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Male Personnel</option>
                  <option value="FEMALE">Female Personnel</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table: Exact 8 columns
          id | name | only position not rank | (no employment) | availability (deployed/available) | current/last site | days off | skills (truncate + hover) | action
      */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/70 border-b border-slate-200">
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 w-[110px]">ID</TableHead>
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 min-w-[170px]">Name</TableHead>
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 min-w-[160px]">Position</TableHead>
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 w-[125px]">Availability</TableHead>
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 min-w-[170px]">Current / Last Site</TableHead>
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 w-[110px]">Days Off</TableHead>
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 min-w-[160px]">Skills</TableHead>
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 text-right w-[110px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPersonnel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                  No personnel records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPersonnel.map((person) => {
                const op = getOperationalStatus(person);

                return (
                  <TableRow
                    key={person.id}
                    onClick={() => setSelectedPersonForModal(person)}
                    className="cursor-pointer group hover:bg-blue-50/30 transition-colors border-b border-slate-100"
                    title="Click row to open profile preview"
                  >
                    {/* 1. ID */}
                    <TableCell className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-600">
                      {person.personnelNumber}
                    </TableCell>

                    {/* 2. Name */}
                    <TableCell className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={person.photoUrl}
                          alt={person.fullName}
                          className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {person.fullName}
                        </div>
                      </div>
                    </TableCell>

                    {/* 3. Position (Only Position, no rank/division subtitle) */}
                    <TableCell className="py-2.5 px-3 font-medium text-xs text-slate-800">
                      <div className="truncate max-w-[180px]">{person.position}</div>
                    </TableCell>

                    {/* 4. Availability (Deployed vs Available) */}
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      {op.isDeployed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                          <ShieldCheck className="h-3 w-3 text-blue-600 shrink-0" />
                          <span>Deployed</span>
                        </span>
                      ) : op.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <UserCheck2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>Available</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    {/* 5. Current / Last Site */}
                    <TableCell className="py-2.5 px-3">
                      <div className="min-w-0 max-w-[200px]">
                        <div className="font-semibold text-xs text-slate-900 flex items-center gap-1 truncate">
                          <MapPin className={`h-3 w-3 shrink-0 ${op.isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate">{op.siteName}</span>
                        </div>
                        {op.siteSubtitle && (
                          <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5 pl-4">
                            {op.siteSubtitle}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* 6. Days Off */}
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${op.daysOffBadge}`}>
                        {op.daysOffLabel}
                      </span>
                    </TableCell>

                    {/* 7. Skills: Truncate + Hover Tooltip */}
                    <TableCell className="py-2.5 px-3">
                      {person.qualifications && person.qualifications.length > 0 ? (
                        <div className="relative group/skills inline-block max-w-[170px]">
                          <div className="flex items-center gap-1 truncate">
                            {/* Truncated primary badge */}
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[105px]">
                              {person.qualifications[0].qualificationName}
                            </span>
                            {person.qualifications.length > 1 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
                                +{person.qualifications.length - 1}
                              </span>
                            )}
                          </div>

                          {/* Hover Tooltip / Popover showing all qualifications & status */}
                          <div className="hidden group-hover/skills:block absolute z-50 left-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 pointer-events-none animate-fadeIn">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pb-1.5 mb-1.5 border-b border-slate-800">
                              <span className="flex items-center gap-1">
                                <Award className="h-3.5 w-3.5 text-blue-400" />
                                All Qualifications ({person.qualifications.length})
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {person.qualifications.map((q) => (
                                <div key={q.id} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-slate-200 truncate font-medium">{q.qualificationName}</span>
                                  <span
                                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                      q.status === 'VALID'
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                        : 'bg-red-950 text-red-400 border border-red-800'
                                    }`}
                                  >
                                    {q.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {/* Arrow indicator */}
                            <div className="absolute left-4 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </TableCell>

                    {/* 8. Action */}
                    <TableCell className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                        {role === 'ADMIN' && op.isAvailable && (
                          <Link href={`/deployments?assignPersonnelId=${person.id}`}>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-7 px-2.5 text-xs font-semibold"
                            >
                              Deploy
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => setSelectedPersonForModal(person)}
                          className="h-7 px-2 gap-1 font-semibold text-xs text-slate-700 hover:text-slate-900"
                        >
                          <span>Preview</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Table Footer with Pagination & Rows Per Page Selector */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div>
              Showing <strong className="text-slate-900 font-bold">{filteredPersonnel.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-900 font-bold">{Math.min(currentPage * pageSize, filteredPersonnel.length)}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{filteredPersonnel.length}</strong> personnel
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
              >
                <option value={10}>10 / page</option>
                <option value={15}>15 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <span className="px-2 font-bold text-slate-800 text-xs">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="subtle"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Pop-up Modal with "View Details" to navigate to details page */}
      {selectedPersonForModal && modalOperationalStatus && (
        <Dialog open={!!selectedPersonForModal} onOpenChange={(open) => !open && setSelectedPersonForModal(null)}>
          <DialogContent className="max-w-xl sm:max-w-2xl p-6 rounded-2xl bg-white border border-slate-200">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center justify-between pr-6">
                <span>Personnel Quick View</span>
                <span className="font-mono text-xs text-slate-400 font-normal">
                  {selectedPersonForModal.personnelNumber}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-1 text-xs">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <img
                  src={selectedPersonForModal.photoUrl}
                  alt={selectedPersonForModal.fullName}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {selectedPersonForModal.fullName}
                    </h3>
                    {modalOperationalStatus.isDeployed ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-semibold text-[11px]">
                        <ShieldCheck className="h-3 w-3" /> Deployed
                      </Badge>
                    ) : modalOperationalStatus.isAvailable ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold text-[11px]">
                        <UserCheck2 className="h-3 w-3" /> Available ({modalOperationalStatus.daysOffLabel})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[11px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    {selectedPersonForModal.position}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building className="h-3 w-3 text-slate-400" />
                    <span>{selectedPersonForModal.organizationalUnitName}</span>
                  </div>
                </div>
              </div>

              {/* Grid: Details & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2">
                  <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Contact & Personal
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-900">{selectedPersonForModal.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-900 truncate">{selectedPersonForModal.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Gender: <strong className="font-semibold text-slate-900">{selectedPersonForModal.gender === 'MALE' ? 'Male' : 'Female'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Joined: <strong className="font-semibold text-slate-900">{formatDate(selectedPersonForModal.joinDate)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2">
                  <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Deployment Information
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {modalOperationalStatus.siteName}
                        </div>
                        {modalOperationalStatus.siteSubtitle && (
                          <div className="text-[11px] text-slate-500">
                            {modalOperationalStatus.siteSubtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Days off status: <strong className="font-semibold text-slate-900">{modalOperationalStatus.daysOffLabel}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualifications / Skills Badges */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-slate-500" />
                    Skills & Qualifications ({selectedPersonForModal.qualifications.length})
                  </span>
                </div>
                {selectedPersonForModal.qualifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No certifications registered.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPersonForModal.qualifications.map((q) => (
                      <span
                        key={q.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-800"
                      >
                        <span className="font-semibold">{q.qualificationName}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1 rounded ${
                            q.status === 'VALID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {q.status}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setSelectedPersonForModal(null)}
                className="w-full sm:w-auto text-xs font-semibold"
              >
                Close Preview
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {role === 'ADMIN' && modalOperationalStatus.isAvailable && (
                  <Link href={`/deployments?assignPersonnelId=${selectedPersonForModal.id}`} className="w-full sm:w-auto">
                    <Button
                      variant="subtle"
                      size="sm"
                      className="w-full sm:w-auto text-xs font-semibold border border-slate-200"
                    >
                      Deploy Personnel
                    </Button>
                  </Link>
                )}

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const id = selectedPersonForModal.id;
                    setSelectedPersonForModal(null);
                    router.push(`/personnel/${id}`);
                  }}
                  className="w-full sm:w-auto gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

