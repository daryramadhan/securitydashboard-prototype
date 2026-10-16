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
  CheckCircle2,
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

      {/* Grid: Profile Left Sidebar (Sticky & Fixed) + Content Right (Scrollable) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Personal, Contact & Employment Cards (Sticky & Fixed) */}
        <div className="space-y-6 lg:sticky lg:top-0 self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

            {/* Section: Uniform Sizing Quick Glance */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                Uniform Sizing (Kaporlap):
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-slate-400 font-medium">Shirt</div>
                  <div className="text-xs font-bold text-slate-800">{person.shirtSize || 'L'}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-slate-400 font-medium">Pants</div>
                  <div className="text-xs font-bold text-slate-800">{person.pantsSize || '34'}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-slate-400 font-medium">Shoes</div>
                  <div className="text-xs font-bold text-slate-800">{person.shoesSize || '42'}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 px-1">
                <span>Belt: <strong className="text-slate-800">{person.dutyBeltSize || 'L'}</strong></span>
                <span>Blood: <strong className="text-rose-600">{person.bloodType || 'O+'}</strong></span>
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
        {/* Right Columns: Unified All-in-One Information Display (No Tabs) */}
        <div className="lg:col-span-2 space-y-5">
          {/* SECTION 1: Current Operational Deployment */}
          <Card className="p-5 shadow-sm border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Current Operational Assignment
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium">Active duty station and site deployment timeline</p>
                </div>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Site & Client Facility</div>
                  <div className="font-bold text-slate-900 text-sm">{activeAsg.locationName}</div>
                  <div className="text-slate-600 font-medium">{activeAsg.clientName}</div>
                  <div className="text-[11px] text-blue-600 font-semibold pt-0.5">Project: {activeAsg.projectName}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Assignment Timeline & Duty Role</div>
                  <div className="font-semibold text-slate-700">
                    Role: <span className="text-slate-900 font-bold">{activeAsg.positionOnSite || person.position}</span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    Deployed: <strong className="text-slate-900">{formatDate(activeAsg.startDate)}</strong> &rarr;{' '}
                    <strong className="text-slate-900">{activeAsg.endDate ? formatDate(activeAsg.endDate) : 'Indefinite / Ongoing'}</strong>
                  </div>
                  <div className="pt-1">
                    <Badge variant="default" className="gap-1 font-bold bg-slate-950 text-[#FFF100] border border-slate-800 text-[10px]">
                      <CheckCircle className="h-3 w-3" /> ACTIVE ON SITE
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200 space-y-2">
                <p className="text-xs text-slate-500 font-medium">This officer currently has no active site assignment (Ready in Standby Pool).</p>
                {role === 'ADMIN' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="font-bold bg-[#FFF100] text-slate-950 hover:bg-[#ebd900] border border-yellow-300 shadow-2xs gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-950" />
                    <span>Deploy to Site Now</span>
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* SECTION 2: Security Uniform & Equipment Sizing (Kaporlap & Fitness) */}
          <Card className="p-5 shadow-sm border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Uniform Sizing & Issued Tactical Gear (Kaporlap)
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium">Official apparel, footwear, physical readiness & tactical equipment</p>
                </div>
              </div>
              {person.bloodType && (
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold gap-1 text-xs">
                  Blood: {person.bloodType}
                </Badge>
              )}
            </div>

            {/* Official Apparel & Footwear */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Official Apparel & Footwear Sizing
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Shirt (PDL/PDH)</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{person.shirtSize || 'L'}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Tactical Uniform</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Pants Size</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{person.pantsSize || '34'}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Waist / Inseam</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Tactical Boots</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{person.shoesSize || '42'}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">EU Shoe Size</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Beret / Hat</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{person.headwearSize || '58'}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Circumference (cm)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-500 font-medium">Duty Belt (Kopel)</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5 truncate">{person.dutyBeltSize || 'L (100cm)'}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Heavy-Duty Webbing</div>
                </div>
              </div>
            </div>

            {/* Physical Specifications & Readiness */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Physical Specifications & Fitness
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Height:</span>
                  <strong className="text-slate-900 font-bold">{person.heightCm || 175} cm</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Weight:</span>
                  <strong className="text-slate-900 font-bold">{person.weightKg || 72} kg</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Physical Readiness:</span>
                  <Badge variant="success" className="font-bold text-[10px]">FIT FOR FIELD DUTY</Badge>
                </div>
              </div>
            </div>

            {/* Standard Field Equipment Issued */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Standard Field Equipment Issued (Kaporlap)
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {person.issuedGear?.length || 5} Items Assigned
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(person.issuedGear || [
                  'Tongkat T (Tactical Baton)',
                  'Borgol Baja (Handcuffs)',
                  'Kopel Rim (Duty Belt)',
                  'Handy Talkie (HT Motorola)',
                  'Senter Lalin LED (Flashlight)',
                ]).map((gear, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-900 text-xs">{gear}</span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold">
                      ISSUED & ACTIVE
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* SECTION 3: Certifications & Qualification Badges */}
          <Card className="p-5 shadow-sm border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Recorded Certifications & Qualification Badges
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium">Police-accredited security licenses, tactical skills & specialty training</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-bold bg-slate-50 text-slate-700">
                {person.qualifications.length} Credentials
              </Badge>
            </div>

            {person.qualifications.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No formal certifications recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {person.qualifications.map((q) => {
                  const isValid = q.status === 'VALID';
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border transition ${
                        isValid
                          ? 'bg-blue-50/40 border-blue-200/80'
                          : 'bg-rose-50/40 border-rose-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-900 text-xs">{q.qualificationName}</div>
                        <Badge variant={isValid ? 'success' : 'destructive'} className="font-bold text-[9px]">
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

          {/* SECTION 4: Placement History Archive */}
          <Card className="p-5 shadow-sm border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Historical Placement & Deployment Archive
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium">Chronological record of past security postings and assignments</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono font-medium">
                {priorAssignments.length} Past Record{priorAssignments.length === 1 ? '' : 's'}
              </span>
            </div>

            {priorAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No historical prior deployments recorded.</p>
            ) : (
              <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {priorAssignments.map((asg) => (
                  <div key={asg.id} className="relative group">
                    <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-slate-300 border-2 border-white group-hover:bg-[#FFF100] transition-colors" />

                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{asg.locationName}</span>
                        <Badge variant="secondary" className="font-bold text-[9px]">{asg.status}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {asg.clientName} &bull; {asg.projectName}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                        <span>Role: <strong className="text-slate-700">{asg.positionOnSite || person.position}</strong></span>
                        <span>{formatDate(asg.startDate)} &rarr; {formatDate(asg.endDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
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
