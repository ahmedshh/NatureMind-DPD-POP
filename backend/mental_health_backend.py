import os
import sqlite3
import datetime
import json
import hashlib
import secrets
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS

app = Flask(__name__, static_folder='frontend', static_url_path='')
app.secret_key = secrets.token_hex(16)  # Generate a random secret key
CORS(app, supports_credentials=True)

DB_PATH = 'data/naturemind.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT,
            location TEXT,
            preferences TEXT
        )
    ''')
    
    # Mood tracking and journal entries
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            timestamp TEXT,
            mood TEXT,
            emotion_tags TEXT,
            notes TEXT,
            journal_entry TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Local wellness activities
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wellness_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            category TEXT,
            location TEXT,
            latitude REAL,
            longitude REAL,
            date TEXT,
            time TEXT,
            price REAL,
            max_participants INTEGER,
            current_participants INTEGER DEFAULT 0,
            organizer_id INTEGER,
            organizer_name TEXT,
            contact_info TEXT,
            image_url TEXT,
            created_at TEXT,
            FOREIGN KEY (organizer_id) REFERENCES users (id)
        )
    ''')
    
    # Activity participants
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER,
            user_id INTEGER,
            joined_at TEXT,
            FOREIGN KEY (activity_id) REFERENCES wellness_activities (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Community posts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS community_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            timestamp TEXT,
            content TEXT,
            category TEXT,
            anonymous_id TEXT,
            likes INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Mindfulness library
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mindfulness_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content_type TEXT,
            content TEXT,
            duration INTEGER,
            category TEXT,
            tags TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def require_auth(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def get_user_id():
    return session.get('user_id')

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    location = data.get('location', '')
    
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    password_hash = hash_password(password)
    created_at = datetime.datetime.now().isoformat()
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, created_at, location)
            VALUES (?, ?, ?, ?, ?)
        """, (username, email, password_hash, created_at, location))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Log in the user automatically
        session['user_id'] = user_id
        session['username'] = username
        
        return jsonify({
            'message': 'Registration successful',
            'user': {'id': user_id, 'username': username, 'email': email}
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    password_hash = hash_password(password)
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, location FROM users 
            WHERE (username = ? OR email = ?) AND password_hash = ?
        """, (username, username, password_hash))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user[0]
            session['username'] = user[1]
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'location': user[3]
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, location, created_at FROM users 
            WHERE id = ?
        """, (get_user_id(),))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'location': user[3],
                    'created_at': user[4]
                }
            }), 200
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mood/log', methods=['POST'])
@require_auth
def log_mood():
    data = request.get_json()
    mood = data.get('mood')
    emotion_tags = json.dumps(data.get('emotion_tags', []))
    notes = data.get('notes', '')
    journal_entry = data.get('journal_entry', '')
    timestamp = datetime.datetime.now().isoformat()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO mood_entries (user_id, timestamp, mood, emotion_tags, notes, journal_entry) 
        VALUES (?, ?, ?, ?, ?, ?)
    """, (get_user_id(), timestamp, mood, emotion_tags, notes, journal_entry))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Mood entry saved successfully'}), 200

@app.route('/api/mood/history', methods=['GET'])
@require_auth
def get_mood_history():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, mood, emotion_tags, notes, journal_entry 
        FROM mood_entries 
        WHERE user_id = ?
        ORDER BY timestamp DESC
    """, (get_user_id(),))
    rows = cursor.fetchall()
    conn.close()

    entries = [{
        'id': row[0],
        'timestamp': row[1],
        'mood': row[2],
        'emotion_tags': json.loads(row[3]) if row[3] else [],
        'notes': row[4],
        'journal_entry': row[5]
    } for row in rows]

    return jsonify(entries), 200

@app.route('/api/activities', methods=['GET'])
@require_auth
def get_activities():
    category = request.args.get('category')
    location = request.args.get('location')
    user_location = request.args.get('user_location')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = """
        SELECT wa.*, u.username as organizer_username,
               CASE WHEN ap.user_id IS NOT NULL THEN 1 ELSE 0 END as is_joined
        FROM wellness_activities wa
        LEFT JOIN users u ON wa.organizer_id = u.id
        LEFT JOIN activity_participants ap ON wa.id = ap.activity_id AND ap.user_id = ?
        WHERE 1=1
    """
    params = [get_user_id()]
    
    if category:
        query += " AND wa.category = ?"
        params.append(category)
    
    if location:
        query += " AND wa.location LIKE ?"
        params.append(f"%{location}%")
    
    if user_location:
        # Simple location matching - in a real app, you'd use geolocation APIs
        query += " AND wa.location LIKE ?"
        params.append(f"%{user_location}%")
    
    query += " ORDER BY wa.date ASC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    activities = [{
        'id': row[0],
        'title': row[1],
        'description': row[2],
        'category': row[3],
        'location': row[4],
        'latitude': row[5],
        'longitude': row[6],
        'date': row[7],
        'time': row[8],
        'price': row[9],
        'max_participants': row[10],
        'current_participants': row[11],
        'organizer_id': row[12],
        'organizer_name': row[13],
        'contact_info': row[14],
        'image_url': row[15],
        'created_at': row[16],
        'organizer_username': row[17],
        'is_joined': bool(row[18])
    } for row in rows]

    return jsonify(activities), 200

@app.route('/api/activities', methods=['POST'])
@require_auth
def add_activity():
    data = request.get_json()
    created_at = datetime.datetime.now().isoformat()
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO wellness_activities 
            (title, description, category, location, latitude, longitude, date, time, price, max_participants, organizer_id, organizer_name, contact_info, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('title'),
            data.get('description'),
            data.get('category'),
            data.get('location'),
            data.get('latitude', 0),
            data.get('longitude', 0),
            data.get('date'),
            data.get('time'),
            data.get('price', 0),
            data.get('max_participants', 0),
            get_user_id(),
            data.get('organizer_name'),
            data.get('contact_info'),
            data.get('image_url', ''),
            created_at
        ))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Activity added successfully'}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to add activity: {str(e)}'}), 500

@app.route('/api/activities/<int:activity_id>/join', methods=['POST'])
@require_auth
def join_activity(activity_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if already joined
        cursor.execute("""
            SELECT id FROM activity_participants 
            WHERE activity_id = ? AND user_id = ?
        """, (activity_id, get_user_id()))
        
        if cursor.fetchone():
            return jsonify({'error': 'Already joined this activity'}), 400
        
        # Check if activity is full
        cursor.execute("""
            SELECT max_participants, current_participants 
            FROM wellness_activities WHERE id = ?
        """, (activity_id,))
        activity = cursor.fetchone()
        
        if activity and activity[0] > 0 and activity[1] >= activity[0]:
            return jsonify({'error': 'Activity is full'}), 400
        
        # Join the activity
        joined_at = datetime.datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO activity_participants (activity_id, user_id, joined_at)
            VALUES (?, ?, ?)
        """, (activity_id, get_user_id(), joined_at))
        
        # Update participant count
        cursor.execute("""
            UPDATE wellness_activities 
            SET current_participants = current_participants + 1
            WHERE id = ?
        """, (activity_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Successfully joined activity'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities/<int:activity_id>/leave', methods=['POST'])
@require_auth
def leave_activity(activity_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Remove from participants
        cursor.execute("""
            DELETE FROM activity_participants 
            WHERE activity_id = ? AND user_id = ?
        """, (activity_id, get_user_id()))
        
        # Update participant count
        cursor.execute("""
            UPDATE wellness_activities 
            SET current_participants = current_participants - 1
            WHERE id = ? AND current_participants > 0
        """, (activity_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Successfully left activity'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/posts', methods=['GET'])
@require_auth
def get_community_posts():
    category = request.args.get('category')
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        query = """
            SELECT cp.id, cp.user_id, cp.timestamp, cp.content, cp.category, cp.anonymous_id, cp.likes, u.username 
            FROM community_posts cp
            LEFT JOIN users u ON cp.user_id = u.id
        """
        params = []
        
        if category:
            query += " WHERE cp.category = ?"
            params.append(category)
        
        query += " ORDER BY cp.timestamp DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        posts = [{
            'id': row[0],
            'user_id': row[1],
            'timestamp': row[2],
            'content': row[3],
            'category': row[4],
            'anonymous_id': row[5],
            'likes': row[6],
            'username': row[7]
        } for row in rows]

        return jsonify(posts), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load community posts: {str(e)}'}), 500

@app.route('/api/community/posts', methods=['POST'])
@require_auth
def add_community_post():
    data = request.get_json()
    timestamp = datetime.datetime.now().isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO community_posts (user_id, timestamp, content, category, anonymous_id)
        VALUES (?, ?, ?, ?, ?)
    """, (
        get_user_id(),
        timestamp,
        data.get('content'),
        data.get('category', 'general'),
        f"user_{timestamp[-6:]}"
    ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Post added successfully'}), 201

@app.route('/api/mindfulness', methods=['GET'])
@require_auth
def get_mindfulness_content():
    content_type = request.args.get('type')
    category = request.args.get('category')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = "SELECT * FROM mindfulness_content WHERE 1=1"
    params = []
    
    if content_type:
        query += " AND content_type = ?"
        params.append(content_type)
    
    if category:
        query += " AND category = ?"
        params.append(category)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    content = [{
        'id': row[0],
        'title': row[1],
        'content_type': row[2],
        'content': row[3],
        'duration': row[4],
        'category': row[5],
        'tags': json.loads(row[6]) if row[6] else []
    } for row in rows]

    return jsonify(content), 200

@app.route('/api/ai/companion', methods=['POST'])
@require_auth
def ai_companion():
    data = request.get_json()
    user_message = data.get('message', '')
    mood = data.get('mood', '')
    emotion_tags = data.get('emotion_tags', [])
    
    # Simple AI responses based on mood and emotions
    responses = {
        'anxious': [
            "I understand you're feeling anxious. Try taking 3 deep breaths - inhale for 4 counts, hold for 4, exhale for 6.",
            "Anxiety can be overwhelming. Remember, this feeling will pass. Would you like to try a quick 2-minute meditation?",
            "You're not alone in feeling this way. Let's focus on what you can control right now."
        ],
        'tired': [
            "It sounds like you need some rest. Even a 10-minute break can make a big difference.",
            "When you're tired, be gentle with yourself. Maybe try some gentle stretching or a short walk.",
            "Rest is not a sign of weakness. Your body is asking for what it needs."
        ],
        'lonely': [
            "I'm here with you. Sometimes the bravest thing we can do is reach out.",
            "Loneliness is a universal human experience. You're not alone in feeling alone.",
            "Would you like to explore some local community activities? Connection can be found in unexpected places."
        ],
        'stressed': [
            "Stress is your body's way of responding to challenges. Let's find some ways to help you feel more grounded.",
            "Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
            "Remember to breathe. Your breath is always with you as an anchor."
        ]
    }
    
    # Find the most relevant response
    response = "I'm here to support you. How are you feeling today?"
    
    for emotion in emotion_tags:
        if emotion.lower() in responses:
            import random
            response = random.choice(responses[emotion.lower()])
            break
    
    if mood and mood.lower() in responses:
        import random
        response = random.choice(responses[mood.lower()])
    
    return jsonify({
        'reply': response,
        'suggestions': [
            'Try a 5-minute meditation',
            'Take a nature walk',
            'Write in your journal',
            'Listen to calming music'
        ]
    })

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5002)
