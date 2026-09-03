// src/stores/openPlayStore.ts
import { create } from 'zustand';
import type {
  OpenPlaySession,
  OpenPlayPlayer,
  OpenPlaySessionStats,
  CreateOpenPlaySessionPayload,
  UpdateOpenPlaySessionPayload,
} from '@/types';
import { openPlayService } from '@/services/openPlayService';

interface OpenPlayStoreState {
  sessions: OpenPlaySession[];
  loadingSessions: boolean;
  selectedSession: OpenPlaySession | null;
  loadingSelectedSession: boolean;
  error: string | null;

  adminSessions: OpenPlaySession[];
  loadingAdminSessions: boolean;
  players: OpenPlayPlayer[];
  loadingPlayers: boolean;
  stats: OpenPlaySessionStats | null;

  loadUpcomingSessions: () => Promise<void>;
  loadSession: (id: string) => Promise<OpenPlaySession | null>;
  setSelectedSession: (session: OpenPlaySession | null) => void;

  adminLoadSessions: () => Promise<void>;
  adminCreateSession: (payload: CreateOpenPlaySessionPayload) => Promise<OpenPlaySession>;
  adminUpdateSession: (id: string, payload: UpdateOpenPlaySessionPayload) => Promise<OpenPlaySession>;
  adminDeleteSession: (id: string) => Promise<void>;
  adminLoadPlayers: (id: string) => Promise<void>;
  adminLoadStats: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useOpenPlayStore = create<OpenPlayStoreState>((set) => ({
  sessions: [],
  loadingSessions: false,
  selectedSession: null,
  loadingSelectedSession: false,
  error: null,

  adminSessions: [],
  loadingAdminSessions: false,
  players: [],
  loadingPlayers: false,
  stats: null,

  loadUpcomingSessions: async () => {
    set({ loadingSessions: true, error: null });
    try {
      const sessions = await openPlayService.getUpcomingSessions();
      set({ sessions, loadingSessions: false });
    } catch (err) {
      set({
        loadingSessions: false,
        error: err instanceof Error ? err.message : 'Failed to load Open Play sessions',
      });
    }
  },

  loadSession: async (id) => {
    set({ loadingSelectedSession: true });
    try {
      const session = await openPlayService.getSession(id);
      set({ selectedSession: session, loadingSelectedSession: false });
      return session;
    } catch {
      set({ selectedSession: null, loadingSelectedSession: false });
      return null;
    }
  },

  setSelectedSession: (session) => set({ selectedSession: session }),

  adminLoadSessions: async () => {
    set({ loadingAdminSessions: true, error: null });
    try {
      const adminSessions = await openPlayService.adminGetAllSessions();
      set({ adminSessions, loadingAdminSessions: false });
    } catch (err) {
      set({
        loadingAdminSessions: false,
        error: err instanceof Error ? err.message : 'Failed to load sessions',
      });
    }
  },

  adminCreateSession: async (payload) => {
    const session = await openPlayService.adminCreateSession(payload);
    set((state) => ({ adminSessions: [session, ...state.adminSessions] }));
    return session;
  },

  adminUpdateSession: async (id, payload) => {
    const session = await openPlayService.adminUpdateSession(id, payload);
    set((state) => ({
      adminSessions: state.adminSessions.map((s) => (s.id === id ? session : s)),
    }));
    return session;
  },

  adminDeleteSession: async (id) => {
    await openPlayService.adminDeleteSession(id);
    set((state) => ({
      adminSessions: state.adminSessions.filter((s) => s.id !== id),
    }));
  },

  adminLoadPlayers: async (id) => {
    set({ loadingPlayers: true });
    try {
      const players = await openPlayService.adminGetPlayers(id);
      set({ players, loadingPlayers: false });
    } catch (err) {
      set({
        loadingPlayers: false,
        error: err instanceof Error ? err.message : 'Failed to load players',
      });
    }
  },

  adminLoadStats: async (id) => {
    try {
      const stats = await openPlayService.adminGetStats(id);
      set({ stats });
    } catch {
      set({ stats: null });
    }
  },

  clearError: () => set({ error: null }),
}));