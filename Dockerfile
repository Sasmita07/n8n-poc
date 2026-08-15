FROM node:18-alpine

WORKDIR /app

# Copy root configurations
COPY package*.json ./

# Copy packages package.json files for caching
COPY packages/workflow-service/package*.json ./packages/workflow-service/

# Install dependencies
RUN npm install

# Copy the rest of the workspace files
COPY . .

EXPOSE 3000

# Start workflow-service workspace in dev mode
CMD ["npm", "run", "workflow-service:dev"]
