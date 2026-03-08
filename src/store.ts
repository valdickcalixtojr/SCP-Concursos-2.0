import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Concurso {
  id: string;
  source: string;
  institution: string;
  location: string;
  board: string;
  vacancies: string;
  salary: string;
  registration_end: string;
  exemption_period: string;
  exam_date: string;
  link: string;
  positions?: string;
  subjects?: string;
  esfera?: string;
  modalidade?: string;
  status?: string;
  etapas?: string;
  duplicadas?: string;
  interest_status: 'none' | 'interested' | 'ignored';
  is_favorite?: boolean;
  is_enrolled: boolean;
  exam_location?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface ScoringRule {
  id: string;
  field: 'salary' | 'vacancies' | 'board' | 'positions' | 'institution' | 'location';
  condition: 'contains' | 'equals' | 'greater_than' | 'less_than';
  value: string;
  points: number;
}

export interface UserProfileScoring {
  ufs_desejadas: Record<string, number>;
  esferas_preferidas: Record<string, number>;
  modalidades_preferidas: Record<string, number>;
  escolaridades_preferidas: Record<string, number>;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface ConcursoStore {
  user: User | null;
  concursos: Concurso[];
  scoringRules: ScoringRule[];
  userProfileScoring: UserProfileScoring;
  setUser: (user: User | null) => void;
  setConcursos: (concursos: Concurso[]) => void;
  updateConcurso: (id: string, updates: Partial<Concurso>) => void;
  markInterest: (id: string, status: 'interested' | 'ignored' | 'none') => void;
  toggleFavorite: (id: string) => void;
  setScoringRules: (rules: ScoringRule[]) => void;
  addScoringRule: (rule: ScoringRule) => void;
  removeScoringRule: (id: string) => void;
  updateScoringRule: (id: string, rule: Partial<ScoringRule>) => void;
  updateUserProfileScoring: (updates: Partial<UserProfileScoring>) => void;
}

export const useConcursoStore = create<ConcursoStore>()(
  persist(
    (set) => ({
      user: null,
      concursos: [],
      scoringRules: [],
      userProfileScoring: {
        ufs_desejadas: {},
        esferas_preferidas: {},
        modalidades_preferidas: {},
        escolaridades_preferidas: {},
      },
      setUser: (user) => set({ user }),
      setConcursos: (concursos) => set({ concursos }),
      updateConcurso: (id, updates) =>
        set((state) => ({
          concursos: state.concursos.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      markInterest: (id, status) =>
        set((state) => ({
          concursos: state.concursos.map((c) =>
            c.id === id ? { ...c, interest_status: status } : c
          ),
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          concursos: state.concursos.map((c) =>
            c.id === id ? { ...c, is_favorite: !c.is_favorite } : c
          ),
        })),
      setScoringRules: (rules) => set({ scoringRules: rules }),
      addScoringRule: (rule) => set((state) => ({ scoringRules: [...state.scoringRules, rule] })),
      removeScoringRule: (id) => set((state) => ({ scoringRules: state.scoringRules.filter((r) => r.id !== id) })),
      updateScoringRule: (id, rule) => set((state) => ({
        scoringRules: state.scoringRules.map((r) => r.id === id ? { ...r, ...rule } : r)
      })),
      updateUserProfileScoring: (updates) => set((state) => ({
        userProfileScoring: { ...state.userProfileScoring, ...updates }
      })),
    }),
    {
      name: 'concursos-storage',
    }
  )
);
