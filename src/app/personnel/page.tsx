'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PersonnelTable, PersonnelTableHandle } from '@/components/personnel/PersonnelTable';
import { PersonnelFormModal } from '@/components/personnel/PersonnelFormModal';
import { Users, Plus, Download, UserCheck2, ShieldCheck, PieChart } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function PersonnelDirectoryContent() {
  const searchParams = useSearchParams();
  const employmentStatus = searchParams.get('employmentStatus') || 'ALL';
  const initialDeployment = searchParams.get('deploymentStatus') || 'ALL';

  const [deploymentFilter, setDeploymentFilter] = useState<string>(initialDeployment);
  const tableRef = useRef<PersonnelTableHandle>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { role, metrics } = useApp();

  // Gender pie/donut chart calculations
  const totalGuards = metrics.malePersonnel + metrics.femalePersonnel || 1;
  const malePercent = Math.round((metrics.malePersonnel / totalGuards) * 100);
  const femalePercent = 100 - malePercent;

  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const maleDash = (metrics.malePersonnel / totalGuards) * circumference;
  const femaleDash = (metrics.femalePersonnel / totalGuards) * circumference;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            Security Troops Directory & Squad Rosters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational security force registry and squad deployment management for maintaining active guard troops
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {role !== 'READ_ONLY' && (
            <button
              onClick={() => tableRef.current?.exportCsv()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
              title="Export personnel directory to CSV"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          {role === 'ADMIN' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FFF100] hover:bg-[#ecd000] text-slate-950 border border-yellow-300/60 shadow-2xs transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-slate-950" />
              <span>Add Security Guard</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Summary: Available Troops, Deployed Troops, Total Troops, and Gender Distribution Pie Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Available Troops (Clickable Filter) */}
        <div
          onClick={() => setDeploymentFilter((prev) => (prev === 'AVAILABLE' ? 'ALL' : 'AVAILABLE'))}
          className={`p-5 rounded-2xl bg-white border shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-md ${
            deploymentFilter === 'AVAILABLE'
              ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/30'
              : 'border-slate-200/80 hover:border-emerald-300'
          }`}
          title="Click to filter by Available Troops (Click again to show all)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Available Troops
            </span>
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center transition ${
                deploymentFilter === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 border border-emerald-200/80 text-emerald-600'
              }`}
            >
              <UserCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.idlePersonnel}
            </div>
            {deploymentFilter === 'AVAILABLE' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Filtered Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Standby & ready for squad deployment</span>
          </div>
        </div>

        {/* 2. Deployed Troops (Clickable Filter) */}
        <div
          onClick={() => setDeploymentFilter((prev) => (prev === 'DEPLOYED' ? 'ALL' : 'DEPLOYED'))}
          className={`p-5 rounded-2xl bg-white border shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-md ${
            deploymentFilter === 'DEPLOYED'
              ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/30'
              : 'border-slate-200/80 hover:border-blue-300'
          }`}
          title="Click to filter by Deployed Troops (Click again to show all)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Deployed Troops
            </span>
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center transition ${
                deploymentFilter === 'DEPLOYED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 border border-blue-200/80 text-blue-600'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.deployedPersonnel}
            </div>
            {deploymentFilter === 'DEPLOYED' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Filtered Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
            <span>Active guards stationed across client sites</span>
          </div>
        </div>

        {/* 3. Total Troops (Clickable to Reset / Show All) */}
        <div
          onClick={() => setDeploymentFilter('ALL')}
          className={`p-5 rounded-2xl bg-white border shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-md ${
            deploymentFilter === 'ALL'
              ? 'ring-2 ring-slate-900 border-slate-700 bg-slate-50/40'
              : 'border-slate-200/80 hover:border-slate-400'
          }`}
          title="Click to show All Registered Troops"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Troops
            </span>
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center transition ${
                deploymentFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 border border-slate-200/80 text-slate-700'
              }`}
            >
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.totalPersonnel}
            </div>
            {deploymentFilter === 'ALL' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                All Force
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-700 shrink-0"></span>
            <span>Registered active security guard personnel</span>
          </div>
        </div>

        {/* 4. Gender Demographic Pie Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Troops Gender Ratio
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <PieChart className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Donut / Pie SVG Chart */}
            <div className="relative shrink-0">
              <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="13"
                />
                {/* Male arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="13"
                  strokeDasharray={`${maleDash} ${circumference}`}
                  strokeDashoffset={0}
                />
                {/* Female arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="13"
                  strokeDasharray={`${femaleDash} ${circumference}`}
                  strokeDashoffset={-maleDash}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-slate-900 leading-none">
                  {totalGuards}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Total
                </span>
              </div>
            </div>

            {/* Legend & Stats */}
            <div className="flex-1 min-w-0 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span className="text-slate-700 font-semibold">Men</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{metrics.malePersonnel}</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1">({malePercent}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-700 font-semibold">Women</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{metrics.femalePersonnel}</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1">({femalePercent}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Directory Table */}
      <PersonnelTable
        ref={tableRef}
        initialEmploymentStatus={employmentStatus}
        deploymentFilter={deploymentFilter}
        onDeploymentFilterChange={(status) => setDeploymentFilter(status)}
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
