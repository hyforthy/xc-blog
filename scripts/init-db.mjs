import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// 新增参数解析函数
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      result[key] = args[i + 1];
      i++; // 跳过下一个参数值
    } else if (args[i].startsWith('-')) {
      const key = args[i].substring(1);
      result[key] = args[i + 1];
      i++; // 跳过下一个参数值
    }
  }
  return result;
}

// 1. 配置数据库路径
const dbDir = path.join(process.cwd(), 'db');
const dbPath = path.join(dbDir, 'data.db');

// 确保db目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 创建数据库目录: ${dbDir}`);
}

// 2. 创建数据库连接
const db = new Database(dbPath);

try {
  // 3. 执行初始化SQL
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      category_id TEXT,
      summary TEXT,
      is_deleted BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id TEXT,
      tag_id TEXT,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id),
      FOREIGN KEY (tag_id) REFERENCES tags(id)
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_ext TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
  CREATE TABLE IF NOT EXISTS users (
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
  `);

  // 4. 添加性能优化配置
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // 5. 添加默认管理员账户
  const params = parseArgs();
  const username = params.user || params.u || 'admin';
  const password = params.password || params.p || '123456';
  const passwordHash = await bcrypt.hash(password, 10);
  console.log(`✅ 管理员账户: ${username}, 密码: ${password}`);
  db.prepare(`
    INSERT OR REPLACE INTO users (username, password_hash)
    VALUES (?, ?)
  `).run(username, passwordHash);

  console.log('✅ 数据库初始化成功，已创建默认管理员账户');
} catch (error) {
  console.error('❌ 数据库初始化失败:', error);
} finally {
  db.close();
}