ARG BUILD_FROM
FROM $BUILD_FROM

# Install Nginx
RUN apk add --no-cache nginx

# Copy configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy frontend build
COPY dist /usr/share/nginx/html

# Expose
EXPOSE 80

# Run
CMD ["nginx", "-g", "daemon off;"]
