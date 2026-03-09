import React from 'react';
import { Star, X, Check, ExternalLink, Trophy, Calendar, MapPin, Briefcase, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Concurso, ScoringRule, UserProfileScoring } from '../store';
import { StatusBadge } from './StatusBadge';
import { getEditalStatus, EditalStatus } from '../utils/concursoUtils';
import { calculateScore } from '../utils/scoring';
import clsx from 'clsx';

interface ConcursoCardProps {
  concurso: Concurso & { calculatedScore?: number };
  scoringRules: ScoringRule[];
  userProfileScoring: UserProfileScoring;
  onMarkInterest: (id: string, status: 'interested' | 'ignored' | 'none') => void;
  onToggleFavorite: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  isAnimating?: boolean;
}

export const ConcursoCard: React.FC<ConcursoCardProps> = ({
  concurso: c,
  scoringRules,
  userProfileScoring,
  onMarkInterest,
  onToggleFavorite,
  isExpanded = false,
  onToggleExpand,
  isAnimating = false,
}) => {
  const status = c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date);
  const score = c.calculatedScore ?? calculateScore(c, scoringRules, userProfileScoring);

  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col",
        c.interest_status === 'interested' ? "border-indigo-200 shadow-indigo-100/50 shadow-lg" : "border-slate-100 shadow-sm",
        c.interest_status === 'ignored' && "opacity-60 grayscale",
        isExpanded && "ring-2 ring-indigo-500/20",
        isAnimating && "scale-95 opacity-70"
      )}
    >
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 uppercase font-bold">
                {c.location}
              </span>
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
              onToggleFavorite(c.id);
            }}
            className={clsx(
              "flex-shrink-0 p-1 transition-colors",
              c.is_favorite ? "text-amber-400" : "text-slate-300 hover:text-amber-400"
            )}
          >
            <Star size={20} fill={c.is_favorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Status & Score */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <StatusBadge status={status as EditalStatus} />
          <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100">
            <Trophy size={10} />
            <span>Score: {score}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 mb-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Vagas</p>
            <p className="text-sm font-bold text-slate-700">{c.vacancies || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Salario</p>
            <p className="text-sm font-bold text-emerald-600 truncate">{c.salary || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Inscricoes</p>
            <p className="text-sm font-medium text-slate-700">{c.registration_end || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Prova</p>
            <p className="text-sm font-medium text-slate-700">{c.exam_date || 'A definir'}</p>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-3 pb-3 border-b border-slate-50 mb-3 animate-in slide-in-from-top duration-200">
            {c.positions && c.positions !== 'N/A' && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cargos</p>
                <p className="text-xs text-slate-600 leading-relaxed">{c.positions}</p>
              </div>
            )}
            {c.esfera && c.esfera !== 'N/A' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Esfera:</span>
                <span className="text-xs font-medium text-slate-700">{c.esfera}</span>
              </div>
            )}
            {c.modalidade && c.modalidade !== 'N/A' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Modalidade:</span>
                <span className="text-xs font-medium text-slate-700">{c.modalidade}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          {c.interest_status === 'none' ? (
            <>
              <button
                onClick={() => onMarkInterest(c.id, 'interested')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all"
              >
                <Check size={14} />
                Tenho Interesse
              </button>
              <button
                onClick={() => onMarkInterest(c.id, 'ignored')}
                className="p-2.5 bg-slate-100 text-slate-500 rounded-xl active:scale-[0.98] transition-all hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </>
          ) : c.interest_status === 'interested' ? (
            <button
              onClick={() => onMarkInterest(c.id, 'none')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 py-2.5 rounded-xl text-xs font-bold border border-emerald-100 active:scale-[0.98] transition-all"
            >
              <Check size={14} />
              Acompanhando
            </button>
          ) : (
            <button
              onClick={() => onMarkInterest(c.id, 'none')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
            >
              Restaurar
            </button>
          )}

          {c.link && c.link !== 'N/A' && (
            <a
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl active:scale-[0.98] transition-all hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ExternalLink size={16} />
            </a>
          )}

          {onToggleExpand && (
            <button
              onClick={() => onToggleExpand(c.id)}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl active:scale-[0.98] transition-all hover:bg-slate-200"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
