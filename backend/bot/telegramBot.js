const TelegramBot = require('node-telegram-bot-api');
const db = require('../src/database/database');
const AIService = require('../src/services/aiService');
const TMBService = require('../src/services/tmbService');
const ExerciseService = require('../src/services/exerciseService');

let bot = null;

/**
 * Inicializa o bot do Telegram
 */
function iniciarBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token || token === 'seu_token_telegram_aqui') {
    console.log('⚠️  Token do Telegram não configurado. Bot não será iniciado.');
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  console.log('✅ Bot do Telegram iniciado!');

  // Comando /start
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const nome = msg.from.first_name;

    // Verificar se usuário já existe
    let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(userId);

    if (!user) {
      // Novo usuário - iniciar onboarding
      bot.sendMessage(chatId, 
        `👋 Olá, ${nome}! Bem-vindo ao NutriBot AI!

🏋️ Seu assistente pessoal de nutrição e fitness com IA

Para começar, preciso conhecer você melhor. Vamos lá?

Envie os seguintes dados (um por vez):
1️⃣ Seu peso atual (kg)
2️⃣ Sua altura (cm)
3️⃣ Sua idade (anos)
4️⃣ Seu gênero (male/female/other)
5️⃣ Seu objetivo (lose_weight/maintain/gain_muscle)
6️⃣ Nível de atividade (sedentary/light/moderate/active/very_active)

Ou use o comando /register com todos os dados de uma vez!`
      );
      
      // Iniciar estado de onboarding
      db.prepare(`
        INSERT OR REPLACE INTO telegram_states (telegram_id, current_step, data)
        VALUES (?, 'waiting_weight', '{}')
      `).run(userId);
      
      return;
    }

    // Usuário existente
    bot.sendMessage(chatId, 
      `👋 Olá, ${user.name}! Bem-vindo de volta ao NutriBot AI!

Use os comandos abaixo:
📸 /foto - Envie uma foto da sua refeição
🍽️ /refeicao - Registre o que você comeu
🏃 /exercicio - Registre seu exercício
📊 /status - Veja seu resumo do dia
🎯 /meta - Sua meta calórica e macros
💬 /coach - Tire dúvidas com a IA
⚙️ /ajuda - Mais opções`
    );
  });

  // Comando /register
  bot.onText(/\/register (.+)/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const args = msg.text.slice(10).trim().split(' ');

    if (args.length < 7) {
      bot.sendMessage(chatId, 
        `❌ Dados incompletos!

Use: /register peso altura idade genero objetivo atividade

Exemplo:
/register 70 175 25 male lose_weight moderate`
      );
      return;
    }

    const [weight, height, age, gender, goal, activity_level] = args;
    const name = msg.from.first_name;

    try {
      // Verificar se já existe
      const existing = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(userId);
      
      if (existing) {
        // Atualizar
        db.prepare(`
          UPDATE users SET weight=?, height=?, age=?, gender=?, goal=?, activity_level=?
          WHERE telegram_id=?
        `).run(weight, height, age, gender, goal, activity_level, userId);
      } else {
        // Criar novo usuário
        db.prepare(`
          INSERT INTO users (telegram_id, name, email, password, gender, age, weight, height, activity_level, goal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          userId,
          name,
          `telegram_${userId}@nutribot.local`,
          'telegram_auth',
          gender,
          age,
          weight,
          height,
          activity_level,
          goal
        );
      }

      // Calcular TMB e meta
      const relatorio = TMBService.gerarRelatorioMetabolico({
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender,
        activityLevel: activity_level,
        goal
      });

      bot.sendMessage(chatId, 
        `✅ Cadastro atualizado com sucesso!

📊 Seu perfil metabólico:
• TMB: ${relatorio.tmb} kcal/dia
• Gasto diário: ${relatorio.tdee} kcal
• Meta: ${relatorio.meta.caloriasAlvo} kcal/dia

🎯 ${relatorio.meta.descricao}

Use /ajuda para ver todos os comandos!`
      );

    } catch (error) {
      console.error('Erro no registro:', error);
      bot.sendMessage(chatId, '❌ Erro ao registrar. Tente novamente!');
    }
  });

  // Comando /foto - analisar imagem
  bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Verificar se usuário está cadastrado
    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(userId);
    if (!user) {
      bot.sendMessage(chatId, '❌ Você precisa se cadastrar primeiro! Use /start');
      return;
    }

    // Baixar foto
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    
    bot.sendMessage(chatId, '🔍 Analisando sua refeição... aguarde...');

    try {
      const file = await bot.getFile(fileId);
      const fileStream = await bot.getFileStream(fileId);
      const chunks = [];
      
      for await (const chunk of fileStream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);

      // Analisar com IA
      const analise = await AIService.analisarImagemAlimento(buffer, 'image/jpeg');

      if (!analise.sucesso) {
        bot.sendMessage(chatId, '❌ Não foi possível analisar a imagem. Tente descrever o que você comeu com /refeicao');
        return;
      }

      const dados = analise.dados;
      const refeicao = dados.refeicao_completa;

      let mensagem = `📸 **Análise da Refeição**\n\n`;
      mensagem += `🍽️ ${refeicao.descricao_refeicao}\n\n`;
      mensagem += `📊 **Totais**:\n`;
      mensagem += `• 🔥 ${Math.round(refeicao.calorias_totais)} kcal\n`;
      mensagem += `• 🥩 ${Math.round(refeicao.proteina_total)}g proteína\n`;
      mensagem += `• 🍞 ${Math.round(refeicao.carboidratos_total)}g carbs\n`;
      mensagem += `• 🧈 ${Math.round(refeicao.gordura_total)}g gordura\n\n`;

      if (dados.alimentos && dados.alimentos.length > 0) {
        mensagem += `**Alimentos identificados**:\n`;
        dados.alimentos.forEach((alimento, i) => {
          mensagem += `${i + 1}. ${alimento.nome} (${alimento.quantidade_estimada}) - ${Math.round(alimento.calorias_estimadas)} kcal\n`;
        });
      }

      if (dados.observacoes) {
        mensagem += `\n💡 ${dados.observacoes}`;
      }

      mensagem += `\n\nPara registrar esta refeição, use /registrar ${Math.round(refeicao.calorias_totais)} "descricao"`;

      bot.sendMessage(chatId, mensagem, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Erro ao analisar foto:', error);
      bot.sendMessage(chatId, '❌ Erro ao analisar imagem. Tente novamente!');
    }
  });

  // Comando /refeicao
  bot.onText(/\/refeicao (.+)/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const descricao = msg.text.slice(9).trim();

    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(userId);
    if (!user) {
      bot.sendMessage(chatId, '❌ Você precisa se cadastrar primeiro! Use /start');
      return;
    }

    bot.sendMessage(chatId, '🔍 Analisando sua refeição...');

    try {
      const analise = await AIService.analisarDescricaoRefeicao(descricao);

      if (!analise.sucesso) {
        bot.sendMessage(chatId, '❌ Não foi possível analisar. Tente ser mais específico!');
        return;
      }

      const dados = analise.dados;
      const refeicao = dados.refeicao_completa;

      // Registrar no banco
      db.prepare(`
        INSERT INTO meals (user_id, name, description, calories, protein, carbs, fat, fiber, meal_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.id,
        'Refeição via Telegram',
        descricao,
        Math.round(refeicao.calorias_totais),
        Math.round(refeicao.proteina_total),
        Math.round(refeicao.carboidratos_total),
        Math.round(refeicao.gordura_total),
        0,
        'snack'
      );

      let resposta = `✅ **Refeição registrada**!

📊 **Informações nutricionais**:
• 🔥 ${Math.round(refeicao.calorias_totais)} kcal
• 🥩 ${Math.round(refeicao.proteina_total)}g proteína
• 🍞 ${Math.round(refeicao.carboidratos_total)}g carbs
• 🧈 ${Math.round(refeicao.gordura_total)}g gordura`;

      if (dados.sugestao_melhoria) {
        resposta += `\n\n💡 **Sugestão**: ${dados.sugestao_melhoria}`;
      }

      bot.sendMessage(chatId, resposta, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Erro ao analisar refeição:', error);
      bot.sendMessage(chatId, '❌ Erro ao processar refeição. Tente novamente!');
    }
  });

  // Comando /exercicio
  bot.onText(/\/exercicio (.+)/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const args = msg.text.slice(10).trim().split(' ');

    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(userId);
    if (!user) {
      bot.sendMessage(chatId, '❌ Você precisa se cadastrar primeiro! Use /start');
      return;
    }

    if (args.length < 2) {
      bot.sendMessage(chatId, 
        `❌ Formato incorreto!

Use: /exercicio <nome> <minutos>

Exemplos:
/exercicio corrida 30
/exercicio caminhada 45
/exercicio musculacao 60`
      );
      return;
    }

    const nome = args[0];
    const minutos = parseInt(args[1]);

    if (isNaN(minutos) || minutos <= 0) {
      bot.sendMessage(chatId, '❌ Os minutos devem ser um número válido!');
      return;
    }

    // Buscar exercício no banco
    let exercicio = db.prepare('SELECT * FROM exercise_templates WHERE name LIKE ? LIMIT 1').get(`%${nome}%`);
    
    if (!exercicio) {
      // MET padrão
      exercicio = { name: nome, met_value: 5.0 };
    }

    // Calcular calorias
    const calorias = TMBService.calcularCaloriasExercicio(exercicio.met_value, user.weight, minutos);

    // Registrar
    db.prepare(`
      INSERT INTO exercises (user_id, name, met_value, duration_minutes, calories_burned)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, exercicio.name, exercicio.met_value, minutos, calorias);

    bot.sendMessage(chatId, 
      `✅ **Exercício registrado**!

🏃 ${exercicio.name}
⏱️ ${minutos} minutos
🔥 ${calorias} calorias gastas

Continue assim! 💪`,
      { parse_mode: 'Markdown' }
    );
  });

  // Comando /status
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(userId);
    if (!user) {
      bot.sendMessage(chatId, '❌ Você precisa se cadastrar primeiro! Use /start');
      return;
    }

    // Consumo de hoje
    const meals = db.prepare(`
      SELECT SUM(calories) as total_cal, SUM(protein) as total_pro, SUM(carbs) as total_carb, SUM(fat) as total_fat
      FROM meals WHERE user_id = ? AND DATE(consumed_at) = DATE('now')
    `).get(user.id);

    // Exercícios de hoje
    const exercises = db.prepare(`
      SELECT SUM(calories_burned) as total_gasto
      FROM exercises WHERE user_id = ? AND DATE(performed_at) = DATE('now')
    `).get(user.id);

    // Meta
    const relatorio = TMBService.gerarRelatorioMetabolico({
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activity_level,
      goal: user.goal
    });

    const consumo = meals?.total_cal || 0;
    const gasto = exercises?.total_gasto || 0;
    const liquido = consumo - gasto;
    const saldo = relatorio.meta.caloriasAlvo - liquido;

    bot.sendMessage(chatId, 
      `📊 **Seu Resumo de Hoje**

🍽️ **Consumo**: ${Math.round(consumo)} kcal
• Proteína: ${Math.round(meals?.total_pro || 0)}g
• Carbs: ${Math.round(meals?.total_carb || 0)}g
• Gordura: ${Math.round(meals?.total_fat || 0)}g

🏃 **Gasto em exercícios**: ${Math.round(gasto)} kcal

🎯 **Meta**: ${relatorio.meta.caloriasAlvo} kcal
💰 **Saldo**: ${Math.round(saldo)} kcal ${saldo >= 0 ? '✅' : '⚠️'}

Use /meta para ver mais detalhes!`,
      { parse_mode: 'Markdown' }
    );
  });

  // Comando /meta
  bot.onText(/\/meta/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(userId);
    if (!user) {
      bot.sendMessage(chatId, '❌ Você precisa se cadastrar primeiro! Use /start');
      return;
    }

    const relatorio = TMBService.gerarRelatorioMetabolico({
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activity_level,
      goal: user.goal
    });

    const macros = relatorio.macros;

    bot.sendMessage(chatId, 
      `🎯 **Suas Metas Diárias**

🔥 **Calorias**: ${relatorio.meta.caloriasAlvo} kcal

📊 **Macronutrientes**:
• 🥩 Proteína: ${macros.protein}g (${macros.percentages.protein}%)
• 🍞 Carboidratos: ${macros.carbs}g (${macros.percentages.carbs}%)
• 🧈 Gordura: ${macros.fat}g (${macros.percentages.fat}%)

💡 ${relatorio.meta.descricao}

Objetivo: ${user.goal === 'lose_weight' ? 'Perder peso' : user.goal === 'gain_muscle' ? 'Ganhar massa' : 'Manter peso'}`,
      { parse_mode: 'Markdown' }
    );
  });

  // Comando /coach
  bot.onText(/\/coach (.+)/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const pergunta = msg.text.slice(7).trim();

    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(userId);
    if (!user) {
      bot.sendMessage(chatId, '❌ Você precisa se cadastrar primeiro! Use /start');
      return;
    }

    bot.sendMessage(chatId, '🤔 Pensando na melhor resposta para você...');

    try {
      const relatorio = TMBService.gerarRelatorioMetabolico({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activity_level,
        goal: user.goal
      });

      user.calorieGoal = relatorio.meta.caloriasAlvo;

      const resposta = await AIService.responderComoCoach(pergunta, user);

      bot.sendMessage(chatId, resposta, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Erro no coach:', error);
      bot.sendMessage(chatId, '❌ Erro ao processar sua pergunta. Tente novamente!');
    }
  });

  // Comando /ajuda
  bot.onText(/\/ajuda/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 
      `📚 **Comandos Disponíveis**

👤 **Cadastro**
/start - Iniciar/Reiniciar
/register - Cadastro rápido

🍽️ **Alimentação**
📸 Envie uma FOTO para analisar
/refeicao <descricao> - Registrar refeição

🏃 **Exercícios**
/exercicio <nome> <minutos> - Registrar exercício

📊 **Informações**
/status - Resumo do dia
/meta - Suas metas
/coach <pergunta> - Tire dúvidas com IA

💡 **Dicas**
• Seja específico nas descrições
• Envie fotos bem iluminadas
• Registre tudo para melhores resultados!`
    , { parse_mode: 'Markdown' });
  });

  // Lidar com estados de onboarding
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const texto = msg.text;

    // Ignorar comandos
    if (texto?.startsWith('/')) return;

    // Verificar estado de onboarding
    const state = db.prepare('SELECT * FROM telegram_states WHERE telegram_id = ?').get(userId);
    
    if (!state || !state.current_step) return;

    const data = JSON.parse(state.data || '{}');

    try {
      switch (state.current_step) {
        case 'waiting_weight':
          data.weight = parseFloat(texto);
          db.prepare(`UPDATE telegram_states SET current_step='waiting_height', data=? WHERE telegram_id=?`)
            .run(JSON.stringify(data), userId);
          bot.sendMessage(chatId, '✅ Peso registrado! Agora, qual sua altura em cm? (ex: 175)');
          break;

        case 'waiting_height':
          data.height = parseFloat(texto);
          db.prepare(`UPDATE telegram_states SET current_step='waiting_age', data=? WHERE telegram_id=?`)
            .run(JSON.stringify(data), userId);
          bot.sendMessage(chatId, '✅ Altura registrada! Qual sua idade?');
          break;

        case 'waiting_age':
          data.age = parseInt(texto);
          db.prepare(`UPDATE telegram_states SET current_step='waiting_gender', data=? WHERE telegram_id=?`)
            .run(JSON.stringify(data), userId);
          bot.sendMessage(chatId, '✅ Idade registrada! Qual seu gênero? (male/female/other)');
          break;

        case 'waiting_gender':
          data.gender = texto.toLowerCase();
          db.prepare(`UPDATE telegram_states SET current_step='waiting_goal', data=? WHERE telegram_id=?`)
            .run(JSON.stringify(data), userId);
          bot.sendMessage(chatId, '✅ Qual seu objetivo? (lose_weight/maintain/gain_muscle)');
          break;

        case 'waiting_goal':
          data.goal = texto.toLowerCase();
          db.prepare(`UPDATE telegram_states SET current_step='waiting_activity', data=? WHERE telegram_id=?`)
            .run(JSON.stringify(data), userId);
          bot.sendMessage(chatId, '✅ Nível de atividade? (sedentary/light/moderate/active/very_active)');
          break;

        case 'waiting_activity':
          data.activity_level = texto.toLowerCase();
          
          // Criar usuário
          const name = msg.from.first_name;
          db.prepare(`
            INSERT INTO users (telegram_id, name, email, password, gender, age, weight, height, activity_level, goal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            userId,
            name,
            `telegram_${userId}@nutribot.local`,
            'telegram_auth',
            data.gender,
            data.age,
            data.weight,
            data.height,
            data.activity_level,
            data.goal
          );

          // Limpar estado
          db.prepare('DELETE FROM telegram_states WHERE telegram_id = ?').run(userId);

          // Calcular relatório
          const relatorio = TMBService.gerarRelatorioMetabolico(data);

          bot.sendMessage(chatId, 
            `🎉 **Cadastro completo**!

📊 Seu perfil:
• TMB: ${relatorio.tmb} kcal/dia
• Gasto diário: ${relatorio.tdee} kcal
• Meta: ${relatorio.meta.caloriasAlvo} kcal/dia

🎯 ${relatorio.meta.descricao}

Use /ajuda para ver todos os comandos!`
          , { parse_mode: 'Markdown' });
          break;
      }
    } catch (error) {
      console.error('Erro no onboarding:', error);
      bot.sendMessage(chatId, '❌ Erro! Use /start para recomeçar.');
    }
  });
}

module.exports = { iniciarBot };
