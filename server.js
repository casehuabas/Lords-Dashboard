import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Explicitly allow the frontend origin
    credentials: true
}));
app.use(express.json()); // Body parser for JSON

// --- Database Setup ---
let db;

/**
 * Initializes the SQLite database connection and schema.
 */
async function initDb() {
    try {
        // 1. Connect to the database (better-sqlite3 handles this synchronously)
        db = new Database(path.resolve('database.sqlite'));
        console.log("✅ Database connected successfully.");

        // 2. Create necessary tables if they don't exist (better-sqlite3 handles this well)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL UNIQUE,
                value REAL NOT NULL,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id TEXT PRIMARY KEY,
                setting_key TEXT NOT NULL,
                setting_value TEXT NOT NULL
            );
        `);
        console.log("✅ Database schema verified/created.");
    } catch (error) {
        console.error("❌ Failed to initialize database:", error);
        process.exit(1);
    }
}

// --- API Routes ---

/**
 * Endpoint to fetch all stored metrics.
 * GET /api/metrics
 */
app.get('/api/metrics', async (req, res) => {
    try {
        // Use db.prepare().all() for querying
        const metrics = db.prepare("SELECT * FROM metrics ORDER BY recorded_at DESC LIMIT 10").all();
        res.json(metrics);
    } catch (error) {
        console.error("Error fetching metrics:", error);
        res.status(500).json({ error: "Failed to retrieve metrics." });
    }
});

/**
 * Endpoint to record a new metric value.
 * POST /api/metrics
 * Body: { metricName: string, value: number }
 */
app.post('/api/metrics', async (req, res) => {
    const { metricName, value } = req.body;
    if (!metricName || typeof value !== 'number') {
        return res.status(400).json({ error: "Missing or invalid metricName or value." });
    }

    try {
        // Use db.prepare().run() with ON CONFLICT handling
        db.prepare(`
            INSERT INTO metrics (metric_name, value) VALUES (?, ?)
            ON CONFLICT(metric_name) DO UPDATE SET value = excluded.value, recorded_at = CURRENT_TIMESTAMP
        `).run(metricName, value);
        res.status(201).json({ message: "Metric recorded successfully." });
    } catch (error) {
        console.error("Error recording metric:", error);
        res.status(500).json({ error: "Failed to record metric." });
    }
});

// --- Server Start ---

const startServer = async () => {
    await initDb(); // Initialize DB first
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n===================================================`);
        console.log(`🚀 Backend API Server running on http://localhost:${PORT}`);
        console.log(`   Endpoint for metrics: http://localhost:${PORT}/api/metrics`);
        console.log(`===================================================`);
    });
};

startServer();