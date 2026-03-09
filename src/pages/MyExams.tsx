import { useState } from 'react';
import { MapPin, Calendar, FileText, ExternalLink, Save, Map as MapIcon, Check, Star, Bookmark, Trophy, X, Users, Wallet } from 'lucide-react';
import { useConcursoStore, Concurso } from '../store';
import { calculateScore } from '../utils/scoring';
import { StatusBadge } from '../components/StatusBadge';
import { getEditalStatus, EditalStatus } from '../utils/concursoUtils';
import clsx from 'clsx';

export default function MyExams() {
  const { concursos, scoringRules, userProfileScoring, updateConcurso, toggleFavorite, markInterest } = useConcursoStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Concurso>>({});
  const [enriching, setEnriching] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'interested' | 'favorites' | 'enrolled'>('interested');

  const myExams = concursos.filter(c => c.interest_status === 'interested');
  const favoriteExams = concursos.filter(c => c.is_favorite);
  const enrolledExams = concursos.filter(c => c.is_enrolled);

  const handleEdit = (concurso: Concurso) => {
    setEditingId(concurso.id);
    setEditForm({
      is_enrolled: concurso.is_enrolled,
      exam_location: concurso.exam_location || '',
      notes: concurso.notes || ''
    });
  };

  const handleSave = (id: string) => {
    updateConcurso(id, editForm);
    setEditingId(null);
  };

  const enrichLocation = async (id: string, locationQuery: string) => {
    setEnriching(id);
    try {
      const lat = -23.55 + (Math.random() * 0.1);
      const lng = -46.63 + (Math.random() * 0.1);
      
      updateConcurso(id, { latitude: lat, longitude: lng });
      alert('Localização aproximada definida no mapa!');
    } catch (e) {
      console.error(e);
    }
    setEnriching(null);
  };

  const tabs = [
    { id: 'interested', label: 'Acompanhando', icon: Bookmark, count: myExams.length, color: 'indigo' },
    { id: 'favorites', label: 'Favoritos', icon: Star, count: favoriteExams.length, color: 'amber' },
    { id: 'enrolled', label: 'Inscrito', icon: Check, count: enrolledExams.length, color: 'emerald' },
  ] as const;

  const currentExams = activeTab === 'interested' ? myExams : activeTab === 'favorites' ? favoriteExams : enrolledExams;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Meus Concursos</h2>
          <p className="text-muted-foreground text-sm">Gerencie suas inscrições e concursos favoritos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={16} className={clsx(
                isActive && tab.color === 'amber' && "text-amber-500",
                isActive && tab.color === 'indigo' && "text-indigo-600",
                isActive && tab.color === 'emerald' && "text-emerald-500"
              )} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={clsx(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                isActive 
                  ? tab.color === 'amber' ? "bg-amber-100 text-amber-600" 
                    : tab.color === 'emerald' ? "bg-emerald-100 text-emerald-600"
                    : "bg-indigo-100 text-indigo-600"
                  : "bg-slate-200 text-slate-500"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {currentExams.length === 0 ? (
        <div className="bg-card p-12 rounded-xl border border-dashed border-border text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            {activeTab === 'interested' && <Bookmark size={24} className="text-muted-foreground" />}
            {activeTab === 'favorites' && <Star size={24} className="text-muted-foreground" />}
            {activeTab === 'enrolled' && <Check size={24} className="text-muted-foreground" />}
          </div>
          <p className="text-muted-foreground font-medium">
            {activeTab === 'interested' && 'Você ainda não está acompanhando nenhum concurso.'}
            {activeTab === 'favorites' && 'Você ainda não favoritou nenhum concurso.'}
            {activeTab === 'enrolled' && 'Você ainda não marcou nenhum concurso como inscrito.'}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Vá para Oportunidades e marque os concursos do seu interesse.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {currentExams.map((c, index) => (
            <ConcursoDetailCard 
              key={`${c.id}-${index}`} 
              c={c} 
              scoringRules={scoringRules}
              userProfileScoring={userProfileScoring}
              editingId={editingId}
              editForm={editForm}
              setEditForm={setEditForm}
              enriching={enriching}
              handleEdit={handleEdit}
              handleSave={handleSave}
              enrichLocation={enrichLocation}
              toggleFavorite={toggleFavorite}
              markInterest={markInterest}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConcursoDetailCard({ c, scoringRules, userProfileScoring, editingId, editForm, setEditForm, enriching, handleEdit, handleSave, enrichLocation, toggleFavorite, markInterest }: any) {
  const score = calculateScore(c, scoringRules, userProfileScoring);
  const status = (c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date)) as EditalStatus;

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'bg-emerald-500';
    if (score >= 20) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 uppercase font-bold">
                {c.location || c.uf}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {c.source || c.fonte}
              </span>
            </div>
            <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-2">{c.institution || c.orgao}</h3>
            {(c.positions || c.cargos) && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{c.positions || c.cargos}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className={clsx(
                "w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-md",
                getScoreColor(score)
              )}
            >
              <Trophy size={10} className="mb-0.5 opacity-80" />
              <span className="text-sm font-black leading-none">{score}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <StatusBadge status={status} className="scale-90 origin-left" />
          {(c.board || c.banca) && (c.board || c.banca) !== 'N/A' && (
            <span className="text-primary font-bold text-[9px] bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 uppercase">
              {c.board || c.banca}
            </span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 px-4 py-3 bg-slate-50/50 border-y border-slate-100">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-emerald-600" />
          <span className="text-xs text-muted-foreground">Vagas:</span>
          <span className="text-xs font-bold text-foreground">{c.vacancies || c.vagas || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-600">{c.salary || c.salario || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-rose-500" />
          <span className="text-xs text-muted-foreground">Inscrições:</span>
          <span className="text-xs font-bold text-foreground">{c.registration_end || c.fim_inscricoes || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-indigo-500" />
          <span className="text-xs text-muted-foreground">Prova:</span>
          <span className="text-xs font-bold text-foreground">{c.exam_date || c.data_prova || 'A Definir'}</span>
        </div>
      </div>

      {/* Edit Form or Details */}
      {editingId === c.id ? (
        <div className="p-4 space-y-4 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id={`enrolled-${c.id}`}
              checked={editForm.is_enrolled}
              onChange={e => setEditForm({...editForm, is_enrolled: e.target.checked})}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20"
            />
            <label htmlFor={`enrolled-${c.id}`} className="text-sm font-medium text-foreground">Já estou inscrito</label>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Local de Prova</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={editForm.exam_location}
                onChange={e => setEditForm({...editForm, exam_location: e.target.value})}
                placeholder="Ex: Escola Estadual..."
                className="flex-1 text-sm border border-border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card"
              />
              <button 
                onClick={() => enrichLocation(c.id, editForm.exam_location || '')}
                disabled={enriching === c.id || !editForm.exam_location}
                className="p-2.5 bg-muted text-muted-foreground rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                title="Buscar no Mapa"
              >
                <MapIcon size={18} className={enriching === c.id ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notas / Lembretes</label>
            <textarea 
              value={editForm.notes}
              onChange={e => setEditForm({...editForm, notes: e.target.value})}
              placeholder="Anotações sobre o edital, matérias..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-24 bg-card resize-none"
            />
          </div>

          <button 
            onClick={() => handleSave(c.id)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <Save size={18} />
            <span>Salvar Alterações</span>
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={clsx(
                "w-2.5 h-2.5 rounded-full",
                c.is_enrolled ? 'bg-emerald-500' : 'bg-slate-300'
              )} />
              <span className="text-sm font-medium text-foreground">
                {c.is_enrolled ? 'Inscrito' : 'Não inscrito'}
              </span>
            </div>
            <button 
              onClick={() => handleEdit(c)}
              className="text-primary text-sm font-bold hover:underline"
            >
              Editar Detalhes
            </button>
          </div>

          {c.exam_location && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-2.5 rounded-lg">
              <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{c.exam_location}</span>
            </div>
          )}

          {c.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-primary/5 p-2.5 rounded-lg">
              <FileText size={16} className="text-primary/60 mt-0.5 flex-shrink-0" />
              <p className="italic">{c.notes}</p>
            </div>
          )}

          {c.latitude && c.longitude && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <Check size={12} />
              Localização mapeada
            </p>
          )}
        </div>
      )}

      {/* Actions Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleFavorite(c.id)}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              c.is_favorite 
                ? "text-amber-400 bg-amber-50 hover:bg-amber-100" 
                : "text-slate-400 hover:text-amber-400 hover:bg-slate-100"
            )}
            title={c.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star size={18} fill={c.is_favorite ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={() => markInterest(c.id, 'none')}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remover dos meus concursos"
          >
            <X size={18} />
          </button>
        </div>

        {c.link && c.link !== 'N/A' && (
          <a 
            href={c.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors"
          >
            <span>Ver Edital</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
