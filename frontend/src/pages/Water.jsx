import { useState, useEffect } from 'react';
import { water as waterApi } from '../services/api';
import { Droplets, Plus, Trash2, TrendingUp, Award, Info } from 'lucide-react';
import { toast } from '../components/Toast';

export default function Water() {
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState(null);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('day'); // 'day', 'week' ou 'month'
  const [showAddModal, setShowAddModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [customGoal, setCustomGoal] = useState('');

  useEffect(() => {
    loadWaterData();
  }, [period]);

  const loadWaterData = async () => {
    try {
      const [todayRes, statsRes] = await Promise.all([
        waterApi.getToday(),
        waterApi.getStats(period)
      ]);
      setTodayData(todayRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados de água:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (amount) => {
    try {
      await waterApi.register({ amount_ml: amount });
      loadWaterData();
      setShowAddModal(false);
      setCustomAmount('');
      toast.success('Consumo registrado!');
    } catch (error) {
      console.error('Erro ao registrar água:', error);
      toast.error('Erro ao registrar consumo');
    }
  };

  const handleUpdateGoal = async () => {
    if (!customGoal || customGoal < 500 || customGoal > 10000) {
      toast.error('Meta inválida (500-10000ml)');
      return;
    }
    try {
      await waterApi.updateGoal({ water_goal_ml: parseInt(customGoal) });
      loadWaterData();
      setShowGoalModal(false);
      setCustomGoal('');
      toast.success('Meta atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return;
    try {
      await waterApi.delete(id);
      loadWaterData();
      toast.success('Registro removido!');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao remover registro');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickAmounts = [250, 500, 750];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Controle de Água</h1>
            <p className="text-gray-600">Mantenha-se hidratado durante o dia</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 mr-2">
              <button
                onClick={() => setPeriod('day')}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                  period === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                  period === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                  period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Mês
              </button>
            </div>
            <button onClick={() => setShowGoalModal(true)} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm">
              Meta
            </button>
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
              Registrar
            </button>
          </div>
        </div>
      </div>

      {/* Card Principal */}
      {todayData && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 mb-2">Consumo de hoje</p>
              <p className="text-5xl font-bold">{Math.round(todayData.consumo_total)}ml</p>
              <p className="text-blue-100 mt-2">Meta: {Math.round(todayData.meta)}ml</p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-400" />
                <circle
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - Math.min(todayData.porcentagem / 100, 1))}
                  className="text-white transition-all duration-500" strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{todayData.porcentagem}%</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-400 rounded-full h-3 overflow-hidden">
            <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(todayData.porcentagem, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-blue-100">
            <span>0ml</span>
            <span>{Math.round(todayData.restante)}ml restantes</span>
            <span>{Math.round(todayData.meta)}ml</span>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Estatísticas - {period === 'week' ? 'Esta Semana' : 'Este Mês'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Média diária</p>
              <p className="text-xl font-bold text-gray-900">{Math.round(stats.media_diaria)}ml</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Dias consecutivos</p>
              <p className="text-xl font-bold text-gray-900">{stats.dias_consecutivos}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Registros</p>
              <p className="text-xl font-bold text-gray-900">{stats.total_registros}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">% da meta</p>
              <p className="text-xl font-bold text-gray-900">{stats.porcentagem_meta}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Registros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registros de hoje</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {todayData && todayData.registros && todayData.registros.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Droplets className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum registro hoje</p>
            </div>
          ) : (
            todayData && todayData.registros.map((registro) => (
              <div key={registro.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{registro.amount_ml}ml</p>
                  <p className="text-xs text-gray-500">
                    {new Date(registro.consumed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => handleDelete(registro.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Adicionar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Registrar Consumo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((amount) => (
                  <button key={amount} onClick={() => handleAddWater(amount)} className="py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl text-blue-700 font-semibold">
                    {amount}ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ou digite quantidade (ml)"
              />
              <button
                onClick={() => handleAddWater(parseInt(customAmount))}
                disabled={!customAmount || customAmount <= 0}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Meta */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Definir Meta Diária</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">Meta recomendada: <strong>35ml por kg</strong> de peso corporal.</p>
              {todayData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">Meta atual: <strong>{Math.round(todayData.meta)}ml/dia</strong></p>
                </div>
              )}
              <input
                type="number"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ex: 2500"
              />
              <p className="text-xs text-gray-500">Mínimo: 500ml | Máximo: 10000ml</p>
              <button
                onClick={handleUpdateGoal}
                disabled={!customGoal}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50"
              >
                Atualizar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
