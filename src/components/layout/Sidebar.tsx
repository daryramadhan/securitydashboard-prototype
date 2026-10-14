'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  Network,
  MapPin,
  Settings,
  Shield,
  Clock,
  ChevronRight,
  Sidebar as SidebarIcon,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const pathname = usePathname();
  const { metrics, role } = useApp();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Personnel Directory',
      href: '/personnel',
      icon: Users,
      badge: null,
    },
    {
      label: 'Organization Tree',
      href: '/organization',
      icon: Network,
      badge: null,
    },
    {
      label: 'Deployments & Sites',
      href: '/deployments',
      icon: MapPin,
      badge: null,
    },
    {
      label: 'Administration',
      href: '/administration',
      icon: Settings,
      badge: role === 'ADMIN' ? 'Admin' : 'Restricted',
      badgeVariant: role === 'ADMIN' ? 'success' as const : 'secondary' as const,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-[#fbfcfd] hidden md:flex flex-col justify-between py-5 px-4 h-screen sticky top-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#18181b] text-white flex items-center justify-center shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight">
                PT. JISS
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-none">
                Personnel Management
              </span>
            </div>
          </Link>

          <button
            title="Toggle Sidebar"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <SidebarIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Core PRD Modules Navigation */}
        <div className="space-y-1">
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Core Modules (PRD V1)
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-white border border-slate-200/80 text-slate-900 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <Badge variant={item.badgeVariant} className="text-[10px] font-semibold px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        {/* Operational Deployment Headcount Card */}
        <div className="rounded-2xl p-3.5 bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-700" />
              Force Deployment
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">ACTIVE</span>
          </div>

          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between items-center text-[11px]">
              <span>Active Deployed:</span>
              <strong className="text-slate-900 font-bold">{metrics.deployedPersonnel} Guards</strong>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${metrics.activePersonnel ? (metrics.deployedPersonnel / metrics.activePersonnel) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] pt-0.5">
              <span className="text-slate-600 font-medium">Available Personnel:</span>
              <strong className="text-slate-900 font-bold">{metrics.idlePersonnel} Guards</strong>
            </div>
          </div>
        </div>

        {/* User Profile Footer row */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=faces"
              alt="Kolonel Hartono"
              className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-900 block truncate leading-tight">
                Kol. Hartono Sutanto
              </span>
              <span className="text-[10px] text-slate-400 block truncate leading-tight">
                Chief Security Officer
              </span>
            </div>
          </div>

          <Badge variant="outline" className="text-[9px] font-mono">
            {role}
          </Badge>
        </div>
      </div>
    </aside>
  );
}
