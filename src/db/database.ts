import * as SQLite from 'expo-sqlite';

export type Account = {
  id: string; name: string; type: string; balance: number; currency: string;
  icon: string; color: string; is_archived: number; created_at: string; updated_at: string;
};
export type Category = {
  id: string; name: string; type: 'expense'|'income'; icon: string; color: string;
  parent_id: string|null; sort_order: number; is_default: number;
};
export type Transaction = {
  id: string; type: 'expense'|'income'; amount: number; account_id: string;
  category_id: string; date: string; note: string; created_at: string; updated_at: string;
  account_name?: string; category_name?: string; account_icon?: string; category_icon?: string;
};

let db: SQLite.SQLiteDatabase | null = null;
const now = () => new Date().toISOString();
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export async function getDb() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('poolaki.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'IRR',
      icon TEXT NOT NULL DEFAULT 'wallet-outline', color TEXT NOT NULL DEFAULT '#16a56b',
      is_archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL,
      icon TEXT NOT NULL, color TEXT NOT NULL, parent_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0, is_default INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY(parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL, type TEXT NOT NULL, amount INTEGER NOT NULL,
      account_id TEXT NOT NULL, category_id TEXT NOT NULL, date TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      FOREIGN KEY(account_id) REFERENCES accounts(id), FOREIGN KEY(category_id) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY NOT NULL, source_account_id TEXT NOT NULL, destination_account_id TEXT NOT NULL,
      amount INTEGER NOT NULL, date TEXT NOT NULL, note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      FOREIGN KEY(source_account_id) REFERENCES accounts(id), FOREIGN KEY(destination_account_id) REFERENCES accounts(id)
    );
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, theme TEXT NOT NULL DEFAULT 'system', calendar TEXT NOT NULL DEFAULT 'persian');
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  `);
  await seed();
  return db;
}

async function seed() {
  const d = await getDbUnsafe();
  const account = await d.getFirstAsync<{count:number}>('SELECT COUNT(*) count FROM accounts');
  if (!account || account.count === 0) {
    const t = now();
    await d.runAsync('INSERT INTO accounts (id,name,type,balance,currency,icon,color,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)', id(),'کیف پول','cash',0,'IRR','wallet-outline','#16a56b',t,t);
  }
  const cats = await d.getFirstAsync<{count:number}>('SELECT COUNT(*) count FROM categories');
  if (!cats || cats.count === 0) {
    const expenses = [['غذا','🍔'],['حمل‌ونقل','🚗'],['خرید','🛍️'],['قبوض','💡'],['سرگرمی','🎬'],['سلامت','❤️'],['آموزش','📚'],['خانه','🏠'],['سفر','✈️']];
    const incomes = [['حقوق','💰'],['فریلنسری','💻'],['هدیه','🎁'],['سرمایه‌گذاری','📈'],['سایر درآمدها','✨']];
    for (let i=0;i<expenses.length;i++) await d.runAsync('INSERT INTO categories (id,name,type,icon,color,sort_order,is_default) VALUES (?,?,?,?,?,?,1)', id(),expenses[i][0],'expense',expenses[i][1],'#16a56b',i);
    for (let i=0;i<incomes.length;i++) await d.runAsync('INSERT INTO categories (id,name,type,icon,color,sort_order,is_default) VALUES (?,?,?,?,?,?,1)', id(),incomes[i][0],'income',incomes[i][1],'#16a56b',i);
  }
  await d.runAsync('INSERT OR IGNORE INTO settings (id,theme,calendar) VALUES (1,\'system\',\'persian\')');
}
async function getDbUnsafe() { return db!; }

export async function listAccounts() { const d=await getDb(); return d.getAllAsync<Account>('SELECT * FROM accounts WHERE is_archived=0 ORDER BY created_at'); }
export async function listCategories(type?: 'expense'|'income') { const d=await getDb(); return type ? d.getAllAsync<Category>('SELECT * FROM categories WHERE type=? ORDER BY sort_order', type) : d.getAllAsync<Category>('SELECT * FROM categories ORDER BY type,sort_order'); }
export async function listTransactions(search='') {
  const d=await getDb(); const q=`SELECT t.*,a.name account_name,a.icon account_icon,c.name category_name,c.icon category_icon FROM transactions t JOIN accounts a ON a.id=t.account_id JOIN categories c ON c.id=t.category_id ${search ? 'WHERE t.note LIKE ? OR a.name LIKE ? OR c.name LIKE ? OR CAST(t.amount AS TEXT) LIKE ?' : ''} ORDER BY t.date DESC,t.created_at DESC`;
  const s=`%${search}%`; return search ? d.getAllAsync<Transaction>(q,s,s,s,s) : d.getAllAsync<Transaction>(q);
}
export async function totals() { const d=await getDb(); const row=await d.getFirstAsync<{balance:number}>('SELECT COALESCE(SUM(balance),0) balance FROM accounts WHERE is_archived=0'); const month=new Date(); const start=new Date(month.getFullYear(),month.getMonth(),1).toISOString(); const r=await d.getFirstAsync<{income:number,expense:number}>('SELECT COALESCE(SUM(CASE WHEN type=\'income\' THEN amount ELSE 0 END),0) income, COALESCE(SUM(CASE WHEN type=\'expense\' THEN amount ELSE 0 END),0) expense FROM transactions WHERE date>=?',start); return {balance:row?.balance??0,income:r?.income??0,expense:r?.expense??0}; }
export async function addTransaction(input:{type:'expense'|'income';amount:number;accountId:string;categoryId:string;date:string;note:string}) { const d=await getDb(); const t=now(); const tx=await d.runAsync('INSERT INTO transactions (id,type,amount,account_id,category_id,date,note,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',id(),input.type,input.amount,input.accountId,input.categoryId,input.date,input.note,t,t); const delta=input.type==='income'?input.amount:-input.amount; await d.runAsync('UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?',delta,t,input.accountId); return tx; }
export async function addTransfer(input:{source:string;destination:string;amount:number;date:string;note:string}) { const d=await getDb(); const t=now(); await d.withTransactionAsync(async()=>{ await d.runAsync('INSERT INTO transfers (id,source_account_id,destination_account_id,amount,date,note,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',id(),input.source,input.destination,input.amount,input.date,input.note,t,t); await d.runAsync('UPDATE accounts SET balance=balance-?,updated_at=? WHERE id=?',input.amount,t,input.source); await d.runAsync('UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?',input.amount,t,input.destination); }); }
export async function addAccount(name:string,type:string,balance:number){ const d=await getDb(); const t=now(); return d.runAsync('INSERT INTO accounts (id,name,type,balance,currency,icon,color,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',id(),name,type,balance,'IRR','wallet-outline','#16a56b',t,t); }
