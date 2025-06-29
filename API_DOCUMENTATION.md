# Medivue Pediatric IBD Care Platform - API Documentation

## Overview

The Medivue API provides a comprehensive set of endpoints for managing pediatric IBD patient data, community features, and machine learning predictions. All endpoints are RESTful and return JSON responses.

## Base URL

- **Development**: `http://localhost:3002`
- **Production**: `https://api.medivue-pediatric.org`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2025-06-23T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-06-23T10:30:00Z"
}
```

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "username": "user@example.com",
      "role": "patient",
      "name": "John Doe"
    }
  },
  "message": "Login successful"
}
```

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "role": "patient",
  "age": 14,
  "diagnosis": "Crohn's Disease"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user456",
      "username": "newuser@example.com",
      "name": "Jane Doe",
      "role": "patient"
    }
  },
  "message": "User registered successfully"
}
```

#### POST /api/auth/logout
Logout a user and invalidate their token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Journal Entries

#### GET /api/journal
Get all journal entries for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (optional): Filter entries from this date (YYYY-MM-DD)
- `end_date` (optional): Filter entries until this date (YYYY-MM-DD)
- `limit` (optional): Number of entries to return (default: 50)
- `offset` (optional): Number of entries to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry123",
        "user_id": "user123",
        "entry_date": "2025-06-23",
        "calories": 1800,
        "protein": 65,
        "carbs": 200,
        "fiber": 25,
        "has_allergens": false,
        "meals_per_day": 3,
        "hydration_level": 5,
        "bowel_frequency": 4,
        "bristol_scale": 4,
        "urgency_level": 2,
        "blood_present": false,
        "pain_location": "lower_abdomen",
        "pain_severity": 3,
        "pain_time": "morning",
        "medication_taken": true,
        "medication_type": "immunosuppressant",
        "dosage_level": 2,
        "sleep_hours": 8,
        "stress_level": 2,
        "menstruation": "not_applicable",
        "fatigue_level": 3,
        "notes": "Feeling better today",
        "created_at": "2025-06-23T10:30:00Z",
        "updated_at": "2025-06-23T10:30:00Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

#### POST /api/journal
Create a new journal entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "entry_date": "2025-06-23",
  "calories": 1800,
  "protein": 65,
  "carbs": 200,
  "fiber": 25,
  "has_allergens": false,
  "meals_per_day": 3,
  "hydration_level": 5,
  "bowel_frequency": 4,
  "bristol_scale": 4,
  "urgency_level": 2,
  "blood_present": false,
  "pain_location": "lower_abdomen",
  "pain_severity": 3,
  "pain_time": "morning",
  "medication_taken": true,
  "medication_type": "immunosuppressant",
  "dosage_level": 2,
  "sleep_hours": 8,
  "stress_level": 2,
  "menstruation": "not_applicable",
  "fatigue_level": 3,
  "notes": "Feeling better today"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry": {
      "id": "entry123",
      "user_id": "user123",
      "entry_date": "2025-06-23",
      "calories": 1800,
      "protein": 65,
      "carbs": 200,
      "fiber": 25,
      "has_allergens": false,
      "meals_per_day": 3,
      "hydration_level": 5,
      "bowel_frequency": 4,
      "bristol_scale": 4,
      "urgency_level": 2,
      "blood_present": false,
      "pain_location": "lower_abdomen",
      "pain_severity": 3,
      "pain_time": "morning",
      "medication_taken": true,
      "medication_type": "immunosuppressant",
      "dosage_level": 2,
      "sleep_hours": 8,
      "stress_level": 2,
      "menstruation": "not_applicable",
      "fatigue_level": 3,
      "notes": "Feeling better today",
      "created_at": "2025-06-23T10:30:00Z"
    },
    "prediction": {
      "flare_risk": 0.15,
      "confidence": 0.85,
      "risk_level": "low",
      "recommendations": [
        "Continue current medication regimen",
        "Maintain good hydration",
        "Monitor symptoms closely"
      ]
    }
  },
  "message": "Journal entry created successfully"
}
```

#### PUT /api/journal/:id
Update an existing journal entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** Same as POST /api/journal

**Response:**
```json
{
  "success": true,
  "data": {
    "entry": {
      "id": "entry123",
      "updated_at": "2025-06-23T11:30:00Z"
    }
  },
  "message": "Journal entry updated successfully"
}
```

#### DELETE /api/journal/:id
Delete a journal entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Journal entry deleted successfully"
}
```

### Meal Logs

#### GET /api/meals
Get all meal logs for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (optional): Filter meals from this date
- `end_date` (optional): Filter meals until this date
- `meal_type` (optional): Filter by meal type (breakfast, lunch, dinner, snack)

**Response:**
```json
{
  "success": true,
  "data": {
    "meals": [
      {
        "id": "meal123",
        "user_id": "user123",
        "meal_type": "breakfast",
        "food_items": "oatmeal, banana, milk",
        "portion_sizes": "1 cup, 1 medium, 1 cup",
        "notes": "Feeling good after breakfast",
        "timestamp": "2025-06-23T08:00:00Z"
      }
    ]
  }
}
```

#### POST /api/meals
Create a new meal log.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "meal_type": "breakfast",
  "food_items": "oatmeal, banana, milk",
  "portion_sizes": "1 cup, 1 medium, 1 cup",
  "notes": "Feeling good after breakfast"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meal": {
      "id": "meal123",
      "user_id": "user123",
      "meal_type": "breakfast",
      "food_items": "oatmeal, banana, milk",
      "portion_sizes": "1 cup, 1 medium, 1 cup",
      "notes": "Feeling good after breakfast",
      "timestamp": "2025-06-23T08:00:00Z"
    }
  },
  "message": "Meal log created successfully"
}
```

### Predictions

#### POST /api/predictions/flare
Get a flare prediction based on current health data.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "calories": 1800,
  "protein": 65,
  "carbs": 200,
  "fiber": 25,
  "has_allergens": false,
  "meals_per_day": 3,
  "hydration_level": 5,
  "bowel_frequency": 4,
  "bristol_scale": 4,
  "urgency_level": 2,
  "blood_present": false,
  "pain_location": "lower_abdomen",
  "pain_severity": 3,
  "pain_time": "morning",
  "medication_taken": true,
  "medication_type": "immunosuppressant",
  "dosage_level": 2,
  "sleep_hours": 8,
  "stress_level": 2,
  "menstruation": "not_applicable",
  "fatigue_level": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "flare_risk": 0.15,
      "confidence": 0.85,
      "risk_level": "low",
      "model_version": "1.0.0",
      "features_used": [
        "bowel_frequency",
        "pain_severity",
        "blood_present",
        "medication_taken"
      ],
      "recommendations": [
        "Continue current medication regimen",
        "Maintain good hydration",
        "Monitor symptoms closely"
      ],
      "timestamp": "2025-06-23T10:30:00Z"
    }
  }
}
```

#### GET /api/predictions/history
Get prediction history for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (optional): Filter predictions from this date
- `end_date` (optional): Filter predictions until this date
- `limit` (optional): Number of predictions to return

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "id": "pred123",
        "user_id": "user123",
        "flare_risk": 0.15,
        "confidence": 0.85,
        "risk_level": "low",
        "model_version": "1.0.0",
        "created_at": "2025-06-23T10:30:00Z"
      }
    ]
  }
}
```

### Community

#### GET /api/community/posts
Get community posts.

**Query Parameters:**
- `category` (optional): Filter by category (story, question, hobby, friendship)
- `limit` (optional): Number of posts to return
- `offset` (optional): Number of posts to skip

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post123",
        "name": "Emma, 14",
        "message": "Just finished my last chemo session! Feeling hopeful!",
        "category": "story",
        "likes": 15,
        "comments": 5,
        "timestamp": "2025-06-23T10:30:00Z",
        "featured": true
      }
    ]
  }
}
```

#### POST /api/community/posts
Create a new community post.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Just finished my last chemo session! Feeling hopeful!",
  "category": "story"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "post123",
      "name": "You",
      "message": "Just finished my last chemo session! Feeling hopeful!",
      "category": "story",
      "likes": 0,
      "comments": 0,
      "timestamp": "2025-06-23T10:30:00Z"
    }
  },
  "message": "Post created successfully"
}
```

### Events

#### GET /api/events
Get local events for pediatric IBD patients.

**Query Parameters:**
- `category` (optional): Filter by event category
- `location` (optional): Filter by location
- `start_date` (optional): Filter events from this date
- `end_date` (optional): Filter events until this date

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event123",
        "title": "IBD Support Group Meeting",
        "description": "Monthly support group for pediatric IBD patients",
        "category": "healthcare",
        "location": "Boston Children's Hospital",
        "start_date": "2025-07-01T18:00:00Z",
        "end_date": "2025-07-01T20:00:00Z",
        "registration_url": "https://example.com/register",
        "contact_email": "events@example.com",
        "contact_phone": "555-123-4567"
      }
    ]
  }
}
```

### Analytics

#### GET /api/analytics/health-trends
Get health trend analytics for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (optional): Start date for analysis
- `end_date` (optional): End date for analysis
- `metrics` (optional): Comma-separated list of metrics to include

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": {
      "pain_severity": {
        "average": 2.5,
        "trend": "decreasing",
        "data_points": [
          {"date": "2025-06-20", "value": 3},
          {"date": "2025-06-21", "value": 2},
          {"date": "2025-06-22", "value": 2}
        ]
      },
      "bowel_frequency": {
        "average": 4.2,
        "trend": "stable",
        "data_points": [
          {"date": "2025-06-20", "value": 4},
          {"date": "2025-06-21", "value": 5},
          {"date": "2025-06-22", "value": 4}
        ]
      }
    },
    "summary": {
      "total_entries": 30,
      "days_tracked": 30,
      "compliance_rate": 0.95
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INVALID_CREDENTIALS` | Invalid username or password |
| `USER_NOT_FOUND` | User not found |
| `ENTRY_NOT_FOUND` | Journal entry not found |
| `VALIDATION_ERROR` | Request validation failed |
| `DATABASE_ERROR` | Database operation failed |
| `ML_SERVICE_ERROR` | Machine learning service error |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Journal endpoints**: 100 requests per hour
- **Prediction endpoints**: 50 requests per hour
- **Community endpoints**: 200 requests per hour

## Pagination

For endpoints that return lists, pagination is supported using `limit` and `offset` query parameters:

```
GET /api/journal?limit=20&offset=40
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": {
    "entries": [...],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 40,
      "has_next": true,
      "has_prev": true
    }
  }
}
```

## Webhooks

The API supports webhooks for real-time notifications. Configure webhooks in the user settings:

```json
{
  "webhook_url": "https://your-app.com/webhook",
  "events": ["journal_entry_created", "flare_prediction_high_risk"]
}
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install medivue-api-client
```

```javascript
import { MedivueAPI } from 'medivue-api-client';

const api = new MedivueAPI({
  baseURL: 'http://localhost:3002',
  token: 'your-jwt-token'
});

const entries = await api.journal.getEntries();
```

### Python
```bash
pip install medivue-api-python
```

```python
from medivue_api import MedivueAPI

api = MedivueAPI(
    base_url='http://localhost:3002',
    token='your-jwt-token'
)

entries = api.journal.get_entries()
```

## Support

For API support and questions:
- **Documentation**: https://docs.medivue-pediatric.org/api
- **Email**: api-support@medivue-pediatric.org
- **GitHub Issues**: https://github.com/medivue-pediatric/api-issues

---

This API documentation is regularly updated. For the latest version, please refer to the official documentation at https://docs.medivue-pediatric.org/api. 