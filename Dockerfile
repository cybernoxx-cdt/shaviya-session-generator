# Use a supported and up-to-date base image
# (bullseye's Debian security repo is past its support window and its
#  InRelease file no longer refreshes, which breaks "apt-get update" -
#  bookworm is the current stable release and is actively maintained)
FROM node:lts-bookworm

# Install required system packages
# --allow-releaseinfo-change lets apt accept a repo suite/codename update
# without failing the build; harmless to keep even once bookworm is current.
RUN apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends ffmpeg imagemagick webp && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy only package.json for layer caching
COPY package.json .

# Install NPM packages
RUN npm install && npm install -g qrcode-terminal pm2

# Copy the rest of your app
COPY . .

# Optional: Expose port (depends on your app)
EXPOSE 5000

# Start the app using npm
CMD ["npm", "start"]
