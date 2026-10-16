import { Personnel, Client, Project, Location, Assignment, OrgUnit, Qualification } from '@/types';

export const initialOrgUnits: OrgUnit[] = [
  { id: 'org-1', name: 'Central Rapid Response Squad', parentUnitId: null, headPersonnelId: 'p-1' },
  { id: 'org-2', name: 'Commercial & Corporate Security Squad', parentUnitId: 'org-1', headPersonnelId: 'p-2' },
  { id: 'org-3', name: 'Industrial & Maritime Security Squad', parentUnitId: 'org-1', headPersonnelId: 'p-3' },
  { id: 'org-4', name: 'VIP Protection & Escort Squad', parentUnitId: 'org-1', headPersonnelId: 'p-4' },
];

export const initialClients: Client[] = [
  {
    id: 'client-1',
    name: 'PT Astra International Tbk',
    industry: 'Automotive & Conglomerate',
    contactPerson: 'Bambang Soepomo (Head of Security)',
    contactPhone: '+62 811-2345-6781',
    status: 'ACTIVE',
    createdAt: '2024-01-15',
  },
  {
    id: 'client-2',
    name: 'PT Bank Central Asia Tbk',
    industry: 'Banking & Financial Services',
    contactPerson: 'Hendra Wijaya (Facility Director)',
    contactPhone: '+62 812-9876-5432',
    status: 'ACTIVE',
    createdAt: '2024-02-01',
  },
  {
    id: 'client-3',
    name: 'PT Danayasa Arthatama (SCBD)',
    industry: 'Real Estate & Commercial District',
    contactPerson: 'Agus Priyanto (Estate Manager)',
    contactPhone: '+62 813-1122-3344',
    status: 'ACTIVE',
    createdAt: '2023-11-10',
  },
  {
    id: 'client-4',
    name: 'PT Pelabuhan Indonesia (Pelindo)',
    industry: 'Maritime Logistics & Port Operator',
    contactPerson: 'Capt. Rahmat Hidayat',
    contactPhone: '+62 815-5566-7788',
    status: 'ACTIVE',
    createdAt: '2023-09-01',
  },
  {
    id: 'client-5',
    name: 'PT Summarecon Agung Tbk',
    industry: 'Retail & Mixed Commercial',
    contactPerson: 'Irene Kusuma (Operations Lead)',
    contactPhone: '+62 818-7788-9900',
    status: 'ACTIVE',
    createdAt: '2024-03-20',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    clientId: 'client-1',
    clientName: 'PT Astra International Tbk',
    name: 'Menara Astra Headquarters Perimeter & Access',
    projectCode: 'ASTRA-HQ-2026',
    startDate: '2026-01-01',
    endDate: '2026-10-26', // 12 days remaining
    status: 'ACTIVE',
    description: 'Executive lobby control, loading dock screening, and 24/7 CCTV surveillance.',
  },
  {
    id: 'proj-2',
    clientId: 'client-2',
    clientName: 'PT Bank Central Asia Tbk',
    name: 'BCA Tier-4 Sentul Data Center High-Security',
    projectCode: 'BCA-DC-SENTUL',
    startDate: '2025-10-15',
    endDate: '2026-10-20', // 6 days remaining (Urgent!)
    status: 'ACTIVE',
    description: 'Biometric checkpoint enforcement and perimeter anti-intrusion patrolling.',
  },
  {
    id: 'proj-3',
    clientId: 'client-3',
    clientName: 'PT Danayasa Arthatama (SCBD)',
    name: 'SCBD District Commercial Hub Patrol',
    projectCode: 'SCBD-PATROL-01',
    startDate: '2026-02-01',
    endDate: '2026-11-28', // 45 days remaining
    status: 'ACTIVE',
    description: 'Integrated vehicle barrier checkpoints and high-visibility bicycle patrols.',
  },
  {
    id: 'proj-4',
    clientId: 'client-4',
    clientName: 'PT Pelabuhan Indonesia (Pelindo)',
    name: 'Tanjung Priok Container Terminal Gate Security',
    projectCode: 'PELINDO-PRIOK-04',
    startDate: '2026-01-10',
    endDate: '2027-01-17', // ~95 days remaining
    status: 'ACTIVE',
    description: 'ISPS Code compliant port gate screening and cargo sealing checkpoint control.',
  },
  {
    id: 'proj-5',
    clientId: 'client-5',
    clientName: 'PT Summarecon Agung Tbk',
    name: 'Summarecon Mall Kelapa Gading Security & Safety',
    projectCode: 'SMKG-RETAIL-05',
    startDate: '2026-04-01',
    endDate: null, // Indefinite contract
    status: 'ACTIVE',
    description: 'Crowd control, loss prevention, bag scanning, and customer emergency response.',
  },
  {
    id: 'proj-6',
    clientId: 'client-3',
    clientName: 'PT Danayasa Arthatama (SCBD)',
    name: 'SCBD Lot 28 Pop-up Event Security',
    projectCode: 'SCBD-POPUP-06',
    startDate: '2026-08-01',
    endDate: '2026-09-30', // Ended 14 days ago
    status: 'COMPLETED',
    description: 'Temporary perimeter guarding for international banking exhibition.',
  },
  {
    id: 'proj-draft-1',
    clientId: 'client-1',
    clientName: 'PT Astra International Tbk',
    name: 'Astra Biz Center BSD City Expansion',
    projectCode: 'ASTRA-BSD-DRAFT',
    startDate: '2026-11-15',
    endDate: '2027-11-15',
    status: 'DRAFT',
    description: 'Proposed integrated physical security and perimeter access for new automotive tech center.',
  },
  {
    id: 'proj-draft-2',
    clientId: 'client-4',
    clientName: 'PT Pelabuhan Indonesia (Pelindo)',
    name: 'Kalibaru Terminal Phase 2 Guarding Proposal',
    projectCode: 'PELINDO-KALIBARU-DRAFT',
    startDate: '2026-12-01',
    endDate: '2027-12-01',
    status: 'DRAFT',
    description: 'Tender specification for automated gate control and marine security patrols.',
  },
];

export const initialLocations: Location[] = [
  {
    id: 'loc-completed-1',
    clientId: 'client-3',
    clientName: 'PT Danayasa Arthatama (SCBD)',
    projectId: 'proj-6',
    projectName: 'SCBD Lot 28 Pop-up Event Security',
    name: 'SCBD Lot 28 - Exhibition Ground & Gate',
    address: 'SCBD Lot 28, Jl. Jend. Sudirman',
    city: 'Jakarta Selatan',
    status: 'INACTIVE',
  },
  {
    id: 'loc-draft-1',
    clientId: 'client-1',
    clientName: 'PT Astra International Tbk',
    projectId: 'proj-draft-1',
    projectName: 'Astra Biz Center BSD City Expansion',
    name: 'Astra Biz Center - South Gate & Showroom',
    address: 'Jl. BSD Grand Boulevard Kav. Commercial',
    city: 'Tangerang',
    status: 'ACTIVE',
  },
  {
    id: 'loc-draft-2',
    clientId: 'client-4',
    clientName: 'PT Pelabuhan Indonesia (Pelindo)',
    projectId: 'proj-draft-2',
    projectName: 'Kalibaru Terminal Phase 2 Guarding Proposal',
    name: 'Kalibaru New Port - Logistics Ingate Checkpoint',
    address: 'Kawasan Kalibaru, Tanjung Priok',
    city: 'Jakarta Utara',
    status: 'ACTIVE',
  },
  {
    id: 'loc-1',
    clientId: 'client-1',
    clientName: 'PT Astra International Tbk',
    projectId: 'proj-1',
    projectName: 'Menara Astra Headquarters Perimeter & Access',
    name: 'Menara Astra - Main Lobby & VIP Access',
    address: 'Jl. Jend. Sudirman Kav. 5-6, Karet Tengsin',
    city: 'Jakarta Pusat',
    status: 'ACTIVE',
  },
  {
    id: 'loc-2',
    clientId: 'client-1',
    clientName: 'PT Astra International Tbk',
    projectId: 'proj-1',
    projectName: 'Menara Astra Headquarters Perimeter & Access',
    name: 'Menara Astra - Basement Loading Dock & Cargo',
    address: 'Jl. Jend. Sudirman Kav. 5-6, Karet Tengsin',
    city: 'Jakarta Pusat',
    status: 'ACTIVE',
  },
  {
    id: 'loc-3',
    clientId: 'client-2',
    clientName: 'PT Bank Central Asia Tbk',
    projectId: 'proj-2',
    projectName: 'BCA Tier-4 Sentul Data Center High-Security',
    name: 'BCA Data Center - Main Gate & Anti-Ram Barrier',
    address: 'Sentul City Tech Park Block B-12',
    city: 'Bogor',
    status: 'ACTIVE',
  },
  {
    id: 'loc-4',
    clientId: 'client-3',
    clientName: 'PT Danayasa Arthatama (SCBD)',
    projectId: 'proj-3',
    projectName: 'SCBD District Commercial Hub Patrol',
    name: 'SCBD Pacific Place Outer Perimeter',
    address: 'SCBD Lot 3 & 5, Senayan',
    city: 'Jakarta Selatan',
    status: 'ACTIVE',
  },
  {
    id: 'loc-5',
    clientId: 'client-4',
    clientName: 'PT Pelabuhan Indonesia (Pelindo)',
    projectId: 'proj-4',
    projectName: 'Tanjung Priok Container Terminal Gate Security',
    name: 'Tanjung Priok - Terminal 3 Gate In/Out',
    address: 'Pelabuhan Tanjung Priok, Koja',
    city: 'Jakarta Utara',
    status: 'ACTIVE',
  },
  {
    id: 'loc-6',
    clientId: 'client-5',
    clientName: 'PT Summarecon Agung Tbk',
    projectId: 'proj-5',
    projectName: 'Summarecon Mall Kelapa Gading Security & Safety',
    name: 'Mall Kelapa Gading 3 - Atrium & West Entrance',
    address: 'Jl. Boulevard Kelapa Gading, Kelapa Gading Timur',
    city: 'Jakarta Utara',
    status: 'ACTIVE',
  },
];

// DATA GENERATOR: SIMULATE 350 GUARDS (67 WOMEN, 283 MEN)
const femaleFirstNames = [
  'Dewi', 'Siti', 'Ratna', 'Rina', 'Nur', 'Sri', 'Putri', 'Lestari', 'Irene', 'Maya',
  'Dian', 'Indah', 'Fitri', 'Novita', 'Anggun', 'Citra', 'Desi', 'Eka', 'Gita', 'Hani',
  'Intan', 'Kartika', 'Melati', 'Nadia', 'Oki', 'Permata', 'Rani', 'Sari', 'Tia', 'Wulan',
  'Yulia', 'Zahra', 'Annisa', 'Bella', 'Clarissa', 'Devi'
];
const femaleLastNames = [
  'Lestari', 'Kusuma', 'Sari', 'Wijaya', 'Anggraini', 'Rahmawati', 'Pertiwi', 'Utami',
  'Puspitasari', 'Handayani', 'Safitri', 'Wulandari', 'Pratiwi', 'Hasanah', 'Novitasari',
  'Damayanti', 'Nurhaliza', 'Septiani', 'Sulistiawati', 'Yuliana'
];

const maleFirstNames = [
  'Budi', 'Agus', 'Bambang', 'Eko', 'Joko', 'Hendra', 'Darmawan', 'Wahyu', 'Rian', 'Bayu',
  'Fajar', 'Ahmad', 'Dimas', 'Tri', 'Arif', 'Rahmat', 'Surya', 'Ilham', 'Gilang', 'Rizky',
  'Danang', 'Sigit', 'Teguh', 'Prasetyo', 'Yusuf', 'Iman', 'Wawan', 'Dodi', 'Doni', 'Gatot',
  'Satria', 'Aditya', 'Rangga', 'Gunawan', 'Haryanto', 'Irfan', 'Kurniawan', 'Lukman', 'Maulana',
  'Nugroho', 'Pandu', 'Raden', 'Sandi', 'Taufik', 'Untung', 'Victor', 'Wisnu', 'Yoga', 'Zul'
];
const maleLastNames = [
  'Santoso', 'Prasetyo', 'Wijaya', 'Kurniawan', 'Setiawan', 'Hidayat', 'Nugroho', 'Saputra',
  'Utomo', 'Wibowo', 'Kusuma', 'Siregar', 'Harahap', 'Lubis', 'Nasution', 'Simanjuntak',
  'Subekti', 'Hartono', 'Purnomo', 'Suhendra', 'Suryanto', 'Firmansyah', 'Hakim', 'Mahendra',
  'Pangestu', 'Ramadhan', 'Syahputra', 'Tanjung', 'Wardhana', 'Yulianto'
];

const femaleAvatars = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=256&h=256&fit=crop&crop=faces'
];

const maleAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces'
];

const standardPositions = [
  'Security Officer (Pratama)',
  'Senior Patrol Officer',
  'Access Control & Lobby Specialist',
  'CCTV & Surveillance Specialist',
  'Loading Dock & X-Ray Screener',
  'Field Commander (Danru)',
  'Shift Supervisor',
  'VIP Close Protection Officer',
  'K-9 Specialist Handler'
];

function generateSimulatedDataset() {
  const personnel: Personnel[] = [];

  // 1. Troops Squad Leadership (4 personnel: 3 Men, 1 Woman - all active field security)
  personnel.push({
    id: 'p-1',
    personnelNumber: 'JISS-001',
    fullName: 'Kolonel (Purn.) Hartono Sutanto',
    photoUrl: maleAvatars[2],
    gender: 'MALE',
    phone: '+62 811-9001-001',
    email: 'hartono.sutanto@jiss.co.id',
    position: 'Chief Security (Danru Utama)',
    organizationalUnitId: 'org-1',
    organizationalUnitName: 'Central Rapid Response Squad',
    supervisorId: null,
    supervisorName: null,
    employmentStatus: 'ACTIVE',
    joinDate: '2020-01-10',
    notes: 'Senior field security commander, leads rapid response squad and high-priority site operations.',
    shirtSize: 'XL',
    pantsSize: '36',
    shoesSize: '43',
    headwearSize: '59',
    dutyBeltSize: 'XL (110cm)',
    bloodType: 'O+',
    heightCm: 178,
    weightKg: 78,
    issuedGear: ['Tongkat T (Tactical Baton)', 'Borgol Baja (Handcuffs)', 'Kopel Rim (Duty Belt)', 'Handy Talkie (HT Motorola)', 'Rompi Reflektif (Safety Vest)'],
    qualifications: [
      { id: 'q-1', personnelId: 'p-1', qualificationId: 'qual-1', qualificationName: 'Gada Utama', issuingOrg: 'Mabes Polri', issueDate: '2021-03-10', expiryDate: '2027-03-10', status: 'VALID' },
      { id: 'q-2', personnelId: 'p-1', qualificationId: 'qual-5', qualificationName: 'ISPS Code Maritime Security Auditor', issuingOrg: 'Ministry of Transportation', issueDate: '2020-05-12', expiryDate: '2028-05-12', status: 'VALID' }
    ],
    createdAt: '2020-01-10',
    updatedAt: '2026-01-01',
  });

  personnel.push({
    id: 'p-2',
    personnelNumber: 'JISS-002',
    fullName: 'Mayor (Purn.) Wahyu Sudrajat',
    photoUrl: maleAvatars[0],
    gender: 'MALE',
    phone: '+62 812-8821-002',
    email: 'wahyu.sudrajat@jiss.co.id',
    position: 'Senior Shift Supervisor',
    organizationalUnitId: 'org-2',
    organizationalUnitName: 'Commercial & Corporate Security Squad',
    supervisorId: 'p-1',
    supervisorName: 'Kolonel (Purn.) Hartono Sutanto',
    employmentStatus: 'ACTIVE',
    joinDate: '2021-04-15',
    notes: 'Oversees commercial building patrol squad, mall safety, and access control.',
    shirtSize: 'L',
    pantsSize: '34',
    shoesSize: '42',
    headwearSize: '58',
    dutyBeltSize: 'L (100cm)',
    bloodType: 'B+',
    heightCm: 175,
    weightKg: 74,
    issuedGear: ['Tongkat T (Tactical Baton)', 'Borgol Baja (Handcuffs)', 'Kopel Rim (Duty Belt)', 'Handy Talkie (HT Motorola)', 'Senter Lalin LED (Flashlight)'],
    qualifications: [
      { id: 'q-3', personnelId: 'p-2', qualificationId: 'qual-2', qualificationName: 'Gada Madya', issuingOrg: 'Polda Metro Jaya', issueDate: '2021-06-01', expiryDate: '2027-06-01', status: 'VALID' }
    ],
    createdAt: '2021-04-15',
    updatedAt: '2026-02-10',
  });

  personnel.push({
    id: 'p-3',
    personnelNumber: 'JISS-003',
    fullName: 'Kapten (Purn.) Darmawan Prasetyo',
    photoUrl: maleAvatars[1],
    gender: 'MALE',
    phone: '+62 813-7744-003',
    email: 'darmawan.prasetyo@jiss.co.id',
    position: 'Maritime & Industrial Patrol Lead',
    organizationalUnitId: 'org-3',
    organizationalUnitName: 'Industrial & Maritime Security Squad',
    supervisorId: 'p-1',
    supervisorName: 'Kolonel (Purn.) Hartono Sutanto',
    employmentStatus: 'ACTIVE',
    joinDate: '2021-08-01',
    notes: 'Specializes in perimeter anti-intrusion, logistics dock protection, and port security squad.',
    shirtSize: 'XL',
    pantsSize: '35',
    shoesSize: '44',
    headwearSize: '59',
    dutyBeltSize: 'L (105cm)',
    bloodType: 'A+',
    heightCm: 180,
    weightKg: 82,
    issuedGear: ['Tongkat T (Tactical Baton)', 'Borgol Baja (Handcuffs)', 'Kopel Rim (Duty Belt)', 'Handy Talkie (HT Motorola)', 'Rompi Taktis Pelabuhan'],
    qualifications: [
      { id: 'q-4', personnelId: 'p-3', qualificationId: 'qual-5', qualificationName: 'ISPS Code Maritime Security Auditor', issuingOrg: 'Ministry of Transportation', issueDate: '2021-08-10', expiryDate: '2027-08-10', status: 'VALID' }
    ],
    createdAt: '2021-08-01',
    updatedAt: '2026-01-20',
  });

  personnel.push({
    id: 'p-4',
    personnelNumber: 'JISS-004',
    fullName: 'Kompol (Purn.) Siti Nurhaliza',
    photoUrl: femaleAvatars[0],
    gender: 'FEMALE',
    phone: '+62 812-4411-004',
    email: 'siti.nurhaliza@jiss.co.id',
    position: 'VIP Protection Lead Officer',
    organizationalUnitId: 'org-4',
    organizationalUnitName: 'VIP Protection & Escort Squad',
    supervisorId: 'p-1',
    supervisorName: 'Kolonel (Purn.) Hartono Sutanto',
    employmentStatus: 'ACTIVE',
    joinDate: '2022-02-01',
    notes: 'Close protection squad commander, dignitary security escort, and tactical handler.',
    shirtSize: 'M',
    pantsSize: '30',
    shoesSize: '39',
    headwearSize: '56',
    dutyBeltSize: 'M (90cm)',
    bloodType: 'AB+',
    heightCm: 168,
    weightKg: 58,
    issuedGear: ['Tongkat T (Tactical Baton)', 'Borgol Baja (Handcuffs)', 'Kopel Rim (Duty Belt)', 'Handy Talkie (HT Motorola)', 'Tactical Concealed Holster'],
    qualifications: [
      { id: 'q-5', personnelId: 'p-4', qualificationId: 'qual-1', qualificationName: 'Gada Utama', issuingOrg: 'Mabes Polri', issueDate: '2022-03-01', expiryDate: '2028-03-01', status: 'VALID' }
    ],
    createdAt: '2022-02-01',
    updatedAt: '2026-03-01',
  });

  // 2. Define Field Commanders (Danru) who lead teams within each squad
  const danrusOrg2 = [
    { id: 'p-71', padId: '071', name: 'Darmawan Kusuma', supervisorId: 'p-2', supervisorName: 'Mayor (Purn.) Wahyu Sudrajat', unitId: 'org-2', unitName: 'Commercial & Corporate Security Squad' },
    { id: 'p-72', padId: '072', name: 'Teguh Prasetyo', supervisorId: 'p-2', supervisorName: 'Mayor (Purn.) Wahyu Sudrajat', unitId: 'org-2', unitName: 'Commercial & Corporate Security Squad' },
    { id: 'p-73', padId: '073', name: 'Bambang Wijaya', supervisorId: 'p-2', supervisorName: 'Mayor (Purn.) Wahyu Sudrajat', unitId: 'org-2', unitName: 'Commercial & Corporate Security Squad' },
    { id: 'p-74', padId: '074', name: 'Eko Suryanto', supervisorId: 'p-2', supervisorName: 'Mayor (Purn.) Wahyu Sudrajat', unitId: 'org-2', unitName: 'Commercial & Corporate Security Squad' },
  ];

  const danrusOrg3 = [
    { id: 'p-75', padId: '075', name: 'Hendra Setiawan', supervisorId: 'p-3', supervisorName: 'Kapten (Purn.) Darmawan Prasetyo', unitId: 'org-3', unitName: 'Industrial & Maritime Security Squad' },
    { id: 'p-76', padId: '076', name: 'Agus Hidayat', supervisorId: 'p-3', supervisorName: 'Kapten (Purn.) Darmawan Prasetyo', unitId: 'org-3', unitName: 'Industrial & Maritime Security Squad' },
    { id: 'p-77', padId: '077', name: 'Fajar Kurniawan', supervisorId: 'p-3', supervisorName: 'Kapten (Purn.) Darmawan Prasetyo', unitId: 'org-3', unitName: 'Industrial & Maritime Security Squad' },
  ];

  const danrusOrg4 = [
    { id: 'p-78', padId: '078', name: 'Bayu Nugroho', supervisorId: 'p-4', supervisorName: 'Kompol (Purn.) Siti Nurhaliza', unitId: 'org-4', unitName: 'VIP Protection & Escort Squad' },
    { id: 'p-79', padId: '079', name: 'Ahmad Saputra', supervisorId: 'p-4', supervisorName: 'Kompol (Purn.) Siti Nurhaliza', unitId: 'org-4', unitName: 'VIP Protection & Escort Squad' },
  ];

  const allDanrus = [...danrusOrg2, ...danrusOrg3, ...danrusOrg4];

  // 3. Generate remaining 66 Women (to reach exactly 67 Women) - all reporting to their squad Danru
  for (let i = 0; i < 66; i++) {
    const idNum = 5 + i;
    const padId = String(idNum).padStart(3, '0');
    const fn = femaleFirstNames[i % femaleFirstNames.length];
    const ln = femaleLastNames[(i * 3 + 1) % femaleLastNames.length];
    const fullName = `${fn} ${ln}`;
    const avatar = femaleAvatars[i % femaleAvatars.length];
    
    // Distribute org units
    const unitId = i % 4 === 0 ? 'org-4' : i % 3 === 0 ? 'org-3' : 'org-2';
    const unitName =
      unitId === 'org-4'
        ? 'VIP Protection & Escort Squad'
        : unitId === 'org-3'
        ? 'Industrial & Maritime Security Squad'
        : 'Commercial & Corporate Security Squad';

    const squadDanrus = unitId === 'org-4' ? danrusOrg4 : unitId === 'org-3' ? danrusOrg3 : danrusOrg2;
    const assignedDanru = squadDanrus[i % squadDanrus.length];

    const pos = i % 7 === 0
      ? 'Access Control & Lobby Specialist'
      : i % 6 === 0
      ? 'VIP Close Protection Officer'
      : i % 5 === 0
      ? 'CCTV & Surveillance Specialist'
      : i % 4 === 0
      ? 'Senior Patrol Officer'
      : 'Security Officer (Pratama)';

    // Exactly 3 women inactive (out of 67)
    const isInactive = i === 12 || i === 35 || i === 58;

    personnel.push({
      id: `p-${idNum}`,
      personnelNumber: `JISS-${padId}`,
      fullName,
      photoUrl: avatar,
      gender: 'FEMALE',
      phone: `+62 812-${String(1000 + i).slice(0, 4)}-${padId}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@jiss.co.id`,
      position: pos,
      organizationalUnitId: unitId,
      organizationalUnitName: unitName,
      supervisorId: assignedDanru.id,
      supervisorName: assignedDanru.name,
      employmentStatus: isInactive ? 'INACTIVE' : 'ACTIVE',
      joinDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
      notes: isInactive ? 'Resigned - contract completed.' : 'Active certified security personnel.',
      shirtSize: ['S', 'M', 'L', 'XL'][i % 4],
      pantsSize: ['28', '29', '30', '31', '32'][i % 5],
      shoesSize: ['38', '39', '40', '41'][i % 4],
      headwearSize: ['55', '56', '57'][i % 3],
      dutyBeltSize: ['S (85cm)', 'M (90cm)', 'L (95cm)'][i % 3],
      bloodType: ['O+', 'A+', 'B+', 'AB+'][i % 4],
      heightCm: 162 + (i % 9),
      weightKg: 52 + (i % 14),
      issuedGear: [
        'Tongkat T (Tactical Baton)',
        'Borgol Baja (Handcuffs)',
        'Kopel Rim (Duty Belt)',
        'Handy Talkie (HT Motorola)',
        i % 2 === 0 ? 'Senter Lalin LED (Flashlight)' : 'Peluit & Tali Kur (Whistle)',
      ],
      qualifications: [
        {
          id: `q-f-${i + 1}`,
          personnelId: `p-${idNum}`,
          qualificationId: 'qual-1',
          qualificationName: i % 4 === 0 ? 'Gada Madya' : 'Gada Pratama',
          issuingOrg: 'Polda Metro Jaya',
          issueDate: '2024-02-10',
          expiryDate: isInactive ? '2025-02-10' : '2029-02-10',
          status: isInactive ? 'EXPIRED' : 'VALID',
        },
      ],
      createdAt: '2024-01-01',
      updatedAt: '2026-01-01',
    });
  }

  // 4. Create the 9 Danru Field Commanders (p-71 to p-79)
  allDanrus.forEach((d, idx) => {
    personnel.push({
      id: d.id,
      personnelNumber: `JISS-${d.padId}`,
      fullName: d.name,
      photoUrl: maleAvatars[idx % maleAvatars.length],
      gender: 'MALE',
      phone: `+62 813-2000-${d.padId}`,
      email: `${d.name.toLowerCase().replace(/\s+/g, '.')}@jiss.co.id`,
      position: 'Field Commander (Danru)',
      organizationalUnitId: d.unitId,
      organizationalUnitName: d.unitName,
      supervisorId: d.supervisorId,
      supervisorName: d.supervisorName,
      employmentStatus: 'ACTIVE',
      joinDate: '2022-06-01',
      notes: 'Field tactical commander leading security squad deployments.',
      shirtSize: ['L', 'XL'][idx % 2],
      pantsSize: ['33', '34', '35'][idx % 3],
      shoesSize: ['42', '43', '44'][idx % 3],
      headwearSize: ['58', '59'][idx % 2],
      dutyBeltSize: 'L (105cm)',
      bloodType: ['O+', 'B+', 'A+'][idx % 3],
      heightCm: 175 + (idx % 5),
      weightKg: 74 + (idx % 6),
      issuedGear: [
        'Tongkat T (Tactical Baton)',
        'Borgol Baja (Handcuffs)',
        'Kopel Rim (Duty Belt)',
        'Handy Talkie (HT Motorola)',
        'Senter Lalin LED (Flashlight)',
        'Rompi Reflektif (Safety Vest)',
      ],
      qualifications: [
        {
          id: `q-danru-${idx + 1}`,
          personnelId: d.id,
          qualificationId: 'qual-2',
          qualificationName: 'Gada Madya',
          issuingOrg: 'Polda Metro Jaya',
          issueDate: '2022-07-15',
          expiryDate: '2028-07-15',
          status: 'VALID',
        },
      ],
      createdAt: '2022-06-01',
      updatedAt: '2026-01-01',
    });
  });

  // 5. Generate remaining 271 Men (p-80 to p-350, reaching exactly 283 Men total)
  const remainingMaleCount = 271; // 3 leaders + 9 danrus + 271 guards = 283 men
  const guardMalePositions = [
    'Security Officer (Pratama)',
    'Senior Patrol Officer',
    'Access Control & Lobby Specialist',
    'CCTV & Surveillance Specialist',
    'Loading Dock & X-Ray Screener',
    'K-9 Specialist Handler',
    'VIP Close Protection Officer',
  ];

  for (let i = 0; i < remainingMaleCount; i++) {
    const idNum = 80 + i;
    const padId = String(idNum).padStart(3, '0');
    const fn = maleFirstNames[i % maleFirstNames.length];
    const ln = maleLastNames[(i * 7 + 2) % maleLastNames.length];
    const fullName = `${fn} ${ln}`;
    const avatar = maleAvatars[i % maleAvatars.length];

    const unitId = i % 5 === 0 ? 'org-4' : i % 2 === 0 ? 'org-2' : 'org-3';
    const unitName =
      unitId === 'org-4'
        ? 'VIP Protection & Escort Squad'
        : unitId === 'org-3'
        ? 'Industrial & Maritime Security Squad'
        : 'Commercial & Corporate Security Squad';

    const squadDanrus = unitId === 'org-4' ? danrusOrg4 : unitId === 'org-3' ? danrusOrg3 : danrusOrg2;
    const assignedDanru = squadDanrus[i % squadDanrus.length];

    const pos = guardMalePositions[i % guardMalePositions.length];

    // 12 men inactive (out of 283) -> Total inactive = 3 + 12 = 15
    const isInactive = i > 0 && i % 22 === 0 && i <= 264;

    personnel.push({
      id: `p-${idNum}`,
      personnelNumber: `JISS-${padId}`,
      fullName,
      photoUrl: avatar,
      gender: 'MALE',
      phone: `+62 813-${String(2000 + i).slice(0, 4)}-${padId}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@jiss.co.id`,
      position: pos,
      organizationalUnitId: unitId,
      organizationalUnitName: unitName,
      supervisorId: assignedDanru.id,
      supervisorName: assignedDanru.name,
      employmentStatus: isInactive ? 'INACTIVE' : 'ACTIVE',
      joinDate: `2023-${String((i % 12) + 1).padStart(2, '0')}-01`,
      notes: isInactive ? 'Resigned - contract period ended.' : 'Active certified field officer.',
      shirtSize: ['M', 'L', 'XL', 'XXL'][i % 4],
      pantsSize: ['31', '32', '33', '34', '36', '38'][i % 6],
      shoesSize: ['41', '42', '43', '44', '45'][i % 5],
      headwearSize: ['57', '58', '59', '60'][i % 4],
      dutyBeltSize: ['M (95cm)', 'L (105cm)', 'XL (115cm)'][i % 3],
      bloodType: ['O+', 'B+', 'A+', 'AB+'][i % 4],
      heightCm: 170 + (i % 14),
      weightKg: 66 + (i % 20),
      issuedGear: [
        'Tongkat T (Tactical Baton)',
        'Borgol Baja (Handcuffs)',
        'Kopel Rim (Duty Belt)',
        'Handy Talkie (HT Motorola)',
        i % 3 === 0 ? 'Rompi Reflektif (Safety Vest)' : 'Senter Lalin LED (Flashlight)',
      ],
      qualifications: [
        {
          id: `q-m-${i + 1}`,
          personnelId: `p-${idNum}`,
          qualificationId: 'qual-1',
          qualificationName: i % 5 === 0 ? 'Gada Madya' : 'Gada Pratama',
          issuingOrg: 'Polda Metro Jaya / Mabes Polri',
          issueDate: '2023-05-15',
          expiryDate: isInactive ? '2024-05-15' : '2028-05-15',
          status: isInactive ? 'EXPIRED' : 'VALID',
        },
      ],
      createdAt: '2023-01-01',
      updatedAt: '2026-01-01',
    });
  }

  return personnel;
}

export const initialPersonnel: Personnel[] = generateSimulatedDataset();

// GENERATE ASSIGNMENTS FOR THE SIMULATED FORCE
function generateSimulatedAssignments(personnel: Personnel[]): Assignment[] {
  const assignments: Assignment[] = [];
  const activeGuards = personnel.filter((p) => p.employmentStatus === 'ACTIVE');

  // Distribution target: Deploy 235 guards across the 6 locations
  // 100 guards remain on IDLE/Standby
  // 15 guards are INACTIVE
  // Total: 350
  const locationPlans = [
    { loc: initialLocations[0], proj: initialProjects[0], count: 45 }, // Menara Astra Main Lobby
    { loc: initialLocations[1], proj: initialProjects[0], count: 35 }, // Menara Astra Loading Dock
    { loc: initialLocations[2], proj: initialProjects[1], count: 40 }, // BCA Sentul Data Center
    { loc: initialLocations[3], proj: initialProjects[2], count: 40 }, // SCBD Pacific Place
    { loc: initialLocations[4], proj: initialProjects[3], count: 35 }, // Tanjung Priok Port
    { loc: initialLocations[5], proj: initialProjects[4], count: 40 }, // Mall Kelapa Gading
  ];

  let guardIndex = 4; // Reserve the 4 executive heads as unassigned command staff
  let asgCounter = 1;

  for (const plan of locationPlans) {
    for (let c = 0; c < plan.count; c++) {
      if (guardIndex >= activeGuards.length) break;
      const guard = activeGuards[guardIndex];
      guardIndex++;

      assignments.push({
        id: `asg-${asgCounter++}`,
        personnelId: guard.id,
        personnelName: guard.fullName,
        personnelNumber: guard.personnelNumber,
        personnelPhoto: guard.photoUrl,
        personnelPosition: guard.position,
        projectId: plan.proj.id,
        projectName: plan.proj.name,
        clientId: plan.loc.clientId,
        clientName: plan.loc.clientName,
        locationId: plan.loc.id,
        locationName: plan.loc.name,
        positionOnSite: c === 0 ? 'Site Commander (Danru)' : guard.position,
        startDate: plan.proj.startDate,
        endDate: plan.proj.endDate,
        status: 'ACTIVE',
        createdAt: plan.proj.startDate,
        updatedAt: plan.proj.startDate,
      });
    }
  }

  // Add a few historical completed assignments for placement history audit (PRD 4.3 F)
  assignments.push({
    id: `asg-hist-1`,
    personnelId: 'p-1',
    personnelName: 'Kolonel (Purn.) Hartono Sutanto',
    personnelNumber: 'JISS-001',
    personnelPhoto: initialPersonnel[0].photoUrl,
    personnelPosition: 'Chief Security (Danru Utama)',
    projectId: 'proj-6',
    projectName: 'SCBD Lot 28 Pop-up Event Security',
    clientId: 'client-3',
    clientName: 'PT Danayasa Arthatama (SCBD)',
    locationId: 'loc-4',
    locationName: 'SCBD Pacific Place Outer Perimeter',
    positionOnSite: 'Site Commander (Danru)',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    status: 'COMPLETED',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-30',
  });

  return assignments;
}

export const initialAssignments: Assignment[] = generateSimulatedAssignments(initialPersonnel);
