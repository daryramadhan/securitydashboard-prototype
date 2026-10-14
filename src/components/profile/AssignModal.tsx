'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Personnel } from '@/types';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel;
}

export function AssignModal({ isOpen, onClose, personnel }: AssignModalProps) {
  const { locations, projects, assignPersonnel, getActiveAssignmentForPersonnel } = useApp();

  const activeAsg = getActiveAssignmentForPersonnel(personnel.id);

  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '');
  const [positionOnSite, setPositionOnSite] = useState(personnel.position);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const selectedLoc = locations.find((l) => l.id === selectedLocationId);
  const matchingProject = selectedLoc ? projects.find((p) => p.id === selectedLoc.projectId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc || !matchingProject) return;

    assignPersonnel({
      personnelId: personnel.id,
      projectId: matchingProject.id,
      locationId: selectedLoc.id,
      startDate,
      endDate: endDate || null,
      positionOnSite,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-slate-900 font-bold">
                {activeAsg ? 'Reassign Deployment Site' : 'Deploy Personnel to Site'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Deploying <strong className="text-slate-900">{personnel.fullName}</strong> ({personnel.personnelNumber})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {activeAsg && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong>Current Active Assignment:</strong> {activeAsg.locationName} ({activeAsg.clientName}).
              Deploying will automatically archive this prior assignment into placement history.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="target-location" className="block mb-1.5 font-bold text-slate-700">
              Select Deployment Location & Site <span className="text-rose-500">*</span>
            </Label>
            <select
              id="target-location"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
            >
              {locations.map((loc) => {
                const proj = projects.find((p) => p.id === loc.projectId);
                return (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} &mdash; {loc.clientName} ({proj?.name})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <Label htmlFor="duty-position" className="block mb-1.5 font-bold text-slate-700">
              Position / Duty on Site <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="duty-position"
              type="text"
              value={positionOnSite}
              onChange={(e) => setPositionOnSite(e.target.value)}
              placeholder="e.g. Lobby Access Screener, Shift Leader..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-date" className="block mb-1.5 font-bold text-slate-700">
                Assignment Start Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="end-date" className="block mb-1.5 font-bold text-slate-700">
                Assignment End Date <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {matchingProject && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900">Target Project Overview:</div>
              <div className="text-slate-600">Project: <span className="text-slate-900 font-semibold">{matchingProject.name}</span> ({matchingProject.projectCode})</div>
              <div className="text-slate-600">Client: <span className="text-slate-900 font-semibold">{matchingProject.clientName}</span></div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Confirm Deployment</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
