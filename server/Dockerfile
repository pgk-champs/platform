FROM node:20-bookworm-slim
WORKDIR /app
# better-sqlite3 нативный: ставим сборочные пакеты для npm install и убираем их.
COPY package.json ./
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && npm install --omit=dev --no-audit --no-fund \
 && apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
# Все модули разом, а не поимённо: список, который ведут руками, однажды
# отстаёт — 16.09.2026 новый linkcheck.mjs не попал в образ, и кабинет лёг на
# импорте. Тесты сюда тоже приедут, но они не запускаются и весят копейки.
COPY *.mjs ./
ENV PORT=3000
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 3000
CMD ["node", "index.mjs"]
