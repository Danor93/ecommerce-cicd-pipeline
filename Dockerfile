# Dockerfile for the Next.js application

# ===== Dependencies Stage =====
# This stage installs all dependencies required for the build process.
# We use a specific Node.js version for consistency.
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and yarn.lock to leverage Docker's build cache.
# This step will only be re-run if these files change.
COPY package.json yarn.lock ./

# Install all dependencies, including devDependencies needed for the build.
RUN yarn install --frozen-lockfile

# ===== Builder Stage =====
# This stage builds the Next.js application.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage.
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code.
COPY . .

# Build the Next.js application for production.
# This will also leverage the 'standalone' output mode defined in next.config.js.
RUN yarn build

# ===== Runner Stage =====
# This is the final stage that will run the application in production.
# We use a minimal Node.js image for a smaller footprint and better security.
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables for production.
ENV NODE_ENV=production
# Disable Next.js telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group for security purposes.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage.
# This includes only the necessary files to run the app.
COPY --from=builder /app/.next/standalone ./

# Copy the static assets from the public directory.
COPY --from=builder /app/public ./public

# Copy the static assets from the .next/static directory.
# The 'standalone' output needs this folder to be in this specific location.
COPY --from=builder /app/.next/static ./.next/static

# Change the ownership of the files to the non-root user.
RUN chown -R nextjs:nodejs .

# Switch to the non-root user.
USER nextjs

# Expose the port the app will run on.
EXPOSE 3000

# Set the port environment variable.
ENV PORT 3000

# The command to start the Next.js server.
# This runs the server.js file from the standalone output.
CMD ["node", "server.js"] 