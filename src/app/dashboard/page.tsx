'use client';

import React, { useState } from 'react';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { NeedsAttentionSection } from '@/components/dashboard/NeedsAttentionSection';
import { ActiveLocationsTable } from '@/components/dashboard/ActiveLocationsTable';
import { UpcomingProjectEndings } from '@/components/dashboard/UpcomingProjectEndings';
import { AvailablePersonnelList } from '@/components/dashboard/AvailablePersonnelList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PersonnelFormModal } from '@/components/personnel/PersonnelFormModal';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { metrics, role } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Security Operations Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              SYSTEM ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            PT. Jasa Integrasi Sekuriti Selaras &bull; Real-time operational strength, site deployments & contract timelines
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions onOpenAddModal={() => setIsAddModalOpen(true)} />
      </div>

      {/* 1. Core Operational KPIs (4 Prioritized Metrics) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
            Operational Force Strength
          </span>
          <span className="text-[11px]">Click metric to filter directory</span>
        </div>
        <MetricCards />
      </section>

      {/* 2. Needs Attention Section (Contracts Expiring, Overdue, and Open-Ended) */}
      <section>
        <NeedsAttentionSection />
      </section>

      {/* 3. Deployment Locations Table (Simplified & Combined Contract Timeline) */}
      <section className="space-y-2">
        <ActiveLocationsTable />
      </section>

      {/* 4. Available Personnel (Left) & Upcoming Expirations (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Concise Available Personnel Roster */}
        <AvailablePersonnelList />

        {/* Upcoming Project Expirations */}
        <UpcomingProjectEndings />
      </section>

      {/* Add Personnel Modal */}
      <PersonnelFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
