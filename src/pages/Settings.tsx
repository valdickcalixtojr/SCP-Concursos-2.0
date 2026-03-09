import React, { useState } from 'react';
import { Plus, Trash2, Save, AlertCircle, User, MapPin, Globe, GraduationCap, Layout, Bell, Mail, Smartphone } from 'lucide-react';
import { useConcursoStore, ScoringRule, NotificationSettings } from '../store';
import { ESFERA_PATTERNS, MODALIDADE_PATTERNS, BRAZILIAN_UFS, ESCOLARIDADE_OPTIONS } from '../constants';

export default function Settings() {
  const { 
    scoringRules, addScoringRule, removeScoringRule, updateScoringRule,
    userProfileScoring, updateUserProfileScoring,
    notificationSettings, updateNotificationSettings
  } = useConcursoStore();

  const [newUf, setNewUf] = useState('');
  const [newUfPoints, setNewUfPoints] = useState(10);
  
  const [newEsfera, setNewEsfera] = useState('');
  const [newEsferaPoints, setNewEsferaPoints] = useState(10);

  const [newModalidade, setNewModalidade] = useState('');
  const [newModalidadePoints, setNewModalidadePoints] = useState(10);

  const [newEscolaridade, setNewEscolaridade] = useState('');
  const [newEscolaridadePoints, setNewEscolaridadePoints] = useState(10);

  const handleAddRule = () => {
    const newRule: ScoringRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: 'salary',
      condition: 'greater_than',
      value: '',
      points: 10,
    };
    addScoringRule(newRule);
  };

  const handleAddUf = () => {
    if (!newUf) return;
    const uf = newUf.toUpperCase();
    updateUserProfileScoring({
      ufs_desejadas: { ...(userProfileScoring.ufs_desejadas || {}), [uf]: newUfPoints }
    });
    setNewUf('');
  };

  const handleRemoveUf = (uf: string) => {
    const newUfs = { ...(userProfileScoring.ufs_desejadas || {}) };
    delete newUfs[uf];
    updateUserProfileScoring({ ufs_desejadas: newUfs });
  };

  const handleAddEsfera = () => {
    if (!newEsfera) return;
    updateUserProfileScoring({
      esferas_preferidas: { ...(userProfileScoring.esferas_preferidas || {}), [newEsfera]: newEsferaPoints }
    });
    setNewEsfera('');
  };

  const handleRemoveEsfera = (esfera: string) => {
    const newEsferas = { ...(userProfileScoring.esferas_preferidas || {}) };
    delete newEsferas[esfera];
    updateUserProfileScoring({ esferas_preferidas: newEsferas });
  };

  const handleAddModalidade = () => {
    if (!newModalidade) return;
    updateUserProfileScoring({
      modalidades_preferidas: { ...userProfileScoring.modalidades_preferidas, [newModalidade]: newModalidadePoints }
    });
    setNewModalidade('');
  };

  const handleRemoveModalidade = (modalidade: string) => {
    const newModalidades = { ...userProfileScoring.modalidades_preferidas };
    delete newModalidades[modalidade];
    updateUserProfileScoring({ modalidades_preferidas: newModalidades });
  };

  const handleAddEscolaridade = () => {
    if (!newEscolaridade) return;
    updateUserProfileScoring({
      escolaridades_preferidas: { ...userProfileScoring.escolaridades_preferidas, [newEscolaridade]: newEscolaridadePoints }
    });
    setNewEscolaridade('');
  };

  const handleRemoveEscolaridade = (escolaridade: string) => {
    const newEscolaridades = { ...userProfileScoring.escolaridades_preferidas };
    delete newEscolaridades[escolaridade];
    updateUserProfileScoring({ escolaridades_preferidas: newEscolaridades });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações de Pontuação</h2>
        <p className="text-slate-500">Defina critérios para pontuar e priorizar os concursos automaticamente.</p>
      </div>

      {/* Perfil do Usuário Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <User className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold text-slate-800">Perfil do Usuário</h3>
        </div>
        
        <div className="p-6 space-y-8">
          {/* UFs Desejadas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-700 font-medium">
              <MapPin size={18} className="text-slate-400" />
              <span>Estados (UFs) Desejados</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex space-x-2">
                <select 
                  value={newUf}
                  onChange={e => setNewUf(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">UF</option>
                  {BRAZILIAN_UFS.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder="Pts"
                  value={newUfPoints}
                  onChange={e => setNewUfPoints(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleAddUf}
                  className="bg-indigo-50 text-indigo-600 p-2 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(userProfileScoring.ufs_desejadas || {}).map(([uf, pts]) => (
                  <div key={uf} className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                    <span>{uf}: {pts} pts</span>
                    <button onClick={() => handleRemoveUf(uf)} className="text-indigo-400 hover:text-rose-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Esferas Preferidas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-700 font-medium">
              <Globe size={18} className="text-slate-400" />
              <span>Esferas Preferidas</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex space-x-2">
                <select 
                  value={newEsfera}
                  onChange={e => setNewEsfera(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Selecionar Categoria</option>
                  {Object.keys(ESFERA_PATTERNS).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="Federal">Federal (Simples)</option>
                  <option value="Estadual">Estadual (Simples)</option>
                  <option value="Municipal">Municipal (Simples)</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Pts"
                  value={newEsferaPoints}
                  onChange={e => setNewEsferaPoints(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleAddEsfera}
                  className="bg-indigo-50 text-indigo-600 p-2 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(userProfileScoring.esferas_preferidas || {}).map(([esfera, pts]) => (
                  <div key={esfera} className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-100">
                    <span className="max-w-[200px] truncate" title={esfera}>{esfera}: {pts} pts</span>
                    <button onClick={() => handleRemoveEsfera(esfera)} className="text-emerald-400 hover:text-rose-500 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modalidades Preferidas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-700 font-medium">
              <Layout size={18} className="text-slate-400" />
              <span>Modalidades Preferidas</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex space-x-2">
                <select 
                  value={newModalidade}
                  onChange={e => setNewModalidade(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Selecionar Modalidade</option>
                  {Object.keys(MODALIDADE_PATTERNS).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder="Pts"
                  value={newModalidadePoints}
                  onChange={e => setNewModalidadePoints(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleAddModalidade}
                  className="bg-indigo-50 text-indigo-600 p-2 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(userProfileScoring.modalidades_preferidas || {}).map(([modalidade, pts]) => (
                  <div key={modalidade} className="flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-100">
                    <span className="max-w-[200px] truncate" title={modalidade}>{modalidade}: {pts} pts</span>
                    <button onClick={() => handleRemoveModalidade(modalidade)} className="text-amber-400 hover:text-rose-500 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Escolaridade Alvo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-700 font-medium">
              <GraduationCap size={18} className="text-slate-400" />
              <span>Nível de Escolaridade Alvo</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex space-x-2">
                <select 
                  value={newEscolaridade}
                  onChange={e => setNewEscolaridade(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Selecionar Escolaridade</option>
                  {ESCOLARIDADE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder="Pts"
                  value={newEscolaridadePoints}
                  onChange={e => setNewEscolaridadePoints(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleAddEscolaridade}
                  className="bg-indigo-50 text-indigo-600 p-2 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(userProfileScoring.escolaridades_preferidas || {}).map(([escolaridade, pts]) => (
                  <div key={escolaridade} className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                    <span className="max-w-[200px] truncate" title={escolaridade}>{escolaridade}: {pts} pts</span>
                    <button onClick={() => handleRemoveEscolaridade(escolaridade)} className="text-blue-400 hover:text-rose-500 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">Ganha pontos se estas palavras forem encontradas nos cargos, órgão ou disciplinas.</p>
          </div>
        </div>
      </div>

      {/* Regras de Pontuação Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Regras de Pontuação Dinâmicas</h3>
          <button
            onClick={handleAddRule}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            <span>Adicionar Regra</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {scoringRules.length === 0 ? (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center">
              <AlertCircle size={48} className="text-slate-300 mb-3" />
              <p>Nenhuma regra dinâmica configurada.</p>
              <p className="text-sm mt-1">Adicione regras para calcular a pontuação dos concursos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scoringRules.map((rule) => (
                <div key={rule.id} className="flex flex-col sm:flex-row flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex w-full sm:w-auto gap-3 flex-1">
                    <select
                      value={rule.field}
                      onChange={(e) => updateScoringRule(rule.id, { field: e.target.value as any })}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="salary">Salário</option>
                      <option value="vacancies">Vagas</option>
                      <option value="board">Banca</option>
                      <option value="positions">Cargos</option>
                      <option value="institution">Órgão</option>
                      <option value="location">UF / Local</option>
                    </select>

                    <select
                      value={rule.condition}
                      onChange={(e) => updateScoringRule(rule.id, { condition: e.target.value as any })}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="contains">Contém</option>
                      <option value="equals">Igual a</option>
                      <option value="greater_than">Maior que (números)</option>
                      <option value="less_than">Menor que (números)</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateScoringRule(rule.id, { value: e.target.value })}
                    placeholder="Valor (ex: 5000, FGV)"
                    className="w-full sm:w-auto flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="flex items-center justify-between w-full sm:w-auto space-x-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-600">Pts:</span>
                      <input
                        type="number"
                        value={rule.points}
                        onChange={(e) => updateScoringRule(rule.id, { points: Number(e.target.value) })}
                        className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => removeScoringRule(rule.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                      title="Remover regra"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-sm text-slate-600">
          <h4 className="font-semibold text-slate-800 mb-2">Como funciona a pontuação?</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Para <strong>Salário</strong> e <strong>Vagas</strong>, o sistema tentará extrair os números do texto (ex: "R$ 5.000,00" vira 5000).</li>
            <li>Use <strong>Maior que</strong> ou <strong>Menor que</strong> para valores numéricos.</li>
            <li>Use <strong>Contém</strong> para buscar palavras-chave em Cargos, Bancas ou Órgãos (ex: Cargo contém "TI" = 20 pts).</li>
            <li>A pontuação total de um concurso é a soma de todas as regras do perfil e regras dinâmicas atendidas.</li>
          </ul>
        </div>
      </div>

      {/* Notificações Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <Bell className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold text-slate-800">Preferências de Notificação</h3>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Canais de Notificação */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Canais de Envio</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-indigo-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700 block">E-mail</span>
                      <span className="text-[10px] text-slate-500">Receba resumos e alertas na sua caixa de entrada</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={notificationSettings.emailEnabled}
                      onChange={e => updateNotificationSettings({ emailEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-indigo-600 transition-colors">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700 block">Push (Navegador)</span>
                      <span className="text-[10px] text-slate-500">Alertas em tempo real no seu dispositivo</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={notificationSettings.pushEnabled}
                      onChange={e => updateNotificationSettings({ pushEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Gatilhos de Notificação */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">O que notificar</h4>
              <div className="space-y-3">
                {[
                  { id: 'notifyNewExams', label: 'Novos Concursos', desc: 'Sempre que um novo edital for importado' },
                  { id: 'notifyInterested', label: 'Concursos Interessados', desc: 'Atualizações em concursos marcados como "Tenho Interesse"' },
                  { id: 'notifyDeadlines', label: 'Prazos se Aproximando', desc: 'Alertas de fim de inscrição e data de prova' }
                ].map((trigger) => (
                  <label key={trigger.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">{trigger.label}</span>
                      <span className="text-[10px] text-slate-500">{trigger.desc}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings[trigger.id as keyof NotificationSettings] as boolean}
                      onChange={e => updateNotificationSettings({ [trigger.id]: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-md transition-all"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Configurações de Prazo (Slider) */}
          <div className="pt-6 border-t border-slate-100">
            <div className="max-w-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Antecedência de Aviso de Prazos</h4>
                  <p className="text-xs text-slate-500">Defina com quantos dias de antecedência você quer ser alertado sobre encerramentos.</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                  <span className="text-xl font-black text-indigo-600">{notificationSettings.deadlineThresholdDays}</span>
                  <span className="text-xs font-bold text-indigo-400 ml-1 uppercase">dias</span>
                </div>
              </div>
              
              <div className="px-2">
                <input 
                  type="range" 
                  min="1"
                  max="30"
                  step="1"
                  value={notificationSettings.deadlineThresholdDays}
                  onChange={e => updateNotificationSettings({ deadlineThresholdDays: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>1 dia</span>
                  <span>15 dias</span>
                  <span>30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
