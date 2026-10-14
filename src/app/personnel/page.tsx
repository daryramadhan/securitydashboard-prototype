'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PersonnelTable } from '@/components/personnel/PersonnelTable';
import { PersonnelFormModal } from '@/components/personnel/PersonnelFormModal';
import { Users, Plus, UserX, UserCheck, Shield, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function PersonnelDirectoryContent() {
  const searchParams = useSearchParams();
  const employmentStatus = searchParams.get('employmentStatus') || 'ALL';
  const deploymentStatus = searchParams.get('deploymentStatus') || 'ALL';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { role, metrics } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            Personnel Directory & Rosters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive force registry, demographic composition, qualification credentials, and placement records
          </p>
        </div>

        {role === 'ADMIN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#18181b] hover:bg-[#27272a] text-white shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Personnel Record</span>
          </button>
        )}
      </div>

      {/* Operational Personnel Strength Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Active Personnel */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Personnel
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.activePersonnel}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Active employment status
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>

        {/* Available Personnel */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Available Personnel
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.idlePersonnel}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Ready for site deployment
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Users className="h-4 w-4" />
          </div>
        </div>

        {/* Currently Deployed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Currently Deployed
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.deployedPersonnel}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Assigned to active posts
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Shield className="h-4 w-4" />
          </div>
        </div>

        {/* Inactive / Past Records */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Inactive Records
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.inactivePersonnel}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Resigned / past staff
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <UserX className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Personnel Directory Table */}
      <PersonnelTable
        initialEmploymentStatus={employmentStatus}
        initialDeploymentStatus={deploymentStatus}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Add Personnel Modal */}
      <PersonnelFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default function PersonnelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading directory...</div>}>
      <PersonnelDirectoryContent />
    </Suspense>
  );
}
