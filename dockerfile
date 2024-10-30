# Stage 1: Build the Angular application
FROM node:23 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install  --unsafe-perm  --legacy-peer-deps

# Copy the entire project
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the built app from the builder stage
COPY --from=builder /app/www /usr/share/nginx/html

# Copy your site configuration file to /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 81

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
