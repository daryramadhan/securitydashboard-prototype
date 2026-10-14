'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Personnel,
  Client,
  Project,
  Location,
  Assignment,
  OrgUnit,
  UserRole,
  DashboardMetrics,
} from '@/types';
import {
  initialPersonnel,
  initialClients,
  initialProjects,
  initialLocations,
  initialAssignments,
  initialOrgUnits,
} from '@/data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  personnelList: Personnel[];
  clients: Client[];
  projects: Project[];
  locations: Location[];
  assignments: Assignment[];
  orgUnits: OrgUnit[];

  // Metrics
  metrics: DashboardMetrics;

  // Personnel actions
  addPersonnel: (data: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>) => Personnel;
  updatePersonnel: (id: string, data: Partial<Personnel>) => void;
  toggleEmploymentStatus: (id: string) => void;

  // Assignment actions
  assignPersonnel: (params: {
    personnelId: string;
    projectId: string;
    locationId: string;
    startDate: string;
    endDate?: string | null;
    positionOnSite?: string;
  }) => void;
  closeAssignment: (assignmentId: string, endDate?: string) => void;

  // Project & Location actions
  addProject: (data: Omit<Project, 'id'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  addLocation: (data: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, data: Partial<Location>) => void;

  // Helpers
  getActiveAssignmentForPersonnel: (personnelId: string) => Assignment | undefined;
  getAssignmentsForLocation: (locationId: string) => Assignment[];
  getAssignmentsHistoryForPersonnel: (personnelId: string) => Assignment[];
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'PT_JISS_DASHBOARD_DATA_V2';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoaded, setIsLoaded] = useState(false);

  const [personnelList, setPersonnelList] = useState<Personnel[]>(initialPersonnel);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>(initialOrgUnits);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.personnelList) setPersonnelList(parsed.personnelList);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.locations) setLocations(parsed.locations);
        if (parsed.assignments) setAssignments(parsed.assignments);
        if (parsed.orgUnits) setOrgUnits(parsed.orgUnits);
        if (parsed.role) setRole(parsed.role);
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          personnelList,
          clients,
          projects,
          locations,
          assignments,
          orgUnits,
          role,
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [personnelList, clients, projects, locations, assignments, orgUnits, role, isLoaded]);

  // Derived helpers according to PRD Section 4.1 A & Section 7 Rules
  const getActiveAssignmentForPersonnel = (personnelId: string): Assignment | undefined => {
    return assignments.find((a) => a.personnelId === personnelId && a.status === 'ACTIVE');
  };

  const getAssignmentsForLocation = (locationId: string): Assignment[] => {
    return assignments.filter((a) => a.locationId === locationId && a.status === 'ACTIVE');
  };

  const getAssignmentsHistoryForPersonnel = (personnelId: string): Assignment[] => {
    return assignments
      .filter((a) => a.personnelId === personnelId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  // STRICT COUNTING DEFINITIONS (PRD Section 4.1 A & Section 7):
  // - Total personnel: All registered personnel records, including inactive personnel.
  // - Active personnel: Employment status == 'ACTIVE'
  // - Inactive personnel: Employment status == 'INACTIVE'
  // - Deployed personnel: Active personnel with at least one active assignment (counted once)
  // - Idle personnel: Active personnel with NO active assignment
  // - Inactive personnel are NEVER counted as idle.
  const activePersonnelList = personnelList.filter((p) => p.employmentStatus === 'ACTIVE');
  const inactivePersonnelList = personnelList.filter((p) => p.employmentStatus === 'INACTIVE');

  const deployedPersonnelIds = new Set(
    assignments
      .filter((a) => a.status === 'ACTIVE')
      .map((a) => a.personnelId)
  );

  const deployedCount = activePersonnelList.filter((p) => deployedPersonnelIds.has(p.id)).length;
  const idleCount = activePersonnelList.filter((p) => !deployedPersonnelIds.has(p.id)).length;

  const maleCount = personnelList.filter((p) => p.gender === 'MALE').length;
  const femaleCount = personnelList.filter((p) => p.gender === 'FEMALE').length;

  const metrics: DashboardMetrics = {
    totalPersonnel: personnelList.length,
    activePersonnel: activePersonnelList.length,
    inactivePersonnel: inactivePersonnelList.length,
    malePersonnel: maleCount,
    femalePersonnel: femaleCount,
    deployedPersonnel: deployedCount,
    idlePersonnel: idleCount,
  };

  // PERSONNEL ACTIONS
  const addPersonnel = (data: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Personnel => {
    const newId = `p-${Date.now()}`;
    const now = new Date().toISOString();
    const newPersonnel: Personnel = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setPersonnelList((prev) => [newPersonnel, ...prev]);
    return newPersonnel;
  };

  const updatePersonnel = (id: string, data: Partial<Personnel>) => {
    setPersonnelList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
  };

  const toggleEmploymentStatus = (id: string) => {
    setPersonnelList((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStatus = p.employmentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...p, employmentStatus: newStatus, updatedAt: new Date().toISOString() };
      })
    );
  };

  // ASSIGNMENT ACTIONS (PRD Section 4.5 C & User choice: Single active assignment per personnel)
  const assignPersonnel = ({
    personnelId,
    projectId,
    locationId,
    startDate,
    endDate,
    positionOnSite,
  }: {
    personnelId: string;
    projectId: string;
    locationId: string;
    startDate: string;
    endDate?: string | null;
    positionOnSite?: string;
  }) => {
    const person = personnelList.find((p) => p.id === personnelId);
    const proj = projects.find((p) => p.id === projectId);
    const loc = locations.find((l) => l.id === locationId);
    if (!person || !proj || !loc) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Close any currently active assignment for this person to preserve history
    setAssignments((prev) => {
      const updated = prev.map((a) => {
        if (a.personnelId === personnelId && a.status === 'ACTIVE') {
          return {
            ...a,
            status: 'COMPLETED' as const,
            endDate: a.endDate || todayStr,
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      });

      const newAssignment: Assignment = {
        id: `asg-${Date.now()}`,
        personnelId,
        personnelName: person.fullName,
        personnelNumber: person.personnelNumber,
        personnelPhoto: person.photoUrl,
        personnelPosition: person.position,
        projectId: proj.id,
        projectName: proj.name,
        clientId: proj.clientId,
        clientName: proj.clientName,
        locationId: loc.id,
        locationName: loc.name,
        positionOnSite: positionOnSite || person.position,
        startDate,
        endDate: endDate || null,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return [newAssignment, ...updated];
    });
  };

  const closeAssignment = (assignmentId: string, endDate?: string) => {
    const todayStr = endDate || new Date().toISOString().split('T')[0];
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: 'COMPLETED',
              endDate: todayStr,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
  };

  // PROJECT & LOCATION ACTIONS
  const addProject = (data: Omit<Project, 'id'>) => {
    const newProj: Project = { ...data, id: `proj-${Date.now()}` };
    setProjects((prev) => [newProj, ...prev]);
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const addLocation = (data: Omit<Location, 'id'>) => {
    const newLoc: Location = { ...data, id: `loc-${Date.now()}` };
    setLocations((prev) => [newLoc, ...prev]);
  };

  const updateLocation = (id: string, data: Partial<Location>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const resetToDefaultData = () => {
    setPersonnelList(initialPersonnel);
    setClients(initialClients);
    setProjects(initialProjects);
    setLocations(initialLocations);
    setAssignments(initialAssignments);
    setOrgUnits(initialOrgUnits);
    setRole('ADMIN');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        personnelList,
        clients,
        projects,
        locations,
        assignments,
        orgUnits,
        metrics,
        addPersonnel,
        updatePersonnel,
        toggleEmploymentStatus,
        assignPersonnel,
        closeAssignment,
        addProject,
        updateProject,
        addLocation,
        updateLocation,
        getActiveAssignmentForPersonnel,
        getAssignmentsForLocation,
        getAssignmentsHistoryForPersonnel,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
