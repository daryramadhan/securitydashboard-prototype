export type EmploymentStatus = 'ACTIVE' | 'INACTIVE';
export type Gender = 'MALE' | 'FEMALE';
export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
export type ProjectStatus = 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'ON_HOLD' | 'DRAFT';
export type UserRole = 'ADMIN' | 'MANAGEMENT' | 'READ_ONLY';

export interface Qualification {
  id: string;
  name: string;
  description?: string;
  level?: string;
}

export interface PersonnelQualification {
  id: string;
  personnelId: string;
  qualificationId: string;
  qualificationName: string;
  issuingOrg: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string | null; // YYYY-MM-DD
  status: 'VALID' | 'EXPIRED';
}

export interface Personnel {
  id: string;
  personnelNumber: string; // e.g. JISS-2024-089
  fullName: string;
  photoUrl: string;
  gender: Gender;
  phone: string;
  email: string;
  position: string; // e.g. "Senior Security Officer", "Field Supervisor", "Patrol Lead"
  organizationalUnitId: string;
  organizationalUnitName: string;
  supervisorId?: string | null;
  supervisorName?: string | null;
  employmentStatus: EmploymentStatus;
  joinDate: string; // YYYY-MM-DD
  notes?: string;
  qualifications: PersonnelQualification[];
  // Uniform & Security Equipment Specifications (Kaporlap)
  shirtSize?: string; // e.g. 'S', 'M', 'L', 'XL', 'XXL'
  pantsSize?: string; // e.g. '30', '32', '34', '36'
  shoesSize?: string; // e.g. '40', '41', '42', '43', '44'
  headwearSize?: string; // e.g. '56', '57', '58'
  dutyBeltSize?: string; // e.g. 'M (90cm)', 'L (100cm)', 'XL (110cm)'
  bloodType?: string; // e.g. 'O+', 'A+', 'B+', 'AB+'
  heightCm?: number; // e.g. 175
  weightKg?: number; // e.g. 72
  issuedGear?: string[]; // e.g. ['Tactical Baton', 'Handcuffs', 'Duty Belt', 'Flashlight', 'Radio HT']
  createdAt: string;
  updatedAt: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  parentUnitId?: string | null;
  headPersonnelId?: string | null;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  projectCode: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD, nullable
  status: ProjectStatus;
  description?: string;
}

export interface Location {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  name: string; // Site name e.g. "Tower 1 - Main Lobby", "SCBD East Gate"
  address: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Assignment {
  id: string;
  personnelId: string;
  personnelName: string;
  personnelNumber: string;
  personnelPhoto: string;
  personnelPosition: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  locationId: string;
  locationName: string;
  positionOnSite?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalPersonnel: number;
  activePersonnel: number;
  inactivePersonnel: number;
  malePersonnel: number;
  femalePersonnel: number;
  deployedPersonnel: number;
  idlePersonnel: number;
}
