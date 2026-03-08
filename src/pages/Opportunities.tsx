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
  
  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(50);
  const observerTarget = useRef(null);

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

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < processedConcursos.length) {
          setVisibleCount(prev => prev + 50);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [processedConcursos.length, visibleCount]);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Oportunidades</h2>
          <p className="text-slate-500">Encontre e gerencie concursos públicos via CSV.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 font-medium text-sm md:text-base"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={processedConcursos.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm md:text-base"
          >
            <Download size={18} />
            <span>Download</span>
          </button>
          <div className="w-full md:w-auto">
            <CSVUpload />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-100 space-y-4 md:space-y-5">
        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por órgão, banca ou fonte..." 
            className="flex-1 outline-none text-slate-700 bg-transparent text-sm md:text-base"
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setVisibleCount(50);
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado (UF)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-slate-400" />
              </div>
              <select 
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-all cursor-pointer"
                value={ufFilter}
                onChange={e => setUfFilter(e.target.value)}
              >
                <option value="">Todas as UFs</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Esfera</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe size={16} className="text-slate-400" />
              </div>
              <select 
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-all cursor-pointer"
                value={esferaFilter}
                onChange={e => setEsferaFilter(e.target.value)}
              >
                <option value="">Todas as Esferas</option>
                {esferas.map(esfera => (
                  <option key={esfera} value={esfera}>{esfera}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modalidade</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Layout size={16} className="text-slate-400" />
              </div>
              <select 
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-all cursor-pointer"
                value={modalidadeFilter}
                onChange={e => setModalidadeFilter(e.target.value)}
              >
                <option value="">Todas as Modalidades</option>
                {modalidades.map(modalidade => (
                  <option key={modalidade} value={modalidade}>{modalidade}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ListChecks size={16} className="text-slate-400" />
              </div>
              <select 
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-all cursor-pointer"
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
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {isFilterActive && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleApplyFilters}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
            >
              <Filter size={16} />
              <span>Aplicar Filtros</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
              <tr>
                <th className="px-2 md:px-6 py-3 md:py-4 w-8 md:w-10"></th>
                <th className="px-2 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('institution')}>
                  <div className="flex items-center">Órgão / Fonte <SortIcon column="institution" /></div>
                </th>
                <th className="hidden sm:table-cell px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('location')}>
                  <div className="flex items-center">UF <SortIcon column="location" /></div>
                </th>
                <th className="hidden md:table-cell px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('board')}>
                  <div className="flex items-center">Banca <SortIcon column="board" /></div>
                </th>
                <th className="hidden md:table-cell px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('score')}>
                  <div className="flex items-center">Pontuação <SortIcon column="score" /></div>
                </th>
                <th className="hidden sm:table-cell px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center">Status <SortIcon column="status" /></div>
                </th>
                <th className="hidden md:table-cell px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('salary')}>
                  <div className="flex items-center">Salário <SortIcon column="salary" /></div>
                </th>
                <th className="hidden lg:table-cell px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('exam_date')}>
                  <div className="flex items-center">Data Prova <SortIcon column="exam_date" /></div>
                </th>
                <th className="px-2 md:px-6 py-3 md:py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span>Ações</span>
                    <span className="hidden md:inline text-[10px] font-normal text-slate-400 max-w-[200px] leading-tight">
                      Link do edital, confirmar ou rejeitar interesse
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {concursos.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center text-slate-500">Nenhum concurso encontrado. Faça o upload do arquivo CSV.</td></tr>
              ) : processedConcursos.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center text-slate-500">Nenhum resultado para a busca.</td></tr>
              ) : (
                <>
                  {visibleConcursos.map((c, index) => {
                    const status = c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date);
                    const isExpanded = expandedRow === c.id;
                    
                    return (
                      <React.Fragment key={`${c.id}-${index}`}>
                        <tr 
                          className={clsx(
                            "transition-all duration-300 ease-in-out cursor-pointer",
                            c.interest_status === 'interested' ? "bg-indigo-50/50" : 
                            c.interest_status === 'ignored' ? "bg-slate-50/50 opacity-50 grayscale" : 
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                            "hover:bg-indigo-50/30",
                            isExpanded && "bg-slate-100",
                            animatingRowId === c.id && "scale-[1.01] shadow-md z-10 relative ring-2 ring-indigo-500/20"
                          )}
                          onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                        >
                          <td className="px-2 md:px-6 py-3 md:py-4">
                            {isExpanded ? <ChevronDown size={18} className="text-indigo-600" /> : <ChevronRight size={18} className="text-slate-400" />}
                          </td>
                          <td className="px-2 md:px-6 py-3 md:py-4">
                            <div className="flex items-start space-x-2 md:space-x-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(c.id);
                                }}
                                className={clsx(
                                  "mt-0.5 transition-colors duration-200",
                                  c.is_favorite ? "text-amber-400 hover:text-amber-500" : "text-slate-300 hover:text-amber-400"
                                )}
                                title={c.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                              >
                                <Star size={18} fill={c.is_favorite ? "currentColor" : "none"} />
                              </button>
                              <div>
                                <div className="font-medium text-slate-900">{c.institution}</div>
                                <div className="text-slate-500 text-xs mt-1">{c.source}</div>
                                {/* Mobile only details */}
                                <div className="md:hidden mt-2 space-y-1">
                                  <div className="flex items-center space-x-2 text-xs">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{c.location}</span>
                                    <span className="text-slate-500">{c.board}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs">
                                    <StatusBadge status={status as any} />
                                    <span className="font-medium text-indigo-600">{c.salary}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs">
                                    <Trophy 
                                      size={12} 
                                      className={clsx(
                                        c.calculatedScore > 70 ? "text-emerald-500" : 
                                        c.calculatedScore > 0 ? "text-amber-500" : "text-slate-300"
                                      )} 
                                    />
                                    <span className={clsx(
                                      "font-semibold", 
                                      c.calculatedScore > 70 ? "text-emerald-600" : 
                                      c.calculatedScore > 0 ? "text-amber-600" : "text-slate-400"
                                    )}>
                                      Pontuação: {c.calculatedScore}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4">
                            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{c.location}</span>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 text-slate-600">{c.board}</td>
                          <td className="hidden md:table-cell px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Trophy 
                                size={c.calculatedScore > 70 ? 16 : 14} 
                                className={clsx(
                                  c.calculatedScore > 70 ? "text-emerald-500" : 
                                  c.calculatedScore > 0 ? "text-amber-500" : "text-slate-300"
                                )} 
                              />
                              <span className={clsx(
                                "font-semibold", 
                                c.calculatedScore > 70 ? "text-emerald-600 font-bold text-base" : 
                                c.calculatedScore > 0 ? "text-amber-600" : "text-slate-400"
                              )}>
                                {c.calculatedScore}
                              </span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4">
                            <StatusBadge status={status as any} />
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 text-slate-600 font-medium text-indigo-600">{c.salary}</td>
                          <td className="hidden lg:table-cell px-6 py-4 text-slate-600">{c.exam_date}</td>
                          <td className="px-2 md:px-6 py-3 md:py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1 md:space-x-4">
                              {c.link && c.link !== 'N/A' ? (
                                <a 
                                  href={c.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                >
                                  <ExternalLink size={14} />
                                  <span className="hidden md:inline">Edital</span>
                                </a>
                              ) : (
                                <span className="text-slate-300 text-xs italic hidden md:inline">Sem link</span>
                              )}

                              <div className="h-4 w-px bg-slate-200 hidden md:block" />

                              {c.interest_status === 'interested' ? (
                                <div className="flex items-center space-x-1 md:space-x-2">
                                  <span className="hidden md:inline text-indigo-600 font-bold text-[10px] uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Interessado</span>
                                  <button 
                                    onClick={() => handleMarkInterest(c.id, 'none')}
                                    className="p-1 text-slate-400 hover:text-rose-500 active:scale-90 transition-all duration-200"
                                    title="Remover interesse"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : c.interest_status === 'ignored' ? (
                                <div className="flex items-center space-x-1 md:space-x-2">
                                  <span className="hidden md:inline text-slate-400 font-bold text-[10px] uppercase tracking-wider bg-slate-100 px-2 py-1 rounded border border-slate-200">Ignorado</span>
                                  <button 
                                    onClick={() => handleMarkInterest(c.id, 'none')}
                                    className="p-1 text-slate-400 hover:text-indigo-500 active:scale-90 transition-all duration-200"
                                    title="Restaurar"
                                  >
                                    <Check size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <button 
                                    onClick={() => handleMarkInterest(c.id, 'interested')}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 active:scale-90 rounded-md transition-all duration-200 border border-transparent hover:border-emerald-200"
                                    title="Tenho Interesse"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleMarkInterest(c.id, 'ignored')}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 active:scale-90 rounded-md transition-all duration-200 border border-transparent hover:border-rose-200"
                                    title="Ignorar"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={10} className="p-0">
                              <div className="p-3 md:p-6 border-t border-slate-100">
                                <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
                                  <div className="mb-4 md:mb-6">
                                    <h4 className="text-base md:text-lg font-bold text-slate-800">Detalhes do Concurso</h4>
                                    <p className="text-xs md:text-sm text-slate-500">Informações adicionais sobre o edital e vagas.</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                                    {/* Left Column: Basic Info */}
                                    <div className="lg:col-span-4 space-y-4 md:space-y-6">
                                      <div className="bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-100 h-full">
                                        <h5 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 md:mb-5">Informações Gerais</h5>
                                        <div className="space-y-4 md:space-y-5">
                                          <div>
                                            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1.5">
                                              <Globe size={16} className="text-indigo-500" />
                                              <span className="text-sm">Esfera</span>
                                            </div>
                                            <div className="text-slate-600 text-sm pl-6">
                                              {c.esfera && c.esfera !== 'N/A' ? c.esfera : 'Não informado'}
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1.5">
                                              <Layout size={16} className="text-indigo-500" />
                                              <span className="text-sm">Modalidade</span>
                                            </div>
                                            <div className="text-slate-600 text-sm pl-6">
                                              {c.modalidade && c.modalidade !== 'N/A' ? c.modalidade : 'Não informado'}
                                            </div>
                                          </div>

                                          <div>
                                            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1.5">
                                              <ListChecks size={16} className="text-indigo-500" />
                                              <span className="text-sm">Etapas</span>
                                            </div>
                                            <div className="text-slate-600 text-sm pl-6 whitespace-pre-wrap">
                                              {c.etapas && c.etapas !== 'N/A' ? c.etapas : 'Não informado'}
                                            </div>
                                          </div>

                                          <div>
                                            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1.5">
                                              <BookOpen size={16} className="text-indigo-500" />
                                              <span className="text-sm">Fim Inscrições</span>
                                            </div>
                                            <div className="text-slate-600 text-sm pl-6">
                                              {c.registration_end && c.registration_end !== 'N/A' ? c.registration_end : 'Não informado'}
                                            </div>
                                          </div>

                                          <div>
                                            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1.5">
                                              <Search size={16} className="text-indigo-500" />
                                              <span className="text-sm">Período Isenção</span>
                                            </div>
                                            <div className="text-slate-600 text-sm pl-6">
                                              {c.exemption_period && c.exemption_period !== 'N/A' ? c.exemption_period : 'Não informado'}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Column: Positions and Subjects */}
                                    <div className="lg:col-span-8 space-y-4 md:space-y-6">
                                      <div className="bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-100 h-full">
                                        <h5 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 md:mb-5">Vagas e Conteúdo</h5>
                                        <div className="space-y-4 md:space-y-6">
                                          <div>
                                            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-2.5">
                                              <Briefcase size={16} className="text-indigo-500" />
                                              <span className="text-sm">Cargos</span>
                                            </div>
                                            <div className="pl-6 flex flex-wrap gap-2">
                                              {c.positions && c.positions !== 'N/A' ? (
                                                c.positions.split(/,|\n|;/).map(p => p.trim()).filter(Boolean).map((pos, idx) => (
                                                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-indigo-700 border border-indigo-100 shadow-sm">
                                                    {pos}
                                                  </span>
                                                ))
                                              ) : (
                                                <span className="text-slate-500 text-sm">Não informado</span>
                                              )}
                                            </div>
                                          </div>

                                          <div>
                                            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-2.5">
                                              <BookOpen size={16} className="text-indigo-500" />
                                              <span className="text-sm">Disciplinas</span>
                                            </div>
                                            <div className="pl-6 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                                              {c.subjects || 'Não informado'}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
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
                  {/* Infinite Scroll Sentinel */}
                  <tr ref={observerTarget}>
                    <td colSpan={10} className="p-4 text-center text-slate-400 text-xs">
                      {visibleCount < processedConcursos.length ? 'Carregando mais...' : 'Fim da lista'}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
