/**
 * Configuração do Banco de Dados
 * Suporta SQLite (dev) e PostgreSQL (prod)
 */

const { Client } = require('pg');

let db;

// Verificar se está em produção com PostgreSQL
if (process.env.DATABASE_URL) {
  // PostgreSQL (Produção)
  console.log('🔵 Conectando ao PostgreSQL...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  client.connect()
    .then(() => {
      console.log('✅ PostgreSQL conectado com sucesso!');
      initializeTables(client);
    })
    .catch(err => {
      console.error('❌ Erro ao conectar PostgreSQL:', err.message);
    });

  db = client;
} else {
  // SQLite (Desenvolvimento)
  const Database = require('better-sqlite3');
  const path = require('path');

  console.log('🟦 Conectando ao SQLite...');
  
  db = new Database(path.join(__dirname, '../../data.db'));
  db.pragma('foreign_keys = ON');
  
  console.log('✅ SQLite conectado com sucesso!');
  initializeTablesSQLite(db);
}

// Inicializar tabelas PostgreSQL
async function initializeTables(client) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id INTEGER UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
        age INTEGER NOT NULL,
        weight REAL NOT NULL,
        height REAL NOT NULL,
        activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) NOT NULL,
        goal TEXT CHECK(goal IN ('lose_weight', 'maintain', 'gain_muscle')) NOT NULL,
        body_type TEXT CHECK(body_type IN ('ectomorph', 'mesomorph', 'endomorph')),
        water_goal_ml REAL DEFAULT 2000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        calories REAL NOT NULL DEFAULT 0,
        protein REAL DEFAULT 0,
        carbs REAL DEFAULT 0,
        fat REAL DEFAULT 0,
        fiber REAL DEFAULT 0,
        meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) DEFAULT 'snack',
        consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        met_value REAL NOT NULL,
        duration_minutes INTEGER NOT NULL,
        calories_burned REAL NOT NULL,
        performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS weight_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        weight REAL NOT NULL,
        body_fat_percentage REAL,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS water_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount_ml REAL NOT NULL,
        consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exercise_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        met_value REAL NOT NULL,
        category TEXT
      )
    `);

    console.log('✅ Tabelas inicializadas com sucesso!');
    
    // Inserir exercícios padrão
    await insertDefaultExercises(client);
    
  } catch (error) {
    console.error('❌ Erro ao inicializar tabelas:', error.message);
  }
}

// Inicializar tabelas SQLite
function initializeTablesSQLite(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
      age INTEGER NOT NULL,
      weight REAL NOT NULL,
      height REAL NOT NULL,
      activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) NOT NULL,
      goal TEXT CHECK(goal IN ('lose_weight', 'maintain', 'gain_muscle')) NOT NULL,
      body_type TEXT CHECK(body_type IN ('ectomorph', 'mesomorph', 'endomorph')),
      water_goal_ml REAL DEFAULT 2000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      calories REAL NOT NULL DEFAULT 0,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      fiber REAL DEFAULT 0,
      meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) DEFAULT 'snack',
      consumed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      met_value REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      calories_burned REAL NOT NULL,
      performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight REAL NOT NULL,
      body_fat_percentage REAL,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS water_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount_ml REAL NOT NULL,
      consumed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercise_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      met_value REAL NOT NULL,
      category TEXT
    );
  `);

  console.log('✅ Tabelas SQLite inicializadas com sucesso!');
  insertDefaultExercisesSQLite(db);
}

// Inserir exercícios padrão (PostgreSQL)
async function insertDefaultExercises(client) {
  const exercises = [
    ['Caminhada leve (3-4 km/h)', 3.5, 'cardio'],
    ['Caminhada moderada (5-6 km/h)', 4.3, 'cardio'],
    ['Corrida (10 km/h)', 9.8, 'cardio'],
    ['Natação (moderada)', 8.0, 'cardio'],
    ['Ciclismo (moderado)', 8.0, 'cardio'],
    ['Musculação (moderada)', 5.0, 'forca'],
    ['Yoga', 2.5, 'flexibilidade'],
    ['HIIT', 8.0, 'hiit'],
  ];

  for (const [name, met, category] of exercises) {
    await client.query(
      `INSERT INTO exercise_templates (name, met_value, category) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (name) DO NOTHING`,
      [name, met, category]
    );
  }
}

// Inserir exercícios padrão (SQLite)
function insertDefaultExercisesSQLite(db) {
  const exercises = [
    ['Caminhada leve (3-4 km/h)', 3.5, 'cardio'],
    ['Caminhada moderada (5-6 km/h)', 4.3, 'cardio'],
    ['Corrida (10 km/h)', 9.8, 'cardio'],
    ['Natação (moderada)', 8.0, 'cardio'],
    ['Ciclismo (moderado)', 8.0, 'cardio'],
    ['Musculação (moderada)', 5.0, 'forca'],
    ['Yoga', 2.5, 'flexibilidade'],
    ['HIIT', 8.0, 'hiit'],
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO exercise_templates (name, met_value, category) 
    VALUES (?, ?, ?)
  `);

  for (const [name, met, category] of exercises) {
    stmt.run(name, met, category);
  }
}

module.exports = db;
