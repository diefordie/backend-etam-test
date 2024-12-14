# Gunakan image Node.js yang lebih baru
FROM node:18-bullseye

WORKDIR /usr/src/app

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

# Install prisma sebagai development dependency
RUN npm install prisma --save-dev

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Copy the rest of the application
COPY . .

# Set environment variable untuk OpenSSL
ENV PRISMA_QUERY_ENGINE_LIBRARY=/usr/src/app/node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node

# Generate Prisma client
RUN npx prisma generate

EXPOSE 2000

# Use a shell form of CMD to allow for environment variable substitution
CMD npx prisma db push && npm start