# Dockerfile (en tu carpeta frontend)
FROM node:20

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Exponer puerto para Vite
EXPOSE 5173

# Comando para desarrollo
CMD ["npm", "run", "dev", "--", "--host"]
