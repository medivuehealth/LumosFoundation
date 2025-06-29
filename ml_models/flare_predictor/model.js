const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class FlarePredictorModel {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.model = null;
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error connecting to database:', err);
            } else {
                console.log('Connected to database at:', dbPath);
            }
        });
    }

    load_model(modelPath) {
        try {
            // Here we would normally load a trained ML model
            // For now, we'll use a simple mock implementation
            this.model = {
                predict: (features) => {
                    // Mock prediction logic
                    const probability = Math.random();
                    return {
                        prediction: probability > 0.5 ? 1 : 0,
                        probability: probability,
                        confidence: `${Math.round(probability * 100)}%`,
                        interpretation: probability > 0.5 ? 
                            "High risk of flare-up based on current symptoms" : 
                            "Low risk of flare-up based on current symptoms"
                    };
                }
            };
            console.log('Model loaded successfully from:', modelPath);
            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            return false;
        }
    }

    predict(features) {
        if (!this.model) {
            throw new Error('Model not loaded');
        }
        return this.model.predict(features);
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = { FlarePredictorModel }; 