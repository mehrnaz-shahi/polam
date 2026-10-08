import * as SQLite from 'expo-sqlite';

export type Account = { id:string; name:string; type:string; balance:number; currency:string; icon:string; color:string; is_archived:number; created_at:string; updated_at:string };
export type Category = { id:string; name:string; type:'expense'|'income'; icon:string; color:string; parent_id:string|null; sort_order:number; is_default:number; is_archived:number };
export type Transaction = { id:string; type:'expense'|'income'; amount:number; account_id:string; category_id:string; date:string; note:string; created_at:string; updated_at:string; account_name?:string; category_name?:string; account_icon?:string; category_icon?:string };
export type Transfer = { id:string; source_account_id:string; destination_account_id:string; amount:number; date:string; note:string; created_at:string; updated_at:string; source_name?:string; destination_name?:string };
export type Theme = 'light'|'dark'|'system';

let opening: Promise<SQLite.SQLiteDatabase> | null = null;
const now=()=>new Date().toISOString();
const id=()=>`${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
function startOfPersianMonth(){const d=new Date();d.setHours(0,0,0,0);const fmt=new Intl.DateTimeFormat('en-US-u-ca-persian',{day:'numeric'});for(let i=0;i<32;i++){if(fmt.format(d)==='1')return d;d.setDate(d.getDate()-1)}return new Date(d.getFullYear(),d.getMonth(),1)}


export function getDb(){
  if(!opening){
    opening=(async()=>{
      const database=await SQLite.openDatabaseAsync('poolaki.db');
      await database.execAsync('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
      await migrate(database);
      return database;
    })();
  }
  return opening;
}

async function migrate(d:SQLite.SQLiteDatabase){
  await d.execAsync(`CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY NOT NULL);`);
  const row=await d.getFirstAsync<{version:number}>('SELECT COALESCE(MAX(version),0) version FROM schema_migrations');
  let version=row?.version??0;
  if(version<1){
    await d.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,type TEXT NOT NULL,balance INTEGER NOT NULL DEFAULT 0,currency TEXT NOT NULL DEFAULT 'IRR',icon TEXT NOT NULL DEFAULT 'wallet-outline',color TEXT NOT NULL DEFAULT '#4B8D88',is_archived INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS categories(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,type TEXT NOT NULL CHECK(type IN ('expense','income')),icon TEXT NOT NULL,color TEXT NOT NULL,parent_id TEXT,sort_order INTEGER NOT NULL DEFAULT 0,is_default INTEGER NOT NULL DEFAULT 1,is_archived INTEGER NOT NULL DEFAULT 0,FOREIGN KEY(parent_id) REFERENCES categories(id) ON DELETE SET NULL);
      CREATE TABLE IF NOT EXISTS transactions(id TEXT PRIMARY KEY NOT NULL,type TEXT NOT NULL CHECK(type IN ('expense','income')),amount INTEGER NOT NULL CHECK(amount>0),account_id TEXT NOT NULL,category_id TEXT NOT NULL,date TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(account_id) REFERENCES accounts(id));
      CREATE TABLE IF NOT EXISTS transfers(id TEXT PRIMARY KEY NOT NULL,source_account_id TEXT NOT NULL,destination_account_id TEXT NOT NULL,amount INTEGER NOT NULL CHECK(amount>0),date TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(source_account_id) REFERENCES accounts(id),FOREIGN KEY(destination_account_id) REFERENCES accounts(id));
      CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY NOT NULL,theme TEXT NOT NULL DEFAULT 'system',calendar TEXT NOT NULL DEFAULT 'persian');
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type,sort_order);
    `);
    await d.runAsync('INSERT OR IGNORE INTO schema_migrations(version) VALUES(1)');
    version=1;
  }
  if(version<2){
    // Existing installations may come from the original Phase 1 starter without archive support.
    const cols=await d.getAllAsync<{name:string}>('PRAGMA table_info(categories)');
    if(!cols.some(c=>c.name==='is_archived')) await d.execAsync('ALTER TABLE categories ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0');
    await d.runAsync('INSERT OR IGNORE INTO schema_migrations(version) VALUES(2)');
    version=2;
  }
  if(version<3){
    await d.runAsync("UPDATE accounts SET color='#4B8D88' WHERE lower(color) IN ('#4f46e5','#7c5cff','#6848e8','#6366f1','#818cf8','#3730a3')");
    await d.runAsync("UPDATE categories SET color='#4B8D88' WHERE lower(color) IN ('#4f46e5','#7c5cff','#6848e8','#6366f1','#818cf8','#3730a3')");
    await d.runAsync('INSERT OR IGNORE INTO schema_migrations(version) VALUES(3)');
  }
  await seed(d);
}

async function seed(d:SQLite.SQLiteDatabase){
  const a=await d.getFirstAsync<{count:number}>('SELECT COUNT(*) count FROM accounts');
  if((a?.count??0)===0){const t=now();await d.runAsync('INSERT INTO accounts VALUES (?,?,?,?,?,?,?,?,?,?)',id(),'کیف پول','cash',0,'IRR','wallet-outline','#4B8D88',0,t,t)}
  const c=await d.getFirstAsync<{count:number}>('SELECT COUNT(*) count FROM categories');
  if((c?.count??0)===0){
    const ex=[['غذا','🍔'],['حمل‌ونقل','🚗'],['خرید','🛍️'],['قبوض','💡'],['سرگرمی','🎬'],['سلامت','❤️'],['آموزش','📚'],['خانه','🏠'],['سفر','✈️']];
    const inc=[['حقوق','💰'],['فریلنسری','💻'],['هدیه','🎁'],['سرمایه‌گذاری','📈'],['سایر درآمدها','✨']];
    for(let i=0;i<ex.length;i++) await d.runAsync('INSERT INTO categories VALUES (?,?,?,?,?,?,?,?,?)',id(),ex[i][0],'expense',ex[i][1],'#4B8D88',null,i,1,0);
    for(let i=0;i<inc.length;i++) await d.runAsync('INSERT INTO categories VALUES (?,?,?,?,?,?,?,?,?)',id(),inc[i][0],'income',inc[i][1],'#4B8D88',null,i,1,0);
  }
  await d.runAsync("INSERT OR IGNORE INTO settings(id,theme,calendar) VALUES(1,'system','persian')");
}

export async function listAccounts(includeArchived=false){const d=await getDb();return d.getAllAsync<Account>(`SELECT * FROM accounts ${includeArchived?'':'WHERE is_archived=0'} ORDER BY is_archived,created_at`)}
export async function getAccount(id:string){const d=await getDb();return d.getFirstAsync<Account>('SELECT * FROM accounts WHERE id=?',id)}
export async function addAccount(input:{name:string;type:string;balance:number;icon?:string;color?:string}){const d=await getDb();const t=now();return d.runAsync('INSERT INTO accounts VALUES (?,?,?,?,?,?,?,?,?,?)',id(),input.name,input.type,input.balance,'IRR',input.icon??'wallet-outline',input.color??'#4B8D88',0,t,t)}
export async function updateAccount(id:string,input:{name:string;type?:string;icon?:string;color?:string}){const d=await getDb();return d.runAsync('UPDATE accounts SET name=?,type=COALESCE(?,type),icon=COALESCE(?,icon),color=COALESCE(?,color),updated_at=? WHERE id=?',input.name,input.type??null,input.icon??null,input.color??null,now(),id)}
export async function setAccountArchived(id:string,archived:boolean){const d=await getDb();return d.runAsync('UPDATE accounts SET is_archived=?,updated_at=? WHERE id=?',archived?1:0,now(),id)}

export async function listCategories(type?:'expense'|'income',includeArchived=false){const d=await getDb();return d.getAllAsync<Category>(`SELECT * FROM categories ${type?'WHERE type=? AND is_archived=0':'WHERE is_archived=0'} ORDER BY type,sort_order`,...(type?[type]:[]))}
export async function addCategory(input:{name:string;type:'expense'|'income';icon:string;parentId?:string|null}){const d=await getDb();const max=await d.getFirstAsync<{n:number}>('SELECT COALESCE(MAX(sort_order),-1)+1 n FROM categories WHERE type=?',input.type);return d.runAsync('INSERT INTO categories VALUES (?,?,?,?,?,?,?,?,?)',id(),input.name,input.type,input.icon,'#4B8D88',input.parentId??null,max?.n??0,0,0)}
export async function updateCategory(id:string,name:string,icon:string){const d=await getDb();return d.runAsync('UPDATE categories SET name=?,icon=? WHERE id=?',name,icon,id)}
export async function archiveCategory(id:string){const d=await getDb();return d.runAsync('UPDATE categories SET is_archived=1 WHERE id=?',id)}

export async function addTransaction(input:{type:'expense'|'income';amount:number;accountId:string;categoryId:string;date:string;note:string}){
  const d=await getDb();const t=now();const txId=id();
  await d.withTransactionAsync(async()=>{
    await d.runAsync('INSERT INTO transactions VALUES (?,?,?,?,?,?,?,?,?)',txId,input.type,input.amount,input.accountId,input.categoryId,input.date,input.note,t,t);
    const delta=input.type==='income'?input.amount:-input.amount;
    await d.runAsync('UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?',delta,t,input.accountId);
  });
  return txId;
}
export async function getTransaction(transactionId:string){const d=await getDb();return d.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id=?',transactionId)}
export async function updateTransaction(transactionId:string,input:{type:'expense'|'income';amount:number;accountId:string;categoryId:string;date:string;note:string}){
 const d=await getDb(); const t=now();
 await d.withTransactionAsync(async()=>{
  const old=await d.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id=?',transactionId);
  if(!old) throw new Error('not-found');
  const oldDelta=old.type==='income'?old.amount:-old.amount;
  const newDelta=input.type==='income'?input.amount:-input.amount;
  await d.runAsync('UPDATE accounts SET balance=balance-?,updated_at=? WHERE id=?',oldDelta,t,old.account_id);
  await d.runAsync('UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?',newDelta,t,input.accountId);
  await d.runAsync('UPDATE transactions SET type=?,amount=?,account_id=?,category_id=?,date=?,note=?,updated_at=? WHERE id=?',input.type,input.amount,input.accountId,input.categoryId,input.date,input.note,t,transactionId);
 });
}
export async function deleteTransaction(transactionId:string){
  const d=await getDb();
  await d.withTransactionAsync(async()=>{const x=await d.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id=?',transactionId);if(!x)return;const delta=x.type==='income'?-x.amount:x.amount;await d.runAsync('UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?',delta,now(),x.account_id);await d.runAsync('DELETE FROM transactions WHERE id=?',transactionId)})
}
export async function listTransactions(search='',filters?:{type?:'expense'|'income';accountId?:string;categoryId?:string;from?:string;to?:string}){
  const d=await getDb();const where:string[]=[];const args:any[]=[];
  if(search){where.push('(t.note LIKE ? OR a.name LIKE ? OR c.name LIKE ? OR CAST(t.amount AS TEXT) LIKE ?)');const s=`%${search}%`;args.push(s,s,s,s)}
  if(filters?.type){where.push('t.type=?');args.push(filters.type)}
  if(filters?.accountId){where.push('t.account_id=?');args.push(filters.accountId)}
  if(filters?.categoryId){where.push('t.category_id=?');args.push(filters.categoryId)}
  if(filters?.from){where.push('t.date>=?');args.push(filters.from)}
  if(filters?.to){where.push('t.date<=?');args.push(filters.to)}
  const sql=`SELECT t.*,a.name account_name,a.icon account_icon,c.name category_name,c.icon category_icon FROM transactions t JOIN accounts a ON a.id=t.account_id JOIN categories c ON c.id=t.category_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY t.date DESC,t.created_at DESC`;
  return d.getAllAsync<Transaction>(sql,...args);
}
export async function addTransfer(input:{source:string;destination:string;amount:number;date:string;note:string}){const d=await getDb();const t=now();if(input.source===input.destination)throw new Error('same-account');await d.withTransactionAsync(async()=>{await d.runAsync('INSERT INTO transfers VALUES (?,?,?,?,?,?,?,?)',id(),input.source,input.destination,input.amount,input.date,input.note,t,t);await d.runAsync('UPDATE accounts SET balance=balance-?,updated_at=? WHERE id=?',input.amount,t,input.source);await d.runAsync('UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?',input.amount,t,input.destination)})}
export async function listTransfers(){const d=await getDb();return d.getAllAsync<Transfer>('SELECT t.*,s.name source_name,d.name destination_name FROM transfers t JOIN accounts s ON s.id=t.source_account_id JOIN accounts d ON d.id=t.destination_account_id ORDER BY t.date DESC,t.created_at DESC')}
export async function totals(){const d=await getDb();const b=await d.getFirstAsync<{balance:number}>('SELECT COALESCE(SUM(balance),0) balance FROM accounts WHERE is_archived=0');const start=startOfPersianMonth();const r=await d.getFirstAsync<{income:number;expense:number}>('SELECT COALESCE(SUM(CASE WHEN type="income" THEN amount ELSE 0 END),0) income,COALESCE(SUM(CASE WHEN type="expense" THEN amount ELSE 0 END),0) expense FROM transactions WHERE date>=?',start.toISOString());return {balance:b?.balance??0,income:r?.income??0,expense:r?.expense??0}}
export async function categoryTotals(){const d=await getDb();const start=startOfPersianMonth();return d.getAllAsync<{category_name:string;category_icon:string;amount:number}>('SELECT c.name category_name,c.icon category_icon,SUM(t.amount) amount FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.type="expense" AND t.date>=? GROUP BY t.category_id ORDER BY amount DESC',start.toISOString())}
export async function getTheme():Promise<Theme>{const d=await getDb();const x=await d.getFirstAsync<{theme:Theme}>('SELECT theme FROM settings WHERE id=1');return x?.theme??'system'}
export async function setTheme(theme:Theme){const d=await getDb();await d.runAsync('UPDATE settings SET theme=? WHERE id=1',theme)}
