/**
 * Script para criar usuário de desenvolvimento
 * 
 * Uso: node scripts/create-dev-user.js
 */

const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data.db'));

// Dados do usuário de desenvolvimento
const devUser = {
  name: 'Usuário Desenvolvedor',
  email: 'dev@nutribot.local',
  password: '123456',
  gender: 'male',
  age: 30,
  weight: 75,
  height: 175,
  activity_level: 'moderate',
  goal: 'maintain'
};

console.log('🔧 Criando usuário de desenvolvimento...\n');

try {
  // Verificar se usuário já existe
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(devUser.email);
  
  if (existingUser) {
    console.log('⚠️  Usuário já existe! Atualizando senha...');
    const passwordHash = bcrypt.hashSync(devUser.password, 10);
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(passwordHash, devUser.email);
    console.log('✅ Senha atualizada com sucesso!');
  } else {
    // Criar novo usuário
    const passwordHash = bcrypt.hashSync(devUser.password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, gender, age, weight, height, activity_level, goal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      devUser.name,
      devUser.email,
      passwordHash,
      devUser.gender,
      devUser.age,
      devUser.weight,
      devUser.height,
      devUser.activity_level,
      devUser.goal
    );
    
    console.log('✅ Usuário criado com sucesso!\n');
  }

  // Buscar usuário criado
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(devUser.email);
  
  console.log('📋 Dados do usuário:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email:    ${user.email}`);
  console.log(`  Senha:    ${devUser.password}`);
  console.log(`  Nome:     ${user.name}`);
  console.log(`  ID:       ${user.id}`);
  console.log(`  Gênero:   ${user.gender}`);
  console.log(`  Idade:    ${user.age} anos`);
  console.log(`  Peso:     ${user.weight} kg`);
  console.log(`  Altura:   ${user.height} cm`);
  console.log(`  Atividade:${user.activity_level}`);
  console.log(`  Objetivo: ${user.goal}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Calcular TMB do usuário
  const tmb = user.gender === 'male'
    ? 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
    : 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  
  const fatorAtividade = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const gastoCalorico = tmb * fatorAtividade[user.activity_level];
  
  console.log('📊 Métricas calculadas:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  TMB (Taxa Metabólica Basal): ${Math.round(tmb)} kcal/dia`);
  console.log(`  GET (Gasto Energético Total): ${Math.round(gastoCalorico)} kcal/dia`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Criar algumas refeições de exemplo
  console.log('🍽️  Criando refeições de exemplo...');
  
  const meals = [
    {
      name: 'Café da Manhã',
      description: 'Ovos, pão integral, fruta e café',
      calories: 450,
      protein: 25,
      carbs: 50,
      fat: 15,
      meal_type: 'breakfast'
    },
    {
      name: 'Almoço',
      description: 'Arroz, feijão, frango grelhado e salada',
      calories: 650,
      protein: 45,
      carbs: 70,
      fat: 20,
      meal_type: 'lunch'
    },
    {
      name: 'Lanche da Tarde',
      description: 'Iogurte natural com granola e mel',
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 8,
      meal_type: 'snack'
    },
    {
      name: 'Jantar',
      description: 'Peixe assado, batata doce e legumes',
      calories: 500,
      protein: 35,
      carbs: 45,
      fat: 18,
      meal_type: 'dinner'
    }
  ];
  
  let mealsCreated = 0;
  const mealStmt = db.prepare(`
    INSERT INTO meals (user_id, name, description, calories, protein, carbs, fat, meal_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const meal of meals) {
    try {
      mealStmt.run(
        user.id,
        meal.name,
        meal.description,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        meal.meal_type
      );
      mealsCreated++;
    } catch (e) {
      // Refeição já existe
    }
  }
  
  console.log(`   ✅ ${mealsCreated} refeições criadas!\n`);

  // Criar alguns exercícios de exemplo
  console.log('🏋️ Criando exercícios de exemplo...');
  
  const exercises = [
    {
      name: 'Caminhada',
      duration: 30,
      calories_burned: 150,
      category: 'cardio'
    },
    {
      name: 'Musculação',
      duration: 45,
      calories_burned: 250,
      category: 'strength'
    },
    {
      name: 'Corrida',
      duration: 20,
      calories_burned: 200,
      category: 'cardio'
    }
  ];
  
  let exercisesCreated = 0;
  const exerciseStmt = db.prepare(`
    INSERT INTO exercises (user_id, name, duration, calories_burned, category)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  for (const exercise of exercises) {
    try {
      exerciseStmt.run(
        user.id,
        exercise.name,
        exercise.duration,
        exercise.calories_burned,
        exercise.category
      );
      exercisesCreated++;
    } catch (e) {
      // Exercício já existe
    }
  }
  
  console.log(`   ✅ ${exercisesCreated} exercícios criados!\n`);

  console.log('🎉 Tudo pronto! Agora você pode fazer login com:\n');
  console.log('   📧 Email: dev@nutribot.local');
  console.log('   🔑 Senha: 123456\n');
  console.log('   Acesse: http://localhost:5173/login\n');

} catch (error) {
  console.error('❌ Erro ao criar usuário:', error.message);
  process.exit(1);
} finally {
  db.close();
}
