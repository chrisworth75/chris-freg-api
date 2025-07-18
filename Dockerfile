# Use Node.js 22.3 base image
FROM node:22.3

# Set working directory
WORKDIR /app

# Copy dependency files first for better cache usage
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy remaining app files
COPY . .

# App port (update if your Express app uses a different one)
EXPOSE 8080

# Start the backend (assumes "start" script in package.json)
CMD ["npm", "start"]
