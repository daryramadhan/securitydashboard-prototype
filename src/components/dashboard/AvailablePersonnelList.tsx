'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { UserCheck2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AvailablePersonnelList() {
  const { personnelList, assignments, getAssignmentsHistoryForPersonnel, role } = useApp();

  // Strict Definition (Requirement 7):
  // Available Personnel = ACTIVE employmentStatus with NO active assignment.
  // Inactive personnel are NEVER counted.
  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const deployedPersonnelIds = new Set(activeAssignments.map((a) => a.personnelId));

  const availablePersonnel = personnelList.filter(
    (p) => p.employmentStatus === 'ACTIVE' && !deployedPersonnelIds.has(p.id)
  );

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-white border-slate-200">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck2 className="h-4 w-4 text-slate-700" />
                Available Personnel
              </CardTitle>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {availablePersonnel.length} Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active guards with zero current deployments, ready for immediate site assignment
            </p>
          </div>

          <Link
            href="/personnel?deploymentStatus=AVAILABLE"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Simplified List: Name, Position, Primary Qualification, Availability Status, Quick Deploy */}
        <div className="divide-y divide-slate-100 mt-2">
          {availablePersonnel.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              All active personnel are currently assigned to active client sites.
            </div>
          ) : (
            availablePersonnel.slice(0, 5).map((person) => {
              const primaryQual = person.qualifications.find((q) => q.status === 'VALID') || person.qualifications[0];
              const history = getAssignmentsHistoryForPersonnel(person.id);
              const lastAssignment = history.length > 0 ? history[0] : null;

              return (
                <div key={person.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={person.photoUrl}
                      alt={person.fullName}
                      className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      {/* Name & ID */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/personnel/${person.id}`}
                          className="font-bold text-slate-900 text-xs truncate hover:text-blue-600 transition"
                        >
                          {person.fullName}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1 py-0.2 rounded border border-slate-200">
                          {person.personnelNumber}
                        </span>
                      </div>

                      {/* Position & Primary Qualification Badge */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-700 font-medium truncate">
                          {person.position}
                        </span>
                        {primaryQual && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {primaryQual.qualificationName}
                          </span>
                        )}
                      </div>

                      {/* Secondary Info: Last known site (subtle) */}
                      {lastAssignment && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          Prior site: {lastAssignment.locationName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Direct Deploy CTA */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <Link href={`/personnel/${person.id}`}>
                      <Button variant="subtle" size="sm" className="font-semibold text-xs text-slate-700">
                        Profile
                      </Button>
                    </Link>
                    {role === 'ADMIN' && (
                      <Link href={`/deployments?assignPersonnelId=${person.id}`}>
                        <Button variant="default" size="sm" className="font-semibold text-xs">
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

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center mt-3">
        <span>Active guards without site assignment</span>
        <span>Total Available: <strong className="text-slate-900 font-bold">{availablePersonnel.length} Guards</strong></span>
      </div>
    </Card>
  );
}
