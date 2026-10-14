'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { getProjectDurationInfo, formatDate } from '@/lib/utils';
import { AlertTriangle, Clock, CalendarOff, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export function NeedsAttentionSection() {
  const { projects, locations, assignments } = useApp();

  // 1. Overdue contracts (passed end date)
  const overdueProjects = projects.filter((p) => {
    const info = getProjectDurationInfo(p.endDate);
    return info.status === 'ended';
  });

  // 2. Ending soon contracts (<= 30 days remaining)
  const endingSoonProjects = projects.filter((p) => {
    const info = getProjectDurationInfo(p.endDate);
    return info.status === 'urgent' || info.status === 'warning';
  });

  // 3. Contracts / Deployments without end date (open-ended / unset)
  const unsetEndDateProjects = projects.filter((p) => {
    return !p.endDate && p.status === 'ACTIVE';
  });

  const totalIssues = overdueProjects.length + endingSoonProjects.length + unsetEndDateProjects.length;

  if (totalIssues === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Needs Attention
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {totalIssues} {totalIssues === 1 ? 'Action Required' : 'Actions Required'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-priority contract deadlines and missing deployment end dates requiring operational decisions
            </p>
          </div>
        </div>

        <Link
          href="/deployments"
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <span>Manage in Deployments</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of 3 issue categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category 1: Overdue Contracts (RED) */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
              Overdue Contracts ({overdueProjects.length})
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Critical
            </span>
          </div>

          {overdueProjects.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No overdue contracts.</p>
          ) : (
            <div className="space-y-2">
              {overdueProjects.map((p) => {
                const info = getProjectDurationInfo(p.endDate);
                const relatedLocations = locations.filter((l) => l.projectId === p.id);
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-white border border-rose-200/80 text-xs shadow-xs"
                  >
                    <div className="font-bold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.clientName}</div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-700">{info.label}</span>
                      <span className="text-slate-500 font-medium">
                        {relatedLocations.length} site(s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category 2: Ending Soon (AMBER) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Clock className="h-3.5 w-3.5 text-amber-700" />
              Ending Within 30 Days ({endingSoonProjects.length})
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Approaching
            </span>
          </div>

          {endingSoonProjects.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No contracts ending within 30 days.</p>
          ) : (
            <div className="space-y-2">
              {endingSoonProjects.map((p) => {
                const info = getProjectDurationInfo(p.endDate);
                const relatedLocations = locations.filter((l) => l.projectId === p.id);
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs shadow-xs"
                  >
                    <div className="font-bold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.clientName}</div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-800">{info.label}</span>
                      <span className="text-slate-500 font-medium">
                        End: {formatDate(p.endDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category 3: No End Date / Open-Ended (NEUTRAL) */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CalendarOff className="h-3.5 w-3.5 text-slate-600" />
              Open-Ended Deployments ({unsetEndDateProjects.length})
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              Review
            </span>
          </div>

          {unsetEndDateProjects.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">All active deployments have set end dates.</p>
          ) : (
            <div className="space-y-2">
              {unsetEndDateProjects.map((p) => {
                const relatedLocations = locations.filter((l) => l.projectId === p.id);
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-xs"
                  >
                    <div className="font-bold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.clientName}</div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-600">End date not specified</span>
                      <span className="text-slate-500 font-medium">
                        {relatedLocations.length} active site(s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
