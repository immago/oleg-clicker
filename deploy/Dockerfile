FROM nginx:alpine

# gzip + static caching for a JS/CSS game bundle
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# ship the built app (context = repo root; only dist is copied)
COPY dist/ /usr/share/nginx/html/

EXPOSE 80
