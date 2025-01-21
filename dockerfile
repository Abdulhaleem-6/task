FROM node:20

WORKDIR /usr/src/app

# Copy dependencies
COPY package.json yarn.lock ./
COPY prisma ./prisma
COPY .env .env  


# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .


# Build the NestJS application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Use a single CMD with /bin/bash to handle multiple commands
CMD ["/bin/bash", "-c", "echo 'Waiting for MySQL to be ready...' && \
  echo 'MySQL is ready!' && \
  yarn prisma generate && \
  sleep 10 && \
  yarn prisma migrate deploy && \
  yarn start:prod"]

