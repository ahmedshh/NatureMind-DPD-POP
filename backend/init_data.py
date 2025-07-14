#!/usr/bin/env python3
"""
Script to initialize the database with dummy activities.
Run this after the Docker container is up and running.
"""

import sqlite3
import datetime
import sys
import os

DB_PATH = 'data/naturemind.db'

def init_dummy_activities():
    """Add dummy activities to the database"""
    try:
        # Ensure data directory exists
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if activities already exist
        cursor.execute("SELECT COUNT(*) FROM wellness_activities")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"Database already has {count} activities. Skipping initialization.")
            return
        
        # Get the first user ID (or create a dummy organizer)
        cursor.execute("SELECT id FROM users LIMIT 1")
        user_result = cursor.fetchone()
        
        if user_result:
            organizer_id = user_result[0]
        else:
            # Create a dummy organizer if no users exist
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, created_at, location)
                VALUES (?, ?, ?, ?, ?)
            """, ('dummy_organizer', 'dummy@example.com', 'dummy_hash', datetime.datetime.now().isoformat(), 'Pfarrkirchen, Germany'))
            organizer_id = cursor.lastrowid
            print(f"Created dummy organizer with ID: {organizer_id}")
        
        # Sample activities in Germany
        activities = [
            {
                'title': 'Morning Yoga in the Park',
                'description': 'Start your day with a refreshing yoga session in Pfarrkirchen. All levels welcome!',
                'category': 'yoga',
                'location': 'Pfarrkirchen, Germany',
                'latitude': 48.4333,
                'longitude': 12.9333,
                'date': '2024-01-20',
                'time': '07:00',
                'price': 15.0,
                'max_participants': 20,
                'organizer_name': 'Sarah Johnson',
                'contact_info': 'sarah@wellness.com',
                'image_url': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
            },
            {
                'title': 'Mindfulness Meditation Workshop',
                'description': 'Learn meditation techniques for stress relief and mental clarity. Perfect for beginners!',
                'category': 'meditation',
                'location': 'Eggenfelden, Germany',
                'latitude': 48.4000,
                'longitude': 12.7667,
                'date': '2024-01-22',
                'time': '18:30',
                'price': 25.0,
                'max_participants': 15,
                'organizer_name': 'Michael Chen',
                'contact_info': 'michael@mindful.com',
                'image_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
            },
            {
                'title': 'Nature Walk & Forest Bathing',
                'description': 'Experience the healing power of nature with guided forest bathing and mindful walking.',
                'category': 'nature',
                'location': 'Simbach am Inn, Germany',
                'latitude': 48.2667,
                'longitude': 13.0167,
                'date': '2024-01-25',
                'time': '09:00',
                'price': 10.0,
                'max_participants': 12,
                'organizer_name': 'Emma Rodriguez',
                'contact_info': 'emma@nature.com',
                'image_url': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400'
            }
        ]
        
        created_at = datetime.datetime.now().isoformat()
        
        for activity in activities:
            cursor.execute("""
                INSERT INTO wellness_activities 
                (title, description, category, location, latitude, longitude, date, time, price, max_participants, organizer_id, organizer_name, contact_info, image_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                activity['title'],
                activity['description'],
                activity['category'],
                activity['location'],
                activity['latitude'],
                activity['longitude'],
                activity['date'],
                activity['time'],
                activity['price'],
                activity['max_participants'],
                organizer_id,
                activity['organizer_name'],
                activity['contact_info'],
                activity['image_url'],
                created_at
            ))
        
        conn.commit()
        conn.close()
        print("✅ Successfully added 3 dummy activities to the database!")
        print("📍 Locations: Pfarrkirchen, Eggenfelden, and Simbach am Inn, Germany")
        
    except Exception as e:
        print(f"❌ Error initializing data: {e}")
        sys.exit(1)

if __name__ == '__main__':
    print("🚀 Initializing NatureMind database with dummy activities...")
    init_dummy_activities()
    print("✨ Database initialization complete!") 