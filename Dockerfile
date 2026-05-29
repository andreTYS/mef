# Imagen oficial de Playwright — ya trae Chromium y todas sus dependencias de sistema
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Instalar dependencias Node (--ignore-scripts evita re-descargar Chromium,
# ya está en la imagen en /ms-playwright)
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .

# Playwright usará el Chromium de la imagen base
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_ENV=production

RUN mkdir -p data

EXPOSE 3000
CMD ["node", "server.js"]
