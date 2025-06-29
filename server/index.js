const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const journalRoutes = require('./routes/journal');
const { Pool } = require('pg');
const config = require('../database/config');
const WebSocket = require('ws');
const http = require('http');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

// WebSocket server
const wss = new WebSocket.Server({ server });

// Get database configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].medivue;

// Create database pool with error handling
const pool = new Pool({
    user: String(dbConfig.username),
    host: String(dbConfig.host),
    database: String(dbConfig.database),
    password: String(dbConfig.password),
    port: Number(dbConfig.port),
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test database connection
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(-1);
    }
}

testDatabaseConnection();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/journal', journalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add cache for log queries
const logQueryCache = new NodeCache({ stdTTL: 25 }); // Cache for 25 seconds

// Logs API endpoints with error handling
app.get('/api/logs', async (req, res) => {
    try {
        const { level, search, startDate, endDate, limit = 100 } = req.query;
        
        // Create cache key from query parameters
        const cacheKey = `logs_${level}_${search}_${startDate}_${endDate}_${limit}`;
        
        // Try to get from cache first
        const cachedResult = logQueryCache.get(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        let query = 'SELECT * FROM logs WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (level) {
            query += ` AND level = $${paramCount}`;
            params.push(level);
            paramCount++;
        }

        if (search) {
            query += ` AND (message ILIKE $${paramCount} OR details::text ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (startDate) {
            query += ` AND timestamp >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND timestamp <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }

        query += ' ORDER BY timestamp DESC';
        
        if (limit) {
            query += ` LIMIT $${paramCount}`;
            params.push(limit);
        }

        // Only log query in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Executing logs query:', query, params);
        }

        const result = await pool.query(query, params);
        
        // Cache the result
        logQueryCache.set(cacheKey, result.rows);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ 
            error: 'Failed to fetch logs',
            details: error.message
        });
    }
});

// Add POST endpoint for logs
app.post('/api/logs', async (req, res) => {
    try {
        const { level, message, details, userAgent, url } = req.body;
        
        const query = `
            INSERT INTO logs (level, message, details, user_agent, url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [level, message, details, userAgent, url];
        const result = await pool.query(query, values);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving log:', error);
        res.status(500).json({ 
            error: 'Failed to save log',
            details: error.message 
        });
    }
});

// Flare Predictions API endpoints
app.get('/api/recent-predictions', async (req, res) => {
    try {
        const { user_id, limit = 5 } = req.query;
        
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const query = `
            SELECT * FROM flare_predictions 
            WHERE user_id = $1 
            ORDER BY prediction_date DESC 
            LIMIT $2
        `;
        const result = await pool.query(query, [user_id, limit]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recent predictions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch recent predictions',
            details: error.message 
        });
    }
});

app.get('/api/flare-statistics', async (req, res) => {
    try {
        const { user_id, start_date, end_date } = req.query;
        
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const query = `
            SELECT 
                COUNT(*) as total_predictions,
                SUM(CASE WHEN probability >= 0.7 THEN 1 ELSE 0 END) as high_risk_count,
                AVG(probability) as average_risk,
                MAX(probability) as highest_risk
            FROM flare_predictions 
            WHERE user_id = $1 
                AND prediction_date >= $2 
                AND prediction_date <= $3
        `;
        const result = await pool.query(query, [
            user_id, 
            start_date || '1900-01-01', 
            end_date || new Date().toISOString()
        ]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching flare statistics:', error);
        res.status(500).json({ 
            error: 'Failed to fetch flare statistics',
            details: error.message 
        });
    }
});

// Meal Logs API endpoints with error handling
app.post('/api/meal_logs', async (req, res) => {
    try {
        const { 
            user_id, 
            meal_type, 
            food_items, 
            portion_sizes, 
            notes 
        } = req.body;

        // Validate required fields
        if (!user_id || !meal_type || !food_items) {
            console.error('Missing required fields:', { user_id, meal_type, food_items });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate meal type
        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validMealTypes.includes(meal_type)) {
            console.error('Invalid meal type:', meal_type);
            return res.status(400).json({ error: 'Invalid meal type' });
        }

        // Insert meal log
        const query = `
            INSERT INTO meal_logs (
                user_id, meal_type, food_items, portion_sizes, notes
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [
            user_id,
            meal_type,
            food_items,
            portion_sizes || '',
            notes || ''
        ];

        console.log('Inserting meal log with values:', values);
        const result = await pool.query(query, values);
        console.log('Meal log inserted successfully:', result.rows[0]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving meal log:', error);
        res.status(500).json({ 
            error: 'Failed to save meal log',
            details: error.message
        });
    }
});

// Flare prediction endpoint
app.post('/api/predict-flare', async (req, res) => {
    try {
        // Call the ML model's prediction endpoint
        const response = await axios.post('http://localhost:5000/predict', req.body);
        
        // Store the prediction in PostgreSQL
        const query = `
            INSERT INTO flare_predictions (
                user_id,
                prediction_value,
                probability,
                features_used,
                recommendations,
                prediction_date
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const values = [
            req.body.user_id,
            response.data.prediction,
            response.data.probability,
            JSON.stringify(req.body),
            JSON.stringify(response.data.recommendations || [])
        ];
        
        await pool.query(query, values);
        
        res.json(response.data);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ 
            error: 'Failed to get prediction',
            details: error.message 
        });
    }
});

// OpenWebUI search endpoint
app.post('/api/chat/completions', async (req, res) => {
    try {
        const { query, user_id } = req.body;
        
        if (!query || !user_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Forward the search request to OpenWebUI
        const response = await axios.post('http://localhost:8080/api/chat/completions', {
            messages: [
                { role: 'system', content: 'You are a medical AI assistant.' },
                { role: 'user', content: query }
            ]
        });

        // Save the search query and response to the database
        const saveQuery = `
            INSERT INTO search_history (user_id, query, response)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        await pool.query(saveQuery, [user_id, query, response.data.choices[0].message.content]);

        res.json(response.data);
    } catch (error) {
        console.error('Error in chat completions:', error);
        res.status(500).json({ 
            error: 'Failed to process search request',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await pool.end();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await pool.end();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
  });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 