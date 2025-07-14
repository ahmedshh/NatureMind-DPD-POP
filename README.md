# NatureMind 🌿

A comprehensive mental wellness application that combines AI-guided emotional support, mindfulness tools, local self-care activities, mood tracking, and community features.

## Features ✨

### 🧠 AI Companion
- Personalized emotional support and guidance
- Mood-based response system
- Helpful suggestions for mental wellness activities

### 📊 Mood Tracking & Journaling
- Daily mood logging with emotion tags
- Personal journal entries
- Mood history visualization
- Progress tracking over time

### 🏃‍♀️ Local Wellness Activities
- Discover nearby wellness activities
- Join community events (yoga, meditation, nature walks)
- Create and organize your own activities
- Location-based filtering (currently featuring German locations)

### 👥 Community Wall
- Share experiences anonymously or publicly
- Connect with like-minded individuals
- Support and encourage others on their wellness journey

### 🧘‍♀️ Mindfulness Library
- Guided meditation content
- Breathing exercises
- Stress relief techniques
- Categorized wellness content

## Tech Stack 🛠️

- **Backend**: Python Flask
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker
- **Authentication**: Session-based with password hashing

## Quick Start 🚀

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nature-by-AI-main
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Open your browser and go to `http://localhost:5002`
   - Register a new account or log in
   - Start exploring the features!

### Manual Setup

1. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the application**
   ```bash
   python mental_health_backend.py
   ```

3. **Access the application**
   - Open your browser and go to `http://localhost:5002`

## Project Structure 📁

```
nature-by-AI-main/
├── backend/
│   ├── mental_health_backend.py    # Main Flask application
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Docker configuration
│   └── frontend/                   # Static frontend files
│       ├── index.html
│       ├── app.js
│       ├── styles.css
│       └── assets/                 # Images and media
├── docker-compose.yml              # Docker Compose configuration
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Mood Tracking
- `POST /api/mood/log` - Log mood entry
- `GET /api/mood/history` - Get mood history

### Activities
- `GET /api/activities` - Get wellness activities
- `POST /api/activities` - Create new activity
- `POST /api/activities/<id>/join` - Join activity
- `POST /api/activities/<id>/leave` - Leave activity

### Community
- `GET /api/community/posts` - Get community posts
- `POST /api/community/posts` - Create new post

### Mindfulness
- `GET /api/mindfulness` - Get mindfulness content

### AI Companion
- `POST /api/ai/companion` - Get AI response

## Database Schema 🗄️

The application uses SQLite with the following main tables:
- `users` - User accounts and profiles
- `mood_entries` - Mood tracking and journal entries
- `wellness_activities` - Local wellness activities
- `activity_participants` - Activity participation tracking
- `community_posts` - Community wall posts
- `mindfulness_content` - Mindfulness library content

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

If you have any questions or need support, please open an issue on GitHub.

---

**NatureMind** - Nurturing mental wellness through technology and community 🌱
