FROM node:20-alpine

RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  cairo-dev \
  pango-dev \
  jpeg-dev \
  giflib-dev \
  librsvg-dev

# setup workspace
RUN mkdir -p /app
WORKDIR /app

# install angular
RUN npm install -g @angular/cli

COPY package*.json ./

# install dependencies
RUN npm install --unsafe-perm --legacy-peer-deps

COPY . .

# RUN server
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000", "--port", "4200", "--disable-host-check"]
