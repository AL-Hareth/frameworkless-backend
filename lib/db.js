import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("./pure.db");

export function initDatabase() {
    // Create Users table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );
    `);

    // Create Todos table
    db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,  -- Ensures one list per user
        task TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,   -- 0 (false) or 1 (true)
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `);
}

export function insertUser(username, password) {
    const insertUserOperation = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`);
    insertUserOperation.run(username, password);
}

export function getUser(username) {
    const getOperation = db.prepare(`SELECT * FROM users WHERE username = ?`);
    return getOperation.get(username);
}

export function getAllUsers() {
    const query = db.prepare('SELECT * FROM users;');
    return query.all();
}

export function insertTask(userId, task) {
    const taskCreator = db.prepare("INSERT INTO todos (user_id, task) VALUES (?, ?);");
    taskCreator.run(userId, task);
}

export function getTasksForUser(userId) {
    const tasksGetter = db.prepare("SELECT * FROM todos WHERE user_id = ?;");
    return tasksGetter.all(userId);
}

export function checkTask(taskId) {
    const taskUpdater = db.prepare("UPDATE todos SET done = 1 WHERE id = ?");
    taskUpdater.run(taskId);
}

export function deleteTask(taskId) {
    const taskDeleter = db.prepare("DELETE FROM todos WHERE id = ?");
    taskDeleter.run(taskId);
}
