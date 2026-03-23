import { useState, useEffect } from 'react';
import { food as foodApi } from '../services/api';
import { Utensils, Plus, Trash2, Camera, Search, X, Sparkles } from 'lucide-react';
import { toast } from '../components/Toast';

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showAnalyzeText, setShowAnalyzeText] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const [newMeal, setNewMeal] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    meal_type: 'snack'
  });

  const [textToAnalyze, setTextToAnalyze] = useState('');

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const [mealsRes, summaryRes] = await Promise.all([
        foodApi.getMeals('today'),
        foodApi.getDailySummary()
      ]);
      setMeals(mealsRes.data.meals);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      await foodApi.registerMeal({
        ...newMeal,
        calories: parseFloat(newMeal.calories),
        protein: parseFloat(newMeal.protein) || 0,
        carbs: parseFloat(newMeal.carbs) || 0,
        fat: parseFloat(newMeal.fat) || 0,
      });
      setShowAddModal(false);
      setNewMeal({ name: '', description: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'snack' });
      loadMeals();
      toast.success('Refeição registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar refeição:', error);
      toast.error('Erro ao adicionar refeição');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await foodApi.search(searchQuery);
      setSearchResults(response.data.resultados || []);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta refeição?')) return;
    try {
      await foodApi.deleteMeal(id);
      loadMeals();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await foodApi.analyzeImage(formData);
      const analise = response.data.analise.dados;

      setNewMeal({
        name: analise.refeicao_completa.descricao_refeicao || 'Refeição analisada',
        description: analise.refeicao_completa.descricao_refeicao || '',
        calories: Math.round(analise.refeicao_completa.calorias_totais),
        protein: Math.round(analise.refeicao_completa.proteina_total),
        carbs: Math.round(analise.refeicao_completa.carboidratos_total),
        fat: Math.round(analise.refeicao_completa.gordura_total),
        meal_type: 'snack'
      });

      setShowImageUpload(false);
      setShowAddModal(true);
      toast.success('Imagem analisada!');
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      const isApiKeyError = error.response?.data?.detalhes?.includes('API key not valid');
      toast.error(isApiKeyError ? 'API do Gemini inválida' : 'Erro ao analisar imagem');
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!textToAnalyze.trim()) {
      toast.error('Digite o que você comeu');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await foodApi.analyzeText(textToAnalyze);
      const analise = response.data.analise.dados;

      setNewMeal({
        name: analise.refeicao_completa.descricao || 'Refeição analisada por IA',
        description: textToAnalyze,
        calories: Math.round(analise.refeicao_completa.calorias_totais),
        protein: Math.round(analise.refeicao_completa.proteina_total),
        carbs: Math.round(analise.refeicao_completa.carboidratos_total),
        fat: Math.round(analise.refeicao_completa.gordura_total),
        meal_type: 'snack'
      });

      setShowAnalyzeText(false);
      setTextToAnalyze('');
      setShowAddModal(true);
      toast.success('Refeição analisada!');
    } catch (error) {
      console.error('Erro ao analisar texto:', error);
      const isApiKeyError = error.response?.data?.detalhes?.includes('API key not valid');
      toast.error(isApiKeyError ? 'API do Gemini inválida' : 'Erro ao analisar');
    } finally {
      setAnalyzing(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refeições</h1>
          <p className="text-gray-600">Registre e acompanhe sua alimentação</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalyzeText(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Analisar com IA
          </button>
          <button
            onClick={() => setShowImageUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Analisar Foto
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Resumo do dia */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Calorias</p>
            <p className="text-2xl font-bold text-orange-600">{Math.round(summary.consumo.calorias)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Proteína</p>
            <p className="text-2xl font-bold text-green-600">{Math.round(summary.consumo.proteina)}g</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Carbs</p>
            <p className="text-2xl font-bold text-blue-600">{Math.round(summary.consumo.carbs)}g</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Gordura</p>
            <p className="text-2xl font-bold text-yellow-600">{Math.round(summary.consumo.fat)}g</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Meta</p>
            <p className="text-2xl font-bold text-gray-900">{summary.meta.calorias}</p>
          </div>
        </div>
      )}

      {/* Lista de refeições */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Refeições de hoje</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {meals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma refeição registrada hoje</p>
              <p className="text-sm">Clique em "Adicionar" para registrar</p>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{meal.name}</p>
                    <p className="text-sm text-gray-500">
                      {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • G: {meal.fat}g
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(meal.consumed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(meal.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Adicionar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Adicionar Refeição</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMeal} className="p-6 space-y-4">
              {newMeal.calories && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Dados calculados automaticamente</p>
                    <p className="text-xs text-green-700 mt-1">
                      A IA analisou e calculou os valores nutricionais
                    </p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Arroz com frango"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
                <textarea
                  value={newMeal.description}
                  onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="2"
                  placeholder="Ex: 100g de arroz, 150g de frango grelhado"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calorias</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={newMeal.meal_type}
                    onChange={(e) => setNewMeal({ ...newMeal, meal_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="breakfast">Café da manhã</option>
                    <option value="lunch">Almoço</option>
                    <option value="dinner">Jantar</option>
                    <option value="snack">Lanche</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proteína (g)</label>
                  <input
                    type="number"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gordura (g)</label>
                  <input
                    type="number"
                    value={newMeal.fat}
                    onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Adicionar Refeição
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Upload de Imagem */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analisar Foto da Refeição</h3>
              <button onClick={() => setShowImageUpload(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors flex items-center justify-center">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Clique para selecionar uma foto</p>
                  <p className="text-sm text-gray-500">ou arraste e solte</p>
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-4 text-center">
                A IA vai analisar a imagem e estimar as calorias e nutrientes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Análise por Texto com IA */}
      {showAnalyzeText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analisar com IA</h3>
              <button onClick={() => setShowAnalyzeText(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descreva o que você comeu
                </label>
                <textarea
                  value={textToAnalyze}
                  onChange={(e) => setTextToAnalyze(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Ex: comi 2 ovos mexidos com 1 fatia de pão e 1 copo de suco de laranja"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Seja detalhista: mencione quantidades e como foi preparado
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnalyzeText(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAnalyzeWithAI}
                  disabled={analyzing || !textToAnalyze.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analisar
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                A IA vai calcular automaticamente as calorias e nutrientes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
