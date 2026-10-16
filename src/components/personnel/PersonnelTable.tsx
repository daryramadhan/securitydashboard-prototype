'use client';

import React, { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Personnel } from '@/types';
import { exportToCsv, formatDate } from '@/lib/utils';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  Briefcase,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  UserPlus,
  Eye,
  Clock,
  Shield,
  CheckCircle2,
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

export interface PersonnelTableHandle {
  exportCsv: () => void;
}

interface PersonnelTableProps {
  initialEmploymentStatus?: string;
  initialDeploymentStatus?: string;
  deploymentFilter?: string;
  onDeploymentFilterChange?: (status: string) => void;
  onOpenAddModal?: () => void;
}

export const PersonnelTable = forwardRef<PersonnelTableHandle, PersonnelTableProps>(
  function PersonnelTable(
    {
      initialEmploymentStatus,
      initialDeploymentStatus,
      deploymentFilter: controlledDeploymentFilter,
      onDeploymentFilterChange,
      onOpenAddModal,
    }: PersonnelTableProps,
    ref
  ) {
    const router = useRouter();
    const {
      personnelList,
      locations,
      role,
      getActiveAssignmentForPersonnel,
      getAssignmentsHistoryForPersonnel,
    } = useApp();

    const [searchQuery, setSearchQuery] = useState('');
    const [internalDeploymentFilter, setInternalDeploymentFilter] = useState<string>(initialDeploymentStatus || 'ALL');
    const deploymentFilter = controlledDeploymentFilter !== undefined ? controlledDeploymentFilter : internalDeploymentFilter;

    const setDeploymentFilter = (status: string) => {
      if (onDeploymentFilterChange) {
        onDeploymentFilterChange(status);
      } else {
        setInternalDeploymentFilter(status);
      }
      setCurrentPage(1);
    };

    useEffect(() => {
      if (controlledDeploymentFilter !== undefined) {
        setCurrentPage(1);
      }
    }, [controlledDeploymentFilter]);

    const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [genderFilter, setGenderFilter] = useState<string>('ALL');
    const [isBadgeDropdownOpen, setIsBadgeDropdownOpen] = useState(false);
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
    const badgeDropdownRef = useRef<HTMLDivElement>(null);
    const positionDropdownRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Selected personnel for quick-view pop-up modal
  const [selectedPersonForModal, setSelectedPersonForModal] = useState<Personnel | null>(null);

  // Close badge & position popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (badgeDropdownRef.current && !badgeDropdownRef.current.contains(event.target as Node)) {
        setIsBadgeDropdownOpen(false);
      }
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target as Node)) {
        setIsPositionDropdownOpen(false);
      }
    }
    if (isBadgeDropdownOpen || isPositionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBadgeDropdownOpen, isPositionDropdownOpen]);

  const uniqueQualifications = useMemo(() => {
    const set = new Set<string>();
    personnelList.forEach((p) => p.qualifications.forEach((q) => set.add(q.qualificationName)));
    return Array.from(set).sort();
  }, [personnelList]);

  const qualificationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    personnelList.forEach((p) => {
      p.qualifications.forEach((q) => {
        if (q.status === 'VALID') {
          counts[q.qualificationName] = (counts[q.qualificationName] || 0) + 1;
        }
      });
    });
    return counts;
  }, [personnelList]);

  const uniquePositions = useMemo(() => {
    const set = new Set<string>();
    personnelList.forEach((p) => {
      if (p.position) set.add(p.position);
    });
    return Array.from(set).sort();
  }, [personnelList]);

  const positionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    personnelList.forEach((p) => {
      if (p.position) {
        counts[p.position] = (counts[p.position] || 0) + 1;
      }
    });
    return counts;
  }, [personnelList]);

  const handleToggleBadge = (badgeName: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeName) ? prev.filter((b) => b !== badgeName) : [...prev, badgeName]
    );
    setCurrentPage(1);
  };

  const handleTogglePosition = (posName: string) => {
    setSelectedPositions((prev) =>
      prev.includes(posName) ? prev.filter((p) => p !== posName) : [...prev, posName]
    );
    setCurrentPage(1);
  };

  const [sortField, setSortField] = useState<'position' | 'availability' | 'daysOff' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'position' | 'availability' | 'daysOff') => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDeploymentFilter('ALL');
    setSelectedPositions([]);
    setSelectedBadges([]);
    setGenderFilter('ALL');
    setSortField(null);
    setSortOrder('asc');
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

      if (initialEmploymentStatus && initialEmploymentStatus !== 'ALL' && person.employmentStatus !== initialEmploymentStatus) {
        return false;
      }

      const activeAsg = getActiveAssignmentForPersonnel(person.id);
      const isDeployed = !!activeAsg;
      const isAvailable = person.employmentStatus === 'ACTIVE' && !isDeployed;

      if (deploymentFilter === 'DEPLOYED' && !isDeployed) return false;
      if ((deploymentFilter === 'AVAILABLE' || deploymentFilter === 'IDLE') && !isAvailable) return false;

      if (genderFilter !== 'ALL' && person.gender !== genderFilter) {
        return false;
      }

      if (selectedPositions.length > 0) {
        if (!selectedPositions.includes(person.position)) return false;
      }

      if (selectedBadges.length > 0) {
        const hasAllRequiredBadges = selectedBadges.every((badgeName) =>
          person.qualifications.some(
            (q) => q.qualificationName === badgeName && q.status === 'VALID'
          )
        );
        if (!hasAllRequiredBadges) return false;
      }

      return true;
    });
  }, [
    personnelList,
    searchQuery,
    initialEmploymentStatus,
    deploymentFilter,
    genderFilter,
    selectedPositions,
    selectedBadges,
    getActiveAssignmentForPersonnel,
  ]);

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
      siteSubtitle = person.employmentStatus === 'ACTIVE' ? 'Standby pool' : 'Unassigned';
    }

    // Days off determination
    let daysOffLabel = '-';
    let daysOffBadge = 'bg-slate-100 text-slate-500 border-slate-200';
    let daysOffValue = 0;

    if (isDeployed) {
      daysOffLabel = 'On Duty';
      daysOffBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      daysOffValue = 0;
    } else if (isAvailable) {
      if (lastAsg?.endDate) {
        const msDiff = Date.now() - new Date(lastAsg.endDate).getTime();
        const days = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
        daysOffLabel = `${days}d off`;
        daysOffBadge = days > 30 ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' : 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
        daysOffValue = days;
      } else {
        const msDiff = Date.now() - new Date(person.joinDate).getTime();
        const days = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
        daysOffLabel = `${days}d off`;
        daysOffBadge = 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
        daysOffValue = days;
      }
    } else {
      daysOffLabel = 'Inactive';
      daysOffBadge = 'bg-slate-100 text-slate-400 border-slate-200';
      daysOffValue = -1;
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
      daysOffValue,
    };
  };

  const sortedPersonnel = useMemo(() => {
    if (!sortField) return filteredPersonnel;

    return [...filteredPersonnel].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'position') {
        comparison = a.position.localeCompare(b.position);
      } else if (sortField === 'availability') {
        const opA = getOperationalStatus(a);
        const opB = getOperationalStatus(b);
        const rankA = opA.isAvailable ? 0 : opA.isDeployed ? 1 : 2;
        const rankB = opB.isAvailable ? 0 : opB.isDeployed ? 1 : 2;
        comparison = rankA - rankB;
      } else if (sortField === 'daysOff') {
        const opA = getOperationalStatus(a);
        const opB = getOperationalStatus(b);
        comparison = opA.daysOffValue - opB.daysOffValue;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPersonnel, sortField, sortOrder, getOperationalStatus]);

  const totalPages = Math.ceil(sortedPersonnel.length / pageSize) || 1;
  const paginatedPersonnel = sortedPersonnel.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

    const rows = sortedPersonnel.map((p) => {
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

  useImperativeHandle(ref, () => ({
    exportCsv: handleExport,
  }));

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    deploymentFilter !== 'ALL' ||
    genderFilter !== 'ALL' ||
    selectedPositions.length > 0 ||
    selectedBadges.length > 0 ||
    sortField !== null;

  const modalOperationalStatus = selectedPersonForModal ? getOperationalStatus(selectedPersonForModal) : null;

  return (
    <div className="space-y-3">
      {/* Search Bar Container - Only Show Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by personnel name or ID (e.g. Budi, JISS-101)..."
            className="pl-10 pr-12 py-2 text-xs text-slate-900 placeholder:text-slate-400 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chips Filter Row: Availability, Position, Skills (formerly Badge Needed), Gender */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Availability Chips */}
        <div className="inline-flex items-center rounded-xl bg-white border border-slate-200/80 p-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Availability:
          </span>
          <button
            type="button"
            onClick={() => {
              setDeploymentFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              deploymentFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setDeploymentFilter('AVAILABLE');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              deploymentFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck2 className="h-3.5 w-3.5" />
            <span>Available</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDeploymentFilter('DEPLOYED');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              deploymentFilter === 'DEPLOYED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Deployed</span>
          </button>
        </div>

        {/* Position Filter Chip with Checkbox Details Popover */}
        <div className="relative" ref={positionDropdownRef}>
          <button
            type="button"
            onClick={() => setIsPositionDropdownOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
              selectedPositions.length > 0
                ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-500/20'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Briefcase className={`h-3.5 w-3.5 ${selectedPositions.length > 0 ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Position</span>
            {selectedPositions.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                {selectedPositions.length}
              </span>
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {/* Position Checkbox Details Dropdown */}
          {isPositionDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Position / Role
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Filter personnel by duty position
                  </div>
                </div>
                {selectedPositions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPositions([]);
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {uniquePositions.map((pos) => {
                  const isChecked = selectedPositions.includes(pos);
                  const count = positionCounts[pos] || 0;

                  return (
                    <label
                      key={pos}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition select-none ${
                        isChecked ? 'bg-blue-50/80 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePosition(pos)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <span className="truncate">{pos}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal shrink-0 ml-2">
                        {count} guards
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {selectedPositions.length === 0 ? 'No positions filtered' : `${selectedPositions.length} selected`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPositionDropdownOpen(false)}
                  className="px-3.5 py-1 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 text-xs shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skills Chip with Checkbox Details Popover (Formerly Badge Needed) */}
        <div className="relative" ref={badgeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsBadgeDropdownOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
              selectedBadges.length > 0
                ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-500/20'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Award className={`h-3.5 w-3.5 ${selectedBadges.length > 0 ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Skills</span>
            {selectedBadges.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                {selectedBadges.length}
              </span>
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {/* Checkbox Details Dropdown */}
          {isBadgeDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-blue-600" />
                    Skills & Qualifications
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Select required skills & certifications
                  </div>
                </div>
                {selectedBadges.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBadges([]);
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {uniqueQualifications.map((badgeName) => {
                  const isChecked = selectedBadges.includes(badgeName);
                  const count = qualificationCounts[badgeName] || 0;

                  return (
                    <label
                      key={badgeName}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition select-none ${
                        isChecked ? 'bg-blue-50/80 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleBadge(badgeName)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <span className="truncate">{badgeName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal shrink-0 ml-2">
                        {count} guards
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {selectedBadges.length === 0 ? 'No skills filtered' : `${selectedBadges.length} selected`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsBadgeDropdownOpen(false)}
                  className="px-3.5 py-1 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 text-xs shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gender Chips */}
        <div className="inline-flex items-center rounded-xl bg-white border border-slate-200/80 p-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Gender:
          </span>
          <button
            type="button"
            onClick={() => {
              setGenderFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              genderFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setGenderFilter('MALE');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              genderFilter === 'MALE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => {
              setGenderFilter('FEMALE');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              genderFilter === 'FEMALE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Female
          </button>
        </div>

        {/* Reset All Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition ml-auto"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Table: Exact 8 columns
          id | name | only position not rank | (no employment) | availability (deployed/available) | current/last site | days off | skills (truncate + hover) | action
      */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm min-h-[380px]">
        <Table className="table-fixed min-w-[1200px] w-full">
          <colgroup>
            <col style={{ width: '100px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '190px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '220px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '90px' }} />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/70 border-b border-slate-200">
              {/* 1. ID */}
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 w-[100px] min-w-[100px] max-w-[100px] truncate">
                ID
              </TableHead>

              {/* 2. Name */}
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 w-[180px] min-w-[180px] max-w-[180px] truncate">
                Name
              </TableHead>

              {/* 3. Position (Sortable) */}
              <TableHead
                onClick={() => handleSort('position')}
                className="py-3 px-3 text-[11px] font-bold w-[190px] min-w-[190px] max-w-[190px] cursor-pointer select-none transition-colors hover:text-blue-600 hover:bg-slate-100/70"
                title="Click to sort by Position"
              >
                <div className="flex items-center justify-between pr-1">
                  <span className={`truncate ${sortField === 'position' ? 'text-blue-600 font-extrabold' : 'text-slate-700'}`}>
                    Position
                  </span>
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {sortField === 'position' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 hover:opacity-100 shrink-0" />
                    )}
                  </span>
                </div>
              </TableHead>

              {/* 4. Availability (Sortable) */}
              <TableHead
                onClick={() => handleSort('availability')}
                className="py-3 px-3 text-[11px] font-bold w-[130px] min-w-[130px] max-w-[130px] cursor-pointer select-none transition-colors hover:text-blue-600 hover:bg-slate-100/70"
                title="Click to sort by Availability"
              >
                <div className="flex items-center justify-between pr-1">
                  <span className={`truncate ${sortField === 'availability' ? 'text-blue-600 font-extrabold' : 'text-slate-700'}`}>
                    Availability
                  </span>
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {sortField === 'availability' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 hover:opacity-100 shrink-0" />
                    )}
                  </span>
                </div>
              </TableHead>

              {/* 5. Current / Last Site */}
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 w-[220px] min-w-[220px] max-w-[220px] truncate">
                Current / Last Site
              </TableHead>

              {/* 6. Days Off (Sortable) */}
              <TableHead
                onClick={() => handleSort('daysOff')}
                className="py-3 px-3 text-[11px] font-bold w-[110px] min-w-[110px] max-w-[110px] cursor-pointer select-none transition-colors hover:text-blue-600 hover:bg-slate-100/70"
                title="Click to sort by Days Off"
              >
                <div className="flex items-center justify-between pr-1">
                  <span className={`truncate ${sortField === 'daysOff' ? 'text-blue-600 font-extrabold' : 'text-slate-700'}`}>
                    Days Off
                  </span>
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {sortField === 'daysOff' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 hover:opacity-100 shrink-0" />
                    )}
                  </span>
                </div>
              </TableHead>

              {/* 7. Skills */}
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 w-[180px] min-w-[180px] max-w-[180px] truncate">
                Skills
              </TableHead>

              {/* 8. Action (Sticky) */}
              <TableHead className="py-3 px-3 text-[11px] font-bold text-slate-700 text-right w-[90px] min-w-[90px] max-w-[90px] sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)]">
                Action
              </TableHead>
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
              paginatedPersonnel.map((person, index) => {
                const op = getOperationalStatus(person);
                const isNearTop = index < 3;

                return (
                  <TableRow
                    key={person.id}
                    onClick={() => setSelectedPersonForModal(person)}
                    className="cursor-pointer group hover:bg-blue-50/30 transition-colors border-b border-slate-100 relative hover:z-20 h-[58px]"
                    title="Click row to open profile preview"
                  >
                    {/* 1. ID */}
                    <TableCell className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-600 w-[100px] min-w-[100px] max-w-[100px] h-[58px] truncate">
                      {person.personnelNumber}
                    </TableCell>

                    {/* 2. Name */}
                    <TableCell className="py-2.5 px-3 w-[180px] min-w-[180px] max-w-[180px] h-[58px]">
                      <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate" title={person.fullName}>
                        {person.fullName}
                      </div>
                    </TableCell>

                    {/* 3. Position (Only Position, no rank/division subtitle) */}
                    <TableCell className="py-2.5 px-3 font-medium text-xs text-slate-800 w-[190px] min-w-[190px] max-w-[190px] h-[58px]">
                      <div className="truncate" title={person.position}>{person.position}</div>
                    </TableCell>

                    {/* 4. Availability (Deployed vs Available) */}
                    <TableCell className="py-2.5 px-3 whitespace-nowrap w-[130px] min-w-[130px] max-w-[130px] h-[58px]">
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
                    <TableCell className="py-2.5 px-3 w-[220px] min-w-[220px] max-w-[220px] h-[58px]">
                      <div className="min-w-0 min-h-[34px] flex flex-col justify-center">
                        <div className="font-semibold text-xs text-slate-900 flex items-center gap-1 truncate" title={op.siteName}>
                          <MapPin className={`h-3 w-3 shrink-0 ${op.isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate">{op.siteName}</span>
                        </div>
                        {op.siteSubtitle && (
                          <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5 pl-4" title={op.siteSubtitle}>
                            {op.siteSubtitle}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* 6. Days Off */}
                    <TableCell className="py-2.5 px-3 whitespace-nowrap w-[110px] min-w-[110px] max-w-[110px] h-[58px]">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${op.daysOffBadge}`}>
                        {op.daysOffLabel}
                      </span>
                    </TableCell>

                    {/* 7. Skills: Truncate + Hover Tooltip (Adaptive direction & full text) */}
                    <TableCell className="py-2.5 px-3 relative w-[180px] min-w-[180px] max-w-[180px] h-[58px]">
                      {person.qualifications && person.qualifications.length > 0 ? (
                        <div className="relative group/skills inline-block max-w-[160px]">
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
                          <div
                            className={`hidden group-hover/skills:block absolute z-50 left-0 w-80 max-w-[340px] p-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 pointer-events-none ${
                              isNearTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pb-2 mb-2 border-b border-slate-800">
                              <span className="flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                <span>All Qualifications ({person.qualifications.length})</span>
                              </span>
                            </div>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {person.qualifications.map((q) => (
                                <div
                                  key={q.id}
                                  className="flex items-start justify-between gap-2.5 text-xs pb-1.5 border-b border-slate-800/60 last:border-0 last:pb-0"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="text-slate-100 font-semibold leading-snug break-words">
                                      {q.qualificationName}
                                    </div>
                                    {q.issuingOrg && (
                                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                        {q.issuingOrg}
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded shrink-0 self-start ${
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
                            <div
                              className={`absolute left-5 w-0 h-0 border-x-4 border-x-transparent ${
                                isNearTop
                                  ? 'bottom-full border-b-4 border-b-slate-900 border-t-transparent'
                                  : 'top-full border-t-4 border-t-slate-900 border-b-transparent'
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </TableCell>

                    {/* 8. Action (Fixed / Sticky to the right) */}
                    <TableCell className="py-2.5 px-3 text-right whitespace-nowrap w-[90px] min-w-[90px] max-w-[90px] h-[58px] sticky right-0 z-10 bg-white group-hover:bg-[#f1f6fd] transition-colors border-l border-slate-200/80 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)]">
                      <div className="inline-flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                        {role === 'ADMIN' && op.isAvailable && (
                          <Link href={`/deployments?assignPersonnelId=${person.id}`} title="Deploy to Site">
                            <Button
                              variant="default"
                              size="icon"
                              className="h-7 w-7 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                              title="Deploy to Site"
                              aria-label="Deploy to Site"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/personnel/${person.id}`} title="View Full Details">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200 shadow-2xs"
                            title="View Full Details"
                            aria-label="View Full Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
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

              {/* Uniform & Security Equipment Sizing (Kaporlap) */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Shield className="h-3.5 w-3.5 text-blue-600" />
                    <span>Uniform & Gear Sizing (Kaporlap)</span>
                  </span>
                  {selectedPersonForModal.bloodType && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                      Blood: {selectedPersonForModal.bloodType}
                    </span>
                  )}
                </div>

                {/* Sizing badges grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                    <div className="text-[10px] text-slate-400 font-medium">Shirt (PDL/PDH)</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedPersonForModal.shirtSize || 'L'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                    <div className="text-[10px] text-slate-400 font-medium">Pants Size</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedPersonForModal.pantsSize || '34'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                    <div className="text-[10px] text-slate-400 font-medium">Shoes / Boots</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedPersonForModal.shoesSize || '42'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                    <div className="text-[10px] text-slate-400 font-medium">Beret / Hat</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedPersonForModal.headwearSize || '58'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-2xs col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-medium">Duty Belt (Kopel)</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{selectedPersonForModal.dutyBeltSize || 'L (100cm)'}</div>
                  </div>
                </div>

                {/* Physical specs & Issued security items */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1.5 border-t border-slate-200/70 text-[11px]">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span>Height: <strong className="font-semibold text-slate-900">{selectedPersonForModal.heightCm || 175} cm</strong></span>
                    <span>&bull;</span>
                    <span>Weight: <strong className="font-semibold text-slate-900">{selectedPersonForModal.weightKg || 72} kg</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Issued Tactical Equipment:
                  </div>
                </div>

                {/* Security Items Issued */}
                {selectedPersonForModal.issuedGear && selectedPersonForModal.issuedGear.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedPersonForModal.issuedGear.map((gear, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-blue-600 shrink-0" />
                        <span>{gear}</span>
                      </span>
                    ))}
                  </div>
                )}
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
});

PersonnelTable.displayName = 'PersonnelTable';

