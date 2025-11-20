# Docker Setup - Frontend (React)

## Prerequisites

- Docker Desktop installed and running
- Git

## Building the Image

From the `bainrecs-fe/` directory:
```bash
docker build -t bainrecs-frontend:latest .
```

This will:
1. Install npm dependencies
2. Build the React production bundle
3. Serve with nginx

## Running the Container
```bash
docker run -d -p 3000:80 --name bainrecs-frontend bainrecs-frontend:latest
```

## Accessing the Application

Open your browser:
- http://localhost:3000

## View Logs
```bash
docker logs -f bainrecs-frontend
```

## Stopping and Removing
```bash
docker stop bainrecs-frontend
docker rm bainrecs-frontend
```

## Environment Configuration

The build uses `.env.docker` which contains:
```
REACT_APP_BACKEND_API_URL=http://localhost:5000
```

### For Different Environments:

- **Development:** `.env.development`
- **Production:** `.env.production`
- **Docker:** `.env.docker`

## Technology Stack

- **Build Stage:** Node.js 18
- **Runtime:** nginx:alpine
- **Port:** 80 (mapped to 3000 on host)
- **Build Tool:** Create React App