'use client';

import React, { useState, useMemo } from 'react';
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
  UserMinus,
  MapPin,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
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
  const { personnelList, locations, role, getActiveAssignmentForPersonnel } = useApp();

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

  const handleExport = () => {
    const headers = [
      'Personnel ID',
      'Full Name',
      'Gender',
      'Phone',
      'Email',
      'Position',
      'Division / Unit',
      'Employment Status',
      'Deployment Status',
      'Current Site',
      'Current Client',
      'Join Date',
    ];

    const rows = filteredPersonnel.map((p) => {
      const activeAsg = getActiveAssignmentForPersonnel(p.id);
      const isDeployed = !!activeAsg;
      const isIdle = p.employmentStatus === 'ACTIVE' && !isDeployed;

      return [
        p.personnelNumber,
        p.fullName,
        p.gender,
        p.phone,
        p.email,
        p.position,
        p.organizationalUnitName,
        p.employmentStatus,
        isDeployed ? 'DEPLOYED' : isIdle ? 'IDLE / STANDBY' : 'INACTIVE',
        activeAsg ? activeAsg.locationName : 'None',
        activeAsg ? activeAsg.clientName : 'None',
        p.joinDate,
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

        {/* Primary Filters (3 Core: Employment, Deployment, Position) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
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

          <div>
            <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Deployment Status</label>
            <select
              value={deploymentFilter}
              onChange={(e) => {
                setDeploymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            >
              <option value="ALL">All Deployments</option>
              <option value="DEPLOYED">Currently Deployed</option>
              <option value="AVAILABLE">Available / Standby</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-slate-700 block mb-1.5">Position / Rank</label>
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

      {/* shadcn Table: 6 Core Columns with Clear Visual Hierarchy */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-slate-700">Personnel</TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-slate-700">Position / Rank</TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-slate-700">Employment Status</TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-slate-700">Deployment Status</TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-slate-700">Current Site</TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-slate-700 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPersonnel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                  No personnel records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPersonnel.map((person) => {
                const activeAsg = getActiveAssignmentForPersonnel(person.id);
                const isDeployed = !!activeAsg;
                const isAvailable = person.employmentStatus === 'ACTIVE' && !isDeployed;

                return (
                  <TableRow key={person.id} className="group hover:bg-slate-50/70 transition-colors">
                    {/* 1. Personnel: Name as primary, ID as secondary */}
                    <TableCell className="py-2 px-3">
                      <Link href={`/personnel/${person.id}`} className="flex items-center gap-2.5 group/link">
                        <img
                          src={person.photoUrl}
                          alt={person.fullName}
                          className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 group-hover/link:text-blue-600 transition-colors truncate">
                            {person.fullName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {person.personnelNumber}
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    {/* 2. Position / Rank */}
                    <TableCell className="py-2 px-3">
                      <div className="font-semibold text-xs text-slate-900 truncate max-w-[210px]">
                        {person.position}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate max-w-[210px]">
                        {person.organizationalUnitName}
                      </div>
                    </TableCell>

                    {/* 3. Employment Status: Semantic Dot Indicator */}
                    <TableCell className="py-2 px-3 whitespace-nowrap">
                      {person.employmentStatus === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span>Active Employee</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0"></span>
                          <span>Inactive / Resigned</span>
                        </span>
                      )}
                    </TableCell>

                    {/* 4. Deployment Status: Operational Pill Badge with Icon */}
                    <TableCell className="py-2 px-3 whitespace-nowrap">
                      {isDeployed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>Deployed</span>
                        </span>
                      ) : isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/80 text-amber-900 border border-amber-200/80">
                          <UserCheck2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>Available</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Unassigned (Inactive)
                        </span>
                      )}
                    </TableCell>

                    {/* 5. Current Site */}
                    <TableCell className="py-2 px-3">
                      {activeAsg ? (
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 flex items-center gap-1 truncate max-w-[230px]">
                            <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                            <span className="truncate">{activeAsg.locationName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-[230px]">
                            {activeAsg.clientName}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          {person.employmentStatus === 'ACTIVE' ? 'No active deployment' : 'Not deployable'}
                        </div>
                      )}
                    </TableCell>

                    {/* 6. Action: Role-Aware Actions */}
                    <TableCell className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {role === 'ADMIN' && isAvailable && (
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
                        <Link href={`/personnel/${person.id}`}>
                          <Button
                            variant="subtle"
                            size="sm"
                            className="h-7 px-2.5 gap-1 font-semibold text-xs text-slate-800"
                          >
                            <span>Profile</span>
                            <ExternalLink className="h-3 w-3 text-slate-500" />
                          </Button>
                        </Link>
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
    </div>
  );
}
