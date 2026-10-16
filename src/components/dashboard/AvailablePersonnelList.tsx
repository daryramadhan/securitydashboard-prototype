'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { UserCheck2, ArrowRight, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export function AvailablePersonnelList() {
  const { personnelList, assignments, getAssignmentsHistoryForPersonnel, role } = useApp();

  // Strict Definition:
  // Available = ACTIVE employmentStatus with NO active assignment
  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const deployedPersonnelIds = new Set(activeAssignments.map((a) => a.personnelId));

  // Filter:
  // 1. Only Security personnel (position includes 'security' or 'guard')
  // 2. Minimal 1 skill (qualifications.length >= 1)
  // 3. Top 5 sorted by longest off-duty period
  const topAvailableSecurity = useMemo(() => {
    const list = personnelList
      .filter((p) => {
        if (p.employmentStatus !== 'ACTIVE') return false;
        if (deployedPersonnelIds.has(p.id)) return false;

        // 1. Only security
        const pos = p.position.toLowerCase();
        const isSecurity = pos.includes('security') || pos.includes('guard');
        if (!isSecurity) return false;

        // 2. Minimal 1 skill / qualification
        const hasSkill = p.qualifications && p.qualifications.length >= 1;
        if (!hasSkill) return false;

        return true;
      })
      .map((person) => {
        const history = getAssignmentsHistoryForPersonnel(person.id);
        const lastAssignment = history.length > 0 ? history[0] : null;

        // Calculate days off-duty
        let daysOff = 0;
        let daysOffLabel = '';
        if (lastAssignment?.endDate) {
          const ms = Date.now() - new Date(lastAssignment.endDate).getTime();
          daysOff = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
          daysOffLabel = `${daysOff}d off-duty`;
        } else {
          const ms = Date.now() - new Date(person.joinDate).getTime();
          daysOff = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
          daysOffLabel = `${daysOff}d off-duty`;
        }

        return {
          person,
          lastAssignment,
          daysOff,
          daysOffLabel,
        };
      });

    // Sort by longest off-duty first (descending)
    list.sort((a, b) => b.daysOff - a.daysOff);

    // Top 5
    return list.slice(0, 5);
  }, [personnelList, deployedPersonnelIds, getAssignmentsHistoryForPersonnel]);

  // Total count of available security personnel
  const totalAvailableSecurityCount = useMemo(() => {
    return personnelList.filter((p) => {
      if (p.employmentStatus !== 'ACTIVE' || deployedPersonnelIds.has(p.id)) return false;
      const pos = p.position.toLowerCase();
      const isSecurity = pos.includes('security') || pos.includes('guard');
      const hasSkill = p.qualifications && p.qualifications.length >= 1;
      return isSecurity && hasSkill;
    }).length;
  }, [personnelList, deployedPersonnelIds]);

  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck2 className="h-4 w-4 text-slate-700" />
                Available Security Personnel (Longest Off-Duty)
              </CardTitle>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Top 5 Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standby security officers with minimal 1 verified skill, prioritized by longest off-duty period
            </p>
          </div>

          <Link
            href="/personnel?deploymentStatus=AVAILABLE"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View All Available ({totalAvailableSecurityCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Available Personnel Table */}
        <div className="overflow-x-auto mt-2">
          {topAvailableSecurity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No available security guards matching criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Security Officer
                  </TableHead>
                  <TableHead className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Position
                  </TableHead>
                  <TableHead className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Skills / Certifications
                  </TableHead>
                  <TableHead className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Off-Duty Period
                  </TableHead>
                  <TableHead className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Prior Deployment
                  </TableHead>
                  <TableHead className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAvailableSecurity.map(({ person, lastAssignment, daysOff, daysOffLabel }) => {
                  return (
                    <TableRow key={person.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Security Officer (Avatar, Name, ID) */}
                      <TableCell className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={person.photoUrl}
                            alt={person.fullName}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/personnel/${person.id}`}
                              className="font-bold text-slate-900 text-xs truncate hover:text-blue-600 transition block"
                            >
                              {person.fullName}
                            </Link>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200 inline-block mt-0.5">
                              {person.personnelNumber}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Position */}
                      <TableCell className="py-3 px-3 text-xs font-semibold text-slate-800">
                        {person.position}
                      </TableCell>

                      {/* 3. Skills / Certifications (Minimal 1 skill) */}
                      <TableCell className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {person.qualifications.map((q) => (
                            <span
                              key={q.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {q.qualificationName}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* 4. Off-Duty Period (Longest highlighted) */}
                      <TableCell className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                            daysOff > 30
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>{daysOffLabel}</span>
                        </span>
                      </TableCell>

                      {/* 5. Prior Deployment */}
                      <TableCell className="py-3 px-3 text-xs text-slate-600">
                        {lastAssignment ? (
                          <div>
                            <span className="font-medium text-slate-800 block truncate max-w-[180px]">
                              {lastAssignment.locationName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {lastAssignment.clientName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            New Recruit Standby
                          </span>
                        )}
                      </TableCell>

                      {/* 6. Actions */}
                      <TableCell className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/personnel/${person.id}`}>
                            <Button
                              variant="subtle"
                              size="sm"
                              className="h-7 text-xs font-semibold text-slate-700 px-2.5"
                            >
                              Profile
                            </Button>
                          </Link>
                          {role === 'ADMIN' && (
                            <Link href={`/deployments?assignPersonnelId=${person.id}`}>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 text-xs font-semibold px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Deploy
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center mt-3">
        <span>Prioritized by longest standby duration for fair duty rotation</span>
        <span>
          Total Available Security Force: <strong className="text-slate-900 font-bold">{totalAvailableSecurityCount} Guards</strong>
        </span>
      </div>
    </Card>
  );
}
