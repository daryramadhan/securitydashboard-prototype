'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Shield,
  Lock,
  RotateCcw,
  Plus,
  FolderPlus,
  MapPin,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export default function AdministrationPage() {
  const {
    role,
    clients,
    projects,
    locations,
    addProject,
    addLocation,
    resetToDefaultData,
  } = useApp();

  // New Project Form State
  const [newProjClientId, setNewProjClientId] = useState(clients[0]?.id || '');
  const [newProjName, setNewProjName] = useState('');
  const [newProjCode, setNewProjCode] = useState('');
  const [newProjEndDate, setNewProjEndDate] = useState('');
  const [projSuccess, setProjSuccess] = useState(false);

  // New Location Form State
  const [newLocProjectId, setNewLocProjectId] = useState(projects[0]?.id || '');
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocCity, setNewLocCity] = useState('Jakarta Pusat');
  const [locSuccess, setLocSuccess] = useState(false);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === newProjClientId);

    addProject({
      clientId: newProjClientId,
      clientName: client?.name || '',
      name: newProjName.trim(),
      projectCode: newProjCode.trim() || `PRJ-${Date.now().toString().slice(-4)}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: newProjEndDate || null,
      status: 'ACTIVE',
    });

    setNewProjName('');
    setNewProjCode('');
    setNewProjEndDate('');
    setProjSuccess(true);
    setTimeout(() => setProjSuccess(false), 2500);
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocProjectId) return;

    const parentProj = projects.find((p) => p.id === newLocProjectId);

    addLocation({
      clientId: parentProj?.clientId || clients[0]?.id || '',
      clientName: parentProj?.clientName || clients[0]?.name || '',
      projectId: newLocProjectId,
      projectName: parentProj?.name || '',
      name: newLocName.trim(),
      address: newLocAddress.trim() || `${newLocName.trim()} Facility`,
      city: newLocCity.trim() || 'Jakarta',
      status: 'ACTIVE',
    });

    setNewLocName('');
    setNewLocAddress('');
    setLocSuccess(true);
    setTimeout(() => setLocSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            System Administration & Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage operational clients, project contracts, locations, and access security rules
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-medium">Current Role Mode:</span>
          <Badge variant="default" className="font-bold">{role}</Badge>
        </div>
      </div>

      {role !== 'ADMIN' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 shadow-xs">
          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <strong>Restricted Access:</strong> You are currently viewing as <strong>{role}</strong>. Administrative mutation operations require Administrator role. You can switch roles anytime using the role switcher in the top navigation bar.
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="rbac" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rbac">Role-Based Access Matrix (RBAC)</TabsTrigger>
          <TabsTrigger value="clients">Clients, Projects & Sites</TabsTrigger>
          <TabsTrigger value="reset">Demo State & Reset</TabsTrigger>
        </TabsList>

        {/* TAB 1: RBAC Matrix */}
        <TabsContent value="rbac">
          <Card className="p-5 shadow-sm border-slate-200/80">
            <CardHeader className="p-0 pb-4 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                PRD Section 3 Role & Permissions Specification
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Permissions are strictly enforced across the prototype according to user roles.
              </p>
            </CardHeader>

            <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capability / Operation</TableHead>
                    <TableHead className="text-center">Administrator</TableHead>
                    <TableHead className="text-center">Management / Executive</TableHead>
                    <TableHead className="text-center">Read-Only Observer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { cap: 'View Overview Dashboard & Metrics', admin: true, mgmt: true, ro: true },
                    { cap: 'Search & Inspect Personnel Profiles', admin: true, mgmt: true, ro: true },
                    { cap: 'Explore Command Tree Hierarchy', admin: true, mgmt: true, ro: true },
                    { cap: 'View Site Deployments & Rosters', admin: true, mgmt: true, ro: true },
                    { cap: 'Export Filtered Data to CSV', admin: true, mgmt: true, ro: false },
                    { cap: 'Create & Edit Personnel Records', admin: true, mgmt: false, ro: false },
                    { cap: 'Deploy / Reassign Personnel to Site', admin: true, mgmt: false, ro: false },
                    { cap: 'Conclude & Close Active Assignments', admin: true, mgmt: false, ro: false },
                    { cap: 'Add Clients, Projects & Deployment Sites', admin: true, mgmt: false, ro: false },
                    { cap: 'Toggle Employment Status (Active / Inactive)', admin: true, mgmt: false, ro: false },
                  ].map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80">
                      <TableCell className="font-bold text-xs text-slate-900">{row.cap}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="success">PERMITTED</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.mgmt ? (
                          <Badge variant="default">PERMITTED</Badge>
                        ) : (
                          <Badge variant="secondary">DENIED</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.ro ? (
                          <Badge variant="warning">PERMITTED</Badge>
                        ) : (
                          <Badge variant="secondary">DENIED</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: Clients, Projects & Sites */}
        <TabsContent value="clients">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Project Form */}
            <Card className="p-5 space-y-4 shadow-sm border-slate-200/80">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                Create Operational Project Contract
              </CardTitle>

              <form onSubmit={handleAddProject} className="space-y-3.5 text-xs">
                <div>
                  <Label htmlFor="client-select" className="block mb-1.5 font-bold text-slate-700">Client Organization</Label>
                  <select
                    id="client-select"
                    value={newProjClientId}
                    onChange={(e) => setNewProjClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
                    disabled={role !== 'ADMIN'}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.industry})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="proj-name" className="block mb-1.5 font-bold text-slate-700">Project Name</Label>
                  <Input
                    id="proj-name"
                    type="text"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="e.g. Sudirman Tower Perimeter Guarding"
                    disabled={role !== 'ADMIN'}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="proj-code" className="block mb-1.5 font-bold text-slate-700">Project Code</Label>
                    <Input
                      id="proj-code"
                      type="text"
                      value={newProjCode}
                      onChange={(e) => setNewProjCode(e.target.value)}
                      placeholder="e.g. SUD-2026-01"
                      className="font-mono"
                      disabled={role !== 'ADMIN'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="proj-end" className="block mb-1.5 font-bold text-slate-700">Contract End Date</Label>
                    <Input
                      id="proj-end"
                      type="date"
                      value={newProjEndDate}
                      onChange={(e) => setNewProjEndDate(e.target.value)}
                      disabled={role !== 'ADMIN'}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {projSuccess && (
                    <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Project Created!
                    </span>
                  )}
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={role !== 'ADMIN'}
                    className="ml-auto"
                  >
                    Save Project Contract
                  </Button>
                </div>
              </form>
            </Card>

            {/* Add Location Form */}
            <Card className="p-5 space-y-4 shadow-sm border-slate-200/80">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Register New Deployment Site
              </CardTitle>

              <form onSubmit={handleAddLocation} className="space-y-3.5 text-xs">
                <div>
                  <Label htmlFor="parent-proj" className="block mb-1.5 font-bold text-slate-700">Parent Project</Label>
                  <select
                    id="parent-proj"
                    value={newLocProjectId}
                    onChange={(e) => setNewLocProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
                    disabled={role !== 'ADMIN'}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} &mdash; {p.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="loc-name" className="block mb-1.5 font-bold text-slate-700">Deployment Site Name</Label>
                  <Input
                    id="loc-name"
                    type="text"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    placeholder="e.g. North Gate & Vehicle Sentry Post"
                    disabled={role !== 'ADMIN'}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="loc-addr" className="block mb-1.5 font-bold text-slate-700">Address / Landmark</Label>
                    <Input
                      id="loc-addr"
                      type="text"
                      value={newLocAddress}
                      onChange={(e) => setNewLocAddress(e.target.value)}
                      placeholder="e.g. Jl. Jend Sudirman Kav 20"
                      disabled={role !== 'ADMIN'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="loc-city" className="block mb-1.5 font-bold text-slate-700">City / Region</Label>
                    <Input
                      id="loc-city"
                      type="text"
                      value={newLocCity}
                      onChange={(e) => setNewLocCity(e.target.value)}
                      disabled={role !== 'ADMIN'}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {locSuccess && (
                    <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Site Registered!
                    </span>
                  )}
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={role !== 'ADMIN'}
                    className="ml-auto"
                  >
                    Save Deployment Site
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Reset Demo State */}
        <TabsContent value="reset">
          <Card className="p-6 max-w-xl space-y-4 shadow-sm border-slate-200/80">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-blue-600" />
              Restore Initial PT. JISS Prototype State
            </CardTitle>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This prototype stores modifications in your browser’s LocalStorage. If you have modified assignments, added test personnel, or edited records, you can instantly restore the application to the pristine initial state.
            </p>

            <Button
              variant="subtle"
              onClick={() => {
                if (confirm('Reset all personnel, deployment sites, and assignments back to default?')) {
                  resetToDefaultData();
                  alert('Database restored to default mock records.');
                }
              }}
              className="gap-2 font-bold text-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset All Local Prototype Data</span>
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
