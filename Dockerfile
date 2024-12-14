FROM node:18-alpine

WORKDIR /usr/src/app

# Install prisma as a development dependency
RUN npm install prisma --save-dev

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 2000

# Use a shell form of CMD to allow for environment variable substitution
CMD npx prisma db push && npm start