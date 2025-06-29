-- Create nutrition schema
CREATE SCHEMA IF NOT EXISTS nutrition;

-- IBD diet categories
CREATE TABLE nutrition.diet_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    evidence_level VARCHAR(50), -- e.g., 'strong', 'moderate', 'limited'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food items database
CREATE TABLE nutrition.food_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    calories FLOAT,
    protein_g FLOAT,
    carbs_g FLOAT,
    fiber_g FLOAT,
    fat_g FLOAT,
    ibd_friendly BOOLEAN,
    fodmap_level VARCHAR(50), -- 'low', 'medium', 'high'
    preparation_methods TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IBD-specific food effects
CREATE TABLE nutrition.ibd_food_effects (
    id SERIAL PRIMARY KEY,
    food_item_id INTEGER REFERENCES nutrition.food_items(id),
    effect_type VARCHAR(50), -- 'beneficial', 'neutral', 'trigger'
    evidence_source TEXT,
    study_references TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diet plans
CREATE TABLE nutrition.diet_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES nutrition.diet_categories(id),
    description TEXT,
    guidelines TEXT,
    restrictions TEXT[],
    recommendations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diet plan foods
CREATE TABLE nutrition.diet_plan_foods (
    diet_plan_id INTEGER REFERENCES nutrition.diet_plans(id),
    food_item_id INTEGER REFERENCES nutrition.food_items(id),
    recommendation_type VARCHAR(50), -- 'recommended', 'limited', 'avoided'
    portion_size VARCHAR(100),
    notes TEXT,
    PRIMARY KEY (diet_plan_id, food_item_id)
);

-- Patient diet preferences
CREATE TABLE nutrition.patient_diet_preferences (
    user_id INTEGER REFERENCES users(id),
    diet_plan_id INTEGER REFERENCES nutrition.diet_plans(id),
    food_item_id INTEGER REFERENCES nutrition.food_items(id),
    preference_type VARCHAR(50), -- 'favorite', 'disliked', 'allergic', 'intolerant'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, food_item_id)
);

-- Meal success tracking
CREATE TABLE nutrition.meal_outcomes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    meal_log_id INTEGER REFERENCES meal_logs(id),
    symptom_score INTEGER CHECK (symptom_score BETWEEN 1 AND 10),
    digestive_comfort INTEGER CHECK (digestive_comfort BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research-based nutrition guidelines
CREATE TABLE nutrition.research_guidelines (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    source VARCHAR(200),
    publication_date DATE,
    evidence_level VARCHAR(50),
    recommendations TEXT[],
    contraindications TEXT[],
    study_links TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 