FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the web app
RUN npx expo export --platform web

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Remove default nginx static files and config
RUN rm -rf /usr/share/nginx/html/* && rm /etc/nginx/conf.d/default.conf

# Copy the built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration with API proxy using resolver
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    server_name localhost;
    
    # Use Docker's internal DNS resolver
    resolver 127.0.0.11 valid=30s ipv6=off;
    
    # Proxy API requests to backend (must be before / location)
    location /api/ {
        set $backend medhub-api:8080;
        proxy_pass http://$backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]