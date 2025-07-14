import sqlite3

conn = sqlite3.connect("mental_health.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM mood_logs")
rows = cursor.fetchall()

print("Mood Logs:")
for row in rows:
    print(row)

conn.close()