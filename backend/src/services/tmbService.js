/**
 * Serviço de Cálculos Metabólicos
 * Implementa fórmulas científicas para TMB e gasto calórico
 * Com suporte para biotipos (somatotipos)
 */

class TMBService {
  // Multiplicadores de TMB por biotipo
  // Ectomorfos: metabolismo mais rápido (+5%)
  // Endomorfos: metabolismo mais lento (-5%)
  // Mesomorfos: baseline
  static bodyTypeMultipliers = {
    ectomorph: 1.05,
    mesomorph: 1.0,
    endomorph: 0.95
  };
  /**
   * Calcula a Taxa Metabólica Basal usando a fórmula Mifflin-St Jeor
   * (Considerada a mais precisa atualmente)
   *
   * @param {Object} params - Parâmetros do usuário
   * @param {number} params.weight - Peso em kg
   * @param {number} params.height - Altura em cm
   * @param {number} params.age - Idade em anos
   * @param {string} params.gender - 'male' ou 'female'
   * @param {string} params.bodyType - Biotipo (opcional): 'ectomorph', 'mesomorph', 'endomorph'
   * @returns {number} TMB em kcal/dia
   */
  static calcularTMB({ weight, height, age, gender, bodyType = null }) {
    const baseCalculus = 10 * weight + 6.25 * height - 5 * age;

    let tmb;
    if (gender === 'male') {
      tmb = baseCalculus + 5;
    } else if (gender === 'female') {
      tmb = baseCalculus - 161;
    } else {
      // Para 'other', usa a média
      tmb = baseCalculus - 78;
    }

    // Aplicar ajuste por biotipo se definido
    if (bodyType && this.bodyTypeMultipliers[bodyType]) {
      tmb *= this.bodyTypeMultipliers[bodyType];
    }

    return Math.round(tmb);
  }

  /**
   * Calcula o Gasto Energético Total Diário (TDEE)
   * baseado no nível de atividade física
   * 
   * @param {number} tmb - Taxa Metabólica Basal
   * @param {string} activityLevel - Nível de atividade
   * @returns {number} TDEE em kcal/dia
   */
  static calcularTDEE(tmb, activityLevel) {
    const multipliers = {
      sedentary: 1.2,      // Pouco ou nenhum exercício
      light: 1.375,        // Exercício leve 1-3 dias/semana
      moderate: 1.55,      // Exercício moderado 3-5 dias/semana
      active: 1.725,       // Exercício intenso 6-7 dias/semana
      very_active: 1.9     // Exercício muito intenso + trabalho físico
    };

    const multiplier = multipliers[activityLevel] || multipliers.moderate;
    return Math.round(tmb * multiplier);
  }

  /**
   * Calcula a meta calórica diária baseada no objetivo
   * 
   * @param {number} tdee - Gasto Energético Total Diário
   * @param {string} goal - Objetivo do usuário
   * @returns {Object} Meta calórica e distribuição de macros
   */
  static calcularMetaCalorica(tdee, goal) {
    let caloriasAlvo;
    let descricao;

    switch (goal) {
      case 'lose_weight':
        caloriasAlvo = tdee - 500; // Déficit de 500 kcal/dia (~0.5kg/semana)
        descricao = 'Déficit calórico moderado para perda de peso';
        break;
      case 'gain_muscle':
        caloriasAlvo = tdee + 300; // Superávit de 300 kcal/dia
        descricao = 'Superávit calórico para ganho de massa muscular';
        break;
      case 'maintain':
      default:
        caloriasAlvo = tdee;
        descricao = 'Manutenção do peso atual';
    }

    // Distribuição de macronutrientes (em gramas)
    // Proteína: 2g/kg para ganho muscular, 1.6g/kg para perda
    // Gordura: 0.8-1g/kg
    // Carboidratos: restante das calorias

    return {
      caloriasAlvo: Math.round(caloriasAlvo),
      descricao,
      tdee
    };
  }

  /**
   * Calcula distribuição de macronutrientes baseada no objetivo
   * 
   * @param {number} caloriasAlvo - Calorias diárias alvo
   * @param {number} weight - Peso do usuário em kg
   * @param {string} goal - Objetivo do usuário
   * @returns {Object} Distribuição de macros em gramas
   */
  static calcularMacros(caloriasAlvo, weight, goal) {
    let proteinPerKg, fatPerKg;

    switch (goal) {
      case 'lose_weight':
        proteinPerKg = 2.0; // Mais proteína para preservar músculo
        fatPerKg = 0.8;
        break;
      case 'gain_muscle':
        proteinPerKg = 2.2;
        fatPerKg = 1.0;
        break;
      default:
        proteinPerKg = 1.6;
        fatPerKg = 0.9;
    }

    const proteinGrams = Math.round(proteinPerKg * weight);
    const fatGrams = Math.round(fatPerKg * weight);
    
    // 1g proteína = 4 kcal, 1g gordura = 9 kcal, 1g carboidrato = 4 kcal
    const proteinCalories = proteinGrams * 4;
    const fatCalories = fatGrams * 9;
    const carbCalories = caloriasAlvo - proteinCalories - fatCalories;
    const carbGrams = Math.round(carbCalories / 4);

    return {
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbGrams,
      calories: {
        fromProtein: Math.round(proteinCalories),
        fromFat: Math.round(fatCalories),
        fromCarbs: Math.round(carbCalories)
      },
      percentages: {
        protein: Math.round((proteinCalories / caloriasAlvo) * 100),
        fat: Math.round((fatCalories / caloriasAlvo) * 100),
        carbs: Math.round((carbCalories / caloriasAlvo) * 100)
      }
    };
  }

  /**
   * Calcula calorias gastas em um exercício usando o método MET
   * 
   * @param {number} met - Valor MET do exercício
   * @param {number} weight - Peso do usuário em kg
   * @param {number} durationMinutes - Duração em minutos
   * @returns {number} Calorias gastas
   */
  static calcularCaloriasExercicio(met, weight, durationMinutes) {
    // Fórmula: calorias = MET × 3.5 × peso(kg) / 200 × minutos
    // Simplificada: 0.0175 × MET × peso × minutos
    return Math.round(0.0175 * met * weight * durationMinutes);
  }

  /**
   * Calcula o IMC (Índice de Massa Corporal)
   * A fórmula NÃO muda por biotipo, mas a interpretação pode variar
   *
   * @param {number} weight - Peso em kg
   * @param {number} height - Altura em cm
   * @param {string} bodyType - Biotipo (opcional)
   * @returns {Object} IMC, classificação e observação
   */
  static calcularIMC(weight, height, bodyType = null) {
    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);

    let classificacao;
    if (imc < 18.5) {
      classificacao = 'Abaixo do peso';
    } else if (imc < 25) {
      classificacao = 'Peso normal';
    } else if (imc < 30) {
      classificacao = 'Sobrepeso';
    } else if (imc < 35) {
      classificacao = 'Obesidade grau 1';
    } else if (imc < 40) {
      classificacao = 'Obesidade grau 2';
    } else {
      classificacao = 'Obesidade grau 3';
    }

    // Adicionar observação baseada no biotipo
    let observacao = null;
    if (bodyType) {
      if (bodyType === 'ectomorph' && imc < 18.5) {
        observacao = 'Compatível com biotipo ectomorfo (metabolismo rápido, estrutura delgada)';
      } else if (bodyType === 'endomorph' && imc >= 25) {
        observacao = 'Considerar biotipo endomorfo (estrutura óssea maior, tendência a acumular gordura)';
      } else if (bodyType === 'mesomorph' && imc >= 25 && imc < 30) {
        observacao = 'Pode ser massa muscular (biotipo mesomorfo tende a ganhar músculo facilmente)';
      }
    }

    return {
      imc: parseFloat(imc.toFixed(2)),
      classificacao,
      observacao
    };
  }

  /**
   * Gera um relatório metabólico completo do usuário
   *
   * @param {Object} userData - Dados completos do usuário
   * @returns {Object} Relatório completo
   */
  static gerarRelatorioMetabolico(userData) {
    const { weight, height, age, gender, activityLevel, goal, bodyType } = userData;

    const tmb = this.calcularTMB({ weight, height, age, gender, bodyType });
    const tdee = this.calcularTDEE(tmb, activityLevel);
    const meta = this.calcularMetaCalorica(tdee, goal);
    const macros = this.calcularMacros(meta.caloriasAlvo, weight, goal);
    const imc = this.calcularIMC(weight, height, bodyType);

    return {
      tmb,
      tdee,
      meta,
      macros,
      imc,
      bodyType,
      dadosUsuario: {
        peso: weight,
        altura: height,
        idade: age,
        genero: gender,
        nivelAtividade: activityLevel,
        objetivo: goal,
        biotipo: bodyType
      }
    };
  }
}

module.exports = TMBService;
