# Use a smaller base image
FROM node:18 AS node

# Stage 2: Building Canvas LMS
FROM ubuntu:20.04 as builder

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV TERM=xterm

# Install necessary dependencies for building Canvas LMS
RUN apt-get update && \
    apt-get install -y git curl

# Shallow clone the Canvas LMS repository
RUN git clone --depth 1 https://github.com/instructure/canvas-lms/ /canvas-lms

# Move to the Canvas LMS directory
WORKDIR /canvas-lms

# Stage 3: Final image
FROM ubuntu:20.04

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Yarn and other necessary packages
RUN npm install -g yarn@1.19.1 && \
    apt-get install -y git curl build-essential

# Install Ruby 3.1
RUN apt-get update && \
    apt-get install -y gnupg2 && \
    curl -fsSL https://github.com/rvm/rvm/releases/download/1.29.12/rvm-installer.asc | gpg2 --import - && \
    curl -sSL https://get.rvm.io | bash -s stable --ruby=3.1

# Install Bundler for managing Ruby gems
RUN /bin/bash -l -c "source /etc/profile.d/rvm.sh && gem install bundler"

# Copy necessary files from the builder stage
COPY --from=builder /canvas-lms /canvas-lms

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV TERM=xterm

# Install necessary dependencies for Canvas LMS and Docker
RUN apt-get install -y git docker.io

# Install Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

# Expose necessary ports
EXPOSE 3000

# Move to the Canvas LMS directory
WORKDIR /canvas-lms

# Run the setup commands manually step-by-step
RUN npm install --legacy-peer-deps
RUN bundle install --path vendor/bundle --without=postgres mysql
RUN yarn install --pure-lockfile
RUN bundle exec rake db:initial_setup
RUN bundle exec rake canvas:compile_assets

# Start Canvas LMS
CMD ["npm", "start"]
