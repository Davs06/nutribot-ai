# Dockerfile do Backend - NutriBot AI
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Instala dependências do sistema (se necessário)
RUN apk add --no-cache python3 make g++

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o código fonte
COPY . .

# Cria diretório para uploads e banco de dados
RUN mkdir -p /app/uploads /app/data

# Expõe a porta do backend
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar o servidor
CMD ["node", "src/server.js"]
