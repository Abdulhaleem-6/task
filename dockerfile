FROM node:20

WORKDIR /usr/src/app

# Install netcat
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY package.json yarn.lock ./
COPY prisma ./prisma

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Copy and make the wait-for-db.sh script executable
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# Build the NestJS application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["/bin/bash", "-c", "/wait-for-db.sh mysql-db 3306 && yarn prisma generate && yarn prisma migrate deploy && yarn start:prod"]