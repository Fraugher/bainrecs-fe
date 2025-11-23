# Build stage
FROM node:18 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Use .env.docker for the build
RUN cp .env.docker .env && npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

#build it
#docker build -t bainrecs-frontend:latest .
#
#run it
#docker run -d -p 3000:80 --name bainrecs-frontend bainrecs-frontend:latest