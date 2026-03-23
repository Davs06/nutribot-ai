import { useState, useEffect } from 'react';
import { dashboard, food, exercises } from '../services/api';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Utensils,
  Dumbbell,
  Target,
  Droplets,
  Wheat,
  Beef,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week'); // 'day', 'week' ou 'month'

  useEffect(() => {
    loadDashboard();
  }, [period]);

  const loadDashboard = async () => {
    try {
      const response = await dashboard.get(period);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { usuario, metricas, hoje, semana, progresso_peso } = data;
  const objetivoTexto = {
    lose_weight: 'Perder peso',
    maintain: 'Manter peso',
    gain_muscle: 'Ganhar massa'
  }[usuario.objetivo];

  // Cores do gráfico de macros
  const macroColors = ['#22c55e', '#3b82f6', '#eab308'];
  const macroData = [
    { name: 'Proteína', value: hoje.progresso_macros.proteina, full: 100 },
    { name: 'Carbs', value: hoje.progresso_macros.carbs, full: 100 },
    { name: 'Gordura', value: hoje.progresso_macros.fat, full: 100 },
  ];

  // Gráfico de calorias da semana
  const weekData = semana.dias.map(d => ({
    dia: new Date(d.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
    calorias: d.calorias,
    meta: metricas.meta_calorica
  })).reverse();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Olá, {usuario.nome}! 👋
            </h1>
            <p className="text-gray-600">
              Objetivo: <span className="font-semibold text-green-600">{objetivoTexto}</span>
            </p>
          </div>
          
          {/* Filtros de Período */}
          <div className="flex gap-1">
            <button
              onClick={() => setPeriod('day')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                period === 'day'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                period === 'week'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                period === 'month'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Calorias */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            {hoje.saldo >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Calorias líquidas</p>
          <p className="text-2xl font-bold text-gray-900">{hoje.calorias_liquidas}</p>
          <p className="text-xs text-gray-500 mt-1">
            Meta: {metricas.meta_calorica} kcal
          </p>
        </div>

        {/* Consumo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Consumido hoje</p>
          <p className="text-2xl font-bold text-gray-900">{hoje.consumo.calorias} kcal</p>
          <p className="text-xs text-gray-500 mt-1">
            {hoje.refeicoes_count} refeições
          </p>
        </div>

        {/* Gasto */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Gasto em exercícios</p>
          <p className="text-2xl font-bold text-gray-900">{hoje.gasto_exercicios} kcal</p>
          <p className="text-xs text-gray-500 mt-1">
            {hoje.exercicios_count} exercícios
          </p>
        </div>

        {/* Saldo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            {hoje.saldo >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Saldo do dia</p>
          <p className={`text-2xl font-bold ${hoje.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {hoje.saldo >= 0 ? '+' : ''}{hoje.saldo} kcal
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hoje.saldo >= 0 ? 'Dentro da meta' : 'Acima da meta'}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Macros */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Macronutrientes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={macroData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => `${Math.round(value)}%`}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {macroData.map((entry, index) => (
                    <Cell key={index} fill={macroColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Beef className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Proteína</span>
              </div>
              <p className="font-semibold text-green-600">{hoje.progresso_macros.proteina}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Wheat className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600">Carbs</span>
              </div>
              <p className="font-semibold text-blue-600">{hoje.progresso_macros.carbs}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplets className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-gray-600">Gordura</span>
              </div>
              <p className="font-semibold text-yellow-600">{hoje.progresso_macros.fat}%</p>
            </div>
          </div>
        </div>

        {/* Calorias da semana */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'meta') return [`${value} kcal`, 'Meta'];
                    return [`${value} kcal`, 'Consumido'];
                  }}
                />
                <Bar dataKey="calorias" fill="#22c55e" radius={[4, 4, 0, 0]} name="Consumido" />
                <Bar dataKey="meta" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Média diária: <span className="font-semibold">{semana.media_calorias_diaria} kcal</span>
            </p>
          </div>
        </div>
      </div>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TMB */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6" />
            <h3 className="font-semibold">Taxa Metabólica Basal</h3>
          </div>
          <p className="text-3xl font-bold mb-2">{metricas.tmb} kcal</p>
          <p className="text-sm opacity-90">
            Seu corpo queima {metricas.tmb} calorias por dia em repouso
          </p>
        </div>

        {/* TDEE */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6" />
            <h3 className="font-semibold">Gasto Energético Total</h3>
          </div>
          <p className="text-3xl font-bold mb-2">{metricas.tdee} kcal</p>
          <p className="text-sm opacity-90">
            Com sua atividade física atual
          </p>
        </div>

        {/* IMC */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6" />
            <h3 className="font-semibold">IMC</h3>
          </div>
          <p className="text-3xl font-bold mb-2">{metricas.imc.imc}</p>
          <p className="text-sm opacity-90">
            {metricas.imc.classificacao}
          </p>
        </div>
      </div>
    </div>
  );
}
