'use client';

import React, { useState } from 'react';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ActiveLocationsTable } from '@/components/dashboard/ActiveLocationsTable';
import { AvailablePersonnelList } from '@/components/dashboard/AvailablePersonnelList';
import { PersonnelFormModal } from '@/components/personnel/PersonnelFormModal';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { role } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Security Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            PT. Jasa Integrasi Sekuriti Selaras &bull; Real-time operational strength, site deployments & contract timelines
          </p>
        </div>

        {/* System Active Badge placed on top right */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200/90 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYSTEM ACTIVE</span>
          </span>
        </div>
      </div>

      {/* 1. Core Operational Force Strength KPIs (Active Area Deployments | Available Personnel | Last Project Added) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
            Operational Force Strength
          </span>
          <span className="text-[11px]">Click card to view details</span>
        </div>
        <MetricCards />
      </section>

      {/* 2. Active Deployments Collapsible Table by Company & Site */}
      <section className="space-y-2">
        <ActiveLocationsTable />
      </section>

      {/* 3. Available Standby Personnel */}
      <section className="space-y-2">
        <AvailablePersonnelList />
      </section>

      {/* Add Personnel Modal */}
      <PersonnelFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
