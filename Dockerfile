# Stage 1: Build the app
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy all files
COPY . .

# Prisma generate types
RUN yarn run gen

# Build the app (NestJS compiles to dist/)
RUN yarn run build

# Stage 2: Run the app with only necessary files
FROM node:22-alpine

WORKDIR /app

# Copy only necessary artifacts from build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Run the app
CMD ["node", "dist/src/main.js"]
