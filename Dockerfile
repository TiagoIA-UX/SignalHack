FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build
RUN npm prune --production

EXPOSE 3000
CMD ["npm", "run", "start"]
