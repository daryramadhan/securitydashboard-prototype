'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  Home,
  ChevronRight,
  Calendar,
  Moon,
  RotateCw,
  Shield,
  ShieldAlert,
  UserCheck,
  Eye,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const pathname = usePathname();
  const { role, setRole, resetToDefaultData } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes('/personnel/')) return 'Personnel Profile';
    if (pathname.startsWith('/personnel')) return 'Personnel Directory';
    if (pathname.startsWith('/organization')) return 'Organization Tree';
    if (pathname.startsWith('/deployments')) return 'Deployments & Sites';
    if (pathname.startsWith('/administration')) return 'Administration';
    return 'Dashboard';
  };

  const handleReset = () => {
    if (confirm('Reset prototype data back to original state?')) {
      resetToDefaultData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  const roleInfo = {
    ADMIN: { label: 'Administrator', icon: ShieldAlert, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    MANAGEMENT: { label: 'Executive', icon: UserCheck, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    READ_ONLY: { label: 'Read-Only', icon: Eye, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  };

  const CurrentRoleIcon = roleInfo[role].icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Breadcrumb matching reference image */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Home className="h-3.5 w-3.5 text-slate-400" />
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold text-slate-900">{getPageTitle()}</span>
        </div>

        {/* Right side controls matching reference image */}
        <div className="flex items-center gap-3">
          {/* Current Date Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs text-slate-600 font-medium shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Wednesday, 14 October 2026</span>
          </div>

          {/* Icon buttons matching reference */}
          <button
            title="Toggle Theme"
            className="h-8 w-8 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition shadow-sm"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleReset}
            title="Reset Prototype Demo Data"
            className="h-8 w-8 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition shadow-sm relative"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {resetSuccess && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition ${roleInfo[role].color}`}
            >
              <CurrentRoleIcon className="h-3.5 w-3.5" />
              <span>{roleInfo[role].label}</span>
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role (RBAC)
                </div>
                {(['ADMIN', 'MANAGEMENT', 'READ_ONLY'] as UserRole[]).map((r) => {
                  const Info = roleInfo[r];
                  const Icon = Info.icon;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition ${
                        role === r ? 'font-bold text-slate-900 bg-slate-100/60' : 'text-slate-600'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{Info.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
