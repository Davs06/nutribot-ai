-- NutriBot AI - PostgreSQL Init Script
-- Criação de tabelas para produção

-- Tabela de usuários
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
);

-- Tabela de refeições
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
);

-- Tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  met_value REAL NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned REAL NOT NULL,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pesos diários
CREATE TABLE IF NOT EXISTS weight_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight REAL NOT NULL,
  body_fat_percentage REAL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de consumo de água
CREATE TABLE IF NOT EXISTS water_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml REAL NOT NULL,
  consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de exercícios pré-definidos
CREATE TABLE IF NOT EXISTS exercise_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  met_value REAL NOT NULL,
  category TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_consumed_at ON meals(consumed_at);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_performed_at ON exercises(performed_at);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_id ON water_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_consumed_at ON water_logs(consumed_at);

-- Inserir exercícios comuns
INSERT INTO exercise_templates (name, met_value, category) VALUES
  ('Caminhada leve (3-4 km/h)', 3.5, 'cardio'),
  ('Caminhada moderada (5-6 km/h)', 4.3, 'cardio'),
  ('Caminhada rápida (6-7 km/h)', 5.0, 'cardio'),
  ('Corrida (8 km/h)', 8.3, 'cardio'),
  ('Corrida (10 km/h)', 9.8, 'cardio'),
  ('Corrida (12 km/h)', 11.5, 'cardio'),
  ('Natação (leve)', 6.0, 'cardio'),
  ('Natação (moderada)', 8.0, 'cardio'),
  ('Natação (intensa)', 10.0, 'cardio'),
  ('Ciclismo (leve)', 4.0, 'cardio'),
  ('Ciclismo (moderado)', 8.0, 'cardio'),
  ('Ciclismo (intenso)', 12.0, 'cardio'),
  ('Musculação (leve)', 3.5, 'forca'),
  ('Musculação (moderada)', 5.0, 'forca'),
  ('Musculação (intensa)', 6.0, 'forca'),
  ('CrossFit', 8.0, 'hiit'),
  ('HIIT', 8.0, 'hiit'),
  ('Yoga', 2.5, 'flexibilidade'),
  ('Pilates', 3.0, 'flexibilidade'),
  ('Pular corda', 11.0, 'cardio'),
  ('Escalada', 7.5, 'cardio'),
  ('Futebol', 7.0, 'esporte'),
  ('Basquete', 6.5, 'esporte'),
  ('Tênis', 7.0, 'esporte'),
  ('Dança', 5.0, 'cardio'),
  ('Esteira (moderado)', 7.0, 'cardio'),
  ('Elíptico', 5.0, 'cardio'),
  ('Remo', 7.0, 'cardio'),
  ('Abdominais', 5.0, 'forca'),
  ('Polichinelos', 8.0, 'cardio'),
  ('Agachamentos', 5.5, 'forca'),
  ('Flexões', 6.0, 'forca'),
  ('Barra fixa', 8.0, 'forca'),
  ('Boxe', 7.5, 'esporte'),
  ('Artes marciais', 7.0, 'esporte'),
  ('Zumba', 6.5, 'cardio'),
  ('Spinning', 8.5, 'cardio'),
  ('Alongamento', 2.3, 'flexibilidade'),
  ('Subir escadas', 8.8, 'cardio'),
  ('Jardinagem', 4.0, 'atividade')
ON CONFLICT (name) DO NOTHING;
