FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create a non-root user
RUN useradd -m -u 1000 appuser

# Create database directory and set permissions
RUN mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser

# Expose the port
EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5002/ || exit 1

# Create a startup script that initializes data and starts the app
RUN echo '#!/bin/bash\n\
echo "🚀 Starting NatureMind..."\n\
echo "📊 Creating database tables..."\n\
python -c "from mental_health_backend import init_db; init_db()"\n\
echo "📊 Initializing database with dummy activities..."\n\
python init_data.py\n\
echo "🌱 Starting Flask application..."\n\
python mental_health_backend.py' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]