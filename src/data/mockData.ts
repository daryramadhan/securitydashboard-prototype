import { Personnel, Client, Project, Location, Assignment, OrgUnit, Qualification } from '@/types';

export const initialOrgUnits: OrgUnit[] = [
  { id: 'org-1', name: 'Executive Operations', parentUnitId: null, headPersonnelId: 'p-1' },
  { id: 'org-2', name: 'Commercial & Corporate Division', parentUnitId: 'org-1', headPersonnelId: 'p-2' },
  { id: 'org-3', name: 'Industrial & Maritime Division', parentUnitId: 'org-1', headPersonnelId: 'p-3' },
  { id: 'org-4', name: 'VIP Protection & Specialized Units', parentUnitId: 'org-1', headPersonnelId: 'p-4' },
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
];

export const initialLocations: Location[] = [
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

  // 1. Leadership Foundation (4 personnel: 3 Men, 1 Woman)
  personnel.push({
    id: 'p-1',
    personnelNumber: 'JISS-001',
    fullName: 'Kolonel (Purn.) Hartono Sutanto',
    photoUrl: maleAvatars[2],
    gender: 'MALE',
    phone: '+62 811-9001-001',
    email: 'hartono.sutanto@jiss.co.id',
    position: 'Chief Security Officer (CSO)',
    organizationalUnitId: 'org-1',
    organizationalUnitName: 'Executive Operations',
    supervisorId: null,
    supervisorName: null,
    employmentStatus: 'ACTIVE',
    joinDate: '2020-01-10',
    notes: 'Ex-military advisor, leads strategic agency operations and high-level client coordination.',
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
    position: 'Head of Commercial Security',
    organizationalUnitId: 'org-2',
    organizationalUnitName: 'Commercial & Corporate Division',
    supervisorId: 'p-1',
    supervisorName: 'Kolonel (Purn.) Hartono Sutanto',
    employmentStatus: 'ACTIVE',
    joinDate: '2021-04-15',
    notes: 'Oversees office towers, banking networks, and retail mall security contracts.',
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
    position: 'Head of Industrial & Port Operations',
    organizationalUnitId: 'org-3',
    organizationalUnitName: 'Industrial & Maritime Division',
    supervisorId: 'p-1',
    supervisorName: 'Kolonel (Purn.) Hartono Sutanto',
    employmentStatus: 'ACTIVE',
    joinDate: '2021-08-01',
    notes: 'Specializes in port security, logistics hubs, and bonded warehouse protection.',
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
    position: 'Head of VIP Protection & Special Units',
    organizationalUnitId: 'org-4',
    organizationalUnitName: 'VIP Protection & Specialized Units',
    supervisorId: 'p-1',
    supervisorName: 'Kolonel (Purn.) Hartono Sutanto',
    employmentStatus: 'ACTIVE',
    joinDate: '2022-02-01',
    notes: 'Ex-police escort commander. Leads dignitary close protection, K-9 handling, and escort services.',
    qualifications: [
      { id: 'q-5', personnelId: 'p-4', qualificationId: 'qual-1', qualificationName: 'Gada Utama', issuingOrg: 'Mabes Polri', issueDate: '2022-03-01', expiryDate: '2028-03-01', status: 'VALID' }
    ],
    createdAt: '2022-02-01',
    updatedAt: '2026-03-01',
  });

  // 2. Generate remaining 66 Women (to reach exactly 67 Women)
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
        ? 'VIP Protection & Specialized Units'
        : unitId === 'org-3'
        ? 'Industrial & Maritime Division'
        : 'Commercial & Corporate Division';

    const supervisorId = unitId === 'org-4' ? 'p-4' : unitId === 'org-3' ? 'p-3' : 'p-2';
    const supervisorName =
      unitId === 'org-4'
        ? 'Kompol (Purn.) Siti Nurhaliza'
        : unitId === 'org-3'
        ? 'Kapten (Purn.) Darmawan Prasetyo'
        : 'Mayor (Purn.) Wahyu Sudrajat';

    const pos = i % 8 === 0
      ? 'Access Control & Lobby Specialist'
      : i % 7 === 0
      ? 'VIP Close Protection Officer'
      : i % 5 === 0
      ? 'CCTV & Surveillance Specialist'
      : i % 6 === 0
      ? 'Shift Supervisor'
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
      supervisorId,
      supervisorName,
      employmentStatus: isInactive ? 'INACTIVE' : 'ACTIVE',
      joinDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
      notes: isInactive ? 'Resigned - contract completed.' : 'Active certified security personnel.',
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

  // 3. Generate remaining 280 Men (to reach exactly 283 Men)
  for (let i = 0; i < 280; i++) {
    const idNum = 71 + i;
    const padId = String(idNum).padStart(3, '0');
    const fn = maleFirstNames[i % maleFirstNames.length];
    const ln = maleLastNames[(i * 7 + 2) % maleLastNames.length];
    const fullName = `${fn} ${ln}`;
    const avatar = maleAvatars[i % maleAvatars.length];

    const unitId = i % 5 === 0 ? 'org-4' : i % 2 === 0 ? 'org-2' : 'org-3';
    const unitName =
      unitId === 'org-4'
        ? 'VIP Protection & Specialized Units'
        : unitId === 'org-3'
        ? 'Industrial & Maritime Division'
        : 'Commercial & Corporate Division';

    const supervisorId = unitId === 'org-4' ? 'p-4' : unitId === 'org-3' ? 'p-3' : 'p-2';
    const supervisorName =
      unitId === 'org-4'
        ? 'Kompol (Purn.) Siti Nurhaliza'
        : unitId === 'org-3'
        ? 'Kapten (Purn.) Darmawan Prasetyo'
        : 'Mayor (Purn.) Wahyu Sudrajat';

    const pos = standardPositions[i % standardPositions.length];

    // 12 men inactive (out of 283) -> Total inactive = 3 + 12 = 15
    const isInactive = i > 0 && i % 24 === 0;

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
      supervisorId,
      supervisorName,
      employmentStatus: isInactive ? 'INACTIVE' : 'ACTIVE',
      joinDate: `2023-${String((i % 12) + 1).padStart(2, '0')}-01`,
      notes: isInactive ? 'Resigned - contract period ended.' : 'Active certified field officer.',
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
    personnelPosition: 'Chief Security Officer (CSO)',
    projectId: 'proj-6',
    projectName: 'SCBD Lot 28 Pop-up Event Security',
    clientId: 'client-3',
    clientName: 'PT Danayasa Arthatama (SCBD)',
    locationId: 'loc-4',
    locationName: 'SCBD Pacific Place Outer Perimeter',
    positionOnSite: 'Special Operations Director',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    status: 'COMPLETED',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-30',
  });

  return assignments;
}

export const initialAssignments: Assignment[] = generateSimulatedAssignments(initialPersonnel);
