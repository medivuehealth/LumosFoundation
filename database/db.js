const { Sequelize } = require('sequelize');
const config = require('./config');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

class Database {
    constructor(dbType = 'medivue') {
        const dbSettings = dbConfig[dbType];
        if (!dbSettings) {
            throw new Error(`Invalid database type: ${dbType}`);
        }

        this.sequelize = new Sequelize(
            dbSettings.database,
            dbSettings.username,
            dbSettings.password,
            {
                host: dbSettings.host,
                port: dbSettings.port,
                dialect: dbSettings.dialect,
                logging: dbSettings.logging,
                pool: dbSettings.pool
            }
        );
    }

    async init() {
        try {
            // Test the connection
            await this.sequelize.authenticate();
            console.log('Connected to PostgreSQL database.');

            // Check if tables exist
            const tablesExist = await this.checkTablesExist();
            if (!tablesExist) {
                // Initialize schema only if tables don't exist
            const schemaPath = path.join(__dirname, 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                    const schemaSQL = await fs.promises.readFile(schemaPath, 'utf8');
                    await this.sequelize.query(schemaSQL);
                    console.log('Schema initialized successfully.');
                }
            } else {
                console.log('Tables already exist, skipping schema initialization.');
            }

            return true;
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    async checkTablesExist() {
        try {
            const result = await this.sequelize.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                );
            `, { type: Sequelize.QueryTypes.SELECT });
            return result[0].exists;
        } catch (error) {
            console.error('Error checking tables:', error);
            return false;
        }
    }

    // Generic query methods
    async run(sql, params = []) {
        try {
            const [result] = await this.sequelize.query(sql, {
                replacements: params,
                type: Sequelize.QueryTypes.INSERT
            });
            return { id: result, changes: 1 };
        } catch (error) {
            console.error('Error running sql:', sql);
            console.error('Error:', error);
            throw error;
        }
    }

    async get(sql, params = []) {
        try {
            const [result] = await this.sequelize.query(sql, {
                replacements: params,
                type: Sequelize.QueryTypes.SELECT
            });
            return result;
        } catch (error) {
            console.error('Error running sql:', sql);
            console.error('Error:', error);
            throw error;
        }
    }

    async all(sql, params = []) {
        try {
            const results = await this.sequelize.query(sql, {
                replacements: params,
                type: Sequelize.QueryTypes.SELECT
            });
            return results;
        } catch (error) {
            console.error('Error running sql:', sql);
            console.error('Error:', error);
            throw error;
        }
    }

    // User operations
    async createUser(userData) {
        // Validate required fields
        const requiredFields = [
            'user_id', 'username', 'email', 'first_name', 'last_name',
            'date_of_birth', 'gender', 'phone_number',
            'emergency_contact_name', 'emergency_contact_phone'
        ];
        
        for (const field of requiredFields) {
            if (!userData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate username constraints
        if (userData.username.length > 12 || 
            userData.username.includes(' ') || 
            !/^[a-zA-Z0-9]+$/.test(userData.username)) {
            throw new Error('Username must be max 12 characters, no spaces, alphanumeric only');
        }

        // Validate gender
        const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
        if (!validGenders.includes(userData.gender)) {
            throw new Error('Invalid gender value');
        }

        const sql = `
            INSERT INTO users (
                user_id, username, email, password_hash, first_name, last_name,
                date_of_birth, gender, phone_number,
                emergency_contact_name, emergency_contact_phone
            ) VALUES (:user_id, :username, :email, :password_hash, :first_name, :last_name,
                     :date_of_birth, :gender, :phone_number,
                     :emergency_contact_name, :emergency_contact_phone)
            RETURNING user_id
        `;
        
        return this.run(sql, {
            user_id: userData.user_id,
            username: userData.username,
            email: userData.email,
            password_hash: userData.password_hash || null,
            first_name: userData.first_name,
            last_name: userData.last_name,
            date_of_birth: userData.date_of_birth,
            gender: userData.gender,
            phone_number: userData.phone_number,
            emergency_contact_name: userData.emergency_contact_name,
            emergency_contact_phone: userData.emergency_contact_phone
        });
    }

    async updateUser(userId, userData) {
        // First check if user exists
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Validate username if provided
        if (userData.username) {
            if (userData.username.length > 12 || 
                userData.username.includes(' ') || 
                !/^[a-zA-Z0-9]+$/.test(userData.username)) {
                throw new Error('Username must be max 12 characters, no spaces, alphanumeric only');
            }

            // Check if username is taken by another user
            const existingUser = await this.get(
                'SELECT user_id FROM users WHERE username = :username AND user_id != :userId', 
                { username: userData.username, userId }
            );
            if (existingUser) {
                throw new Error('Username is already taken');
            }
        }

        // Validate gender if provided
        if (userData.gender) {
            const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
            if (!validGenders.includes(userData.gender)) {
                throw new Error('Invalid gender value');
            }
        }

        // Merge existing user data with updates
        const updatedData = { ...user, ...userData };

        const sql = `
            UPDATE users 
            SET first_name = :first_name,
                last_name = :last_name,
                username = :username,
                email = :email,
                date_of_birth = :date_of_birth,
                gender = :gender,
                phone_number = :phone_number,
                address = :address,
                city = :city,
                state = :state,
                country = :country,
                postal_code = :postal_code,
                emergency_contact_name = :emergency_contact_name,
                emergency_contact_phone = :emergency_contact_phone,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = :userId
            RETURNING user_id
        `;

        const params = {
            first_name: updatedData.first_name,
            last_name: updatedData.last_name,
            username: updatedData.username,
            email: updatedData.email,
            date_of_birth: updatedData.date_of_birth,
            gender: updatedData.gender,
            phone_number: updatedData.phone_number,
            address: updatedData.address || null,
            city: updatedData.city || null,
            state: updatedData.state || null,
            country: updatedData.country || null,
            postal_code: updatedData.postal_code || null,
            emergency_contact_name: updatedData.emergency_contact_name,
            emergency_contact_phone: updatedData.emergency_contact_phone,
            userId
        };

        try {
            await this.run(sql, params);
            return await this.getUserById(userId);
        } catch (error) {
            console.error('Database error updating user:', error);
            throw error;
        }
    }

    async getUserById(userId) {
        return this.get('SELECT * FROM users WHERE user_id = :userId', { userId });
    }

    async getUserByEmail(email) {
        return this.get('SELECT * FROM users WHERE email = :email', { email });
    }

    // Journal operations
    async createJournalEntry(entryData) {
        const sql = `
            INSERT INTO journal_entries (
                user_id, entry_date, calories, protein, carbs, fiber,
                has_allergens, meals_per_day, hydration_level,
                bowel_frequency, bristol_scale, urgency_level,
                blood_present, pain_location, pain_severity,
                pain_time, medication_taken, medication_type,
                dosage_level, sleep_hours, stress_level,
                menstruation, fatigue_level, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return this.run(sql, [
            entryData.user_id,
            entryData.entry_date,
            entryData.calories,
            entryData.protein,
            entryData.carbs,
            entryData.fiber,
            entryData.has_allergens,
            entryData.meals_per_day,
            entryData.hydration_level,
            entryData.bowel_frequency,
            entryData.bristol_scale,
            entryData.urgency_level,
            entryData.blood_present,
            entryData.pain_location,
            entryData.pain_severity,
            entryData.pain_time,
            entryData.medication_taken,
            entryData.medication_type,
            entryData.dosage_level,
            entryData.sleep_hours,
            entryData.stress_level,
            entryData.menstruation,
            entryData.fatigue_level,
            entryData.notes
        ]);
    }

    async getJournalEntriesByUserId(userId, startDate, endDate) {
        const sql = `
            SELECT * FROM journal_entries 
            WHERE user_id = ? 
            AND entry_date BETWEEN ? AND ?
            ORDER BY entry_date DESC
        `;
        return this.all(sql, [userId, startDate, endDate]);
    }

    // Flare prediction operations
    async savePrediction(predictionData) {
        const sql = `
            INSERT INTO flare_predictions (
                user_id, entry_id, prediction, probability,
                model_version
            ) VALUES (?, ?, ?, ?, ?)
        `;
        return this.run(sql, [
            predictionData.user_id,
            predictionData.entry_id,
            predictionData.prediction,
            predictionData.probability,
            predictionData.model_version
        ]);
    }

    async getPredictionsByUserId(userId, limit = 10) {
        const sql = `
            SELECT * FROM flare_predictions 
            WHERE user_id = ? 
            ORDER BY prediction_date DESC 
            LIMIT ?
        `;
        return this.all(sql, [userId, limit]);
    }

    // Chat history operations
    async saveChatMessage(messageData) {
        const sql = `
            INSERT INTO chat_history (
                user_id, message, is_user_message
            ) VALUES (?, ?, ?)
        `;
        return this.run(sql, [
            messageData.user_id,
            messageData.message,
            messageData.is_user_message
        ]);
    }

    async getChatHistory(userId, limit = 50) {
        const sql = `
            SELECT * FROM chat_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        return this.all(sql, [userId, limit]);
    }

    // Reminder operations
    async createReminder(reminderData) {
        const sql = `
            INSERT INTO reminders (
                user_id, title, description, reminder_type,
                due_date, is_completed
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        return this.run(sql, [
            reminderData.user_id,
            reminderData.title,
            reminderData.description,
            reminderData.reminder_type,
            reminderData.due_date,
            reminderData.is_completed || false
        ]);
    }

    async getUpcomingReminders(userId) {
        const sql = `
            SELECT * FROM reminders 
            WHERE user_id = ? 
            AND due_date > datetime('now') 
            AND is_completed = 0 
            ORDER BY due_date ASC
        `;
        return this.all(sql, [userId]);
    }

    // Healthcare provider operations
    async addHealthcareProvider(providerData) {
        const sql = `
            INSERT INTO healthcare_providers (
                user_id, name, specialty, phone_number,
                email, address, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return this.run(sql, [
            providerData.user_id,
            providerData.name,
            providerData.specialty,
            providerData.phone_number,
            providerData.email,
            providerData.address,
            providerData.notes
        ]);
    }

    async getHealthcareProviders(userId) {
        return this.all(
            'SELECT * FROM healthcare_providers WHERE user_id = ?',
            [userId]
        );
    }

    // Appointment operations
    async createAppointment(appointmentData) {
        const sql = `
            INSERT INTO appointments (
                user_id, provider_id, appointment_date,
                purpose, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        return this.run(sql, [
            appointmentData.user_id,
            appointmentData.provider_id,
            appointmentData.appointment_date,
            appointmentData.purpose,
            appointmentData.notes,
            appointmentData.status || 'scheduled'
        ]);
    }

    async getUpcomingAppointments(userId) {
        const sql = `
            SELECT a.*, h.name as provider_name, h.specialty 
            FROM appointments a 
            JOIN healthcare_providers h ON a.provider_id = h.provider_id 
            WHERE a.user_id = ? 
            AND a.appointment_date > datetime('now') 
            AND a.status = 'scheduled' 
            ORDER BY a.appointment_date ASC
        `;
        return this.all(sql, [userId]);
    }

    // Search history operations
    async saveSearch(searchData) {
        const sql = `
            INSERT INTO search_history (
                user_id, query, response
            ) VALUES (?, ?, ?)
        `;
        return this.run(sql, [
            searchData.user_id,
            searchData.query,
            searchData.response
        ]);
    }

    async getSearchHistory(userId, days = 7) {
        const sql = `
            SELECT * FROM search_history 
            WHERE user_id = ? 
            AND created_at >= datetime('now', '-' || ? || ' days')
            ORDER BY created_at DESC
        `;
        return this.all(sql, [userId, days]);
    }

    async getRecentSearches(userId, limit = 3) {
        const sql = `
            SELECT * FROM search_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        return this.all(sql, [userId, limit]);
    }

    // Close the database connection
    async close() {
        if (this.sequelize) {
            await this.sequelize.close();
        }
    }
}

// Create and initialize database instance
const db = new Database();
db.init().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

module.exports = Database; 