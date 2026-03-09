import { 
  Star, 
  X, 
  ExternalLink, 
  Calendar, 
  Users, 
  Wallet, 
  FileText,
  GraduationCap,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { Concurso } from '../store';
import { StatusBadge } from './StatusBadge';
import { EditalStatus, getEditalStatus } from '../utils/concursoUtils';
import clsx from 'clsx';

interface ConcursoCardProps {
  concurso: Concurso & { calculatedScore?: number };
  onToggleFavorite: (id: string) => void;
  onMarkInterest: (id: string, status: 'interested' | 'ignored' | 'none') => void;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
}

export function ConcursoCard({
  concurso,
  onToggleFavorite,
  onMarkInterest,
  isExpanded,
  onToggleExpand
}) => {
  const c = concurso;
  const status = (c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date)) as EditalStatus;
  const score = c.calculatedScore ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'score-badge-high';
    if (score >= 20) return 'score-badge-medium';
    return 'score-badge-low';
  };

  const getScoreRing = (score: number) => {
    if (score >= 50) return 'ring-emerald-400/30';
    if (score >= 20) return 'ring-amber-400/30';
    return 'ring-slate-400/20';
  };

  return (
    <div 
      className={clsx(
        "bg-card rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col group hover:shadow-lg",
        c.interest_status === 'interested' 
          ? "border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/10" 
          : "border-border shadow-sm hover:border-primary/20",
        c.interest_status === 'ignored' && "opacity-50 grayscale",
        isExpanded && "ring-2 ring-primary/20"
      )}
    >
      {/* Header com Score */}
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start gap-3">
          {/* Left side - Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 uppercase font-bold tracking-tight">
                {c.location || c.uf}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {c.source || c.fonte}
              </span>
              {c.escolaridade && c.escolaridade !== 'N/A' && (
                <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
                  <GraduationCap size={10} />
                  {c.escolaridade}
                </span>
              )}
            </div>
            
            <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2 mb-1" title={c.institution || c.orgao}>
              {c.institution || c.orgao}
            </h3>
            
            {(c.positions || c.cargos) && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                {c.positions || c.cargos}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={status} className="scale-90 origin-left" />
              {(c.board || c.banca) && (c.board || c.banca) !== 'N/A' && (c.board || c.banca) !== 'A Definir' && (
                <span className="text-primary font-bold text-[9px] bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 uppercase tracking-tight">
                  {c.board || c.banca}
                </span>
              )}
              {c.esfera && c.esfera !== 'N/A' && (
                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium truncate max-w-[100px]" title={c.esfera}>
                  {c.esfera.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          {/* Right side - Score Badge */}
          <div className="flex flex-col items-center gap-2">
            <div 
              className={clsx(
                "w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg ring-4",
                getScoreColor(score),
                getScoreRing(score)
              )}
              title={`Score de aderência: ${score} pontos`}
            >
              <Trophy size={12} className="mb-0.5 opacity-80" />
              <span className="text-lg font-black leading-none">{score}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(c.id);
              }}
              className={clsx(
                "p-1.5 rounded-full transition-all duration-200",
                c.is_favorite 
                  ? "text-amber-400 bg-amber-50 hover:bg-amber-100" 
                  : "text-slate-300 hover:text-amber-400 hover:bg-slate-50"
              )}
              title={c.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star size={18} fill={c.is_favorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 px-4 py-3 bg-slate-50/50 border-y border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Users size={14} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vagas</p>
            <p className="text-sm font-bold text-slate-800 truncate">{c.vacancies || c.vagas || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Wallet size={14} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Salário</p>
            <p className="text-sm font-bold text-emerald-600 truncate">{c.salary || c.salario || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
            <Calendar size={14} className="text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Inscrições</p>
            <p className="text-sm font-bold text-slate-800 truncate">{c.registration_end || c.fim_inscricoes || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-indigo-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Prova</p>
            <p className="text-sm font-bold text-slate-800 truncate">{c.exam_date || c.data_prova || 'A Definir'}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {c.interest_status !== 'interested' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkInterest(c.id, 'interested');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
            >
              <span>Tenho Interesse</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkInterest(c.id, 'none');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-bold transition-colors"
            >
              <span>Acompanhando</span>
            </button>
          )}
          
          {c.interest_status !== 'ignored' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkInterest(c.id, 'ignored');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Ignorar este concurso"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {c.link && c.link !== 'N/A' && (
          <a 
            href={c.link} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            <span className="hidden sm:inline">Ver Edital</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/30 animate-fade-in">
          <div className="space-y-3">
            {c.etapas && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Etapas</p>
                <p className="text-sm text-slate-700">{c.etapas}</p>
              </div>
            )}
            {(c.subjects || c.disciplinas) && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Disciplinas</p>
                <p className="text-sm text-slate-700">{c.subjects || c.disciplinas}</p>
              </div>
            )}
            {(c.exemption_period || c.periodo_isencao) && (c.exemption_period || c.periodo_isencao) !== '' && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Período de Isenção</p>
                <p className="text-sm text-slate-700">{c.exemption_period || c.periodo_isencao}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expand Button */}
      {onToggleExpand && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(c.id);
          }}
          className="w-full py-2 border-t border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
        >
          <span>{isExpanded ? 'Ver menos' : 'Ver mais detalhes'}</span>
          <ChevronRight size={14} className={clsx("transition-transform", isExpanded && "rotate-90")} />
        </button>
      )}
    </div>
  );
}
