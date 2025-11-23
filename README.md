# Bain Restaurant Recommendation Frontend

React-based user interface for restaurant review search and submission.

## Overview

Web interface providing:
- **Search & Filter** - Find restaurants by name, keyword, and cuisine type
- **View Reviews** - Browse reviews from multiple sources (Google, TripAdvisor, Yelp)
- **Bain Reviews** - Toggle to show/prioritize internal Bain staff reviews
- **Submit Reviews** - Bain users can submit restaurant reviews with star ratings
- **Ratings Display** - Compare public ratings vs. Bain-specific ratings

## Tech Stack

- **Framework:** React 19.2.0
- **UI Library:** React Bootstrap 2.10.10
- **Build Tool:** Create React App
- **Web Server:** nginx (in Docker)

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

3. Configure environment variables:
   
   The app requires environment variables:
    ```env
    REACT_APP_BACKEND_API_URL=<backend-url>
    REACT_APP_PYTHONANYWHERE_API_KEY=<api-key>
    ```

   Create the appropriate `.env` file for your environment:
    - `.env.development` - Local development
    - `.env.production` - Production build (Netlify)
    - `.env.docker` - Docker builds

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

## Project Structure

```
bainrecs-fe/
├── public/              # Static assets
│   ├── index.html       # Main HTML template
│   └── logos/           # Provider logos (Google, TripAdvisor, etc.)
├── src/
│   ├── components/
│   │   ├── SearchReviews.jsx
│   │   └── SubmitReviewModal.jsx
│   ├── App.js
│   └── index.js
├── package.json
├── Dockerfile
├── nginx.conf           # nginx configuration for Docker
├── .dockerignore
└── .env.development     # Environment config files
```

## Features

### Search & Filter
- Search restaurants by name keywords
- Filter by cuisine type (Italian, Chinese, Japanese, etc.)
- Toggle Bain reviews on/off

### Restaurant Details
- Expandable cards showing full review history
- Review source provider identification for each review source
- Separate display of public vs. Bain ratings
- Review counts for each rating type

### Submit Reviews
- Star rating interface (1-5 stars)
- Title and detailed review text
- Optional author identification
- Auto-refresh after submission

## Project Link: 

[https://github.com/Fraugher/bainrecs-fe](https://github.com/Fraugher/bainrecs-fe)
