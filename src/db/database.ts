import * as SQLite from "expo-sqlite";

export type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
};
export type Category = {
  id: string;
  name: string;
  type: "expense" | "income";
  icon: string;
  color: string;
  parent_id: string | null;
  sort_order: number;
  is_default: number;
  is_archived: number;
};
export type Transaction = {
  id: string;
  type: "expense" | "income";
  amount: number;
  account_id: string;
  category_id: string;
  date: string;
  note: string;
  created_at: string;
  updated_at: string;
  account_name?: string;
  category_name?: string;
  account_icon?: string;
  category_icon?: string;
};
export type Transfer = {
  id: string;
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  date: string;
  note: string;
  created_at: string;
  updated_at: string;
  source_name?: string;
  destination_name?: string;
};
export type Theme = "light" | "dark" | "system";
export type Budget = {
  id: string;
  name: string;
  category_id: string | null;
  amount: number;
  period: "monthly" | "overall";
  start_date: string;
  end_date: string | null;
  is_active: number;
};
export type Debt = {
  id: string;
  direction: "owe" | "owed";
  person: string;
  principal: number;
  paid: number;
  remaining: number;
  due_date: string | null;
  note: string;
  status: string;
};
export type Loan = {
  id: string;
  title: string;
  amount: number;
  interest: number;
  start_date: string;
  end_date: string | null;
  frequency: string;
  installment_amount: number;
  remaining_principal: number;
  remaining_installments: number;
};
export type Installment = {
  id: string;
  title: string;
  total_amount: number;
  count: number;
  paid_count: number;
  payment_amount: number;
  due_date: string;
  start_date: string;
  end_date: string | null;
  reminder: number;
};
export type Check = {
  id: string;
  type: "issued" | "received";
  check_number: string;
  bank: string;
  amount: number;
  person: string;
  issue_date: string;
  due_date: string;
  account_id: string;
  note: string;
  status: string;
};
export type Reminder = {
  id: string;
  title: string;
  type: string;
  due_at: string;
  recurrence: string | null;
  snooze_until: string | null;
  is_active: number;
  notification_id: string | null;
};

let opening: Promise<SQLite.SQLiteDatabase> | null = null;
const now = () => new Date().toISOString();
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
function startOfPersianMonth(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const fmt = new Intl.DateTimeFormat("en-US-u-ca-persian", { day: "numeric" });
  for (let i = 0; i < 32; i++) {
    if (fmt.format(d) === "1") return d;
    d.setDate(d.getDate() - 1);
  }
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function persianMonthStarts(count: number) {
  const starts: Date[] = [];
  let cursor = startOfPersianMonth();
  for (let i = 0; i < count; i++) {
    starts.unshift(new Date(cursor));
    const prev = new Date(cursor);
    prev.setDate(prev.getDate() - 1);
    cursor = startOfPersianMonth(prev);
  }
  return starts;
}

export function getDb() {
  if (!opening) {
    opening = (async () => {
      const database = await SQLite.openDatabaseAsync("poolaki.db");
      await database.execAsync(
        "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;",
      );
      await migrate(database);
      return database;
    })();
  }
  return opening;
}

async function migrate(d: SQLite.SQLiteDatabase) {
  await d.execAsync(
    `CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY NOT NULL);`,
  );
  const row = await d.getFirstAsync<{ version: number }>(
    "SELECT COALESCE(MAX(version),0) version FROM schema_migrations",
  );
  let version = row?.version ?? 0;
  if (version < 1) {
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
    await d.runAsync(
      "INSERT OR IGNORE INTO schema_migrations(version) VALUES(1)",
    );
    version = 1;
  }
  if (version < 2) {
    // Existing installations may come from the original Phase 1 starter without archive support.
    const cols = await d.getAllAsync<{ name: string }>(
      "PRAGMA table_info(categories)",
    );
    if (!cols.some((c) => c.name === "is_archived"))
      await d.execAsync(
        "ALTER TABLE categories ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0",
      );
    await d.runAsync(
      "INSERT OR IGNORE INTO schema_migrations(version) VALUES(2)",
    );
    version = 2;
  }
  if (version < 3) {
    await d.runAsync(
      "UPDATE accounts SET color='#4B8D88' WHERE lower(color) IN ('#4f46e5','#7c5cff','#6848e8','#6366f1','#818cf8','#3730a3')",
    );
    await d.runAsync(
      "UPDATE categories SET color='#4B8D88' WHERE lower(color) IN ('#4f46e5','#7c5cff','#6848e8','#6366f1','#818cf8','#3730a3')",
    );
    await d.runAsync(
      "INSERT OR IGNORE INTO schema_migrations(version) VALUES(3)",
    );
    version = 3;
  }
  if (version < 4) {
    await d.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,category_id TEXT,amount INTEGER NOT NULL,period TEXT NOT NULL DEFAULT 'monthly',start_date TEXT NOT NULL,end_date TEXT,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL);
      CREATE TABLE IF NOT EXISTS debts(id TEXT PRIMARY KEY NOT NULL,direction TEXT NOT NULL CHECK(direction IN ('owe','owed')),person TEXT NOT NULL,principal INTEGER NOT NULL,paid INTEGER NOT NULL DEFAULT 0,due_date TEXT,note TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS loans(id TEXT PRIMARY KEY NOT NULL,title TEXT NOT NULL,amount INTEGER NOT NULL,interest INTEGER NOT NULL DEFAULT 0,start_date TEXT NOT NULL,end_date TEXT,frequency TEXT NOT NULL,installment_amount INTEGER NOT NULL,remaining_principal INTEGER NOT NULL,remaining_installments INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS installments(id TEXT PRIMARY KEY NOT NULL,title TEXT NOT NULL,total_amount INTEGER NOT NULL,count INTEGER NOT NULL,paid_count INTEGER NOT NULL DEFAULT 0,payment_amount INTEGER NOT NULL,due_date TEXT NOT NULL,start_date TEXT NOT NULL,end_date TEXT,reminder INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS checks(id TEXT PRIMARY KEY NOT NULL,type TEXT NOT NULL CHECK(type IN ('issued','received')),check_number TEXT NOT NULL,bank TEXT NOT NULL,amount INTEGER NOT NULL,person TEXT NOT NULL,issue_date TEXT NOT NULL,due_date TEXT NOT NULL,account_id TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(account_id) REFERENCES accounts(id));
      CREATE TABLE IF NOT EXISTS reminders(id TEXT PRIMARY KEY NOT NULL,title TEXT NOT NULL,type TEXT NOT NULL,due_at TEXT NOT NULL,recurrence TEXT,snooze_until TEXT,is_active INTEGER NOT NULL DEFAULT 1,notification_id TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);
      CREATE INDEX IF NOT EXISTS idx_debts_due ON debts(due_date);
      CREATE INDEX IF NOT EXISTS idx_checks_due ON checks(due_date);
      CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_at,is_active);
    `);
    await d.runAsync("INSERT OR IGNORE INTO schema_migrations(version) VALUES(4)");
  }
  await seed(d);
}

async function seed(d: SQLite.SQLiteDatabase) {
  const a = await d.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) count FROM accounts",
  );
  if ((a?.count ?? 0) === 0) {
    const t = now();
    await d.runAsync(
      "INSERT INTO accounts VALUES (?,?,?,?,?,?,?,?,?,?)",
      id(),
      "کیف پول",
      "cash",
      0,
      "IRR",
      "wallet-outline",
      "#4B8D88",
      0,
      t,
      t,
    );
  }
  const c = await d.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) count FROM categories",
  );
  if ((c?.count ?? 0) === 0) {
    const ex = [
      ["غذا", "🍔"],
      ["حمل‌ونقل", "🚗"],
      ["خرید", "🛍️"],
      ["قبوض", "💡"],
      ["سرگرمی", "🎬"],
      ["سلامت", "❤️"],
      ["آموزش", "📚"],
      ["خانه", "🏠"],
      ["سفر", "✈️"],
    ];
    const inc = [
      ["حقوق", "💰"],
      ["فریلنسری", "💻"],
      ["هدیه", "🎁"],
      ["سرمایه‌گذاری", "📈"],
      ["سایر درآمدها", "✨"],
    ];
    for (let i = 0; i < ex.length; i++)
      await d.runAsync(
        "INSERT INTO categories VALUES (?,?,?,?,?,?,?,?,?)",
        id(),
        ex[i][0],
        "expense",
        ex[i][1],
        "#4B8D88",
        null,
        i,
        1,
        0,
      );
    for (let i = 0; i < inc.length; i++)
      await d.runAsync(
        "INSERT INTO categories VALUES (?,?,?,?,?,?,?,?,?)",
        id(),
        inc[i][0],
        "income",
        inc[i][1],
        "#4B8D88",
        null,
        i,
        1,
        0,
      );
  }
  await d.runAsync(
    "INSERT OR IGNORE INTO settings(id,theme,calendar) VALUES(1,'system','persian')",
  );
}

export async function listAccounts(includeArchived = false) {
  const d = await getDb();
  return d.getAllAsync<Account>(
    `SELECT * FROM accounts ${includeArchived ? "" : "WHERE is_archived=0"} ORDER BY is_archived,created_at`,
  );
}
export async function getAccount(id: string) {
  const d = await getDb();
  return d.getFirstAsync<Account>("SELECT * FROM accounts WHERE id=?", id);
}
export async function addAccount(input: {
  name: string;
  type: string;
  balance: number;
  icon?: string;
  color?: string;
}) {
  const d = await getDb();
  const t = now();
  return d.runAsync(
    "INSERT INTO accounts VALUES (?,?,?,?,?,?,?,?,?,?)",
    id(),
    input.name,
    input.type,
    input.balance,
    "IRR",
    input.icon ?? "wallet-outline",
    input.color ?? "#4B8D88",
    0,
    t,
    t,
  );
}
export async function updateAccount(
  id: string,
  input: { name: string; type?: string; icon?: string; color?: string },
) {
  const d = await getDb();
  return d.runAsync(
    "UPDATE accounts SET name=?,type=COALESCE(?,type),icon=COALESCE(?,icon),color=COALESCE(?,color),updated_at=? WHERE id=?",
    input.name,
    input.type ?? null,
    input.icon ?? null,
    input.color ?? null,
    now(),
    id,
  );
}
export async function setAccountArchived(id: string, archived: boolean) {
  const d = await getDb();
  return d.runAsync(
    "UPDATE accounts SET is_archived=?,updated_at=? WHERE id=?",
    archived ? 1 : 0,
    now(),
    id,
  );
}

export async function listCategories(
  type?: "expense" | "income",
  includeArchived = false,
) {
  const d = await getDb();
  return d.getAllAsync<Category>(
    `SELECT * FROM categories ${type ? "WHERE type=? AND is_archived=0" : "WHERE is_archived=0"} ORDER BY type,sort_order`,
    ...(type ? [type] : []),
  );
}
export async function addCategory(input: {
  name: string;
  type: "expense" | "income";
  icon: string;
  parentId?: string | null;
}) {
  const d = await getDb();
  const max = await d.getFirstAsync<{ n: number }>(
    "SELECT COALESCE(MAX(sort_order),-1)+1 n FROM categories WHERE type=?",
    input.type,
  );
  return d.runAsync(
    "INSERT INTO categories VALUES (?,?,?,?,?,?,?,?,?)",
    id(),
    input.name,
    input.type,
    input.icon,
    "#4B8D88",
    input.parentId ?? null,
    max?.n ?? 0,
    0,
    0,
  );
}
export async function updateCategory(id: string, name: string, icon: string) {
  const d = await getDb();
  return d.runAsync(
    "UPDATE categories SET name=?,icon=? WHERE id=?",
    name,
    icon,
    id,
  );
}
export async function archiveCategory(id: string) {
  const d = await getDb();
  return d.runAsync("UPDATE categories SET is_archived=1 WHERE id=?", id);
}

export async function addTransaction(input: {
  type: "expense" | "income";
  amount: number;
  accountId: string;
  categoryId: string;
  date: string;
  note: string;
}) {
  const d = await getDb();
  const t = now();
  const txId = id();
  await d.withTransactionAsync(async () => {
    await d.runAsync(
      "INSERT INTO transactions VALUES (?,?,?,?,?,?,?,?,?)",
      txId,
      input.type,
      input.amount,
      input.accountId,
      input.categoryId,
      input.date,
      input.note,
      t,
      t,
    );
    const delta = input.type === "income" ? input.amount : -input.amount;
    await d.runAsync(
      "UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?",
      delta,
      t,
      input.accountId,
    );
  });
  return txId;
}
export async function getTransaction(transactionId: string) {
  const d = await getDb();
  return d.getFirstAsync<Transaction>(
    "SELECT * FROM transactions WHERE id=?",
    transactionId,
  );
}
export async function updateTransaction(
  transactionId: string,
  input: {
    type: "expense" | "income";
    amount: number;
    accountId: string;
    categoryId: string;
    date: string;
    note: string;
  },
) {
  const d = await getDb();
  const t = now();
  await d.withTransactionAsync(async () => {
    const old = await d.getFirstAsync<Transaction>(
      "SELECT * FROM transactions WHERE id=?",
      transactionId,
    );
    if (!old) throw new Error("not-found");
    const oldDelta = old.type === "income" ? old.amount : -old.amount;
    const newDelta = input.type === "income" ? input.amount : -input.amount;
    await d.runAsync(
      "UPDATE accounts SET balance=balance-?,updated_at=? WHERE id=?",
      oldDelta,
      t,
      old.account_id,
    );
    await d.runAsync(
      "UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?",
      newDelta,
      t,
      input.accountId,
    );
    await d.runAsync(
      "UPDATE transactions SET type=?,amount=?,account_id=?,category_id=?,date=?,note=?,updated_at=? WHERE id=?",
      input.type,
      input.amount,
      input.accountId,
      input.categoryId,
      input.date,
      input.note,
      t,
      transactionId,
    );
  });
}
export async function deleteTransaction(transactionId: string) {
  const d = await getDb();
  await d.withTransactionAsync(async () => {
    const x = await d.getFirstAsync<Transaction>(
      "SELECT * FROM transactions WHERE id=?",
      transactionId,
    );
    if (!x) return;
    const delta = x.type === "income" ? -x.amount : x.amount;
    await d.runAsync(
      "UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?",
      delta,
      now(),
      x.account_id,
    );
    await d.runAsync("DELETE FROM transactions WHERE id=?", transactionId);
  });
}
export async function listTransactions(
  search = "",
  filters?: {
    type?: "expense" | "income";
    accountId?: string;
    categoryId?: string;
    from?: string;
    to?: string;
  },
) {
  const d = await getDb();
  const where: string[] = [];
  const args: any[] = [];
  if (search) {
    where.push(
      "(t.note LIKE ? OR a.name LIKE ? OR c.name LIKE ? OR CAST(t.amount AS TEXT) LIKE ?)",
    );
    const s = `%${search}%`;
    args.push(s, s, s, s);
  }
  if (filters?.type) {
    where.push("t.type=?");
    args.push(filters.type);
  }
  if (filters?.accountId) {
    where.push("t.account_id=?");
    args.push(filters.accountId);
  }
  if (filters?.categoryId) {
    where.push("t.category_id=?");
    args.push(filters.categoryId);
  }
  if (filters?.from) {
    where.push("t.date>=?");
    args.push(filters.from);
  }
  if (filters?.to) {
    where.push("t.date<=?");
    args.push(filters.to);
  }
  const sql = `SELECT t.*,a.name account_name,a.icon account_icon,c.name category_name,c.icon category_icon FROM transactions t JOIN accounts a ON a.id=t.account_id JOIN categories c ON c.id=t.category_id ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY t.date DESC,t.created_at DESC`;
  return d.getAllAsync<Transaction>(sql, ...args);
}
export async function addTransfer(input: {
  source: string;
  destination: string;
  amount: number;
  date: string;
  note: string;
}) {
  const d = await getDb();
  const t = now();
  if (input.source === input.destination) throw new Error("same-account");
  await d.withTransactionAsync(async () => {
    await d.runAsync(
      "INSERT INTO transfers VALUES (?,?,?,?,?,?,?,?)",
      id(),
      input.source,
      input.destination,
      input.amount,
      input.date,
      input.note,
      t,
      t,
    );
    await d.runAsync(
      "UPDATE accounts SET balance=balance-?,updated_at=? WHERE id=?",
      input.amount,
      t,
      input.source,
    );
    await d.runAsync(
      "UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=?",
      input.amount,
      t,
      input.destination,
    );
  });
}
export async function listTransfers() {
  const d = await getDb();
  return d.getAllAsync<Transfer>(
    "SELECT t.*,s.name source_name,d.name destination_name FROM transfers t JOIN accounts s ON s.id=t.source_account_id JOIN accounts d ON d.id=t.destination_account_id ORDER BY t.date DESC,t.created_at DESC",
  );
}
function nextPersianMonth(start: Date) {
  const next = new Date(start);
  next.setDate(next.getDate() + 32);
  return startOfPersianMonth(next);
}
export async function totals(
  start = startOfPersianMonth().toISOString(),
  end?: string,
) {
  const d = await getDb();
  const b = await d.getFirstAsync<{ balance: number }>(
    "SELECT COALESCE(SUM(balance),0) balance FROM accounts WHERE is_archived=0",
  );
  const r = await d.getFirstAsync<{ income: number; expense: number }>(
    `SELECT COALESCE(SUM(CASE WHEN type="income" THEN amount ELSE 0 END),0) income,COALESCE(SUM(CASE WHEN type="expense" THEN amount ELSE 0 END),0) expense FROM transactions WHERE date>=?${end ? " AND date<?" : ""}`,
    ...(end ? [start, end] : [start]),
  );
  return {
    balance: b?.balance ?? 0,
    income: r?.income ?? 0,
    expense: r?.expense ?? 0,
  };
}
export async function categoryTotals(
  start = startOfPersianMonth().toISOString(),
  end?: string,
) {
  const d = await getDb();
  return d.getAllAsync<{
    category_name: string;
    category_icon: string;
    amount: number;
  }>(
    `SELECT c.name category_name,c.icon category_icon,SUM(t.amount) amount FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.type="expense" AND t.date>=?${end ? " AND t.date<?" : ""} GROUP BY t.category_id ORDER BY amount DESC`,
    ...(end ? [start, end] : [start]),
  );
}
export async function dailyFlow(startIso: string, endIso: string) {
  const d = await getDb();
  const rows = await d.getAllAsync<{
    day: string;
    income: number;
    expense: number;
  }>(
    'SELECT substr(date,1,10) day,COALESCE(SUM(CASE WHEN type="income" THEN amount ELSE 0 END),0) income,COALESCE(SUM(CASE WHEN type="expense" THEN amount ELSE 0 END),0) expense FROM transactions WHERE date>=? AND date<? GROUP BY day',
    startIso,
    endIso,
  );
  const by = new Map(rows.map((row) => [row.day, row]));
  const start = new Date(startIso);
  const end = new Date(endIso);
  const days: { date: string; income: number; expense: number }[] = [];
  for (
    const cursor = new Date(start);
    cursor < end;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const key = cursor.toISOString().slice(0, 10);
    const row = by.get(key);
    days.push({
      date: new Date(cursor).toISOString(),
      income: row?.income ?? 0,
      expense: row?.expense ?? 0,
    });
  }
  return days;
}
export async function monthlyFlow() {
  const d = await getDb();
  const starts = persianMonthStarts(6);
  const rows = await d.getAllAsync<{
    date: string;
    type: "expense" | "income";
    amount: number;
  }>(
    "SELECT date,type,amount FROM transactions WHERE date>=?",
    starts[0].toISOString(),
  );
  const labelOf = (date: Date) =>
    new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long" }).format(
      date,
    );
  return starts.map((start) => {
    const end = nextPersianMonth(start);
    let income = 0;
    let expense = 0;
    for (const row of rows) {
      if (row.date < start.toISOString() || row.date >= end.toISOString())
        continue;
      if (row.type === "income") income += row.amount;
      else expense += row.amount;
    }
    return {
      label: labelOf(start),
      start: start.toISOString(),
      end: end.toISOString(),
      income,
      expense,
    };
  });
}
export async function accountExpenseTotals(
  start = startOfPersianMonth().toISOString(),
  end?: string,
) {
  const d = await getDb();
  return d.getAllAsync<{ account_name: string; amount: number }>(
    `SELECT a.name account_name,SUM(t.amount) amount FROM transactions t JOIN accounts a ON a.id=t.account_id WHERE t.type="expense" AND t.date>=?${end ? " AND t.date<?" : ""} GROUP BY t.account_id ORDER BY amount DESC`,
    ...(end ? [start, end] : [start]),
  );
}
export async function getTheme(): Promise<Theme> {
  const d = await getDb();
  const x = await d.getFirstAsync<{ theme: Theme }>(
    "SELECT theme FROM settings WHERE id=1",
  );
  return x?.theme ?? "system";
}
export async function setTheme(theme: Theme) {
  const d = await getDb();
  await d.runAsync("UPDATE settings SET theme=? WHERE id=1", theme);
}
function monthRange(offset = 0) {
  const fmt = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const parts = (x: Date) => {
    const a = fmt.formatToParts(x);
    return {
      y: Number(a.find((p) => p.type === "year")?.value),
      m: Number(a.find((p) => p.type === "month")?.value),
      d: Number(a.find((p) => p.type === "day")?.value),
    };
  };
  let cur = parts(base);
  let targetM = cur.m - offset,
    targetY = cur.y;
  while (targetM < 1) {
    targetM += 12;
    targetY--;
  }
  while (targetM > 12) {
    targetM -= 12;
    targetY++;
  }
  const start = new Date(base);
  for (let i = 0; i < 4000; i++) {
    const q = parts(start);
    if (q.y === targetY && q.m === targetM && q.d === 1) break;
    start.setDate(start.getDate() - 1);
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  for (let i = 0; i < 40; i++) {
    const q = parts(end);
    if (q.d === 1) {
      end.setMilliseconds(-1);
      break;
    }
    end.setDate(end.getDate() + 1);
  }
  return { start, end };
}
export async function listBudgets() {
  const d = await getDb();
  return d.getAllAsync<Budget>(
    "SELECT * FROM budgets WHERE is_active=1 ORDER BY created_at DESC",
  );
}
export async function addBudget(input: {
  name: string;
  categoryId?: string | null;
  amount: number;
  period?: "monthly" | "overall";
  startDate: string;
  endDate?: string | null;
}) {
  const d = await getDb();
  const t = now();
  return d.runAsync(
    "INSERT INTO budgets VALUES (?,?,?,?,?,?,?,?,?,?)",
    id(),
    input.name,
    input.categoryId ?? null,
    input.amount,
    input.period ?? "monthly",
    input.startDate,
    input.endDate ?? null,
    1,
    t,
    t,
  );
}
export async function updateBudget(
  idv: string,
  input: {
    name: string;
    categoryId?: string | null;
    amount: number;
    period: "monthly" | "overall";
    startDate: string;
    endDate?: string | null;
  },
) {
  const d = await getDb();
  return d.runAsync(
    "UPDATE budgets SET name=?,category_id=?,amount=?,period=?,start_date=?,end_date=?,updated_at=? WHERE id=?",
    input.name,
    input.categoryId ?? null,
    input.amount,
    input.period,
    input.startDate,
    input.endDate ?? null,
    now(),
    idv,
  );
}
export async function deleteBudget(idv: string) {
  const d = await getDb();
  return d.runAsync(
    "UPDATE budgets SET is_active=0,updated_at=? WHERE id=?",
    now(),
    idv,
  );
}
export async function budgetUsage() {
  const d = await getDb();
  const rows = await listBudgets();
  const { start, end } = monthRange(0);
  const out = [] as any[];
  for (const b of rows) {
    const args: any[] = [start.toISOString(), end.toISOString()];
    let sql =
      'SELECT COALESCE(SUM(amount),0) amount FROM transactions WHERE type="expense" AND date>=? AND date<=?';
    if (b.category_id) {
      sql += " AND category_id=?";
      args.push(b.category_id);
    }
    const r = await d.getFirstAsync<{ amount: number }>(sql, ...args);
    const used = r?.amount ?? 0;
    out.push({
      ...b,
      used,
      remaining: b.amount - used,
      percent: b.amount ? Math.round((used * 100) / b.amount) : 0,
    });
  }
  return out;
}
export async function analyticsRange(
  from: string,
  to: string,
  accountId?: string,
  categoryId?: string,
) {
  const d = await getDb();
  const args: any[] = [from, to];
  let extra = "";
  if (accountId) {
    extra += " AND account_id=?";
    args.push(accountId);
  }
  if (categoryId) {
    extra += " AND category_id=?";
    args.push(categoryId);
  }
  const totals = await d.getFirstAsync<{ income: number; expense: number }>(
    'SELECT COALESCE(SUM(CASE WHEN type="income" THEN amount ELSE 0 END),0) income,COALESCE(SUM(CASE WHEN type="expense" THEN amount ELSE 0 END),0) expense FROM transactions WHERE date>=? AND date<=?' +
      extra,
    ...args,
  );
  const byCategory = await d.getAllAsync<{ name: string; amount: number }>(
    'SELECT c.name,SUM(t.amount) amount FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.type="expense" AND t.date>=? AND t.date<=?' +
      extra +
      " GROUP BY t.category_id ORDER BY amount DESC",
    ...args,
  );
  const byMonth = await d.getAllAsync<{
    month: string;
    income: number;
    expense: number;
  }>(
    'SELECT substr(date,1,7) month,COALESCE(SUM(CASE WHEN type="income" THEN amount ELSE 0 END),0) income,COALESCE(SUM(CASE WHEN type="expense" THEN amount ELSE 0 END),0) expense FROM transactions WHERE date>=? AND date<=?' +
      extra +
      " GROUP BY substr(date,1,7) ORDER BY month",
    ...args,
  );
  return {
    income: totals?.income ?? 0,
    expense: totals?.expense ?? 0,
    net: (totals?.income ?? 0) - (totals?.expense ?? 0),
    byCategory,
    byMonth,
  };
}
export async function monthlySummary(offset = 0) {
  const d = await getDb();
  const { start, end } = monthRange(offset);
  const r = await analyticsRange(start.toISOString(), end.toISOString());
  const largest = await d.getFirstAsync<{ amount: number; note: string }>(
    'SELECT amount,note FROM transactions WHERE type="expense" AND date>=? AND date<=? ORDER BY amount DESC LIMIT 1',
    start.toISOString(),
    end.toISOString(),
  );
  const count = await d.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) n FROM transactions WHERE date>=? AND date<=?",
    start.toISOString(),
    end.toISOString(),
  );
  return {
    ...r,
    largestTransaction: largest?.amount ?? 0,
    largestNote: largest?.note ?? "",
    transactionCount: count?.n ?? 0,
    monthStart: start,
    monthEnd: end,
  };
}
export async function listDebts() {
  const d = await getDb();
  return d.getAllAsync<Debt>(
    "SELECT id,direction,person,principal,paid,(principal-paid) remaining,due_date,note,status FROM debts ORDER BY due_date IS NULL,due_date",
  );
}
export async function addDebt(input: {
  direction: "owe" | "owed";
  person: string;
  principal: number;
  dueDate?: string | null;
  note: string;
}) {
  const d = await getDb();
  const t = now();
  return d.runAsync(
    "INSERT INTO debts VALUES (?,?,?,?,?,?,?,?,?,?)",
    id(),
    input.direction,
    input.person,
    input.principal,
    0,
    input.dueDate ?? null,
    input.note,
    "active",
    t,
    t,
  );
}
export async function payDebt(idv: string, amount: number) {
  const d = await getDb();
  const x = await d.getFirstAsync<{ principal: number; paid: number }>(
    "SELECT principal,paid FROM debts WHERE id=?",
    idv,
  );
  if (!x) throw new Error("not-found");
  const paid = Math.min(x.principal, x.paid + amount);
  const status =
    paid >= x.principal ? "paid" : paid > 0 ? "partially_paid" : "active";
  return d.runAsync(
    "UPDATE debts SET paid=?,status=?,updated_at=? WHERE id=?",
    paid,
    status,
    now(),
    idv,
  );
}
export async function deleteDebt(idv: string) {
  const d = await getDb();
  return d.runAsync("DELETE FROM debts WHERE id=?", idv);
}
export async function listLoans() {
  const d = await getDb();
  return d.getAllAsync<Loan>("SELECT * FROM loans ORDER BY start_date DESC");
}
export async function addLoan(input: {
  title: string;
  amount: number;
  interest: number;
  startDate: string;
  endDate?: string | null;
  frequency: string;
  installmentAmount: number;
  remainingPrincipal?: number;
  remainingInstallments: number;
}) {
  const d = await getDb();
  const t = now();
  return d.runAsync(
    "INSERT INTO loans VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    id(),
    input.title,
    input.amount,
    input.interest,
    input.startDate,
    input.endDate ?? null,
    input.frequency,
    input.installmentAmount,
    input.remainingPrincipal ?? input.amount,
    input.remainingInstallments,
    t,
    t,
  );
}
export async function payLoan(idv: string, amount: number) {
  const d = await getDb();
  const x = await d.getFirstAsync<{
    remaining_principal: number;
    remaining_installments: number;
  }>(
    "SELECT remaining_principal,remaining_installments FROM loans WHERE id=?",
    idv,
  );
  if (!x) throw new Error("not-found");
  return d.runAsync(
    "UPDATE loans SET remaining_principal=?,remaining_installments=?,updated_at=? WHERE id=?",
    Math.max(0, x.remaining_principal - amount),
    Math.max(0, x.remaining_installments - 1),
    now(),
    idv,
  );
}
export async function listInstallments() {
  const d = await getDb();
  return d.getAllAsync<Installment>(
    "SELECT * FROM installments ORDER BY due_date",
  );
}
export async function addInstallment(input: {
  title: string;
  totalAmount: number;
  count: number;
  paymentAmount: number;
  dueDate: string;
  startDate: string;
  endDate?: string | null;
  reminder: boolean;
}) {
  const d = await getDb();
  const t = now();
  return d.runAsync(
    "INSERT INTO installments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    id(),
    input.title,
    input.totalAmount,
    input.count,
    0,
    input.paymentAmount,
    input.dueDate,
    input.startDate,
    input.endDate ?? null,
    input.reminder ? 1 : 0,
    t,
    t,
  );
}
export async function payInstallment(idv: string) {
  const d = await getDb();
  const x = await d.getFirstAsync<{ count: number; paid_count: number }>(
    "SELECT count,paid_count FROM installments WHERE id=?",
    idv,
  );
  if (!x) throw new Error("not-found");
  return d.runAsync(
    "UPDATE installments SET paid_count=?,updated_at=? WHERE id=?",
    Math.min(x.count, x.paid_count + 1),
    now(),
    idv,
  );
}
export async function listChecks() {
  const d = await getDb();
  return d.getAllAsync<Check>("SELECT * FROM checks ORDER BY due_date");
}
export async function addCheck(input: {
  type: "issued" | "received";
  checkNumber: string;
  bank: string;
  amount: number;
  person: string;
  issueDate: string;
  dueDate: string;
  accountId: string;
  note: string;
}) {
  const d = await getDb();
  const t = now();
  return d.runAsync(
    "INSERT INTO checks VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    id(),
    input.type,
    input.checkNumber,
    input.bank,
    input.amount,
    input.person,
    input.issueDate,
    input.dueDate,
    input.accountId,
    input.note,
    "pending",
    t,
    t,
  );
}
export async function updateCheckStatus(idv: string, status: string) {
  const d = await getDb();
  return d.runAsync(
    "UPDATE checks SET status=?,updated_at=? WHERE id=?",
    status,
    now(),
    idv,
  );
}
export async function listReminders() {
  const d = await getDb();
  return d.getAllAsync<Reminder>(
    "SELECT * FROM reminders WHERE is_active=1 ORDER BY due_at",
  );
}
export async function addReminder(input: {
  title: string;
  type: string;
  dueAt: string;
  recurrence?: string | null;
  notificationId?: string | null;
}) {
  const d = await getDb();
  const t = now();
  return d.runAsync(
    "INSERT INTO reminders VALUES (?,?,?,?,?,?,?,?,?)",
    id(),
    input.title,
    input.type,
    input.dueAt,
    input.recurrence ?? null,
    null,
    1,
    input.notificationId ?? null,
    t,
    t,
  );
}
export async function deleteReminder(idv: string) {
  const d = await getDb();
  return d.runAsync(
    "UPDATE reminders SET is_active=0,updated_at=? WHERE id=?",
    now(),
    idv,
  );
}
