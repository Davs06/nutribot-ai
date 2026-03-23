const axios = require('axios');

/**
 * Serviço de Nutrição - Integração com USDA FoodData Central API
 * Banco de dados gratuito com +380.000 alimentos
 */

class NutritionService {
  constructor() {
    this.baseURL = 'https://api.nal.usda.gov/fdc/v1';
    this.apiKey = process.env.USDA_API_KEY;
    
    // Cache simples em memória para reduzir chamadas à API
    this.cache = new Map();
    this.cacheExpiration = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Busca alimentos por termo de pesquisa
   * 
   * @param {string} query - Termo de busca (ex: "arroz", "frango grelhado")
   * @param {number} pageSize - Quantidade de resultados (máx 50)
   * @returns {Array} Lista de alimentos encontrados
   */
  async buscarAlimento(query) {
    const cacheKey = `search_${query}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/foods/search`, {
        params: {
          api_key: this.apiKey,
          query,
          pageSize: 20,
          dataType: ['Foundation', 'Survey (FNDDS)', 'Branded']
        }
      });

      const resultados = response.data.foods.map(food => ({
        fdcId: food.fdcId,
        nome: food.description,
        tipo: food.dataType,
        marca: food.brandOwner || null,
        imagem: food.foodNutrients?.find(n => n.nutrientName === 'Protein') ? null : null
      }));

      this._setCache(cacheKey, resultados);
      return resultados;
    } catch (error) {
      console.error('Erro ao buscar alimento na USDA:', error.message);
      
      // Fallback: retornar dados simulados se API falhar
      return this._getFallbackData(query);
    }
  }

  /**
   * Obtém informações nutricionais completas de um alimento pelo ID
   * 
   * @param {number} fdcId - ID do alimento no banco USDA
   * @returns {Object} Informações nutricionais completas
   */
  async obterNutrientes(fdcId) {
    const cacheKey = `nutrients_${fdcId}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/food/${fdcId}`, {
        params: {
          api_key: this.apiKey,
          nutrients: [
            '208', // Energia (kcal)
            '203', // Proteína (g)
            '204', // Carboidratos (g)
            '205', // Açúcares (g)
            '269', // Fibra (g)
            '207', // Cinzas (g)
            '268', // Cálcio (mg)
            '303', // Ferro (mg)
            '305', // Magnésio (mg)
            '306', // Fósforo (mg)
            '307', // Potássio (mg)
            '309', // Zinco (mg)
            '301', // Cobre (mg)
            '304', // Manganês (mg)
            '308', // Sódio (mg)
            '601', // Colesterol (mg)
            '600', // Ácidos graxos saturados (g)
            '645', // Ácidos graxos monoinsaturados (g)
            '646', // Ácidos graxos poliinsaturados (g)
            '1253', // Ácidos graxos trans (g)
          ]
        }
      });

      const food = response.data;
      const nutrientes = this._parseNutrientes(food.foodNutrients);

      const resultado = {
        fdcId: food.fdcId,
        nome: food.description,
        tipo: food.dataType,
        marca: food.brandOwner || null,
        porcao: 100, // gramas
        nutrientes
      };

      this._setCache(cacheKey, resultado);
      return resultado;
    } catch (error) {
      console.error('Erro ao obter nutrientes:', error.message);
      return null;
    }
  }

  /**
   * Parseia os nutrientes do formato USDA para formato simplificado
   * 
   * @param {Array} foodNutrients - Array de nutrientes do USDA
   * @returns {Object} Nutrientes formatados
   */
  _parseNutrientes(foodNutrients) {
    const nutrientMap = {
      '208': 'calorias',
      '203': 'proteina',
      '204': 'carboidratos',
      '205': 'acucares',
      '269': 'fibra',
      '207': 'cinzas',
      '268': 'calcio',
      '303': 'ferro',
      '305': 'magnesio',
      '306': 'fosforo',
      '307': 'potassio',
      '309': 'zinco',
      '308': 'sodio',
      '601': 'colesterol',
      '600': 'gordura_saturada',
      '645': 'gordura_monoinsaturada',
      '646': 'gordura_poliinsaturada',
      '1253': 'gordura_trans'
    };

    const nutrientes = {};
    
    foodNutrients?.forEach(nutrient => {
      const key = nutrientMap[nutrient.nutrient.id];
      if (key) {
        nutrientes[key] = parseFloat((nutrient.amount || 0).toFixed(2));
      }
    });

    // Adicionar valores padrão se não existirem
    return {
      calorias: nutrientes.calorias || 0,
      proteina: nutrientes.proteina || 0,
      carboidratos: nutrientes.carboidratos || 0,
      acucares: nutrientes.acucares || 0,
      fibra: nutrientes.fibra || 0,
      gordura_total: this._calcularGorduraTotal(nutrientes),
      gordura_saturada: nutrientes.gordura_saturada || 0,
      gordura_monoinsaturada: nutrientes.gordura_monoinsaturada || 0,
      gordura_poliinsaturada: nutrientes.gordura_poliinsaturada || 0,
      gordura_trans: nutrientes.gordura_trans || 0,
      colesterol: nutrientes.colesterol || 0,
      sodio: nutrientes.sodio || 0,
      potassio: nutrientes.potassio || 0,
      calcio: nutrientes.calcio || 0,
      ferro: nutrientes.ferro || 0,
      magnesio: nutrientes.magnesio || 0,
      fosforo: nutrientes.fosforo || 0,
      zinco: nutrientes.zinco || 0
    };
  }

  /**
   * Calcula gordura total somando os tipos
   */
  _calcularGorduraTotal(nutrientes) {
    return parseFloat((
      (nutrientes.gordura_saturada || 0) +
      (nutrientes.gordura_monoinsaturada || 0) +
      (nutrientes.gordura_poliinsaturada || 0)
    ).toFixed(2));
  }

  /**
   * Dados fallback quando a API USDA não está disponível
   * 
   * @param {string} query - Termo de busca
   * @returns {Array} Dados simulados
   */
  _getFallbackData(query) {
    const fallbackFoods = {
      'arroz': [
        { fdcId: 1, nome: 'Arroz branco, cozido', tipo: 'Foundation', marca: null },
        { fdcId: 2, nome: 'Arroz integral, cozido', tipo: 'Foundation', marca: null }
      ],
      'feijao': [
        { fdcId: 3, nome: 'Feijão carioca, cozido', tipo: 'Foundation', marca: null },
        { fdcId: 4, nome: 'Feijão preto, cozido', tipo: 'Foundation', marca: null }
      ],
      'frango': [
        { fdcId: 5, nome: 'Peito de frango, grelhado', tipo: 'Foundation', marca: null },
        { fdcId: 6, nome: 'Coxa de frango, assada', tipo: 'Foundation', marca: null }
      ],
      'ovo': [
        { fdcId: 7, nome: 'Ovo, cozido', tipo: 'Foundation', marca: null },
        { fdcId: 8, nome: 'Ovo, frito', tipo: 'Foundation', marca: null }
      ],
      'pao': [
        { fdcId: 9, nome: 'Pão francês', tipo: 'Foundation', marca: null },
        { fdcId: 10, nome: 'Pão de forma, branco', tipo: 'Branded', marca: null }
      ]
    };

    const queryLower = query.toLowerCase();
    for (const [key, foods] of Object.entries(fallbackFoods)) {
      if (queryLower.includes(key)) {
        return foods;
      }
    }

    return [{ fdcId: 0, nome: query, tipo: 'Desconhecido', marca: null }];
  }

  /**
   * Busca alimento por código de barras
   * 
   * @param {string} barcode - Código de barras
   * @returns {Object} Informações do produto
   */
  async buscarPorBarcode(barcode) {
    try {
      const response = await axios.get(`${this.baseURL}/foods/search`, {
        params: {
          api_key: this.apiKey,
          query: barcode,
          dataType: ['Branded']
        }
      });

      if (response.data.foods && response.data.foods.length > 0) {
        const food = response.data.foods[0];
        return {
          fdcId: food.fdcId,
          nome: food.description,
          marca: food.brandOwner,
          barcode: barcode
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar por barcode:', error.message);
      return null;
    }
  }

  /**
   * Métodos de cache
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpa o cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new NutritionService();
