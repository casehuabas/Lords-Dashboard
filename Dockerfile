# Use a suitable base image based on the application's needs (e.g., node:lts-alpine or python:3.10-slim)
# Assuming a Node.js/React stack for a typical dashboard example. Adjust base image and build steps if necessary.
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json .

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the frontend (if applicable)
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]