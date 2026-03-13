# Argus - AI-Powered Cybersecurity & Risk Management Platform

Argus is an enterprise-grade SaaS platform that provides AI-driven risk intelligence for organizations. It discovers your digital footprint, analyzes risks across multiple dimensions, and provides executive-ready insights prioritized by business impact.

## Features

- **Automated Asset Discovery**: Continuously discover and map your entire external attack surface
- **AI-Driven Risk Scoring**: Machine learning algorithms evaluate risks across exposure, exploitability, business impact, and temporal change
- **Business-Context Prioritization**: Risks prioritized based on actual business impact, not just technical severity
- **Executive-Ready Dashboards**: Beautiful visualizations and reports for technical and business stakeholders
- **Continuous Monitoring**: Real-time monitoring and alerts for new assets and emerging risks
- **Comprehensive Reporting**: Export detailed reports in multiple formats

## Tech Stack

- **Backend**: Node.js, Express.js
- **Authentication**: JWT, bcrypt
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Visualization**: Chart.js
- **Email**: Nodemailer

## Quick Start

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET`: Your secret key for JWT tokens
- `EMAIL_USER`: (Optional) Gmail address for notifications
- `EMAIL_PASS`: (Optional) Gmail app password

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3001`

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "organization": "Acme Corp"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "organization": "Acme Corp"
  }
}
```

#### POST `/api/auth/login`
Login to an existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Analysis Endpoints

All analysis endpoints require authentication via Bearer token in the Authorization header.

#### POST `/api/analyze`
Analyze a domain for security risks.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "domain": "example.com",
  "overallRiskScore": 65,
  "overallRiskLevel": "High",
  "totalAssets": 27,
  "criticalAssets": 3,
  "highRiskAssets": 8,
  "mediumRiskAssets": 12,
  "lowRiskAssets": 4,
  "assets": [...],
  "riskTrend": [...],
  "analyzedAt": "2024-01-15T10:30:00.000Z"
}
```

#### GET `/api/analyses`
Get all analyses for the authenticated user.

#### GET `/api/analyses/:id`
Get a specific analysis by ID.

#### GET `/api/analyses/:id/export`
Export an analysis as JSON file.

## Project Structure

```
argus-platform/
├── server.js           # Express server and API endpoints
├── public/
│   ├── index.html      # Landing page and dashboard UI
│   ├── styles.css      # Styling and design system
│   └── app.js          # Frontend logic and interactions
├── .env                # Environment variables
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Security Notes

- Uses bcrypt for password hashing
- JWT tokens for stateless authentication
- CORS enabled for cross-origin requests
- In-memory storage (replace with database for production)
- Environment variables for sensitive configuration

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for various platforms.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The server will start on `http://localhost:3001`.

## License

ISC License

## Support

For issues and feature requests, please contact your system administrator.
