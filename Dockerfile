# Utiliser une image Node légère
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Copier .env.prod vers .env AVANT le démarrage
# (Pour que le conteneur utilise les variables de prod automatiquement)
#RUN #cp .env.prod .env

# Définir les variables d'environnement par défaut
ENV HOST=0.0.0.0
ENV PORT=4000
ENV NODE_ENV=production

# Exposer le port 4000
EXPOSE 4000

# Commande de démarrage
CMD ["npm", "run", "start"]
