import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Concurso {
  id: string;
  // Dados extraídos do CSV
  fonte?: string;
  source: string;
  esfera?: string;
  modalidade?: string;
  status?: string;
  escolaridade?: string;
  orgao?: string;
  institution: string;
  uf?: string;
  location: string;
  banca?: string;
  board: string;
  cargos?: string;
  positions?: string;
  vagas?: string;
  vacancies: string;
  salario?: string;
  salary: string;
  fim_inscricoes?: string;
  registration_end: string;
  periodo_isencao?: string;
  exemption_period: string;
  data_prova?: string;
  exam_date: string;
  etapas?: string;
  disciplinas?: string;
  subjects?: string;
  link: string;
  duplicadas?: string;
  // Estado interno do usuário
  interest_status: 'none' | 'interested' | 'ignored';
  is_favorite?: boolean;
  is_enrolled: boolean;
  score?: number;
  calculatedScore?: number;
  exam_location?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

// Dados mockados para visualização
const MOCK_CONCURSOS: Concurso[] = [
  {
    id: '1',
    source: 'PCI Concursos',
    fonte: 'PCI Concursos',
    esfera: 'Federal e Nacional',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Superior',
    institution: 'Tribunal Regional Federal da 3ª Região',
    orgao: 'Tribunal Regional Federal da 3ª Região',
    location: 'SP',
    uf: 'SP',
    board: 'FCC',
    banca: 'FCC',
    positions: 'Analista Judiciário - Área Administrativa, Analista Judiciário - Área Judiciária',
    cargos: 'Analista Judiciário - Área Administrativa, Analista Judiciário - Área Judiciária',
    vacancies: '120 + CR',
    vagas: '120 + CR',
    salary: 'R$ 13.994,78',
    salario: 'R$ 13.994,78',
    registration_end: '15/04/2026',
    fim_inscricoes: '15/04/2026',
    exemption_period: '01/04/2026 a 05/04/2026',
    periodo_isencao: '01/04/2026 a 05/04/2026',
    exam_date: '25/05/2026',
    data_prova: '25/05/2026',
    link: 'https://www.concursosfcc.com.br',
    etapas: 'Prova Objetiva, Prova Discursiva, TAF',
    disciplinas: 'Português, Raciocínio Lógico, Direito Constitucional, Direito Administrativo',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '2',
    source: 'Estratégia Concursos',
    fonte: 'Estratégia Concursos',
    esfera: 'Estadual e Controle',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Superior',
    institution: 'Secretaria da Fazenda do Estado de São Paulo',
    orgao: 'Secretaria da Fazenda do Estado de São Paulo',
    location: 'SP',
    uf: 'SP',
    board: 'VUNESP',
    banca: 'VUNESP',
    positions: 'Agente Fiscal de Rendas',
    cargos: 'Agente Fiscal de Rendas',
    vacancies: '500',
    vagas: '500',
    salary: 'R$ 25.568,00',
    salario: 'R$ 25.568,00',
    registration_end: '30/04/2026',
    fim_inscricoes: '30/04/2026',
    exemption_period: '10/04/2026 a 15/04/2026',
    periodo_isencao: '10/04/2026 a 15/04/2026',
    exam_date: '15/06/2026',
    data_prova: '15/06/2026',
    link: 'https://www.vunesp.com.br',
    etapas: 'Prova Objetiva, Prova Discursiva',
    disciplinas: 'Contabilidade, Legislação Tributária, Auditoria, Direito Tributário',
    interest_status: 'interested',
    is_favorite: true,
    is_enrolled: false,
  },
  {
    id: '3',
    source: 'PCI Concursos',
    fonte: 'PCI Concursos',
    esfera: 'Militar e Segurança',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Médio',
    institution: 'Polícia Militar do Estado de Minas Gerais',
    orgao: 'Polícia Militar do Estado de Minas Gerais',
    location: 'MG',
    uf: 'MG',
    board: 'FUMARC',
    banca: 'FUMARC',
    positions: 'Soldado PM',
    cargos: 'Soldado PM',
    vacancies: '3.000',
    vagas: '3.000',
    salary: 'R$ 5.769,51',
    salario: 'R$ 5.769,51',
    registration_end: '20/03/2026',
    fim_inscricoes: '20/03/2026',
    exemption_period: '',
    periodo_isencao: '',
    exam_date: '27/04/2026',
    data_prova: '27/04/2026',
    link: 'https://www.fumarc.com.br',
    etapas: 'Prova Objetiva, TAF, Exames Médicos, Investigação Social',
    disciplinas: 'Português, Matemática, Geografia, História, Legislação',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '4',
    source: 'Estratégia Concursos',
    fonte: 'Estratégia Concursos',
    esfera: 'Municipal (Prefeituras, Câmaras e Saúde Local)',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Previsto',
    escolaridade: 'Superior',
    institution: 'Prefeitura de Maceió - AL',
    orgao: 'Prefeitura de Maceió - AL',
    location: 'AL',
    uf: 'AL',
    board: 'COPEVE',
    banca: 'COPEVE',
    positions: 'Auditor Municipal, Analista de Controle Interno',
    cargos: 'Auditor Municipal, Analista de Controle Interno',
    vacancies: '45',
    vagas: '45',
    salary: 'R$ 8.500,00',
    salario: 'R$ 8.500,00',
    registration_end: 'A Definir',
    fim_inscricoes: 'A Definir',
    exemption_period: 'A Definir',
    periodo_isencao: 'A Definir',
    exam_date: 'A Definir',
    data_prova: 'A Definir',
    link: 'https://www.maceio.al.gov.br',
    etapas: 'Prova Objetiva, Prova Discursiva, Títulos',
    disciplinas: 'Português, Raciocínio Lógico, Contabilidade Pública, AFO',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '5',
    source: 'PCI Concursos',
    fonte: 'PCI Concursos',
    esfera: 'Judiciário e Defensoria',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Superior',
    institution: 'Ministério Público do Estado do Rio de Janeiro',
    orgao: 'Ministério Público do Estado do Rio de Janeiro',
    location: 'RJ',
    uf: 'RJ',
    board: 'FGV',
    banca: 'FGV',
    positions: 'Promotor de Justiça',
    cargos: 'Promotor de Justiça',
    vacancies: '80',
    vagas: '80',
    salary: 'R$ 35.462,22',
    salario: 'R$ 35.462,22',
    registration_end: '10/04/2026',
    fim_inscricoes: '10/04/2026',
    exemption_period: '01/04/2026 a 03/04/2026',
    periodo_isencao: '01/04/2026 a 03/04/2026',
    exam_date: '18/05/2026',
    data_prova: '18/05/2026',
    link: 'https://www.fgv.br',
    etapas: 'Prova Objetiva, Prova Oral, Títulos',
    disciplinas: 'Direito Constitucional, Direito Penal, Direito Civil, Direito Processual',
    interest_status: 'none',
    is_favorite: true,
    is_enrolled: false,
  },
  {
    id: '6',
    source: 'Gran Cursos',
    fonte: 'Gran Cursos',
    esfera: 'Federal e Nacional',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Autorizado',
    escolaridade: 'Superior',
    institution: 'Instituto Nacional do Seguro Social - INSS',
    orgao: 'Instituto Nacional do Seguro Social - INSS',
    location: 'BR',
    uf: 'BR',
    board: 'CEBRASPE',
    banca: 'CEBRASPE',
    positions: 'Analista do Seguro Social, Técnico do Seguro Social',
    cargos: 'Analista do Seguro Social, Técnico do Seguro Social',
    vacancies: '1.000 + CR',
    vagas: '1.000 + CR',
    salary: 'R$ 8.357,04',
    salario: 'R$ 8.357,04',
    registration_end: 'A Definir',
    fim_inscricoes: 'A Definir',
    exemption_period: '',
    periodo_isencao: '',
    exam_date: 'A Definir',
    data_prova: 'A Definir',
    link: 'https://www.gov.br/inss',
    etapas: 'Prova Objetiva',
    disciplinas: 'Português, Raciocínio Lógico, Informática, Direito Previdenciário',
    interest_status: 'interested',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '7',
    source: 'Direção Concursos',
    fonte: 'Direção Concursos',
    esfera: 'Universitária e Educação',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Superior',
    institution: 'Universidade Federal do Rio Grande do Sul',
    orgao: 'Universidade Federal do Rio Grande do Sul',
    location: 'RS',
    uf: 'RS',
    board: 'UFRGS',
    banca: 'UFRGS',
    positions: 'Professor Adjunto, Técnico-Administrativo',
    cargos: 'Professor Adjunto, Técnico-Administrativo',
    vacancies: '67',
    vagas: '67',
    salary: 'R$ 10.481,64',
    salario: 'R$ 10.481,64',
    registration_end: '25/03/2026',
    fim_inscricoes: '25/03/2026',
    exemption_period: '',
    periodo_isencao: '',
    exam_date: '03/05/2026',
    data_prova: '03/05/2026',
    link: 'https://www.ufrgs.br/concursos',
    etapas: 'Prova Objetiva, Prova Didática, Títulos',
    disciplinas: 'Conhecimentos Específicos',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '8',
    source: 'PCI Concursos',
    fonte: 'PCI Concursos',
    esfera: 'Estadual e Controle',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Comissão Formada',
    escolaridade: 'Superior',
    institution: 'Tribunal de Contas do Estado de Goiás',
    orgao: 'Tribunal de Contas do Estado de Goiás',
    location: 'GO',
    uf: 'GO',
    board: 'A Definir',
    banca: 'A Definir',
    positions: 'Auditor de Controle Externo',
    cargos: 'Auditor de Controle Externo',
    vacancies: '30',
    vagas: '30',
    salary: 'R$ 15.800,00',
    salario: 'R$ 15.800,00',
    registration_end: 'A Definir',
    fim_inscricoes: 'A Definir',
    exemption_period: '',
    periodo_isencao: '',
    exam_date: 'A Definir',
    data_prova: 'A Definir',
    link: 'https://www.tce.go.gov.br',
    etapas: 'Prova Objetiva, Prova Discursiva, TAF',
    disciplinas: 'Auditoria Governamental, Contabilidade Pública, AFO, Controle Externo',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '9',
    source: 'Estratégia Concursos',
    fonte: 'Estratégia Concursos',
    esfera: 'Legislativo Estadual e Distrital',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Superior',
    institution: 'Assembleia Legislativa do Estado de São Paulo - ALESP',
    orgao: 'Assembleia Legislativa do Estado de São Paulo - ALESP',
    location: 'SP',
    uf: 'SP',
    board: 'FCC',
    banca: 'FCC',
    positions: 'Agente Legislativo, Procurador',
    cargos: 'Agente Legislativo, Procurador',
    vacancies: '150',
    vagas: '150',
    salary: 'R$ 18.500,00',
    salario: 'R$ 18.500,00',
    registration_end: '05/04/2026',
    fim_inscricoes: '05/04/2026',
    exemption_period: '20/03/2026 a 25/03/2026',
    periodo_isencao: '20/03/2026 a 25/03/2026',
    exam_date: '10/05/2026',
    data_prova: '10/05/2026',
    link: 'https://www.al.sp.gov.br',
    etapas: 'Prova Objetiva, Prova Discursiva',
    disciplinas: 'Português, Raciocínio Lógico, Direito Constitucional, Processo Legislativo',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '10',
    source: 'Gran Cursos',
    fonte: 'Gran Cursos',
    esfera: 'Federal e Nacional',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Solicitado',
    escolaridade: 'Superior',
    institution: 'Banco Central do Brasil',
    orgao: 'Banco Central do Brasil',
    location: 'BR',
    uf: 'BR',
    board: 'CEBRASPE',
    banca: 'CEBRASPE',
    positions: 'Analista - Área 1 (Economia), Analista - Área 2 (TI)',
    cargos: 'Analista - Área 1 (Economia), Analista - Área 2 (TI)',
    vacancies: '300',
    vagas: '300',
    salary: 'R$ 21.000,00',
    salario: 'R$ 21.000,00',
    registration_end: 'A Definir',
    fim_inscricoes: 'A Definir',
    exemption_period: '',
    periodo_isencao: '',
    exam_date: 'A Definir',
    data_prova: 'A Definir',
    link: 'https://www.bcb.gov.br',
    etapas: 'Prova Objetiva, Prova Discursiva',
    disciplinas: 'Economia, Finanças, Contabilidade, Estatística',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '11',
    source: 'PCI Concursos',
    fonte: 'PCI Concursos',
    esfera: 'Militar e Segurança',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Médio',
    institution: 'Corpo de Bombeiros Militar do Distrito Federal',
    orgao: 'Corpo de Bombeiros Militar do Distrito Federal',
    location: 'DF',
    uf: 'DF',
    board: 'IADES',
    banca: 'IADES',
    positions: 'Soldado Bombeiro Militar',
    cargos: 'Soldado Bombeiro Militar',
    vacancies: '200',
    vagas: '200',
    salary: 'R$ 7.328,00',
    salario: 'R$ 7.328,00',
    registration_end: '12/03/2026',
    fim_inscricoes: '12/03/2026',
    exemption_period: '',
    periodo_isencao: '',
    exam_date: '19/04/2026',
    data_prova: '19/04/2026',
    link: 'https://www.cbm.df.gov.br',
    etapas: 'Prova Objetiva, TAF, Exames Médicos',
    disciplinas: 'Português, Matemática, Química, Física',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
  {
    id: '12',
    source: 'Direção Concursos',
    fonte: 'Direção Concursos',
    esfera: 'Conselhos Profissionais',
    modalidade: 'Concurso Público (Efetivo)',
    status: 'Aberto',
    escolaridade: 'Técnico',
    institution: 'Conselho Regional de Engenharia e Agronomia de São Paulo',
    orgao: 'Conselho Regional de Engenharia e Agronomia de São Paulo',
    location: 'SP',
    uf: 'SP',
    board: 'Quadrix',
    banca: 'Quadrix',
    positions: 'Agente de Fiscalização, Analista',
    cargos: 'Agente de Fiscalização, Analista',
    vacancies: '25',
    vagas: '25',
    salary: 'R$ 6.200,00',
    salario: 'R$ 6.200,00',
    registration_end: '18/03/2026',
    fim_inscricoes: '18/03/2026',
    exemption_period: '',
    periodo_isencao: '',
    exam_date: '12/04/2026',
    data_prova: '12/04/2026',
    link: 'https://www.crea-sp.org.br',
    etapas: 'Prova Objetiva',
    disciplinas: 'Português, Legislação, Conhecimentos Específicos',
    interest_status: 'none',
    is_favorite: false,
    is_enrolled: false,
  },
];

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
  photoURL?: string | null;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  notifyInterested: boolean;
  notifyNewExams: boolean;
  notifyDeadlines: boolean;
  deadlineThresholdDays: number;
}

interface ConcursoStore {
  user: User | null;
  concursos: Concurso[];
  scoringRules: ScoringRule[];
  userProfileScoring: UserProfileScoring;
  notificationSettings: NotificationSettings;
  lastSeenExamIds: string[];
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
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  setLastSeenExamIds: (ids: string[]) => void;
}

export const useConcursoStore = create<ConcursoStore>()(
  persist(
    (set) => ({
      user: null,
      concursos: MOCK_CONCURSOS,
      scoringRules: [],
      userProfileScoring: {
        ufs_desejadas: {},
        esferas_preferidas: {},
        modalidades_preferidas: {},
        escolaridades_preferidas: {},
      },
      notificationSettings: {
        emailEnabled: false,
        pushEnabled: false,
        notifyInterested: true,
        notifyNewExams: true,
        notifyDeadlines: true,
        deadlineThresholdDays: 3,
      },
      lastSeenExamIds: [],
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
      updateNotificationSettings: (updates) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...updates }
      })),
      setLastSeenExamIds: (ids) => set({ lastSeenExamIds: ids }),
    }),
    {
      name: 'concursos-storage',
      merge: (persistedState: any, currentState) => {
        // Se não há concursos persistidos ou está vazio, usar os dados mockados
        const concursos = persistedState?.concursos?.length > 0 
          ? persistedState.concursos 
          : MOCK_CONCURSOS;
        
        return {
          ...currentState,
          ...persistedState,
          concursos,
        };
      },
    }
  )
);
