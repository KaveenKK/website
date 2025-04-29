server {
  listen ${PORT};
  root /usr/share/nginx/html;   # ← matches where we copied the files
  index index.html;

  location / {
    try_files $uri $uri.html $uri/ =404;
  }

  location ~ ^(.+)\.html$ { return 301 $1; }  # optional redirect
}
