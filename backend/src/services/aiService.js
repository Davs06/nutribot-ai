const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Serviço de IA - Google Gemini API
 * Responsável por:
 * - Reconhecimento de alimentos por imagem
 * - Análise de refeições descritas em texto natural (CALCULA CALORIAS AUTOMATICAMENTE)
 * - Cálculo de calorias gastas em exercícios
 * - Recomendações nutricionais personalizadas
 */

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // gemini-2.5-flash é o modelo free tier mais recente com quota disponível
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Testa se a API key é válida
   */
  async testarAPI() {
    try {
      const result = await this.model.generateContent('Diga apenas "OK" se a API estiver funcionando');
      const response = await result.response;
      const text = response.text();
      return {
        valido: true,
        mensagem: 'API Gemini funcionando corretamente',
        resposta: text
      };
    } catch (error) {
      return {
        valido: false,
        erro: error.message
      };
    }
  }

  /**
   * Analisa uma imagem de alimento e retorna informações nutricionais
   * 
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @param {string} mimeType - Tipo MIME da imagem (ex: 'image/jpeg')
   * @returns {Object} Alimentos identificados com estimativa nutricional
   */
  async analisarImagemAlimento(imageBuffer, mimeType = 'image/jpeg') {
    try {
      const prompt = `
Você é um nutricionista especialista em análise de alimentos. Analise esta imagem e identifique TODOS os alimentos presentes.

Para CADA alimento identificado, retorne EXATAMENTE neste formato JSON:

{
  "alimentos": [
    {
      "nome": "nome do alimento em português",
      "quantidade_estimada": "descrição da porção (ex: 100g, 1 unidade, 1 concha)",
      "gramas_estimadas": número aproximado em gramas,
      "calorias_estimadas": número aproximado de calorias,
      "proteina": número em gramas,
      "carboidratos": número em gramas,
      "gordura": número em gramas,
      "fibra": número em gramas,
      "confianca": "alta" | "media" | "baixa"
    }
  ],
  "refeicao_completa": {
    "calorias_totais": número,
    "proteina_total": número,
    "carboidratos_total": número,
    "gordura_total": número,
    "descricao_refeicao": "descrição breve da refeição"
  },
  "observacoes": "quaisquer observações sobre a qualidade nutricional da refeição"
}

Seja o mais preciso possível. Se não tiver certeza sobre algum alimento, indique confiança "baixa" ou "media".
Considere métodos de preparo (frito, grelhado, cozido, assado) na estimativa calórica.
Retorne APENAS o JSON, sem texto adicional antes ou depois.
      `;

      const result = await this.model.generateContent([
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
          }
        },
        prompt
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Extrair JSON do response (pode vir com markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sucesso: true,
          dados: parsed
        };
      }

      throw new Error('Não foi possível parsear a resposta como JSON');
    } catch (error) {
      console.error('Erro ao analisar imagem:', error.message);
      return {
        sucesso: false,
        erro: error.message,
        fallback: this._getFallbackImageAnalysis()
      };
    }
  }

  /**
   * Analisa uma descrição textual de refeição
   * 
   * @param {string} descricao - Descrição da refeição (ex: "comi 2 ovos mexidos com 1 fatia de pão")
   * @returns {Object} Alimentos identificados com informações nutricionais
   */
  async analisarDescricaoRefeicao(descricao) {
    try {
      const prompt = `
Você é um nutricionista especialista. O usuário descreveu o que comeu: "${descricao}"

Identifique todos os alimentos e suas quantidades, e retorne EXATAMENTE neste formato JSON:

{
  "alimentos": [
    {
      "nome": "nome do alimento",
      "quantidade": "quantidade descrita",
      "gramas_estimadas": número aproximado,
      "calorias": número,
      "proteina": número em gramas,
      "carboidratos": número em gramas,
      "gordura": número em gramas,
      "fibra": número em gramas
    }
  ],
  "refeicao_completa": {
    "calorias_totais": número,
    "proteina_total": número,
    "carboidratos_total": número,
    "gordura_total": número,
    "descricao": "resumo da refeição"
  },
  "sugestao_melhoria": "sugestão opcional para tornar a refeição mais saudável (ou null se já estiver boa)"
}

Considere preparações mencionadas (frito, grelhado, etc.) nas estimativas.
Retorne APENAS o JSON.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sucesso: true,
          dados: parsed
        };
      }

      throw new Error('Não foi possível parsear a resposta');
    } catch (error) {
      console.error('Erro ao analisar descrição:', error.message);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  /**
   * Gera recomendações nutricionais personalizadas
   * 
   * @param {Object} userData - Dados do usuário
   * @param {Array} mealsHistory - Histórico de refeições dos últimos dias
   * @returns {string} Recomendações em texto natural
   */
  async gerarRecomendacoes(userData, mealsHistory) {
    try {
      const prompt = `
Você é um assistente de nutrição e fitness. Analise os dados do usuário e gere recomendações.

DADOS DO USUÁRIO:
- Idade: ${userData.age} anos
- Peso: ${userData.weight} kg
- Altura: ${userData.height} cm
- Gênero: ${userData.gender}
- Objetivo: ${userData.goal === 'lose_weight' ? 'Perder peso' : userData.goal === 'gain_muscle' ? 'Ganhar massa muscular' : 'Manter peso'}
- Nível de atividade: ${userData.activityLevel}
- Meta calórica diária: ${userData.calorieGoal} kcal

HISTÓRICO RECENTE DE ALIMENTAÇÃO (últimos 3 dias):
${JSON.stringify(mealsHistory, null, 2)}

Com base nestes dados, forneça:
1. Uma análise do padrão alimentar
2. 3-5 recomendações práticas e acionáveis
3. Uma mensagem motivacional personalizada

Seja encorajador, mas honesto. Use linguagem acessível e evite jargões técnicos.
Formate em markdown com títulos e listas para facilitar a leitura.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error.message);
      return 'Não foi possível gerar recomendações no momento. Tente novamente mais tarde.';
    }
  }

  /**
   * Atua como coach de fitness, respondendo perguntas
   * 
   * @param {string} pergunta - Pergunta do usuário
   * @param {Object} userData - Contexto do usuário
   * @returns {string} Resposta da IA
   */
  async responderComoCoach(pergunta, userData) {
    try {
      const prompt = `
Você é um coach de fitness e nutrição pessoal. Responda a pergunta do usuário de forma útil e motivacional.

CONTEXTO DO USUÁRIO:
- Objetivo: ${userData.goal === 'lose_weight' ? 'Perder peso' : userData.goal === 'gain_muscle' ? 'Ganhar massa muscular' : 'Manter peso'}
- Peso atual: ${userData.weight} kg
- Meta calórica: ${userData.calorieGoal} kcal/dia

PERGUNTA: "${pergunta}"

Forneça uma resposta prática, baseada em ciência, mas acessível. Se a pergunta for sobre algo fora do seu escopo (nutrição/fitness), gentilmente redirecione.
Use no máximo 300 palavras. Seja encorajador!
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao responder como coach:', error.message);
      return 'Desculpe, não consegui processar sua pergunta. Tente novamente!';
    }
  }

  /**
   * Calcula calorias gastas em exercício usando IA
   * @param {string} exercicio - Nome do exercício
   * @param {number} duracao - Duração em minutos
   * @param {number} peso - Peso do usuário em kg
   * @returns {Object} Dados do exercício com calorias calculadas
   */
  async calcularCaloriasExercicio(exercicio, duracao, peso) {
    try {
      const prompt = `
Você é um especialista em fisiologia do exercício. Calcule as calorias gastas neste exercício.

EXERCÍCIO: ${exercicio}
DURAÇÃO: ${duracao} minutos
PESO DO USUÁRIO: ${peso} kg

Retorne APENAS este formato JSON:
{
  "nome": "${exercicio}",
  "met_value": número (valor MET do exercício),
  "calorias_gastas": número (calorias gastas),
  "intensidade": "baixa" | "moderada" | "alta",
  "descricao": "breve descrição do exercício e benefícios"
}

Use valores MET reais baseados em ciência do esporte.
Fórmula: calorias = MET × peso(kg) × (duracao/60)
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sucesso: true,
          dados: parsed
        };
      }

      throw new Error('Não foi possível parsear a resposta');
    } catch (error) {
      console.error('Erro ao calcular calorias do exercício:', error.message);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  /**
   * Fallback para análise de imagem quando a API falha
   */
  _getFallbackImageAnalysis() {
    return {
      alimentos: [
        {
          nome: 'Alimento não identificado',
          quantidade_estimada: 'porção média',
          gramas_estimadas: 100,
          calorias_estimadas: 150,
          proteina: 10,
          carboidratos: 15,
          gordura: 5,
          fibra: 3,
          confianca: 'baixa'
        }
      ],
      refeicao_completa: {
        calorias_totais: 150,
        proteina_total: 10,
        carboidratos_total: 15,
        gordura_total: 5,
        descricao_refeicao: 'Refeição analisada (dados estimados)'
      },
      observacoes: 'Não foi possível analisar a imagem com precisão. Por favor, descreva o que você comeu para um registro mais preciso.'
    };
  }
}

module.exports = new AIService();
