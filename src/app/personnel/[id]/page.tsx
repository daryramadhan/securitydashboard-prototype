'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatDate, exportToCsv } from '@/lib/utils';
import { AssignModal } from '@/components/profile/AssignModal';
import { PersonnelFormModal } from '@/components/personnel/PersonnelFormModal';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Calendar,
  Award,
  Building,
  MapPin,
  Clock,
  History,
  CheckCircle,
  AlertTriangle,
  Edit,
  UserMinus,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function PersonnelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    personnelList,
    role,
    getActiveAssignmentForPersonnel,
    getAssignmentsHistoryForPersonnel,
    closeAssignment,
    toggleEmploymentStatus,
  } = useApp();

  const id = params?.id as string;
  const person = personnelList.find((p) => p.id === id);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!person) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Personnel Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested personnel record may have been removed.</p>
        <Link href="/personnel">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Personnel Directory
          </Button>
        </Link>
      </div>
    );
  }

  const activeAsg = getActiveAssignmentForPersonnel(person.id);
  const history = getAssignmentsHistoryForPersonnel(person.id);
  const priorAssignments = history.filter((a) => a.id !== activeAsg?.id);

  const handleCloseActiveAssignment = () => {
    if (!activeAsg) return;
    if (confirm(`Conclude and close the assignment at ${activeAsg.locationName}? It will be preserved in placement history.`)) {
      closeAssignment(activeAsg.id);
    }
  };

  const handleExportHistory = () => {
    const headers = [
      'Assignment ID',
      'Client',
      'Project',
      'Location / Site',
      'Position on Site',
      'Start Date',
      'End Date',
      'Status',
    ];
    const rows = history.map((a) => [
      a.id,
      a.clientName,
      a.projectName,
      a.locationName,
      a.positionOnSite || '-',
      a.startDate,
      a.endDate || 'Present',
      a.status,
    ]);
    exportToCsv(`Placement_History_${person.personnelNumber}`, headers, rows);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/personnel">
            <Button variant="subtle" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{person.fullName}</h1>
              <Badge variant="outline" className="font-mono text-slate-700">
                {person.personnelNumber}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{person.position} &bull; {person.organizationalUnitName}</p>
          </div>
        </div>

        {/* Action Buttons for Authorized users */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {history.length > 0 && role !== 'READ_ONLY' && (
            <Button
              variant="subtle"
              size="sm"
              onClick={handleExportHistory}
              className="gap-1.5 font-semibold text-slate-800"
              title="Export placement history to CSV"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Export History</span>
            </Button>
          )}

          {role === 'ADMIN' && (
            <>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-1.5 font-semibold text-slate-800"
              >
                <Edit className="h-3.5 w-3.5 text-slate-600" />
                <span>Edit Profile</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAssignModalOpen(true)}
                className="gap-1.5 font-semibold"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{activeAsg ? 'Reassign Site' : 'Deploy to Site'}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid: Profile Left Sidebar + Content Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal, Contact & Employment Cards */}
        <div className="space-y-6">
          {/* Section A: Personal Overview Card */}
          <Card className="p-5 text-center space-y-4 shadow-sm border-slate-200/80">
            <div className="relative inline-block mx-auto">
              <Avatar className="h-28 w-28 rounded-2xl border-2 border-slate-200 shadow-sm">
                <AvatarImage src={person.photoUrl} alt={person.fullName} />
                <AvatarFallback>{person.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Badge
                variant={person.employmentStatus === 'ACTIVE' ? 'success' : 'destructive'}
                className="absolute -bottom-1 -right-1 font-bold shadow-xs"
              >
                {person.employmentStatus}
              </Badge>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">{person.fullName}</h2>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">{person.position}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{person.personnelNumber}</p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
              {activeAsg ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
                  Deployed at {activeAsg.clientName}
                </span>
              ) : person.employmentStatus === 'ACTIVE' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  <User className="h-3.5 w-3.5 text-slate-600" />
                  Available on Standby
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  Inactive / Resigned
                </span>
              )}
            </div>

            {role === 'ADMIN' && (
              <div className="pt-2">
                <Button
                  variant="subtle"
                  size="sm"
                  className="w-full text-xs font-semibold text-slate-800"
                  onClick={() => toggleEmploymentStatus(person.id)}
                >
                  Toggle: {person.employmentStatus === 'ACTIVE' ? 'Set Inactive' : 'Reactivate'}
                </Button>
              </div>
            )}
          </Card>

          {/* Section B & C: Contact & Employment Info */}
          <Card className="p-5 space-y-4 text-xs shadow-sm border-slate-200/80">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-100 pb-2">
              Employment & Contact Information
            </h3>

            <div className="space-y-3 font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Gender
                </span>
                <span className="font-bold text-slate-800">
                  {person.gender === 'MALE' ? 'Male (Pria)' : 'Female (Wanita)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone
                </span>
                <span className="font-bold text-slate-900 font-mono">{person.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email
                </span>
                <span className="font-semibold text-blue-600 truncate max-w-[180px]">{person.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> Org Unit
                </span>
                <span className="font-bold text-slate-900">{person.organizationalUnitName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Direct Supervisor
                </span>
                {person.supervisorId ? (
                  <Link
                    href={`/personnel/${person.supervisorId}`}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>{person.supervisorName}</span>
                  </Link>
                ) : (
                  <span className="text-slate-400 italic">None (Division Head)</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date of Joining
                </span>
                <span className="font-bold text-slate-900">{formatDate(person.joinDate)}</span>
              </div>
            </div>

            {person.notes && (
              <div className="pt-3 border-t border-slate-100 text-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-700 block mb-1">
                  Operational Notes:
                </span>
                <p className="italic text-slate-700">{person.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Columns: Current Deployment, Qualifications, Placement History with Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="deployment" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deployment" className="gap-1.5 font-bold">
                <MapPin className="h-3.5 w-3.5" />
                <span>Current Deployment</span>
              </TabsTrigger>
              <TabsTrigger value="qualifications" className="gap-1.5 font-bold">
                <Award className="h-3.5 w-3.5" />
                <span>Qualifications ({person.qualifications.length})</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 font-bold">
                <History className="h-3.5 w-3.5" />
                <span>History ({priorAssignments.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Current Deployment */}
            <TabsContent value="deployment">
              <Card className="p-5 shadow-sm border-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Current Operational Assignment
                  </CardTitle>
                  {activeAsg && role === 'ADMIN' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCloseActiveAssignment}
                      className="font-bold text-xs"
                    >
                      Conclude Assignment
                    </Button>
                  )}
                </div>

                {activeAsg ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="text-[11px] uppercase font-bold text-slate-500">Site & Client</div>
                      <div className="font-bold text-slate-900 text-sm">{activeAsg.locationName}</div>
                      <div className="text-slate-600 font-medium">{activeAsg.clientName}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">Project: {activeAsg.projectName}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="text-[11px] uppercase font-bold text-slate-500">Assignment Timeline & Role</div>
                      <div className="font-semibold text-slate-700">
                        Role: <span className="text-slate-900 font-bold">{activeAsg.positionOnSite || person.position}</span>
                      </div>
                      <div className="text-slate-600 font-medium">
                        Deployed: <strong className="text-slate-900">{formatDate(activeAsg.startDate)}</strong> &rarr;{' '}
                        <strong className="text-slate-900">{activeAsg.endDate ? formatDate(activeAsg.endDate) : 'Indefinite / Ongoing'}</strong>
                      </div>
                      <div className="pt-1">
                        <Badge variant="success" className="gap-1 font-bold">
                          <CheckCircle className="h-3 w-3" /> ACTIVE ON SITE
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">This officer currently has no active deployment assignment.</p>
                    {role === 'ADMIN' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsAssignModalOpen(true)}
                        className="font-bold"
                      >
                        Deploy to a Site Now
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* TAB 2: Qualifications & Badges */}
            <TabsContent value="qualifications">
              <Card className="p-5 shadow-sm border-slate-200/80">
                <CardTitle className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 text-sm font-bold text-slate-900">
                  <Award className="h-4 w-4 text-indigo-600" />
                  Recorded Certifications & Qualification Badges
                </CardTitle>

                {person.qualifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No formal certifications recorded.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {person.qualifications.map((q) => {
                      const isValid = q.status === 'VALID';
                      return (
                        <div
                          key={q.id}
                          className={`p-3.5 rounded-xl border transition ${
                            isValid
                              ? 'bg-blue-50/50 border-blue-200'
                              : 'bg-rose-50/50 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-slate-900 text-xs">{q.qualificationName}</div>
                            <Badge variant={isValid ? 'success' : 'destructive'} className="font-bold">
                              {!isValid && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                              {q.status}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium mt-1">Issuing Body: {q.issuingOrg}</div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>Issued: {formatDate(q.issueDate)}</span>
                            <span>&bull;</span>
                            <span className={isValid ? 'text-slate-600 font-medium' : 'text-rose-700 font-bold'}>
                              Expires: {formatDate(q.expiryDate)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* TAB 3: Placement History */}
            <TabsContent value="history">
              <Card className="p-5 shadow-sm border-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <History className="h-4 w-4 text-emerald-600" />
                    Historical Placement & Deployment Archive
                  </CardTitle>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {priorAssignments.length} Past Record{priorAssignments.length === 1 ? '' : 's'}
                  </span>
                </div>

                {priorAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No historical prior deployments recorded.</p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {priorAssignments.map((asg) => (
                      <div key={asg.id} className="relative group">
                        <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-slate-300 border-2 border-white group-hover:bg-blue-600 transition-colors" />

                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{asg.locationName}</span>
                            <Badge variant="secondary" className="font-bold">{asg.status}</Badge>
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium">
                            {asg.clientName} &bull; {asg.projectName}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                            <span>Role: <strong className="text-slate-700">{asg.positionOnSite || person.position}</strong></span>
                            <span>{formatDate(asg.startDate)} &rarr; {formatDate(asg.endDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* SHADCN MODALS */}
      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        personnel={person}
      />

      <PersonnelFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        personnelToEdit={person}
      />
    </div>
  );
}
