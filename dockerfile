# Stage 1: Build the Angular application
FROM node:23 AS builder

RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  librsvg2-dev \
  pkg-config \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --unsafe-perm --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

COPY --from=builder /app/www /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
