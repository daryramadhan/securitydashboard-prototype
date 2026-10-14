'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Personnel } from '@/types';
import {
  Network,
  ChevronDown,
  ChevronRight,
  Shield,
  ExternalLink,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TreeNodeProps {
  person: Personnel;
  allPersonnel: Personnel[];
  level: number;
}

function TreeNode({ person, allPersonnel, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const subordinates = allPersonnel.filter((p) => p.supervisorId === person.id);
  const hasSubordinates = subordinates.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="relative group">
        <div
          className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 bg-white shadow-sm min-w-[260px] max-w-[320px] ${
            level === 0
              ? 'border-slate-400/80 shadow-md ring-1 ring-slate-200'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <img
              src={person.photoUrl}
              alt={person.fullName}
              className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                person.employmentStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-slate-900 truncate group-hover:text-primary transition-colors">
                {person.fullName}
              </span>
              <Badge variant="outline" className="font-mono text-[9px] px-1 py-0">
                {person.personnelNumber}
              </Badge>
            </div>

            <div className="text-[11px] text-primary font-medium truncate mt-0.5">
              {person.position}
            </div>

            <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center justify-between">
              <span>{person.organizationalUnitName}</span>
              {hasSubordinates && (
                <span className="font-semibold text-slate-700">
                  {subordinates.length} direct reports
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/personnel/${person.id}`}
            title="Inspect Personnel Profile"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {hasSubordinates && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center h-6 px-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold shadow-sm transition"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="ml-0.5">{subordinates.length}</span>
          </button>
        )}
      </div>

      {hasSubordinates && isExpanded && (
        <div className="flex flex-col items-center pt-6 relative before:absolute before:top-0 before:left-1/2 before:w-0.5 before:h-6 before:bg-slate-200">
          <div className="flex flex-wrap items-start justify-center gap-6 pt-4 relative">
            {subordinates.map((sub) => (
              <TreeNode
                key={sub.id}
                person={sub}
                allPersonnel={allPersonnel}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const { personnelList } = useApp();

  const topLeaders = personnelList.filter((p) => !p.supervisorId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-600" />
            Organizational Command Hierarchy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal reporting relationships and supervision chain across PT. JISS agency
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Users className="h-3.5 w-3.5 text-blue-600" />
          <span>Total Officers in Chain: <strong className="text-slate-900">{personnelList.length}</strong></span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-800 flex items-start gap-2.5">
        <Shield className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <strong>Command Integrity:</strong> Organizational reporting relationships reflect the permanent chain of command and supervision within PT. JISS, distinct from temporary client site deployments.
        </div>
      </div>

      <div className="p-8 rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-x-auto shadow-sm min-h-[500px] flex justify-center">
        <div className="flex flex-col items-center gap-8 min-w-max">
          {topLeaders.map((leader) => (
            <TreeNode
              key={leader.id}
              person={leader}
              allPersonnel={personnelList}
              level={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
