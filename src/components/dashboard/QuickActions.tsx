'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Search, Network, UserPlus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActions({ onOpenAddModal }: { onOpenAddModal?: () => void }) {
  const { role } = useApp();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link href="/personnel">
        <Button variant="subtle" size="sm" className="gap-2">
          <Search className="h-3.5 w-3.5 text-primary" />
          <span>Search Personnel</span>
        </Button>
      </Link>

      <Link href="/organization">
        <Button variant="subtle" size="sm" className="gap-2">
          <Network className="h-3.5 w-3.5 text-indigo-400" />
          <span>Command Hierarchy</span>
        </Button>
      </Link>

      <Link href="/deployments">
        <Button variant="subtle" size="sm" className="gap-2">
          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
          <span>Site Deployments</span>
        </Button>
      </Link>

      {role === 'ADMIN' && onOpenAddModal && (
        <Button
          variant="default"
          size="sm"
          onClick={onOpenAddModal}
          className="gap-2"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add Personnel Record</span>
        </Button>
      )}
    </div>
  );
}
