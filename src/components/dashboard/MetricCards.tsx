'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { MapPin, UserCheck2, FolderKanban, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function MetricCards() {
  const { metrics, locations, projects } = useApp();

  const activeDeploymentsCount = locations.filter((l) => l.status === 'ACTIVE').length;

  // Latest added project
  const lastProject = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    const sorted = [...projects].sort((a, b) => {
      const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return timeB - timeA;
    });
    return sorted[0];
  }, [projects]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {/* 1. Active Area Deployments */}
      <Link href="/deployments" className="block group">
        <Card className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Area Deployments
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>

            <div className="mt-4 mb-2">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeDeploymentsCount}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mt-2">
            <span className="text-[11px] text-slate-400 font-medium">
              Across active client facilities
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <TrendingUp className="h-3 w-3" />
              <span>+2 active</span>
            </span>
          </div>
        </Card>
      </Link>

      {/* 2. Available Personnel */}
      <Link href="/personnel?deploymentStatus=AVAILABLE" className="block group">
        <Card className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                  <UserCheck2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Available Personnel
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </div>

            <div className="mt-4 mb-2">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {metrics.idlePersonnel.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mt-2">
            <span className="text-[11px] text-slate-400 font-medium">
              Standby & ready for dispatch
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {metrics.totalPersonnel} Total Force
            </span>
          </div>
        </Card>
      </Link>

      {/* 3. Last Project Added */}
      <Link href="/deployments" className="block group">
        <Card className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Last Project Added
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
            </div>

            <div className="mt-3 mb-1">
              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight line-clamp-1 group-hover:text-amber-700 transition-colors">
                {lastProject?.name || 'No projects yet'}
              </div>
              <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {lastProject?.clientName || 'PT. JISS Operational Force'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mt-2">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>{lastProject?.startDate ? formatDate(lastProject.startDate) : 'N/A'}</span>
            </span>
            {lastProject && (
              <Badge
                variant="outline"
                className={`text-[10px] font-bold ${
                  lastProject.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : lastProject.status === 'DRAFT'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {lastProject.status}
              </Badge>
            )}
          </div>
        </Card>
      </Link>
    </div>
  );
}
