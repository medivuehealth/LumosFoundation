# IBDPal - Pediatric IBD Care iOS App

IBDPal is a comprehensive iOS mobile application designed to support pediatric patients with Inflammatory Bowel Disease (IBD) and their families. The app provides tools for symptom tracking, nutrition analysis, medication management, and community support.

## Architecture Overview

IBDPal is part of a multi-platform healthcare ecosystem:

- **IBDPal**: iOS mobile application (this repository)
- **MediVue**: Web application (separate repository)
- **Shared Database**: Both applications use the same MediVue PostgreSQL database
- **Separate Configurations**: Each application has its own configuration files and deployment settings

## Features

- **User Authentication**: Email-based login system with secure password hashing
- **Symptom Tracking**: Daily journal entries for monitoring IBD symptoms
- **Nutrition Analysis**: Food logging and nutritional content tracking
- **Medication Management**: Medication reminders and dosage tracking
- **Flare Prediction**: ML-powered flare prediction using symptom data
- **Healthcare Provider Management**: Store and manage healthcare provider information
- **Appointment Scheduling**: Schedule and track medical appointments
- **Emergency Contacts**: Quick access to emergency contact information
- **Community Support**: Connect with other IBD patients and families

## Technology Stack

- **Frontend**: React Native with Expo (iOS)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (Shared MediVue database)
- **Authentication**: JWT tokens with email-based login
- **ML Models**: Python Flask API for flare prediction

## Database Architecture

Both IBDPal (iOS app) and MediVue (website) share the same comprehensive MediVue database schema:

- **Users**: Email-based authentication with comprehensive user profiles
- **Journal Entries**: Daily symptom and nutrition tracking
- **Flare Predictions**: ML model predictions and probabilities
- **Medical History**: Diagnosis and treatment information
- **Healthcare Providers**: Provider contact and specialty information
- **Appointments**: Scheduled medical appointments
- **Reminders**: Medication and appointment reminders
- **Chat History**: User interaction logs
- **Audit Logs**: Security and compliance tracking

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd IBDPal
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp config.env.example config.env
```

Update the following in `config.env`:
```env
# IBDPal iOS App Configuration
APP_NAME=IBDPal
APP_TYPE=ios

# Database Configuration - Shared MediVue Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medivue
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_SSL=false

# App Configuration
JWT_SECRET=ibdpal_jwt_secret_key_here
```

4. Set up the shared database:
```bash
node database/setup.js
```

5. Start the development server:
```bash
npm start
```

## Database Setup

The application uses the shared MediVue database which provides a comprehensive schema for healthcare applications. The database setup script will:

1. Create the `medivue` database if it doesn't exist (shared with MediVue website)
2. Execute the complete MediVue schema including all tables and indexes
3. Set up proper constraints and relationships
4. Create necessary indexes for optimal performance

**Note**: This database is shared with the MediVue website application. Both applications can read and write to the same database, ensuring data consistency across platforms.

## Authentication

IBDPal uses email-based authentication instead of usernames for better user experience and security. The system includes:

- Email/password registration and login
- JWT token-based session management
- Password hashing with bcrypt
- Account lockout protection
- Failed login attempt tracking
- Multi-factor authentication support

**Shared Authentication**: Users can log in to both IBDPal (iOS) and MediVue (website) using the same email and password.

## API Endpoints

The application provides RESTful API endpoints for:

- User authentication (register, login, logout)
- User profile management
- Journal entry creation and retrieval
- Flare prediction requests
- Healthcare provider management
- Appointment scheduling
- Reminder management

## Development

### Project Structure
```
IBDPal/
├── src/                    # React Native source code
│   ├── screens/           # App screens
│   ├── components/        # Reusable components
│   └── config/           # Configuration files
├── server/               # Node.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── database/         # Database connection
├── database/             # Database setup and migrations
├── deployment/           # Deployment configurations
└── config.env           # IBDPal-specific environment configuration
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the React Native app:
```bash
npm start
```

3. Use Expo Go app to scan the QR code and run on your device

## Production Deployment

### Separate Deployments

- **IBDPal API**: Deployed separately from MediVue website
- **Shared Database**: Both applications connect to the same production database
- **Separate Configuration**: Each application has its own environment variables and secrets

### Configuration Files

- `config.env`: Development configuration for IBDPal
- `deployment/azure-config.env`: Production configuration for IBDPal Azure deployment

### Deployment Steps

1. Deploy the shared MediVue database to production
2. Deploy IBDPal API with its own configuration
3. Deploy MediVue website with its own configuration
4. Configure CORS to allow both applications to access the API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 