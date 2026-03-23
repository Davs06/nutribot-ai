import { useState, useEffect } from 'react';
import { exercises as exercisesApi } from '../services/api';
import { Dumbbell, Plus, Trash2, Search, Flame, Clock, X, Sparkles } from 'lucide-react';
import { toast } from '../components/Toast';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [newExercise, setNewExercise] = useState({
    name: '',
    duration_minutes: '',
    met_value: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const [exercisesRes, historyRes, statsRes] = await Promise.all([
        exercisesApi.list(),
        exercisesApi.getHistory('today'),
        exercisesApi.getStats()
      ]);
      setExercises(exercisesRes.data.exercicios);
      setHistory(historyRes.data.exercicios);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await exercisesApi.search(searchQuery);
      setSearchResults(response.data.exercicios || []);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  };

  const handleSelectExercise = (exercise) => {
    setNewExercise({
      name: exercise.name,
      duration_minutes: '',
      met_value: exercise.met_value.toString()
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      await exercisesApi.register({
        name: newExercise.name,
        duration_minutes: parseInt(newExercise.duration_minutes),
        met_value: parseFloat(newExercise.met_value) || undefined,
        use_ai: useAI
      });
      setShowAddModal(false);
      setNewExercise({ name: '', duration_minutes: '', met_value: '' });
      setUseAI(false);
      loadExercises();
      toast.success('Exercício registrado!');
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
      toast.error('Erro ao adicionar exercício');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este exercício?')) return;
    try {
      await exercisesApi.delete(id);
      loadExercises();
      toast.success('Exercício removido!');
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  // Agrupar exercícios por categoria
  const exercisesByCategory = exercises.reduce((acc, ex) => {
    const category = ex.category || 'outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ex);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercícios</h1>
          <p className="text-gray-600">Registre e acompanhe seus treinos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar
        </button>
      </div>

      {/* Stats do dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Calorias gastas hoje</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.reduce((acc, ex) => acc + ex.calories_burned, 0)} kcal
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tempo total hoje</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.reduce((acc, ex) => acc + ex.duration_minutes, 0)} min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Exercícios hoje</p>
              <p className="text-2xl font-bold text-gray-900">{history.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de exercícios disponíveis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Exercícios Disponíveis</h2>
          </div>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch();
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Buscar exercício..."
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{ex.name}</span>
                    <span className="text-sm text-gray-500">MET: {ex.met_value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {Object.entries(exercisesByCategory).map(([category, catExercises]) => (
              <div key={category}>
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600 capitalize">
                  {category}
                </div>
                {catExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-gray-900">{ex.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      MET: {ex.met_value}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Histórico de hoje */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Hoje</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum exercício registrado hoje</p>
              </div>
            ) : (
              history.map((ex) => (
                <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{ex.name}</p>
                      <p className="text-sm text-gray-500">
                        {ex.duration_minutes} min • {ex.calories_burned} kcal
                      </p>
                      <p className="text-xs text-gray-400">
                        MET: {ex.met_value}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ex.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas gerais */}
      {stats && stats.total_exercicios > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas Gerais</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de exercícios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_exercicios}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Calorias totais</p>
              <p className="text-2xl font-bold text-orange-600">{stats.total_calorias}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tempo total</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(stats.total_minutos / 60)}h</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Dias ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.dias_ativos}</p>
            </div>
          </div>
          {stats.top_exercicios && stats.top_exercicios.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Exercícios mais praticados</h4>
              <div className="space-y-2">
                {stats.top_exercicios.map((ex, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-gray-900">{ex.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{ex.vezes}x • {ex.total_calorias} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Adicionar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Adicionar Exercício</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddExercise} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do exercício
                </label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Corrida"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    value={newExercise.duration_minutes}
                    onChange={(e) => setNewExercise({ ...newExercise, duration_minutes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MET {useAI ? '(calculado pela IA)' : '(opcional)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newExercise.met_value}
                    onChange={(e) => setNewExercise({ ...newExercise, met_value: e.target.value })}
                    disabled={useAI}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={useAI ? 'IA vai calcular' : '5.0'}
                  />
                </div>
              </div>
              
              {/* Checkbox Usar IA */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="use-ai"
                  checked={useAI}
                  onChange={(e) => {
                    setUseAI(e.target.checked);
                    if (e.target.checked) {
                      setNewExercise({ ...newExercise, met_value: '' });
                    }
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                />
                <label htmlFor="use-ai" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Calcular calorias com IA</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    A IA vai determinar o MET exato baseado no exercício e calcular calorias precisas
                  </p>
                </label>
              </div>
              
              {newExercise.name && newExercise.duration_minutes && (
                <div className={`rounded-lg p-4 ${
                  useAI 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-purple-50 border border-purple-200'
                }`}>
                  <p className={`text-sm ${useAI ? 'text-blue-800' : 'text-purple-800'}`}>
                    🔥 Calorias estimadas:{' '}
                    <span className="font-bold">
                      {Math.round(0.0175 * (parseFloat(newExercise.met_value) || 5) * 70 * parseInt(newExercise.duration_minutes))} kcal
                    </span>
                  </p>
                  <p className={`text-xs ${useAI ? 'text-blue-600' : 'text-purple-600'} mt-1`}>
                    {useAI 
                      ? '*A IA vai calcular o valor MET exato ao registrar' 
                      : '*Cálculo baseado em peso de 70kg'}
                  </p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
              >
                Adicionar Exercício
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
