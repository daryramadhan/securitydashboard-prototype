'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Personnel, Gender, EmploymentStatus } from '@/types';
import {
  UserPlus,
  Check,
  Shield,
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  UserCheck,
  AlertCircle,
  ChevronDown,
  FileText,
  User,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PersonnelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelToEdit?: Personnel | null;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces',
];

const COUNTRY_CODES = [
  { code: '+62', country: 'ID', label: '🇮🇩 +62' },
  { code: '+65', country: 'SG', label: '🇸🇬 +65' },
  { code: '+60', country: 'MY', label: '🇲🇾 +60' },
];

function generateNextPersonnelId(existingPersonnel: Personnel[]) {
  let maxNum = 350;
  for (const p of existingPersonnel) {
    const digits = p.personnelNumber.match(/\d+/g);
    if (digits) {
      const num = parseInt(digits[digits.length - 1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `JISS-${maxNum + 1}`;
}

export function PersonnelFormModal({ isOpen, onClose, personnelToEdit }: PersonnelFormModalProps) {
  const { addPersonnel, updatePersonnel, orgUnits, personnelList } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Section 1: Personal Information
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [countryCode, setCountryCode] = useState('+62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState(DEFAULT_AVATARS[0]);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);

  // Section 2: Employment Information
  const [personnelNumber, setPersonnelNumber] = useState('');
  const [position, setPosition] = useState('Security Officer (Pratama)');
  const [organizationalUnitId, setOrganizationalUnitId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('ACTIVE');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);

  // Section 3: Physical & Equipment Information (Collapsible)
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [shirtSize, setShirtSize] = useState('L');
  const [pantsSize, setPantsSize] = useState('34');
  const [shoesSize, setShoesSize] = useState('42');
  const [headwearSize, setHeadwearSize] = useState('58');
  const [dutyBeltSize, setDutyBeltSize] = useState('L (105cm)');
  const [bloodType, setBloodType] = useState('O+');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(72);

  // Section 4: Additional Information
  const [notes, setNotes] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Form Data
  useEffect(() => {
    if (personnelToEdit) {
      setFullName(personnelToEdit.fullName);
      setPersonnelNumber(personnelToEdit.personnelNumber);
      setGender(personnelToEdit.gender);

      // Parse phone into country code and number
      const fullPhone = personnelToEdit.phone || '';
      if (fullPhone.startsWith('+65')) {
        setCountryCode('+65');
        setPhoneNumber(fullPhone.replace('+65', '').trim());
      } else if (fullPhone.startsWith('+60')) {
        setCountryCode('+60');
        setPhoneNumber(fullPhone.replace('+60', '').trim());
      } else {
        setCountryCode('+62');
        setPhoneNumber(fullPhone.replace('+62', '').trim());
      }

      setEmail(personnelToEdit.email || '');
      setPosition(personnelToEdit.position);
      setOrganizationalUnitId(personnelToEdit.organizationalUnitId || orgUnits[0]?.id || 'org-2');
      setSupervisorId(personnelToEdit.supervisorId || '');
      setEmploymentStatus(personnelToEdit.employmentStatus);
      setJoinDate(personnelToEdit.joinDate);
      setPhotoUrl(personnelToEdit.photoUrl || DEFAULT_AVATARS[0]);
      setNotes(personnelToEdit.notes || '');
      setShirtSize(personnelToEdit.shirtSize || 'L');
      setPantsSize(personnelToEdit.pantsSize || '34');
      setShoesSize(personnelToEdit.shoesSize || '42');
      setHeadwearSize(personnelToEdit.headwearSize || '58');
      setDutyBeltSize(personnelToEdit.dutyBeltSize || 'L (105cm)');
      setBloodType(personnelToEdit.bloodType || 'O+');
      setHeightCm(personnelToEdit.heightCm || 175);
      setWeightKg(personnelToEdit.weightKg || 72);
      setIsEquipmentOpen(true); // Open when editing to show existing details
    } else {
      // New Personnel Defaults
      setFullName('');
      setPersonnelNumber(generateNextPersonnelId(personnelList));
      setGender('MALE');
      setCountryCode('+62');
      setPhoneNumber('');
      setEmail('');
      setPosition('Security Officer (Pratama)');
      setOrganizationalUnitId(orgUnits[0]?.id || 'org-2');
      setSupervisorId('');
      setEmploymentStatus('ACTIVE');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setPhotoUrl(DEFAULT_AVATARS[0]);
      setPhotoFileName(null);
      setNotes('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setShirtSize('L');
      setPantsSize('34');
      setShoesSize('42');
      setHeadwearSize('58');
      setDutyBeltSize('L (105cm)');
      setBloodType('O+');
      setHeightCm(175);
      setWeightKg(72);
      setIsEquipmentOpen(false); // Collapsed by default for initial registration simplicity
    }
    setErrors({});
  }, [personnelToEdit, isOpen, orgUnits, personnelList]);

  // Real-time Personnel ID Uniqueness Validation
  const isIdDuplicate = useMemo(() => {
    if (!personnelNumber.trim()) return false;
    return personnelList.some(
      (p) =>
        p.personnelNumber.trim().toLowerCase() === personnelNumber.trim().toLowerCase() &&
        p.id !== personnelToEdit?.id
    );
  }, [personnelNumber, personnelList, personnelToEdit]);

  // Supervisors filtered & organized by chain of command
  const organizedSupervisors = useMemo(() => {
    const list = personnelList.filter(
      (p) => p.id !== personnelToEdit?.id && p.employmentStatus === 'ACTIVE'
    );

    const commanders = list.filter((p) => {
      const lower = p.position.toLowerCase();
      return lower.includes('danru') || lower.includes('chief') || lower.includes('supervisor');
    });

    const others = list.filter((p) => {
      const lower = p.position.toLowerCase();
      return !lower.includes('danru') && !lower.includes('chief') && !lower.includes('supervisor');
    });

    return { commanders, others };
  }, [personnelList, personnelToEdit]);

  // Photo Upload Handler with FileReader
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'Photo file size exceeds 5MB limit' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          setPhotoFileName(file.name);
          setErrors((prev) => {
            const copy = { ...prev };
            delete copy.photo;
            return copy;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Validation
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    if (!personnelNumber.trim()) {
      errs.personnelNumber = 'Personnel ID is required';
    } else if (isIdDuplicate) {
      errs.personnelNumber = 'This Personnel ID is already registered to another guard';
    }

    if (!phoneNumber.trim()) {
      errs.phoneNumber = 'Phone number is required for emergency and operational contact';
    } else if (!/^[0-9\s\-()+]{6,16}$/.test(phoneNumber.trim())) {
      errs.phoneNumber = 'Enter a valid contact phone number';
    }

    if (!position.trim()) {
      errs.position = 'Operational position is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please complete required fields before saving.');
      return;
    }

    setIsSubmitting(true);
    const orgUnit = orgUnits.find((u) => u.id === organizationalUnitId);
    const supervisor = personnelList.find((p) => p.id === supervisorId);
    const combinedPhone = `${countryCode} ${phoneNumber.trim()}`;
    const generatedEmail = email.trim() || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@jiss.co.id`;

    try {
      if (personnelToEdit) {
        updatePersonnel(personnelToEdit.id, {
          fullName: fullName.trim(),
          personnelNumber: personnelNumber.trim(),
          gender,
          phone: combinedPhone,
          email: generatedEmail,
          position,
          organizationalUnitId,
          organizationalUnitName: orgUnit?.name || 'General Operations',
          supervisorId: supervisorId || null,
          supervisorName: supervisor?.fullName || null,
          employmentStatus,
          joinDate,
          photoUrl,
          notes: notes.trim() || undefined,
          shirtSize,
          pantsSize,
          shoesSize,
          headwearSize,
          dutyBeltSize,
          bloodType,
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
        });
        toast.success(`Personnel record for ${fullName} updated successfully.`);
      } else {
        addPersonnel({
          fullName: fullName.trim(),
          personnelNumber: personnelNumber.trim(),
          gender,
          phone: combinedPhone,
          email: generatedEmail,
          position,
          organizationalUnitId,
          organizationalUnitName: orgUnit?.name || 'General Operations',
          supervisorId: supervisorId || null,
          supervisorName: supervisor?.fullName || null,
          employmentStatus,
          joinDate,
          photoUrl,
          notes: notes.trim() || undefined,
          shirtSize,
          pantsSize,
          shoesSize,
          headwearSize,
          dutyBeltSize,
          bloodType,
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          issuedGear: [
            'Tongkat T (Tactical Baton)',
            'Borgol Baja (Handcuffs)',
            'Kopel Rim (Duty Belt)',
            'Handy Talkie (HT Motorola)',
            'Senter Lalin LED (Flashlight)',
          ],
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
        toast.success(`New security officer ${fullName} registered successfully.`);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving the personnel record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200">
        {/* Sticky Header */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
                    {personnelToEdit ? 'Edit Security Personnel' : 'Add New Security Personnel'}
                  </DialogTitle>
                  <Badge variant="outline" className="text-[10px] font-mono bg-white text-slate-700">
                    PRD V2
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Streamlined personnel registration with automated ID assignment and equipment profile
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs">
          {/* SECTION 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <User className="h-4 w-4 text-blue-600" />
                <span>1. Personal Information</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Core Identifiers</span>
            </div>

            {/* Profile Photo Uploader & Live Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={photoUrl}
                  alt="Security Guard Preview"
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold"
                  title="Upload New Photo"
                >
                  <Camera className="h-4 w-4 mb-0.5" />
                  <span>Change</span>
                </button>
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs font-semibold gap-1.5 bg-white border-slate-200 hover:bg-slate-100"
                  >
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    <span>Upload Officer Photo</span>
                  </Button>

                  {/* Preset Avatar Selector */}
                  <div className="flex items-center gap-1 pl-1">
                    <span className="text-[10px] text-slate-400 mr-1 hidden md:inline">Presets:</span>
                    {DEFAULT_AVATARS.slice(0, 4).map((preset, idx) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(preset);
                          setPhotoFileName(null);
                        }}
                        className={`h-6 w-6 rounded-full overflow-hidden border transition-all ${
                          photoUrl === preset ? 'ring-2 ring-blue-600 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={`Select default officer avatar #${idx + 1}`}
                      >
                        <img src={preset} alt="preset" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  {photoFileName ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1 justify-center sm:justify-start">
                      <CheckCircle2 className="h-3 w-3" /> Uploaded: {photoFileName}
                    </span>
                  ) : (
                    'PNG, JPG, or WebP up to 5MB. Standard 1:1 security ID portrait recommended.'
                  )}
                </p>
                {errors.photo && <p className="text-rose-500 text-[10px] font-semibold">{errors.photo}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullname" className="font-bold text-slate-800">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.fullName;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. Budi Hartono Santoso"
                  className={`h-9 text-xs ${errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'}`}
                />
                {errors.fullName && (
                  <p className="text-rose-500 font-semibold text-[10px] flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <Label htmlFor="gender-select" className="font-bold text-slate-800">
                  Gender <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="gender-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="MALE">Male (Pria)</option>
                  <option value="FEMALE">Female (Wanita)</option>
                </select>
              </div>

              {/* Phone with Country Code */}
              <div className="space-y-1">
                <Label htmlFor="phone-input" className="font-bold text-slate-800">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-1.5">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-9 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shrink-0 shadow-xs focus:ring-2 focus:ring-slate-900/10"
                    title="Country Calling Code"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1">
                    <Input
                      id="phone-input"
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.phoneNumber;
                            return copy;
                          });
                        }
                      }}
                      placeholder="812-3456-7890"
                      className={`h-9 text-xs font-mono ${
                        errors.phoneNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                </div>
                {errors.phoneNumber ? (
                  <p className="text-rose-500 font-semibold text-[10px] flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.phoneNumber}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400">Direct mobile phone for emergency dispatches</p>
                )}
              </div>

              {/* Email Address (Optional) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-input" className="font-bold text-slate-800">
                    Work Email Address
                  </Label>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </div>
                <Input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guard.name@jiss.co.id"
                  className="h-9 text-xs border-slate-200"
                />
                <p className="text-[10px] text-slate-400">Auto-generated from name if left empty</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Employment Information */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>2. Employment Information</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Assignment & Command</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personnel ID / Number with Auto-generate & Live Uniqueness Check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="personnel-id" className="font-bold text-slate-800">
                    Personnel ID <span className="text-rose-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextId = generateNextPersonnelId(personnelList);
                      setPersonnelNumber(nextId);
                      toast.info(`Generated Personnel ID: ${nextId}`);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    title="Generate Next Available Unique ID"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <Input
                  id="personnel-id"
                  type="text"
                  value={personnelNumber}
                  onChange={(e) => {
                    setPersonnelNumber(e.target.value);
                    if (errors.personnelNumber) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.personnelNumber;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. JISS-351"
                  className={`h-9 text-xs font-mono font-bold tracking-wide ${
                    isIdDuplicate || errors.personnelNumber
                      ? 'border-rose-400 bg-rose-50/20 text-rose-700'
                      : 'border-slate-200'
                  }`}
                />
                {isIdDuplicate ? (
                  <p className="text-rose-600 font-bold text-[10px] flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> This ID is already assigned to another guard!
                  </p>
                ) : errors.personnelNumber ? (
                  <p className="text-rose-500 font-semibold text-[10px] flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.personnelNumber}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Unique official PT. JISS personnel identifier
                  </p>
                )}
              </div>

              {/* Position / Operational Rank */}
              <div className="space-y-1">
                <Label htmlFor="position-select" className="font-bold text-slate-800">
                  Position / Operational Rank <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="position-select"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
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

              {/* Organizational Unit */}
              <div className="space-y-1">
                <Label htmlFor="org-unit-select" className="font-bold text-slate-800">
                  Organizational Division / Unit
                </Label>
                <select
                  id="org-unit-select"
                  value={organizationalUnitId}
                  onChange={(e) => setOrganizationalUnitId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  {orgUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Direct Supervisor (Clarified with role grouping) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="supervisor-select" className="font-bold text-slate-800">
                    Direct Supervisor
                  </Label>
                  <span className="text-[10px] text-slate-400 font-normal">Chain of Command</span>
                </div>
                <select
                  id="supervisor-select"
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="">-- No Direct Supervisor (Top Level) --</option>
                  <optgroup label="Field Commanders & Shift Supervisors (Recommended)">
                    {organizedSupervisors.commanders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} &bull; {p.position}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Senior Officers">
                    {organizedSupervisors.others.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} &bull; {p.position}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-slate-400">
                  Select the Danru or Shift Supervisor responsible for duty reports
                </p>
              </div>

              {/* Employment Status */}
              <div className="space-y-1">
                <Label htmlFor="status-select" className="font-bold text-slate-800">
                  Employment Status
                </Label>
                <select
                  id="status-select"
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="ACTIVE">Active (In Service & Eligible for Deployment)</option>
                  <option value="INACTIVE">Inactive (Resigned / Terminated)</option>
                </select>
              </div>

              {/* Join Date */}
              <div className="space-y-1">
                <Label htmlFor="join-date" className="font-bold text-slate-800">
                  Date of Joining
                </Label>
                <Input
                  id="join-date"
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="h-9 text-xs border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Physical & Equipment Information (Kaporlap) - Collapsible Progressive Disclosure */}
          <div className="pt-2">
            <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsEquipmentOpen((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition select-none bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        3. Physical & Equipment Sizing (Kaporlap)
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-white text-slate-600 font-semibold">
                        {isEquipmentOpen ? 'Expanded' : 'Optional for Registration'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Uniform sizes, boot sizing, duty belt, and medical blood type for field deployment
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                    {isEquipmentOpen ? 'Collapse' : 'Configure Sizes'}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                      isEquipmentOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Collapsed State Summary Preview */}
              {!isEquipmentOpen && (
                <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-700">Default Allocation:</span>
                    <span>Shirt: <strong>{shirtSize}</strong></span> &bull;
                    <span>Pants: <strong>{pantsSize}</strong></span> &bull;
                    <span>Boots: <strong>{shoesSize}</strong></span> &bull;
                    <span>Belt: <strong>{dutyBeltSize}</strong></span> &bull;
                    <span>Blood: <strong>{bloodType}</strong></span>
                  </div>
                  <span className="text-blue-600 font-bold shrink-0 cursor-pointer" onClick={() => setIsEquipmentOpen(true)}>
                    Edit sizes &rarr;
                  </span>
                </div>
              )}

              {/* Expanded Uniform Form */}
              {isEquipmentOpen && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Shirt Size */}
                    <div className="space-y-1">
                      <Label htmlFor="shirt-size" className="text-[11px] font-bold text-slate-700">
                        Shirt (PDL/PDH)
                      </Label>
                      <select
                        id="shirt-size"
                        value={shirtSize}
                        onChange={(e) => setShirtSize(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                      </select>
                    </div>

                    {/* Pants Size */}
                    <div className="space-y-1">
                      <Label htmlFor="pants-size" className="text-[11px] font-bold text-slate-700">
                        Pants Waist Size
                      </Label>
                      <select
                        id="pants-size"
                        value={pantsSize}
                        onChange={(e) => setPantsSize(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {['28', '29', '30', '31', '32', '33', '34', '35', '36', '38', '40'].map((s) => (
                          <option key={s} value={s}>
                            Size {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shoes Size */}
                    <div className="space-y-1">
                      <Label htmlFor="shoes-size" className="text-[11px] font-bold text-slate-700">
                        Tactical Boots (PDL)
                      </Label>
                      <select
                        id="shoes-size"
                        value={shoesSize}
                        onChange={(e) => setShoesSize(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {['38', '39', '40', '41', '42', '43', '44', '45', '46'].map((s) => (
                          <option key={s} value={s}>
                            Size {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Headwear Size */}
                    <div className="space-y-1">
                      <Label htmlFor="headwear-size" className="text-[11px] font-bold text-slate-700">
                        Beret / Field Hat
                      </Label>
                      <select
                        id="headwear-size"
                        value={headwearSize}
                        onChange={(e) => setHeadwearSize(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {['54', '55', '56', '57', '58', '59', '60'].map((s) => (
                          <option key={s} value={s}>
                            {s} cm
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {/* Duty Belt */}
                    <div className="space-y-1">
                      <Label htmlFor="belt-size" className="text-[11px] font-bold text-slate-700">
                        Duty Belt (Kopel)
                      </Label>
                      <select
                        id="belt-size"
                        value={dutyBeltSize}
                        onChange={(e) => setDutyBeltSize(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        <option value="S (85cm)">S (85cm)</option>
                        <option value="M (95cm)">M (95cm)</option>
                        <option value="L (105cm)">L (105cm)</option>
                        <option value="XL (115cm)">XL (115cm)</option>
                      </select>
                    </div>

                    {/* Blood Type */}
                    <div className="space-y-1">
                      <Label htmlFor="blood-type" className="text-[11px] font-bold text-slate-700">
                        Blood Type
                      </Label>
                      <select
                        id="blood-type"
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'].map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Height */}
                    <div className="space-y-1">
                      <Label htmlFor="height-cm" className="text-[11px] font-bold text-slate-700">
                        Height (cm)
                      </Label>
                      <Input
                        id="height-cm"
                        type="number"
                        min={150}
                        max={210}
                        value={heightCm}
                        onChange={(e) => setHeightCm(Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>

                    {/* Weight */}
                    <div className="space-y-1">
                      <Label htmlFor="weight-kg" className="text-[11px] font-bold text-slate-700">
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight-kg"
                        type="number"
                        min={45}
                        max={140}
                        value={weightKg}
                        onChange={(e) => setWeightKg(Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Additional Information */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>4. Additional Information</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Service Notes & Emergency</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Emergency Contact Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emergency-name" className="font-bold text-slate-800">
                    Emergency Contact Name
                  </Label>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </div>
                <Input
                  id="emergency-name"
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Siti Nurhaliza (Spouse / Parent)"
                  className="h-9 text-xs border-slate-200"
                />
              </div>

              {/* Emergency Contact Phone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emergency-phone" className="font-bold text-slate-800">
                    Emergency Contact Phone
                  </Label>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </div>
                <Input
                  id="emergency-phone"
                  type="text"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+62 813-9999-8888"
                  className="h-9 text-xs font-mono border-slate-200"
                />
              </div>
            </div>

            {/* Operational Background / Experience Notes */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes-area" className="font-bold text-slate-800">
                  Prior Military / Police / Satpam Experience & Notes
                </Label>
                <span className="text-[10px] text-slate-400">Optional</span>
              </div>
              <textarea
                id="notes-area"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ex-TNI AD Kostrad 5 years, advanced close protection certification, active K-9 handler skills..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs font-medium shadow-xs"
              />
            </div>
          </div>
        </form>

        {/* Persistent Sticky Action Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-[-4px_0_12px_rgba(0,0,0,0.05)] z-20">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-rose-500 font-bold">*</span>
            <span>Required fields: Full Name, Personnel ID, Contact Phone, and Position.</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || isIdDuplicate}
              className="px-5 text-xs font-bold bg-[#FFF100] hover:bg-[#ecd000] text-slate-950 border border-yellow-300/60 rounded-xl shadow-xs gap-1.5 active:scale-[0.98] transition-all"
            >
              <Check className="h-4 w-4 text-slate-950" />
              <span>{isSubmitting ? 'Saving...' : personnelToEdit ? 'Save Changes' : 'Add Personnel'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
