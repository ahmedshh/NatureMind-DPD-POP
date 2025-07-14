# NatureMind 🌿

A comprehensive mental wellness platform that connects people through local wellness activities, mood tracking, and community support.

## Core Features ✨

### 💰 Earn by Creating Activities
- **Create and monetize your wellness activities** - Organize yoga sessions, meditation workshops, nature walks, and more
- **Set your own pricing** - Charge participants for your expertise and time
- **Build your wellness business** - Grow your clientele and establish yourself as a wellness professional
- **Flexible scheduling** - Choose dates, times, and locations that work for you

### 🏃‍♀️ Join Local Activities
- **Discover nearby wellness events** - Find activities in your area through location-based filtering
- **Join community events** - Participate in yoga, meditation, nature walks, and other wellness activities
- **Connect with local wellness professionals** - Meet like-minded individuals and wellness experts
- **Support local wellness economy** - Contribute to your community's mental health and wellness

### 📊 Mood Tracking & Journaling
- Daily mood logging with emotion tags
- Personal journal entries
- Mood history visualization
- Progress tracking over time

### 👥 Community Support
- Share experiences anonymously or publicly
- Connect with like-minded individuals
- Support and encourage others on their wellness journey
- Build meaningful connections in your local wellness community

### 🧘‍♀️ Mindfulness Resources
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
   - Start creating or joining activities!

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

## Database Schema 🗄️

The application uses SQLite with the following main tables:
- `users` - User accounts and profiles
- `mood_entries` - Mood tracking and journal entries
- `wellness_activities` - Local wellness activities
- `activity_participants` - Activity participation tracking
- `community_posts` - Community wall posts
- `mindfulness_content` - Mindfulness library content



## Support 💬

If you have any questions or need support, please open an issue on GitHub.

---

**NatureMind** - Connecting wellness professionals with their community 🌱

BY: Muhammad Ahmed Shahab | Anusuya Kuguavarathan | Abdul Hannan | Abdul Mannan 
