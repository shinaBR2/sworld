FROM --platform=linux/amd64 node:20.10.0-slim

# Install procps package to provide the 'ps' command
# (required for the PlaywrightCrawler)
RUN apt-get update && \
    apt-get install -y procps && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 4000
CMD ["npm", "run", "start-io", "--", "--listen", "0.0.0.0"]
