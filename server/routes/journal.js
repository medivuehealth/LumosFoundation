const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../database/config');
const { validateJournalEntry } = require('../validation');
const axios = require('axios');

// Get database configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
const medivueConfig = dbConfig.medivue;
const flarePredictorConfig = dbConfig.flarePredictor;

// Create database pools for both databases
const medivuePool = new Pool({
    user: String(medivueConfig.username),
    host: String(medivueConfig.host),
    database: String(medivueConfig.database),
    password: String(medivueConfig.password),
    port: Number(medivueConfig.port),
});

const flarePredictorPool = new Pool({
    user: String(flarePredictorConfig.username),
    host: String(flarePredictorConfig.host),
    database: String(flarePredictorConfig.database),
    password: String(flarePredictorConfig.password),
    port: Number(flarePredictorConfig.port),
});

// POST /api/journal/entries - Create a new journal entry
router.post('/entries', async (req, res) => {
    let medivueClient = null;
    
    try {
        // Get the journal entry data
        const journalData = req.body;
        
        // Note: menstruation field is now stored as string ('yes', 'no', 'not_applicable')
        // No conversion needed since the database migration has been applied

        console.log('Server received journal entry data:', {
            medication_taken: journalData.medication_taken,
            medication_type: journalData.medication_type,
            dosage_level: journalData.dosage_level,
            typeOfDosage: typeof journalData.dosage_level,
            rawData: JSON.stringify(journalData)
        });

        // Validate the journal entry data
        console.log('Validating journal entry data:', JSON.stringify(journalData, null, 2));
        const validationResult = await validateJournalEntry(journalData);
        console.log('Server validation result:', validationResult);

        if (!validationResult.isValid) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.errors
            });
        }

        // Get database clients
        medivueClient = await medivuePool.connect();

        // Start transaction for journal entry
        await medivueClient.query('BEGIN');

        // Insert journal entry
        const journalQuery = `
            INSERT INTO journal_entries (
                user_id, entry_date, calories, protein, carbs, fiber,
                has_allergens, meals_per_day, hydration_level, bowel_frequency,
                bristol_scale, urgency_level, blood_present, pain_location,
                pain_severity, pain_time, medication_taken, medication_type,
                dosage_level, sleep_hours, stress_level, menstruation,
                fatigue_level, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            RETURNING entry_id;
        `;

        const journalValues = [
            journalData.user_id,
            journalData.entry_date,
            journalData.calories,
            journalData.protein,
            journalData.carbs,
            journalData.fiber,
            journalData.has_allergens,
            journalData.meals_per_day,
            journalData.hydration_level,
            journalData.bowel_frequency,
            journalData.bristol_scale,
            journalData.urgency_level,
            journalData.blood_present,
            journalData.pain_location,
            journalData.pain_severity,
            journalData.pain_time,
            journalData.medication_taken,
            journalData.medication_type,
            journalData.dosage_level,
            journalData.sleep_hours,
            journalData.stress_level,
            journalData.menstruation,
            journalData.fatigue_level,
            journalData.notes || ''
        ];

        console.log('Executing journal entry query with values:', journalValues);
        const journalResult = await medivueClient.query(journalQuery, journalValues);
        const entryId = journalResult.rows[0].entry_id;

        // Get prediction from ML model
        const mlResponse = await axios.post('http://localhost:5000/predict', journalData);
        const prediction = mlResponse.data;

        // Insert prediction into flare_predictions table in medivue database
        const predictionQuery = `
            INSERT INTO flare_predictions (
                user_id,
                entry_id,
                prediction,
                probability,
                prediction_date,
                model_version
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING prediction_id;
        `;

        const predictionValues = [
            journalData.user_id,
            entryId,
            prediction.prediction ? 1 : 0,
            prediction.probability || 0.5,
            new Date(),
            '1.0.0'
        ];

        await medivueClient.query(predictionQuery, predictionValues);

        // Commit transaction
        await medivueClient.query('COMMIT');

        res.json({
            message: 'Journal entry and prediction saved successfully',
            entry_id: entryId,
            prediction: prediction
        });

    } catch (error) {
        console.error('Error saving journal entry:', error);
        
        // Rollback transaction if it was started
        if (medivueClient) {
            await medivueClient.query('ROLLBACK');
        }

        res.status(500).json({
            error: 'Failed to save journal entry',
            details: error.message
        });

    } finally {
        // Release client back to the pool
        if (medivueClient) {
            medivueClient.release();
        }
    }
});

// GET /api/journal/entries/:userId - Get all journal entries for a user
router.get('/entries/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get journal entries with predictions from medivue
        const query = `
            SELECT 
                j.*,
                fp.prediction_value,
                fp.probability,
                fp.confidence_score,
                fp.recommendations,
                fp.features_used
            FROM journal_entries j
            LEFT JOIN flare_predictions fp ON 
                j.entry_id = fp.journal_entry_id
            WHERE j.user_id = $1 
            ORDER BY j.entry_date DESC, j.created_at DESC
        `;
        
        const result = await medivuePool.query(query, [userId]);
        
        // Map the results
        const mappedResults = result.rows.map(row => ({
            ...row,
            prediction: row.prediction_value !== null ? {
                prediction: row.prediction_value === 1,
                probability: row.probability,
                confidence: row.confidence_score,
                recommendations: row.recommendations,
                features_used: row.features_used
            } : null
        }));
        
        res.json(mappedResults);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ error: 'Failed to fetch journal entries', details: error.message });
    }
});

module.exports = router; 