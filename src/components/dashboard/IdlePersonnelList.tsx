'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { UserMinus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function IdlePersonnelList() {
  const { personnelList, assignments, getAssignmentsHistoryForPersonnel, role } = useApp();

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const deployedPersonnelIds = new Set(activeAssignments.map((a) => a.personnelId));

  const idlePersonnel = personnelList.filter(
    (p) => p.employmentStatus === 'ACTIVE' && !deployedPersonnelIds.has(p.id)
  );

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UserMinus className="h-4 w-4 text-amber-600" />
                Standby & Unassigned Personnel (PRD 4.1 E)
              </CardTitle>
              <Badge variant="warning">{idlePersonnel.length} Available</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active guards on standby ready for immediate client deployment
            </p>
          </div>

          <Link
            href="/personnel?deploymentStatus=IDLE"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {idlePersonnel.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              All active personnel are currently deployed to client sites.
            </div>
          ) : (
            idlePersonnel.slice(0, 5).map((person) => {
              const history = getAssignmentsHistoryForPersonnel(person.id);
              const lastAssignment = history.length > 0 ? history[0] : null;

              return (
                <div key={person.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={person.photoUrl}
                      alt={person.fullName}
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/personnel/${person.id}`}
                          className="font-semibold text-slate-900 text-xs truncate hover:text-blue-600 transition"
                        >
                          {person.fullName}
                        </Link>
                        <Badge variant="outline" className="font-mono text-[10px] px-1 py-0">
                          {person.personnelNumber}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="text-slate-700 font-medium">{person.position}</span>
                        <span>&bull;</span>
                        <span className="truncate">
                          {lastAssignment ? `Last at: ${lastAssignment.locationName}` : 'New recruit (no prior site)'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {person.qualifications.slice(0, 2).map((q) => (
                          <Badge
                            key={q.id}
                            variant={q.status === 'VALID' ? 'default' : 'destructive'}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {q.qualificationName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link href={`/personnel/${person.id}`}>
                      <Button variant="subtle" size="sm">
                        Profile
                      </Button>
                    </Link>
                    {role === 'ADMIN' && (
                      <Link href={`/deployments?assignPersonnelId=${person.id}`}>
                        <Button variant="default" size="sm">
                          Deploy
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center mt-3">
        <span>Filtered from active roster with zero ongoing assignments</span>
        <span>Total Standby: <strong className="text-slate-700">{idlePersonnel.length} Guards</strong></span>
      </div>
    </Card>
  );
}
