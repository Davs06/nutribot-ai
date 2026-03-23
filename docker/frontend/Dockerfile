# Dockerfile do Frontend - NutriBot AI
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm ci

# Copia o código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia build do frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração customizada do nginx
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando padrão do nginx
CMD ["nginx", "-g", "daemon off;"]
