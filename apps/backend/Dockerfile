FROM --platform=linux/amd64 node:20.10.0-slim

# RUN apt-get update -y && apt-get install -y curl


# RUN curl -L https://encore.dev/install.sh | bash && \
#     echo "Encore installation complete" && \
#     ls -la /root/.encore/bin && \
#     cat /root/.bashrc && \
#     echo "PATH: $PATH"
# ENV PATH="/root/.encore/bin:${PATH}"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# RUN echo "PATH: $PATH" && command -v encore && encore version


EXPOSE 4000
CMD ["npm", "start", "--listen", "0.0.0.0"]
# Build and run
# CMD ["/root/.encore/bin/encore", "run", "--listen", "0.0.0.0"]
# CMD ["encore", "run", "--listen", "0.0.0.0"]