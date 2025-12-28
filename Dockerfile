# Stage 1: build Angular app
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Nginx to serve static files
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/sb-admin-angular/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

