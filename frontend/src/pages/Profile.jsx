import { useState, useEffect } from 'react';
import { auth } from '../services/api';
import { User, Activity, Target, Save, Sparkles, Weight } from 'lucide-react';
import { toast } from '../components/Toast';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    height: '',
    goal: '',
    activity_level: '',
    body_type: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await auth.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.usuario.name || '',
        weight: response.data.usuario.peso || '',
        height: response.data.usuario.altura || '',
        goal: response.data.usuario.objetivo || '',
        activity_level: response.data.usuario.nivelAtividade || '',
        body_type: response.data.usuario.biotipo || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await auth.updateProfile({
        name: formData.name,
        weight: parseFloat(formData.weight),
        height: formData.height ? parseInt(formData.height) : undefined,
        goal: formData.goal,
        activity_level: formData.activity_level,
        body_type: formData.body_type || null
      });
      setEditing(false);
      loadProfile();
      toast.success('Perfil atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  const objetivoTexto = {
    lose_weight: 'Perder peso',
    maintain: 'Manter peso',
    gain_muscle: 'Ganhar massa muscular'
  }[profile.usuario.objetivo];

  const atividadeTexto = {
    sedentary: 'Sedentário',
    light: 'Leve (1-3 dias/semana)',
    moderate: 'Moderado (3-5 dias/semana)',
    active: 'Ativo (6-7 dias/semana)',
    very_active: 'Muito ativo'
  }[profile.usuario.activity_level];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie seus dados e preferências</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Editar
          </button>
        ) : (
          <button
            onClick={() => {
              setEditing(false);
              loadProfile();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações pessoais */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </h3>
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="175"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="lose_weight">Perder peso</option>
                  <option value="maintain">Manter peso</option>
                  <option value="gain_muscle">Ganhar massa muscular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nível de atividade</label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="sedentary">Sedentário</option>
                  <option value="light">Leve (1-3 dias/semana)</option>
                  <option value="moderate">Moderado (3-5 dias/semana)</option>
                  <option value="active">Ativo (6-7 dias/semana)</option>
                  <option value="very_active">Muito ativo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biotipo <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <select
                  value={formData.body_type}
                  onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Não sei / Não informar</option>
                  <option value="ectomorph">Ectomorfo (delgado, metabolismo rápido)</option>
                  <option value="mesomorph">Mesomorfo (musculoso, metabolismo equilibrado)</option>
                  <option value="endomorph">Endomorfo (robusto, metabolismo lento)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  O biotipo influencia no cálculo do metabolismo e IMC
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar alterações
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nome</p>
                <p className="font-semibold text-gray-900">{profile.usuario.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{profile.usuario.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Idade</p>
                  <p className="font-semibold text-gray-900">{profile.usuario.age} anos</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gênero</p>
                  <p className="font-semibold text-gray-900 capitalize">{profile.usuario.gender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Peso atual</p>
                <p className="font-semibold text-gray-900">{profile.usuario.peso} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Altura</p>
                <p className="font-semibold text-gray-900">{profile.usuario.altura} cm</p>
              </div>
            </div>
          )}
        </div>

        {/* Métricas */}
        <div className="space-y-6">
          {/* Objetivo e atividade */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Objetivo & Atividade
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Objetivo</p>
                <p className="font-semibold text-green-600">{objetivoTexto}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Nível de atividade</p>
                <p className="font-semibold text-gray-900">{atividadeTexto}</p>
              </div>
              {profile.usuario.biotipo && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Biotipo</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    {{
                      ectomorph: 'Ectomorfo (metabolismo rápido)',
                      mesomorph: 'Mesomorfo (metabolismo equilibrado)',
                      endomorph: 'Endomorfo (metabolismo lento)'
                    }[profile.usuario.biotipo]}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Métricas metabólicas */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Métricas Metabólicas
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Taxa Metabólica Basal (TMB)</p>
                <p className="text-3xl font-bold">{profile.tmb} kcal/dia</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Gasto Energético Total (TDEE)</p>
                <p className="text-3xl font-bold">{profile.tdee} kcal/dia</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Meta calórica diária</p>
                <p className="text-3xl font-bold">{profile.meta.caloriasAlvo} kcal</p>
              </div>
            </div>
          </div>

          {/* IMC */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Weight className="w-5 h-5" />
              IMC - Índice de Massa Corporal
            </h3>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-2">{profile.imc.imc}</p>
              <p className="text-sm text-gray-600">{profile.imc.classificacao}</p>
              <div className="mt-4 h-4 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-400 rounded-full"></div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Abaixo</span>
                <span>Normal</span>
                <span>Sobrepeso</span>
                <span>Obesidade</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição de Macronutrientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">{profile.macros.percentages.protein}%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Proteína</p>
            <p className="font-semibold text-gray-900">{profile.macros.protein}g/dia</p>
            <p className="text-xs text-gray-500">{profile.macros.calories.fromProtein} kcal</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{profile.macros.percentages.carbs}%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Carboidratos</p>
            <p className="font-semibold text-gray-900">{profile.macros.carbs}g/dia</p>
            <p className="text-xs text-gray-500">{profile.macros.calories.fromCarbs} kcal</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-yellow-600">{profile.macros.percentages.fat}%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Gordura</p>
            <p className="font-semibold text-gray-900">{profile.macros.fat}g/dia</p>
            <p className="text-xs text-gray-500">{profile.macros.calories.fromFat} kcal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
