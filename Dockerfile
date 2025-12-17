# Use Nginx base image
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your index.html to Nginx web folder
COPY index.html /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

