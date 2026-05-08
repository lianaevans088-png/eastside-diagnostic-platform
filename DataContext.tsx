import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Lead, ReportStatus, Role } from '../types';
import { mockLeads, products } from '../lib/mockData';
import { makeId } from '../lib/helpers';
import { dataMode } from '../lib/supabase';

interface DataContextValue {
  role: Role;
  setRole: (role: Role) => void;
  leads: Lead[];
  products: typeof products;
  dataMode: string;
  getLead: (id: string) => Lead | undefined;
  updateLead: (id: string, updater: (lead: Lead) => Lead) => void;
  updateLeadStatus: (id: string, status: ReportStatus, actor?: string, comment?: string) => void;
  resetMockData: () => void;
}
const DataContext = createContext<DataContextValue | null>(null);
const STORAGE_KEY = 'eastside_diagnostic_platform_leads_v1';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('manager');
  const [leads, setLeads] = useState<Lead[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return mockLeads;
    try { return JSON.parse(stored) as Lead[]; } catch { return mockLeads; }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); }, [leads]);

  const value = useMemo<DataContextValue>(() => ({
    role,
    setRole,
    leads,
    products,
    dataMode,
    getLead: (id:string) => leads.find(l => l.id === id),
    updateLead: (id:string, updater:(lead:Lead)=>Lead) => {
      setLeads(current => current.map(lead => lead.id === id ? { ...updater(lead), updatedAt: new Date().toISOString() } : lead));
    },
    updateLeadStatus: (id:string, status:ReportStatus, actor = 'Система', comment = '') => {
      setLeads(current => current.map(lead => lead.id !== id ? lead : ({
        ...lead,
        status,
        report: { ...lead.report, status, updatedAt: new Date().toISOString() },
        statusHistory: [...lead.statusHistory, { id: makeId('hist'), status, date: new Date().toISOString(), actor, comment }],
        updatedAt: new Date().toISOString()
      })));
    },
    resetMockData: () => setLeads(mockLeads)
  }), [role, leads]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
