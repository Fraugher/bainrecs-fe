# Bainrecs - Bain Restaurant Recommendation Frontend

React-based user interface for restaurant review search and submission.

## Overview

Simple web interface providing:
- **Search & Filter** - Find restaurankeyword and type
- **Submit Reviews** - Bain users can submit restaurant reviews

## Tech Stack

- **Framework:** React 19.2.0
- **UI Library:** React Bootstrap 2.10.10
- **Build Tool:** Create React App
- **Web Server:** nginx (in Docker)

## Current Deployment

Currently deployed on **Netlify** at:
- Production: https://bainrecs-fe.netlify.app/

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Fraugher/bainrecs-fe.git
cd bainrecs-fe
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (create `.env.development`):
```
REACT_APP_BACKEND_API_URL=http://localhost:5000
```

4. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Docker Deployment

### Build the Image
```bash
docker build -t bainrecs-frontend:latest .
```

### Run the Container
```bash
docker run -d -p 3000:80 --name bainrecs-frontend bainrecs-frontend:latest
```

The app will be available at `http://localhost:3000`

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

## Environment Configuration

The app uses different `.env` files for different environments:

- `.env.development` - Local development
- `.env.production` - Production build (Netlify)
- `.env.docker` - Docker builds

Each contains:
```
REACT_APP_BACKEND_API_URL=<backend-url>
```

## Project Structure

```
bainrecs-fe/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── SearchReviews.jsx
│   ├── SubmitReview.Modal.jsx
│   └── App.js
├── package.json
├── Dockerfile
├── nginx.conf           # nginx configuration for Docker
└── .dockerignore
```
