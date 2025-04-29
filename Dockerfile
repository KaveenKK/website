# Dockerfile
FROM nginx:alpine

# 1) Copy everything in public/ (your .html/.css/.js/images) 
#    into NGINX’s default web-root
COPY public/ /usr/share/nginx/html

# 2) Overwrite the default NGINX config with our own
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3) Railway will inject the PORT env var for us
ENV PORT 8080
EXPOSE 8080

# 4) Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
