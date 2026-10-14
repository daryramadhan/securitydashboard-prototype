'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Users, UserCheck, ShieldCheck, UserCheck2, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function MetricCards() {
  const { metrics } = useApp();

  const cards = [
    {
      title: 'Total Personnel',
      count: metrics.totalPersonnel,
      subtitle: 'Registered personnel force',
      filterParam: 'all',
      icon: Users,
    },
    {
      title: 'Active Personnel',
      count: metrics.activePersonnel,
      subtitle: 'Eligible for active duty',
      filterParam: 'employmentStatus=ACTIVE',
      icon: UserCheck,
    },
    {
      title: 'Currently Deployed',
      count: metrics.deployedPersonnel,
      subtitle: 'Stationed at client sites',
      filterParam: 'deploymentStatus=DEPLOYED',
      icon: ShieldCheck,
    },
    {
      title: 'Available Personnel',
      count: metrics.idlePersonnel,
      subtitle: 'Active & ready for assignment',
      filterParam: 'deploymentStatus=AVAILABLE',
      icon: UserCheck2,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.title} href={`/personnel?${card.filterParam}`}>
            <Card className="p-5 hover:border-slate-300 transition-all duration-150 hover:shadow-md cursor-pointer flex flex-col justify-between h-full group bg-white border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {card.title}
                </span>
                <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="my-3">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {card.count}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{card.subtitle}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
