ARG node_ver=22-alpine3.21
FROM node:${node_ver}

RUN addgroup -S user && adduser -S user -G user

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  font-freefont \
  nodejs \
  yarn \
  openssl
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install 
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

RUN npx prisma generate && \
  npm run build


# Bundle app source
COPY . .    
EXPOSE 3000

USER user
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --spider http://localhost:3000 || exit 1
CMD ["npm","run","start:migrate:prod" ]