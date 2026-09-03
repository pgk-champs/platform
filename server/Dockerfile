FROM node:20-bookworm-slim
WORKDIR /app
# better-sqlite3 нативный: ставим сборочные пакеты для npm install и убираем их.
COPY package.json ./
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && npm install --omit=dev --no-audit --no-fund \
 && apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
COPY index.mjs merge.mjs ./
ENV PORT=3000
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 3000
CMD ["node", "index.mjs"]
