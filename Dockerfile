# Stage 1: Build Angular app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build Angular app for production
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app to Nginx web root
COPY --from=build /app/dist/sb-admin-angular/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

