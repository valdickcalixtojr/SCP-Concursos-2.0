import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Check, X, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown, Download, ChevronDown, ChevronRight, BookOpen, Briefcase, Globe, Layout, ListChecks, Star, MapPin, Trophy, ExternalLink, RefreshCw } from 'lucide-react';
import { useConcursoStore, Concurso } from '../store';
import { CSVUpload } from '../components/CSVUpload';
import { StatusBadge } from '../components/StatusBadge';
import { calculateScore } from '../utils/scoring';
import { getEditalStatus } from '../utils/concursoUtils';
import { fetchGlobalConcursos } from '../services/firebaseSync';
import clsx from 'clsx';
import Papa from 'papaparse';

type SortKey = keyof Concurso | 'status' | 'score';

export default function Opportunities() {
  const { concursos, scoringRules, userProfileScoring, markInterest, updateConcurso, toggleFavorite } = useConcursoStore();
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
  const [animatingRowId, setAnimatingRowId] = useState<string | null>(null);
  
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
        // Reset filters and pagination if needed
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

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isFilterActive = ufFilter !== '' || statusFilter !== '' || esferaFilter !== '' || modalidadeFilter !== '';

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
    // 1. Filter
    let result = concursos.filter(c => {
      const matchesText = 
        c.institution.toLowerCase().includes(filter.toLowerCase()) ||
        c.board.toLowerCase().includes(filter.toLowerCase()) ||
        c.source.toLowerCase().includes(filter.toLowerCase());
      
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

    // 2. Sort
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
      // Default sort by score descending if no sort config
      result.sort((a, b) => b.calculatedScore - a.calculatedScore);
    }

    return result;
  }, [concursos, filter, appliedFilters, sortConfig, getEditalStatus, scoringRules, userProfileScoring]);

  const visibleConcursos = useMemo(() => {
    return processedConcursos.slice(0, visibleCount);
  }, [processedConcursos, visibleCount]);

  const handleMarkInterest = (id: string, status: 'interested' | 'ignored' | 'none') => {
    setAnimatingRowId(id);
    markInterest(id, status);
    setTimeout(() => setAnimatingRowId(null), 500);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (!sortConfig || sortConfig.key !== column) return <ArrowUpDown size={14} className="ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 text-indigo-600" /> : <ArrowDown size={14} className="ml-1 text-indigo-600" />;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Oportunidades</h2>
          <p className="text-slate-500">Encontre e gerencie concursos públicos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            <span className="sm:hidden">{isSyncing ? '...' : 'Sinc.'}</span>
          </button>
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            <Filter size={18} />
            <span>Filtros</span>
          </button>
          <div className="hidden md:block">
            <CSVUpload />
          </div>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => { setStatusFilter('Aberto'); handleApplyFilters(); }}
          className={clsx(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
            appliedFilters.status === 'Aberto' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
          )}
        >
          Inscrições Abertas
        </button>
        <button
          onClick={() => { setEsferaFilter('Federal'); handleApplyFilters(); }}
          className={clsx(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
            appliedFilters.esfera === 'Federal' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
          )}
        >
          Federal
        </button>
        <button
          onClick={() => { setUfFilter('SP'); handleApplyFilters(); }}
          className={clsx(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
            appliedFilters.uf === 'SP' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
          )}
        >
          São Paulo
        </button>
        <button
          onClick={() => { setUfFilter('RJ'); handleApplyFilters(); }}
          className={clsx(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
            appliedFilters.uf === 'RJ' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
          )}
        >
          Rio de Janeiro
        </button>
        {isFilterActive && (
          <button
            onClick={clearFilters}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* BARRA DE AÇÕES (Busca sempre visível, Botão de Filtro apenas no Mobile) */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar concurso..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setVisibleCount(50);
            }}
          />
        </div>
        
        {/* Botão que só aparece no Mobile */}
        <button 
          onClick={() => setIsFilterDrawerOpen(true)}
          className="md:hidden flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg shadow-md active:scale-95 transition-transform"
        >
          <Filter size={24} />
        </button>
      </div>

      {/* --- FILTROS DESKTOP (Visível apenas em md:) --- */}
      <div className="hidden md:flex flex-wrap gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Estado (UF)</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
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
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Esfera</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
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
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Modalidade</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
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
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
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
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold shadow-md"
            >
              Aplicar Filtros
            </button>
          </div>
        )}
      </div>

      {/* MOBILE: Cards (hidden em md:) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {concursos.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
            Nenhum concurso encontrado. Faça o upload do arquivo CSV.
          </div>
        ) : processedConcursos.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            Nenhum resultado para a busca.
          </div>
        ) : (
          <>
            {visibleConcursos.map((c, index) => {
              const status = c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date);
              const isExpanded = expandedRow === c.id;
              
              return (
                <div 
                  key={`${c.id}-${index}`}
                  className={clsx(
                    "bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col",
                    c.interest_status === 'interested' ? "border-indigo-200 shadow-indigo-100/50 shadow-lg" : "border-slate-100 shadow-sm",
                    c.interest_status === 'ignored' && "opacity-60 grayscale",
                    isExpanded && "ring-2 ring-indigo-500/20"
                  )}
                >
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 uppercase font-bold">{c.location}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">{c.source}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 leading-tight line-clamp-2" title={c.institution}>
                            {c.institution}
                          </h3>
                          {c.board && c.board !== 'N/A' && (
                            <span className="text-indigo-600 font-bold text-[9px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex-shrink-0 uppercase tracking-tight">
                              {c.board}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(c.id);
                        }}
                        className={clsx(
                          "flex-shrink-0 p-1 transition-colors",
                          c.is_favorite ? "text-amber-400" : "text-slate-300 hover:text-amber-400"
                        )}
                      >
                        <Star size={20} fill={c.is_favorite ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <StatusBadge status={status as any} />
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100">
                        <Trophy size={10} />
                        <span>Score: {c.calculatedScore}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Banca</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{c.board}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Salário</p>
                        <p className="text-sm font-bold text-indigo-600 truncate">{c.salary}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {c.interest_status === 'interested' ? (
                          <button 
                            onClick={() => handleMarkInterest(c.id, 'none')}
                            className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                          >
                            <Check size={14} />
                            <span>Interessado</span>
                          </button>
                        ) : c.interest_status === 'ignored' ? (
                          <button 
                            onClick={() => handleMarkInterest(c.id, 'none')}
                            className="flex items-center gap-1 bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                          >
                            <RefreshCw size={14} />
                            <span>Restaurar</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleMarkInterest(c.id, 'interested')}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                            >
                              Interesse
                            </button>
                            <button 
                              onClick={() => handleMarkInterest(c.id, 'ignored')}
                              className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                            >
                              Ignorar
                            </button>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vagas</p>
                          <p className="text-xs text-slate-700 font-medium">{c.vacancies}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prova</p>
                          <p className="text-xs text-slate-700 font-medium">{c.exam_date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inscrições até</p>
                          <p className="text-xs text-slate-700 font-medium">{c.registration_end}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Esfera</p>
                          <p className="text-xs text-slate-700 font-medium">{c.esfera}</p>
                        </div>
                        {c.etapas && (
                          <div className="col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Etapas</p>
                            <p className="text-xs text-slate-700 font-medium">{c.etapas}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cargos</p>
                          <div className="flex flex-wrap gap-1.5">
                            {c.positions?.split(/[,;]/).map((pos, i) => {
                              const trimmed = pos.trim();
                              if (!trimmed) return null;
                              return (
                                <span key={i} className="px-2 py-0.5 bg-white text-slate-600 rounded-md text-[9px] font-bold border border-slate-200 shadow-sm">
                                  {trimmed}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Disciplinas</p>
                          <p className="text-xs text-slate-700 font-medium line-clamp-3">{c.subjects}</p>
                        </div>
                      </div>
                      {c.link && c.link !== 'N/A' && (
                        <a 
                          href={c.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <ExternalLink size={14} />
                          Acessar Edital
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* DESKTOP/TABLET: Tabela (block apenas em md:) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('institution')}>
                  <div className="flex items-center">Órgão / Banca <SortIcon column="institution" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('score')}>
                  <div className="flex items-center">Pontuação <SortIcon column="score" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center">Status <SortIcon column="status" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('salary')}>
                  <div className="flex items-center">Salário <SortIcon column="salary" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('exam_date')}>
                  <div className="flex items-center">Data Prova <SortIcon column="exam_date" /></div>
                </th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {concursos.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-500">Nenhum concurso encontrado.</td></tr>
              ) : processedConcursos.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-500">Nenhum resultado para a busca.</td></tr>
              ) : (
                <>
                  {visibleConcursos.map((c, index) => {
                    const status = c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date);
                    const isExpanded = expandedRow === c.id;
                    
                    return (
                      <React.Fragment key={`${c.id}-${index}`}>
                        <tr 
                          className={clsx(
                            "transition-colors cursor-pointer",
                            c.interest_status === 'interested' ? "bg-indigo-50/30" : 
                            c.interest_status === 'ignored' ? "opacity-50 grayscale" : "bg-white",
                            "hover:bg-slate-50"
                          )}
                          onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                        >
                          <td className="px-6 py-4">
                            {isExpanded ? <ChevronDown size={18} className="text-indigo-600" /> : <ChevronRight size={18} className="text-slate-400" />}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(c.id);
                                }}
                                className={clsx(
                                  "transition-colors flex-shrink-0",
                                  c.is_favorite ? "text-amber-400" : "text-slate-300 hover:text-amber-400"
                                )}
                              >
                                <Star size={18} fill={c.is_favorite ? "currentColor" : "none"} />
                              </button>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold flex-shrink-0">{c.location}</span>
                                  <div className="font-medium text-slate-900 truncate">{c.institution}</div>
                                  {c.board && c.board !== 'N/A' && (
                                    <span className="text-indigo-600 font-bold text-[9px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex-shrink-0 uppercase tracking-tight">
                                      {c.board}
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-xs truncate">
                                  {c.source}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Trophy size={14} className={clsx(c.calculatedScore > 70 ? "text-emerald-500" : "text-amber-500")} />
                              <span className="font-semibold">{c.calculatedScore}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={status as any} />
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {c.salary && c.salary !== 'N/A' ? c.salary : '---'}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{c.exam_date}</td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1.5">
                              {c.link && c.link !== 'N/A' && (
                                <a href={c.link} target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Acessar Edital">
                                  <ExternalLink size={16} />
                                </a>
                              )}
                              
                              {c.interest_status === 'interested' ? (
                                <button 
                                  onClick={() => handleMarkInterest(c.id, 'none')}
                                  className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                                >
                                  <Check size={12} />
                                  <span>Interessado</span>
                                </button>
                              ) : c.interest_status === 'ignored' ? (
                                <button 
                                  onClick={() => handleMarkInterest(c.id, 'none')}
                                  className="flex items-center gap-1 bg-slate-200 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-slate-300 transition-colors"
                                >
                                  <RefreshCw size={12} />
                                  <span>Restaurar</span>
                                </button>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleMarkInterest(c.id, 'interested')}
                                    className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                                  >
                                    <Check size={12} />
                                    <span>Interesse</span>
                                  </button>
                                  <button 
                                    onClick={() => handleMarkInterest(c.id, 'ignored')}
                                    className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-rose-100 transition-colors"
                                  >
                                    <X size={12} />
                                    <span>Ignorar</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={6} className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Informações Gerais - Bento Style */}
                                <div className="lg:col-span-1 space-y-4">
                                  <h4 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                    <Layout size={16} className="text-indigo-600" />
                                    Informações Gerais
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 shadow-sm col-span-2">
                                      <p className="text-indigo-400 font-bold text-[9px] uppercase tracking-wider mb-1">Órgão / UF / Banca</p>
                                      <p className="font-bold text-slate-900 text-sm">
                                        {c.institution} <span className="text-indigo-300 mx-1">|</span> {c.location} <span className="text-indigo-300 mx-1">|</span> {c.board}
                                      </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Esfera</p>
                                      <p className="font-semibold text-slate-700 text-xs">{c.esfera}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Modalidade</p>
                                      <p className="font-semibold text-slate-700 text-xs">{c.modalidade}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Vagas</p>
                                      <p className="font-semibold text-slate-700 text-xs">{c.vacancies}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Inscrições até</p>
                                      <p className="font-semibold text-slate-700 text-xs">{c.registration_end}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Data da Prova</p>
                                      <p className="font-semibold text-slate-700 text-xs">{c.exam_date}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">Fonte</p>
                                      <p className="font-semibold text-slate-500 text-xs">{c.source}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Cargos e Disciplinas */}
                                <div className="lg:col-span-2 space-y-6">
                                  <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                      <Briefcase size={16} className="text-indigo-600" />
                                      Cargos e Oportunidades
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {c.positions?.split(/[,;]/).map((pos, i) => {
                                        const trimmed = pos.trim();
                                        if (!trimmed) return null;
                                        return (
                                          <span key={i} className="px-2.5 py-1 bg-white text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                                            {trimmed}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                      <BookOpen size={16} className="text-indigo-600" />
                                      Conteúdo Programático / Disciplinas
                                    </h4>
                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{c.subjects}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination / Load More */}
      <div className="py-12">
        {visibleCount < processedConcursos.length ? (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setVisibleCount(prev => prev + 50)}
              className="w-full md:w-auto bg-white text-indigo-600 border border-indigo-200 px-8 py-4 md:py-3 rounded-2xl md:rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Carregar Mais Oportunidades
            </button>
            <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
              Exibindo {visibleCount} de {processedConcursos.length} concursos
            </p>
          </div>
        ) : processedConcursos.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <Check size={14} />
              Fim da lista
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Filtros</h3>
              <button onClick={clearFilters} className="text-sm font-bold text-rose-600">Limpar</button>
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pb-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Estado (UF)</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none"
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Esfera</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none"
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Modalidade</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none"
                  value={modalidadeFilter}
                  onChange={e => setModalidadeFilter(e.target.value)}
                >
                  <option value="">Todas as Modalidades</option>
                  {modalidades.map(modalidade => (
                    <option key={modalidade} value={modalidade}>{modalidade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none"
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
            </div>

            <button
              onClick={handleApplyFilters}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
