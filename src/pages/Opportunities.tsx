import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowUp, ArrowDown, ArrowUpDown, Download, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import { useConcursoStore, Concurso } from '../store';
import { CSVUpload } from '../components/CSVUpload';
import { ConcursoCard } from '../components/ConcursoCard';
import { calculateScore } from '../utils/scoring';
import { getEditalStatus } from '../utils/concursoUtils';
import { fetchGlobalConcursos } from '../services/firebaseSync';
import clsx from 'clsx';
import Papa from 'papaparse';

type SortKey = keyof Concurso | 'status' | 'score';

export default function Opportunities() {
  const { concursos, scoringRules, userProfileScoring, markInterest, toggleFavorite } = useConcursoStore();
  const [filter, setFilter] = useState('');
  const [ufFilter, setUfFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [esferaFilter, setEsferaFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    uf: '',
    status: '',
    esfera: '',
    modalidade: ''
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(50);

  const handleDownload = () => {
    const dataToExport = processedConcursos.map(c => ({
      Fonte: c.source,
      Esfera: c.esfera,
      Modalidade: c.modalidade,
      Status: c.status,
      Orgao: c.institution,
      UF: c.location,
      Banca: c.board,
      Cargos: c.positions,
      Vagas: c.vacancies,
      Salario: c.salary,
      Fim_Inscricoes: c.registration_end,
      Periodo_Isencao: c.exemption_period,
      Data_Prova: c.exam_date,
      Etapas: c.etapas,
      Disciplinas: c.subjects,
      Status_Edital: getEditalStatus(c.registration_end, c.exam_date),
      Link: c.link,
      Duplicadas: c.duplicadas
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `concursos_oportunidades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const success = await fetchGlobalConcursos();
      if (success) {
        setVisibleCount(50);
      } else {
        alert("Não foi possível sincronizar os dados. Verifique sua conexão ou tente novamente mais tarde.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'BR', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 
    'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 
    'RR', 'SC', 'SP', 'SE', 'TO', 'N/A'
  ];

  const esferas = useMemo(() => {
    const set = new Set(concursos.map(c => c.esfera).filter(e => e && e !== 'N/A'));
    return Array.from(set).sort();
  }, [concursos]);

  const modalidades = useMemo(() => {
    const set = new Set(concursos.map(c => c.modalidade).filter(m => m && m !== 'N/A'));
    return Array.from(set).sort();
  }, [concursos]);

  const isFilterActive = ufFilter !== '' || statusFilter !== '' || esferaFilter !== '' || modalidadeFilter !== '';
  const appliedFiltersActive = appliedFilters.uf !== '' || appliedFilters.status !== '' || appliedFilters.esfera !== '' || appliedFilters.modalidade !== '';

  useEffect(() => {
    if (!isFilterActive) {
      setAppliedFilters({ uf: '', status: '', esfera: '', modalidade: '' });
    }
  }, [isFilterActive]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      uf: ufFilter,
      status: statusFilter,
      esfera: esferaFilter,
      modalidade: modalidadeFilter
    });
    setVisibleCount(50);
    setIsFilterDrawerOpen(false);
  };

  const clearFilters = () => {
    setUfFilter('');
    setStatusFilter('');
    setEsferaFilter('');
    setModalidadeFilter('');
    setAppliedFilters({ uf: '', status: '', esfera: '', modalidade: '' });
    setVisibleCount(50);
  };

  const processedConcursos = useMemo(() => {
    let result = concursos.filter(c => {
      const matchesText = 
        (c.institution || '').toLowerCase().includes(filter.toLowerCase()) ||
        (c.board || '').toLowerCase().includes(filter.toLowerCase()) ||
        (c.source || '').toLowerCase().includes(filter.toLowerCase()) ||
        (c.positions || '').toLowerCase().includes(filter.toLowerCase());
      
      const matchesUf = appliedFilters.uf === '' || c.location === appliedFilters.uf;
      
      const status = (c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date)) as any;
      const matchesStatus = appliedFilters.status === '' || status === appliedFilters.status;
      
      const matchesEsfera = appliedFilters.esfera === '' || c.esfera === appliedFilters.esfera;
      const matchesModalidade = appliedFilters.modalidade === '' || c.modalidade === appliedFilters.modalidade;
      
      return matchesText && matchesUf && matchesStatus && matchesEsfera && matchesModalidade;
    }).map(c => ({
      ...c,
      calculatedScore: calculateScore(c, scoringRules, userProfileScoring)
    }));

    if (sortConfig) {
      result.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortConfig.key === 'status') {
          valA = a.status && a.status !== 'N/A' ? a.status : getEditalStatus(a.registration_end, a.exam_date);
          valB = b.status && b.status !== 'N/A' ? b.status : getEditalStatus(b.registration_end, b.exam_date);
        } else if (sortConfig.key === 'score') {
          valA = a.calculatedScore;
          valB = b.calculatedScore;
        } else {
          valA = a[sortConfig.key as keyof Concurso] || '';
          valB = b[sortConfig.key as keyof Concurso] || '';
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => b.calculatedScore - a.calculatedScore);
    }

    return result;
  }, [concursos, filter, appliedFilters, sortConfig, scoringRules, userProfileScoring]);

  const visibleConcursos = useMemo(() => {
    return processedConcursos.slice(0, visibleCount);
  }, [processedConcursos, visibleCount]);

  const handleMarkInterest = (id: string, status: 'interested' | 'ignored' | 'none') => {
    markInterest(id, status);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const quickFilters = [
    { label: 'Inscrições Abertas', filter: () => { setStatusFilter('Aberto'); handleApplyFilters(); }, active: appliedFilters.status === 'Aberto' },
    { label: 'Federal', filter: () => { setEsferaFilter('Federal e Nacional'); handleApplyFilters(); }, active: appliedFilters.esfera === 'Federal e Nacional' },
    { label: 'SP', filter: () => { setUfFilter('SP'); handleApplyFilters(); }, active: appliedFilters.uf === 'SP' },
    { label: 'RJ', filter: () => { setUfFilter('RJ'); handleApplyFilters(); }, active: appliedFilters.uf === 'RJ' },
    { label: 'MG', filter: () => { setUfFilter('MG'); handleApplyFilters(); }, active: appliedFilters.uf === 'MG' },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Oportunidades</h2>
          <p className="text-muted-foreground text-sm">
            {processedConcursos.length} concursos encontrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
          <div className="hidden md:block">
            <CSVUpload />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por órgão, banca ou cargo..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-sm transition-all"
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setVisibleCount(50);
            }}
          />
        </div>
        
        <button 
          onClick={() => setIsFilterDrawerOpen(true)}
          className={clsx(
            "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all",
            appliedFiltersActive 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "bg-card border border-border text-foreground hover:border-primary/30"
          )}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filtros</span>
          {appliedFiltersActive && (
            <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {Object.values(appliedFilters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {quickFilters.map((qf, index) => (
          <button
            key={index}
            onClick={qf.filter}
            className={clsx(
              "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border",
              qf.active 
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            )}
          >
            {qf.label}
          </button>
        ))}
        {appliedFiltersActive && (
          <button
            onClick={clearFilters}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-1"
          >
            <X size={12} />
            Limpar
          </button>
        )}
      </div>

      {/* Filter Drawer (Mobile) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Filtros</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Estado (UF)</label>
                <select 
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary"
                  value={ufFilter}
                  onChange={e => setUfFilter(e.target.value)}
                >
                  <option value="">Todas as UFs</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Esfera</label>
                <select 
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary"
                  value={esferaFilter}
                  onChange={e => setEsferaFilter(e.target.value)}
                >
                  <option value="">Todas as Esferas</option>
                  {esferas.map(esfera => (
                    <option key={esfera} value={esfera}>{esfera}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                <select 
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os Status</option>
                  <option value="Aberto">Aberto</option>
                  <option value="Autorizado">Autorizado</option>
                  <option value="Comissão Formada">Comissão Formada</option>
                  <option value="Previsto">Previsto</option>
                  <option value="Solicitado">Solicitado</option>
                  <option value="Encerrado">Encerrado</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Modalidade</label>
                <select 
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary"
                  value={modalidadeFilter}
                  onChange={e => setModalidadeFilter(e.target.value)}
                >
                  <option value="">Todas as Modalidades</option>
                  {modalidades.map(modalidade => (
                    <option key={modalidade} value={modalidade}>{modalidade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={clearFilters}
                className="flex-1 py-4 bg-muted text-foreground rounded-xl font-bold transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Estado (UF)</label>
          <select 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary"
            value={ufFilter}
            onChange={e => setUfFilter(e.target.value)}
          >
            <option value="">Todas as UFs</option>
            {ufs.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Esfera</label>
          <select 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary"
            value={esferaFilter}
            onChange={e => setEsferaFilter(e.target.value)}
          >
            <option value="">Todas as Esferas</option>
            {esferas.map(esfera => (
              <option key={esfera} value={esfera}>{esfera}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Modalidade</label>
          <select 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary"
            value={modalidadeFilter}
            onChange={e => setModalidadeFilter(e.target.value)}
          >
            <option value="">Todas as Modalidades</option>
            {modalidades.map(modalidade => (
              <option key={modalidade} value={modalidade}>{modalidade}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
          <select 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="Aberto">Aberto</option>
            <option value="Autorizado">Autorizado</option>
            <option value="Comissão Formada">Comissão Formada</option>
            <option value="Previsto">Previsto</option>
            <option value="Solicitado">Solicitado</option>
            <option value="Encerrado">Encerrado</option>
          </select>
        </div>
        {isFilterActive && (
          <div className="w-full flex justify-end pt-2">
            <button
              onClick={handleApplyFilters}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold shadow-md"
            >
              Aplicar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {concursos.length === 0 ? (
          <div className="col-span-full bg-card p-12 text-center rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">Nenhum concurso encontrado. Faça o upload do arquivo CSV ou sincronize os dados.</p>
          </div>
        ) : processedConcursos.length === 0 ? (
          <div className="col-span-full bg-card p-12 text-center rounded-2xl border border-border">
            <p className="text-muted-foreground">Nenhum resultado para a busca. Tente ajustar os filtros.</p>
          </div>
        ) : (
          <>
            {visibleConcursos.map((c, index) => (
              <ConcursoCard
                key={`${c.id}-${index}`}
                concurso={c}
                onToggleFavorite={toggleFavorite}
                onMarkInterest={handleMarkInterest}
                isExpanded={expandedRow === c.id}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </>
        )}
      </div>

      {/* Load More */}
      {visibleCount < processedConcursos.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount(prev => prev + 50)}
            className="px-8 py-3 bg-card border border-border text-foreground hover:border-primary/30 rounded-xl font-medium text-sm transition-all"
          >
            Carregar mais ({processedConcursos.length - visibleCount} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
