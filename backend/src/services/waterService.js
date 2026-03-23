/**
 * Serviço de Controle de Consumo de Água
 * Implementa cálculos baseados em recomendações oficiais
 */

class WaterService {
  /**
   * Calcula a meta diária de água baseada no peso e biotipo
   * Fórmula base: 35ml por kg de peso corporal
   *
   * @param {Object} params - Parâmetros do usuário
   * @param {number} params.weight - Peso em kg
   * @param {string} params.bodyType - Biotipo (opcional)
   * @param {number} params.exerciseMinutes - Minutos de exercício diário (opcional)
   * @returns {number} Meta de água em ml/dia
   */
  static calcularMetaAgua({ weight, bodyType = null, exerciseMinutes = 0 }) {
    // Fórmula base: 35ml por kg
    let metaBase = weight * 35;

    // Ajuste por exercício: +350ml para cada 30 minutos
    const exerciseAdjustment = (exerciseMinutes / 30) * 350;

    // Ajuste por biotipo
    let bodyTypeMultiplier = 1;
    switch (bodyType) {
      case 'ectomorph':
        // Ectomorfos têm metabolismo mais rápido, precisam de +5% hidratação
        bodyTypeMultiplier = 1.05;
        break;
      case 'endomorph':
        // Endomorfos podem ter -2% (metabolismo mais lento)
        bodyTypeMultiplier = 0.98;
        break;
      case 'mesomorph':
      default:
        // Mesomorfos usam baseline
        bodyTypeMultiplier = 1.0;
    }

    const metaFinal = (metaBase + exerciseAdjustment) * bodyTypeMultiplier;
    return Math.round(metaFinal);
  }

  /**
   * Calcula o consumo de água com base no IMC
   * Para pessoas com IMC > 25, aumenta ligeiramente a recomendação
   *
   * @param {number} weight - Peso em kg
   * @param {number} height - Altura em cm
   * @returns {number} Meta ajustada em ml
   */
  static calcularMetaAguaComIMC(weight, height) {
    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);

    // Meta base
    let meta = weight * 35;

    // Ajuste para sobrepeso/obesidade: +10%
    if (imc >= 25 && imc < 30) {
      meta *= 1.05;
    } else if (imc >= 30) {
      meta *= 1.10;
    }

    return Math.round(meta);
  }

  /**
   * Retorna a quantidade recomendada por dia baseada em gênero e idade
   * (Recomendações gerais de saúde)
   *
   * @param {string} gender - 'male' ou 'female'
   * @param {number} age - Idade em anos
   * @returns {Object} Recomendações
   */
  static getRecomendacoesGerais(gender, age) {
    let recomendacaoBase;

    if (gender === 'male') {
      recomendacaoBase = age < 50 ? 3000 : 2500;
    } else {
      recomendacaoBase = age < 50 ? 2200 : 2000;
    }

    return {
      recomendacaoBase,
      minimo: recomendacaoBase * 0.8,
      maximo: recomendacaoBase * 1.3,
      porRefeicoes: Math.round(recomendacaoBase / 5), // Dividido em 5 refeições
      dicas: [
        'Beba água ao acordar (500ml)',
        'Beba 30min antes das refeições',
        'Mantenha garrafa sempre visível',
        'Monitore cor da urina (clara = hidratado)'
      ]
    };
  }

  /**
   * Calcula ajuste por condições climáticas
   *
   * @param {string} climate - 'frio', 'temperado', 'quente', 'tropical'
   * @param {number} baseMeta - Meta base em ml
   * @returns {number} Meta ajustada
   */
  static ajustarPorClima(climate, baseMeta) {
    const climateMultipliers = {
      frio: 0.9,
      temperado: 1.0,
      quente: 1.15,
      tropical: 1.25
    };

    const multiplier = climateMultipliers[climate] || 1.0;
    return Math.round(baseMeta * multiplier);
  }

  /**
   * Calcula ajuste para condições especiais
   *
   * @param {Object} conditions - Condições especiais
   * @param {boolean} conditions.pregnant - Grávida
   * @param {boolean} conditions.breastfeeding - Amamentando
   * @param {boolean} conditions.athlete - Atleta
   * @returns {Object} Ajustes
   */
  static ajustarCondicoesEspeciais(conditions = {}) {
    let ajuste = 0;
    const ajustesAplicados = [];

    if (conditions.pregnant) {
      ajuste += 500;
      ajustesAplicados.push('Gravidez: +500ml');
    }

    if (conditions.breastfeeding) {
      ajuste += 700;
      ajustesAplicados.push('Amamentação: +700ml');
    }

    if (conditions.athlete) {
      ajuste += 500;
      ajustesAplicados.push('Atleta: +500ml');
    }

    return {
      ajusteTotal: ajuste,
      ajustesAplicados,
      descricao: ajustesAplicados.length > 0 
        ? `Ajustes: ${ajustesAplicados.join(', ')}` 
        : 'Sem ajustes especiais'
    };
  }

  /**
   * Gera relatório completo de hidratação
   *
   * @param {Object} userData - Dados completos do usuário
   * @returns {Object} Relatório de hidratação
   */
  static gerarRelatorioHidratacao(userData) {
    const {
      weight,
      height,
      gender,
      age,
      bodyType,
      activityLevel
    } = userData;

    // Meta base por peso
    const metaPorPeso = this.calcularMetaAgua({ weight, bodyType });

    // Meta por gênero/idade (referência)
    const metaPorGenero = this.getRecomendacoesGerais(gender, age);

    // Ajuste por nível de atividade
    let exerciseMinutes = 0;
    const activityExerciseMap = {
      sedentary: 0,
      light: 15,
      moderate: 30,
      active: 45,
      very_active: 60
    };
    exerciseMinutes = activityExerciseMap[activityLevel] || 0;

    const metaComExercicio = this.calcularMetaAgua({ 
      weight, 
      bodyType, 
      exerciseMinutes 
    });

    return {
      metaRecomendada: metaComExercicio,
      metaPorPeso: metaPorPeso,
      metaPorGenero: metaPorGenero.recomendacaoBase,
      ajustes: {
        bodyType,
        exerciseMinutes,
        climate: 'temperado' // padrão
      },
      dicas: metaPorGenero.dicas,
      limites: {
        minimo: metaPorGenero.minimo,
        maximo: metaPorGenero.maximo
      }
    };
  }
}

module.exports = WaterService;
