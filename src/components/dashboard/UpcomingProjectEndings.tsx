'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getProjectDurationInfo, formatDate } from '@/lib/utils';
import { Clock, Calendar, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function UpcomingProjectEndings() {
  const { projects, locations } = useApp();
  const [filterDays, setFilterDays] = useState<number | 'all'>(60);

  const filteredProjects = projects.filter((project) => {
    const info = getProjectDurationInfo(project.endDate);
    if (filterDays === 'all') return true;
    if (info.daysRemaining === null) return false;
    return info.daysRemaining <= filterDays;
  });

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Upcoming Project Expirations (PRD 4.1 D)
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Contracts approaching completion requiring renewal or personnel reassignment
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            {[30, 60, 90, 'all'].map((val) => (
              <button
                key={String(val)}
                onClick={() => setFilterDays(val as any)}
                className={`px-2 py-0.5 rounded-lg transition ${
                  filterDays === val
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {val === 'all' ? 'All' : `< ${val}d`}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {filteredProjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No projects ending within this agreed time window.
            </div>
          ) : (
            filteredProjects.map((project) => {
              const info = getProjectDurationInfo(project.endDate);
              const relatedLocations = locations.filter((l) => l.projectId === project.id);

              const badgeVariant =
                info.status === 'urgent'
                  ? 'destructive'
                  : info.status === 'warning'
                  ? 'warning'
                  : info.status === 'active'
                  ? 'success'
                  : 'secondary';

              return (
                <div key={project.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                        {project.projectCode}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">{project.clientName}</span>
                      <span>&bull;</span>
                      <span>{relatedLocations.length} deployment {relatedLocations.length === 1 ? 'site' : 'sites'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge variant={badgeVariant as any}>{info.label}</Badge>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(project.endDate)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center mt-3">
        <span>Dynamic countdown at page load</span>
        <Link href="/deployments" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
          <span>Manage deployment contracts</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
