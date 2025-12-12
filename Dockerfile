# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (используем npm install вместо npm ci)
RUN npm install --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]