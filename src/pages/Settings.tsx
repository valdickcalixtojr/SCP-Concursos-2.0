import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, User, MapPin, Globe, GraduationCap, Layout, Bell, Mail, Smartphone } from 'lucide-react';
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-0 pb-12">
      <div className="py-4 sm:py-0">
        <h2 className="text-2xl font-bold text-slate-900">Configurações de Pontuação</h2>
        <p className="text-slate-500 text-sm sm:text-base">Defina critérios para pontuar e priorizar os concursos automaticamente.</p>
      </div>

      {/* Perfil do Usuário Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center space-x-2">
          <User className="text-indigo-600 shrink-0" size={20} />
          <h3 className="text-lg font-semibold text-slate-800">Perfil do Usuário</h3>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* UFs Desejadas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-700 font-medium">
              <MapPin size={18} className="text-slate-400 shrink-0" />
              <span className="text-sm sm:text-base">Estados (UFs) Desejados</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <select 
                  value={newUf}
                  onChange={e => setNewUf(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">UF</option>
                  {BRAZILIAN_UFS.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="number" 
                    placeholder="Pts"
                    value={newUfPoints}
                    onChange={e => setNewUfPoints(Number(e.target.value))}
                    className="w-20 sm:w-16 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleAddUf}
                    className="flex-1 sm:flex-none flex justify-center items-center bg-indigo-600 sm:bg-indigo-50 text-white sm:text-indigo-600 py-3 sm:py-2 px-4 sm:px-3 rounded-lg sm:rounded-md hover:bg-indigo-700 sm:hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={20} />
                    <span className="sm:hidden font-medium ml-2">Adicionar</span>
                  </button>
                </div>
              </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(userProfileScoring.ufs_desejadas || {}).map(([uf, pts]) => (
                      <div key={uf} className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 pl-3 pr-1 py-1 rounded-full text-sm font-medium border border-indigo-100">
                        <span>{uf}: {pts} pts</span>
                        <button onClick={() => handleRemoveUf(uf)} className="text-indigo-400 hover:text-rose-500 p-2 rounded-full hover:bg-indigo-100 transition-colors">
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
              <Globe size={18} className="text-slate-400 shrink-0" />
              <span className="text-sm sm:text-base">Esferas Preferidas</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <select 
                  value={newEsfera}
                  onChange={e => setNewEsfera(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Selecionar Categoria</option>
                  {Object.keys(ESFERA_PATTERNS).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="Federal">Federal (Simples)</option>
                  <option value="Estadual">Estadual (Simples)</option>
                  <option value="Municipal">Municipal (Simples)</option>
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="number" 
                    placeholder="Pts"
                    value={newEsferaPoints}
                    onChange={e => setNewEsferaPoints(Number(e.target.value))}
                    className="w-20 sm:w-16 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleAddEsfera}
                    className="flex-1 sm:flex-none flex justify-center items-center bg-indigo-600 sm:bg-indigo-50 text-white sm:text-indigo-600 py-3 sm:py-2 px-4 sm:px-3 rounded-lg sm:rounded-md hover:bg-indigo-700 sm:hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={20} />
                    <span className="sm:hidden font-medium ml-2">Adicionar</span>
                  </button>
                </div>
              </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(userProfileScoring.esferas_preferidas || {}).map(([esfera, pts]) => (
                      <div key={esfera} className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 pl-3 pr-1 py-1 rounded-full text-sm font-medium border border-emerald-100">
                        <span className="max-w-[200px] truncate" title={esfera}>{esfera}: {pts} pts</span>
                        <button onClick={() => handleRemoveEsfera(esfera)} className="text-emerald-400 hover:text-rose-500 flex-shrink-0 p-2 rounded-full hover:bg-emerald-100 transition-colors">
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
              <Layout size={18} className="text-slate-400 shrink-0" />
              <span className="text-sm sm:text-base">Modalidades Preferidas</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <select 
                  value={newModalidade}
                  onChange={e => setNewModalidade(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Selecionar Modalidade</option>
                  {Object.keys(MODALIDADE_PATTERNS).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="number" 
                    placeholder="Pts"
                    value={newModalidadePoints}
                    onChange={e => setNewModalidadePoints(Number(e.target.value))}
                    className="w-20 sm:w-16 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleAddModalidade}
                    className="flex-1 sm:flex-none flex justify-center items-center bg-indigo-600 sm:bg-indigo-50 text-white sm:text-indigo-600 py-3 sm:py-2 px-4 sm:px-3 rounded-lg sm:rounded-md hover:bg-indigo-700 sm:hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={20} />
                    <span className="sm:hidden font-medium ml-2">Adicionar</span>
                  </button>
                </div>
              </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(userProfileScoring.modalidades_preferidas || {}).map(([modalidade, pts]) => (
                      <div key={modalidade} className="flex items-center space-x-2 bg-amber-50 text-amber-700 pl-3 pr-1 py-1 rounded-full text-sm font-medium border border-amber-100">
                        <span className="max-w-[200px] truncate" title={modalidade}>{modalidade}: {pts} pts</span>
                        <button onClick={() => handleRemoveModalidade(modalidade)} className="text-amber-400 hover:text-rose-500 flex-shrink-0 p-2 rounded-full hover:bg-amber-100 transition-colors">
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
              <GraduationCap size={18} className="text-slate-400 shrink-0" />
              <span className="text-sm sm:text-base">Nível de Escolaridade Alvo</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <select 
                  value={newEscolaridade}
                  onChange={e => setNewEscolaridade(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Selecionar Escolaridade</option>
                  {ESCOLARIDADE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="number" 
                    placeholder="Pts"
                    value={newEscolaridadePoints}
                    onChange={e => setNewEscolaridadePoints(Number(e.target.value))}
                    className="w-20 sm:w-16 px-3 py-3 sm:py-2 border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleAddEscolaridade}
                    className="flex-1 sm:flex-none flex justify-center items-center bg-indigo-600 sm:bg-indigo-50 text-white sm:text-indigo-600 py-3 sm:py-2 px-4 sm:px-3 rounded-lg sm:rounded-md hover:bg-indigo-700 sm:hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={20} />
                    <span className="sm:hidden font-medium ml-2">Adicionar</span>
                  </button>
                </div>
              </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(userProfileScoring.escolaridades_preferidas || {}).map(([escolaridade, pts]) => (
                      <div key={escolaridade} className="flex items-center space-x-2 bg-blue-50 text-blue-700 pl-3 pr-1 py-1 rounded-full text-sm font-medium border border-blue-100">
                        <span className="max-w-[200px] truncate" title={escolaridade}>{escolaridade}: {pts} pts</span>
                        <button onClick={() => handleRemoveEscolaridade(escolaridade)} className="text-blue-400 hover:text-rose-500 flex-shrink-0 p-2 rounded-full hover:bg-blue-100 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">Ganha pontos se estas palavras forem encontradas nos cargos, órgão ou disciplinas.</p>
          </div>
        </div>
      </div>

      {/* Regras de Pontuação Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-800">Regras de Pontuação Dinâmicas</h3>
          <button
            onClick={handleAddRule}
            className="w-full sm:w-auto flex justify-center items-center space-x-2 bg-indigo-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-base sm:text-sm font-medium"
          >
            <Plus size={18} />
            <span>Adicionar Regra</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {scoringRules.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
              <AlertCircle size={48} className="text-slate-300 mb-3" />
              <p className="font-medium">Nenhuma regra dinâmica configurada.</p>
              <p className="text-sm mt-1">Adicione regras para calcular a pontuação dos concursos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scoringRules.map((rule) => (
                <div key={rule.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  
                  {/* Agrupamento 1: Selects (Empilhados no mobile, lado a lado no desktop) */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:flex-1">
                    <select
                      value={rule.field}
                      onChange={(e) => updateScoringRule(rule.id, { field: e.target.value as any })}
                      className="w-full sm:flex-1 px-3 py-3 sm:py-2 bg-white border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full sm:flex-1 px-3 py-3 sm:py-2 bg-white border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="contains">Contém</option>
                      <option value="equals">Igual a</option>
                      <option value="greater_than">Maior que (números)</option>
                      <option value="less_than">Menor que (números)</option>
                    </select>
                  </div>

                  {/* Agrupamento 2: Input de Valor */}
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateScoringRule(rule.id, { value: e.target.value })}
                    placeholder="Valor (ex: 5000, FGV)"
                    className="w-full sm:flex-1 px-3 py-3 sm:py-2 bg-white border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Agrupamento 3: Pontos e Botão de Remover */}
                  <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
                    <div className="flex-1 flex items-center justify-between sm:justify-start space-x-2">
                      <span className="text-sm font-medium text-slate-600">Pontos:</span>
                      <input
                        type="number"
                        value={rule.points}
                        onChange={(e) => updateScoringRule(rule.id, { points: Number(e.target.value) })}
                        className="w-24 sm:w-20 px-3 py-3 sm:py-2 bg-white border border-slate-300 rounded-lg sm:rounded-md text-base sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => removeScoringRule(rule.id)}
                      className="p-3 sm:p-2 text-rose-500 bg-rose-50 sm:bg-transparent sm:text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg sm:rounded-md transition-colors"
                      title="Remover regra"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 p-4 sm:p-6 border-t border-slate-100 text-sm text-slate-600">
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
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center space-x-2">
          <Bell className="text-indigo-600 shrink-0" size={20} />
          <h3 className="text-lg font-semibold text-slate-800">Preferências de Notificação</h3>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Canais de Notificação */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Canais de Envio</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all group gap-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-indigo-600 transition-colors shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="pr-2">
                      <span className="text-sm font-semibold text-slate-700 block line-clamp-1">E-mail</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">Receba resumos e alertas na sua caixa de entrada</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={notificationSettings.emailEnabled}
                      onChange={e => updateNotificationSettings({ emailEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all group gap-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-indigo-600 transition-colors shrink-0">
                      <Smartphone size={18} />
                    </div>
                    <div className="pr-2">
                      <span className="text-sm font-semibold text-slate-700 block line-clamp-1">Push (Navegador)</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">Alertas em tempo real no seu dispositivo</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer shrink-0">
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
                  <label key={trigger.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 pr-4">
                      <span className="text-sm font-semibold text-slate-700 block group-hover:text-indigo-600 transition-colors">{trigger.label}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">{trigger.desc}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings[trigger.id as keyof NotificationSettings] as boolean}
                      onChange={e => updateNotificationSettings({ [trigger.id]: e.target.checked })}
                      className="w-6 h-6 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-lg transition-all cursor-pointer shrink-0"
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
                  <p className="text-xs text-slate-500 mt-1">Defina com quantos dias de antecedência você quer ser alertado sobre encerramentos.</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shrink-0 ml-4">
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
