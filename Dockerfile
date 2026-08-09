FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (production only)
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Copy the pre-built React app
COPY build ./build

# Copy public assets
COPY public ./public

# Copy server
COPY server.js ./

# Azure App Service uses PORT env variable
ENV PORT=8080
ENV NODE_ENV=production

# Azure App Service uses /home for persistent storage
ENV HOME=/home

EXPOSE 8080

CMD ["node", "server.js"]
