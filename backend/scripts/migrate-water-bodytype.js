/**
 * Script de Migration para adicionar colunas de Biotipo e Água
 * Executar: node scripts/migrate-water-bodytype.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

console.log('🔄 Iniciando migration...\n');

try {
  // Habilitar foreign keys
  db.pragma('foreign_keys = ON');

  // 1. Adicionar coluna body_type na tabela users
  console.log('1. Adicionando coluna body_type em users...');
  try {
    db.exec(`
      ALTER TABLE users ADD COLUMN body_type TEXT CHECK(body_type IN ('ectomorph', 'mesomorph', 'endomorph'));
    `);
    console.log('   ✅ body_type adicionada com sucesso');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('   ⚠️  Coluna body_type já existe');
    } else {
      throw e;
    }
  }

  // 2. Adicionar coluna water_goal_ml na tabela users
  console.log('2. Adicionando coluna water_goal_ml em users...');
  try {
    db.exec(`
      ALTER TABLE users ADD COLUMN water_goal_ml REAL DEFAULT 0;
    `);
    console.log('   ✅ water_goal_ml adicionada com sucesso');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('   ⚠️  Coluna water_goal_ml já existe');
    } else {
      throw e;
    }
  }

  // 3. Criar tabela water_logs se não existir
  console.log('3. Criando tabela water_logs...');
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS water_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount_ml REAL NOT NULL,
        consumed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('   ✅ water_logs criada com sucesso');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('   ⚠️  Tabela water_logs já existe');
    } else {
      throw e;
    }
  }

  console.log('\n✅ Migration concluída com sucesso!\n');

  // Verificar estrutura da tabela users
  console.log('📊 Estrutura atual da tabela users:');
  const columns = db.prepare("PRAGMA table_info(users)").all();
  columns.forEach(col => {
    console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : 'NULL'}`);
  });

} catch (error) {
  console.error('\n❌ Erro na migration:', error.message);
  process.exit(1);
} finally {
  db.close();
}

console.log('\n🎉 Migration finalizada!');
