# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps for compilation)
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Expose port (Render sets PORT env)
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/server.js"]
