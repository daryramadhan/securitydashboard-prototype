'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Personnel, Gender, EmploymentStatus } from '@/types';
import { UserPlus, Check } from 'lucide-react';
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

interface PersonnelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelToEdit?: Personnel | null;
}

export function PersonnelFormModal({ isOpen, onClose, personnelToEdit }: PersonnelFormModalProps) {
  const { addPersonnel, updatePersonnel, orgUnits, personnelList } = useApp();

  const [fullName, setFullName] = useState(personnelToEdit?.fullName || '');
  const [personnelNumber, setPersonnelNumber] = useState(personnelToEdit?.personnelNumber || `JISS-${Math.floor(100 + Math.random() * 900)}`);
  const [gender, setGender] = useState<Gender>(personnelToEdit?.gender || 'MALE');
  const [phone, setPhone] = useState(personnelToEdit?.phone || '+62 812-');
  const [email, setEmail] = useState(personnelToEdit?.email || '');
  const [position, setPosition] = useState(personnelToEdit?.position || 'Security Officer (Pratama)');
  const [organizationalUnitId, setOrganizationalUnitId] = useState(personnelToEdit?.organizationalUnitId || orgUnits[0]?.id || 'org-2');
  const [supervisorId, setSupervisorId] = useState(personnelToEdit?.supervisorId || '');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(personnelToEdit?.employmentStatus || 'ACTIVE');
  const [joinDate, setJoinDate] = useState(personnelToEdit?.joinDate || new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState(personnelToEdit?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces');
  const [notes, setNotes] = useState(personnelToEdit?.notes || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (personnelToEdit) {
      setFullName(personnelToEdit.fullName);
      setPersonnelNumber(personnelToEdit.personnelNumber);
      setGender(personnelToEdit.gender);
      setPhone(personnelToEdit.phone);
      setEmail(personnelToEdit.email);
      setPosition(personnelToEdit.position);
      setOrganizationalUnitId(personnelToEdit.organizationalUnitId);
      setSupervisorId(personnelToEdit.supervisorId || '');
      setEmploymentStatus(personnelToEdit.employmentStatus);
      setJoinDate(personnelToEdit.joinDate);
      setPhotoUrl(personnelToEdit.photoUrl);
      setNotes(personnelToEdit.notes || '');
    } else {
      setFullName('');
      setPersonnelNumber(`JISS-${Math.floor(100 + Math.random() * 900)}`);
      setGender('MALE');
      setPhone('+62 812-');
      setEmail('');
      setPosition('Security Officer (Pratama)');
      setOrganizationalUnitId(orgUnits[0]?.id || 'org-2');
      setSupervisorId('');
      setEmploymentStatus('ACTIVE');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces');
      setNotes('');
    }
  }, [personnelToEdit, isOpen, orgUnits]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!personnelNumber.trim()) errs.personnelNumber = 'Personnel ID is required';
    if (!phone.trim()) errs.phone = 'Contact phone number is required';
    if (!position.trim()) errs.position = 'Position is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const orgUnit = orgUnits.find((u) => u.id === organizationalUnitId);
    const supervisor = personnelList.find((p) => p.id === supervisorId);

    if (personnelToEdit) {
      updatePersonnel(personnelToEdit.id, {
        fullName,
        personnelNumber,
        gender,
        phone,
        email,
        position,
        organizationalUnitId,
        organizationalUnitName: orgUnit?.name || 'General Operations',
        supervisorId: supervisorId || null,
        supervisorName: supervisor?.fullName || null,
        employmentStatus,
        joinDate,
        photoUrl,
        notes,
      });
    } else {
      addPersonnel({
        fullName,
        personnelNumber,
        gender,
        phone,
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@jiss.co.id`,
        position,
        organizationalUnitId,
        organizationalUnitName: orgUnit?.name || 'General Operations',
        supervisorId: supervisorId || null,
        supervisorName: supervisor?.fullName || null,
        employmentStatus,
        joinDate,
        photoUrl,
        notes,
        qualifications: [
          {
            id: `q-${Date.now()}`,
            personnelId: '',
            qualificationId: 'qual-1',
            qualificationName: 'Gada Pratama (Satpam Dasar)',
            issuingOrg: 'Polda Metro Jaya / Mabes Polri',
            issueDate: joinDate,
            expiryDate: '2030-01-01',
            status: 'VALID',
          },
        ],
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-slate-900 font-bold">
                {personnelToEdit ? 'Edit Personnel Record' : 'Register New Security Personnel'}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                PT. JISS internal HR and credential management system
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullname" className="block mb-1.5 font-bold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Budi Santoso"
              />
              {errors.fullName && <p className="text-rose-500 font-semibold text-[10px] mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <Label htmlFor="personnel-id" className="block mb-1.5 font-bold text-slate-700">
                Personnel ID / Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="personnel-id"
                type="text"
                value={personnelNumber}
                onChange={(e) => setPersonnelNumber(e.target.value)}
                placeholder="e.g. JISS-105"
                className="font-mono"
              />
              {errors.personnelNumber && <p className="text-rose-500 font-semibold text-[10px] mt-1">{errors.personnelNumber}</p>}
            </div>

            <div>
              <Label htmlFor="gender-select" className="block mb-1.5 font-bold text-slate-700">Gender</Label>
              <select
                id="gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
              >
                <option value="MALE">Male (Pria)</option>
                <option value="FEMALE">Female (Wanita)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="position-select" className="block mb-1.5 font-bold text-slate-700">
                Position / Operational Rank <span className="text-rose-500">*</span>
              </Label>
              <select
                id="position-select"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
              >
                <option value="Chief Security Officer (CSO)">Chief Security Officer (CSO)</option>
                <option value="Field Commander (Danru)">Field Commander (Danru)</option>
                <option value="Shift Supervisor">Shift Supervisor</option>
                <option value="Senior Patrol Officer">Senior Patrol Officer</option>
                <option value="Access Control & Lobby Specialist">Access Control & Lobby Specialist</option>
                <option value="CCTV & Surveillance Specialist">CCTV & Surveillance Specialist</option>
                <option value="VIP Close Protection Officer">VIP Close Protection Officer</option>
                <option value="K-9 Specialist Handler">K-9 Specialist Handler</option>
                <option value="Security Officer (Pratama)">Security Officer (Pratama)</option>
                <option value="Loading Dock & X-Ray Screener">Loading Dock & X-Ray Screener</option>
              </select>
            </div>

            <div>
              <Label htmlFor="phone-input" className="block mb-1.5 font-bold text-slate-700">
                Phone Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="phone-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812-xxxx-xxxx"
              />
              {errors.phone && <p className="text-rose-500 font-semibold text-[10px] mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="email-input" className="block mb-1.5 font-bold text-slate-700">Email Address</Label>
              <Input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@jiss.co.id"
              />
            </div>

            <div>
              <Label htmlFor="org-unit-select" className="block mb-1.5 font-bold text-slate-700">Organizational Unit</Label>
              <select
                id="org-unit-select"
                value={organizationalUnitId}
                onChange={(e) => setOrganizationalUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
              >
                {orgUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="supervisor-select" className="block mb-1.5 font-bold text-slate-700">Direct Supervisor</Label>
              <select
                id="supervisor-select"
                value={supervisorId}
                onChange={(e) => setSupervisorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
              >
                <option value="">-- No Direct Supervisor (Top Level) --</option>
                {personnelList
                  .filter((p) => p.id !== personnelToEdit?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.position})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status-select" className="block mb-1.5 font-bold text-slate-700">Employment Status</Label>
              <select
                id="status-select"
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
              >
                <option value="ACTIVE">Active (In Service)</option>
                <option value="INACTIVE">Inactive (Resigned / Terminated)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="join-date" className="block mb-1.5 font-bold text-slate-700">Date of Joining</Label>
              <Input
                id="join-date"
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="photo-url" className="block mb-1.5 font-bold text-slate-700">Profile Photo URL</Label>
            <div className="flex gap-3 items-center">
              <img
                src={photoUrl}
                alt="Preview"
                className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <Input
                id="photo-url"
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes-area" className="block mb-1.5 font-bold text-slate-700">Operational Background & Notes</Label>
            <textarea
              id="notes-area"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prior military or police experience, special skills..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="gap-1.5">
              <Check className="h-4 w-4" />
              <span>{personnelToEdit ? 'Save Changes' : 'Create Record'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
