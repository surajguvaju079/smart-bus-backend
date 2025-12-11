FROM node:20-alpine

#Working Directory
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

#Install dependencies
RUN npm install


#Copy all source code
COPY . .

#Expose backend port
EXPOSE 8080


# Default command for dev (can be overridden)
CMD ["npm", "run", "dev"]