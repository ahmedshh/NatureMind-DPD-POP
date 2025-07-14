
// Global variables
let selectedMood = null;
let selectedEmotionTags = [];
let currentSection = 'home';
let currentUser = null;
let userLocation = '';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            userLocation = currentUser.location || '';
            showApp();
            initializeApp();
        } else {
            showAuth();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showAuth();
    }
}

function showAuth() {
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    
    if (currentUser) {
        document.getElementById('user-username').textContent = currentUser.username;
        document.getElementById('user-location').textContent = currentUser.location || 'Location not set';
    }
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Setup authentication form listeners
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await login();
});

document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await register();
});

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            userLocation = currentUser.location || '';
            showApp();
            initializeApp();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const location = document.getElementById('register-location').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password, location })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            userLocation = currentUser.location || '';
            showApp();
            initializeApp();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        userLocation = '';
        showAuth();
        
        // Clear forms
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function initializeApp() {
    setupNavigation();
    loadMoodHistory();
    loadActivities();
    loadMindfulnessContent();
    loadCommunityPosts();
    loadHappeningNow(); // Load on init in case it's the first tab
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            if (section === 'happening-now') {
                loadHappeningNow();
            }
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to corresponding nav link
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    currentSection = sectionName;
}

// Mood Tracker
function setupEventListeners() {
    // Mood options
    document.querySelectorAll('.mood-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedMood = this.getAttribute('data-mood');
        });
    });
    
    // Emotion tags
    document.querySelectorAll('.tag-option').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagValue = this.getAttribute('data-tag');
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedEmotionTags = selectedEmotionTags.filter(t => t !== tagValue);
        } else {
                this.classList.add('selected');
                selectedEmotionTags.push(tagValue);
            }
        });
    });
    
    // Chat input
    const chatInput = document.getElementById('chat-input-field');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Activity form
    const activityForm = document.getElementById('activity-form');
    if (activityForm) {
        activityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addActivity();
        });
    }
    
    // Mindfulness categories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            loadMindfulnessContent(category);
        });
    });
}

async function saveMoodEntry() {
    if (!selectedMood) {
        alert('Please select a mood');
        return;
    }
    
    const journalText = document.getElementById('journal-text').value;
    
    const moodData = {
        mood: selectedMood,
        emotion_tags: selectedEmotionTags,
        notes: '',
        journal_entry: journalText
    };
    
    try {
        const response = await fetch('/api/mood/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(moodData)
        });
        
        if (response.ok) {
            alert('Mood entry saved successfully!');
            resetMoodForm();
            loadMoodHistory();
        } else {
            alert('Error saving mood entry');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving mood entry');
    }
}

function resetMoodForm() {
    selectedMood = null;
    selectedEmotionTags = [];
    document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.tag-option').forEach(tag => tag.classList.remove('selected'));
    document.getElementById('journal-text').value = '';
}

async function loadMoodHistory() {
    try {
        const response = await fetch('/api/mood/history', {
            credentials: 'include'
        });
        const entries = await response.json();
        
        const container = document.getElementById('mood-entries');
        container.innerHTML = '';
        
        entries.forEach(entry => {
            const entryElement = createMoodEntryElement(entry);
            container.appendChild(entryElement);
        });
    } catch (error) {
        console.error('Error loading mood history:', error);
    }
}

function createMoodEntryElement(entry) {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'mood-entry';
    entryDiv.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const date = new Date(entry.timestamp).toLocaleDateString();
    const time = new Date(entry.timestamp).toLocaleTimeString();
    
    entryDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-weight: 600; color: #1f2937;">${entry.mood}</span>
            <span style="color: #6b7280; font-size: 0.875rem;">${date} at ${time}</span>
        </div>
        ${entry.emotion_tags.length > 0 ? `
            <div style="margin-bottom: 0.5rem;">
                ${entry.emotion_tags.map(tag => `<span style="background: #e0e7ff; color: #4f46e5; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem; margin-right: 0.5rem;">${tag}</span>`).join('')}
            </div>
        ` : ''}
        ${entry.journal_entry ? `<p style="color: #6b7280; font-style: italic; margin: 0;">"${entry.journal_entry}"</p>` : ''}
    `;
    
    return entryDiv;
}

// AI Companion
async function sendMessage() {
    const input = document.getElementById('chat-input-field');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch('/api/ai/companion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                message: message,
                mood: selectedMood,
                emotion_tags: selectedEmotionTags
            })
        });
        
        const data = await response.json();
        
        // Add AI response to chat
        addMessageToChat(data.reply, 'ai');
        
        // Show suggestions if available
        if (data.suggestions) {
            showSuggestions(data.suggestions);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('Sorry, I\'m having trouble connecting right now. Please try again later.', 'ai');
    }
}

function sendQuickMessage(message) {
    document.getElementById('chat-input-field').value = message;
    sendMessage();
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    const avatarClass = sender === 'ai' ? 'ai-message' : 'user-message';
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${avatarClass}">
            ${avatar}
            </div>
        <div class="message-content">
            <p>${message}</p>
            </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showSuggestions(suggestions) {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'message ai-message';
    suggestionsDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
            </div>
        <div class="message-content">
            <p>Here are some suggestions:</p>
            <div style="margin-top: 0.5rem;">
                ${suggestions.map(suggestion => 
                    `<button onclick="sendQuickMessage('${suggestion}')" style="background: rgba(79, 70, 229, 0.1); color: #4f46e5; border: 1px solid rgba(79, 70, 229, 0.2); border-radius: 12px; padding: 0.5rem 1rem; margin: 0.25rem; cursor: pointer; font-size: 0.875rem;">${suggestion}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('chat-messages').appendChild(suggestionsDiv);
}

// Activities
async function loadActivities() {
    try {
        const response = await fetch('/api/activities', {
            credentials: 'include'
        });
        const activities = await response.json();
        
        const container = document.getElementById('activities-grid');
        container.innerHTML = '';
        
        activities.forEach(activity => {
            const activityElement = createActivityElement(activity);
            container.appendChild(activityElement);
        });
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function createActivityElement(activity) {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-card';
    
    const date = new Date(activity.date).toLocaleDateString();
    const price = activity.price > 0 ? `$${activity.price}` : 'Free';
    const participants = `${activity.current_participants}/${activity.max_participants || '∞'}`;
    
    activityDiv.innerHTML = `
        <h3>${activity.title}</h3>
        <p>${activity.description}</p>
        <div class="activity-meta">
            <span class="activity-category">${activity.category}</span>
            <span class="activity-price">${price}</span>
                </div>
        <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">
            <div><i class="fas fa-map-marker-alt"></i> ${activity.location}</div>
            <div><i class="fas fa-calendar"></i> ${date} at ${activity.time}</div>
            <div><i class="fas fa-user"></i> ${activity.organizer_name || activity.organizer_username}</div>
            <div><i class="fas fa-users"></i> ${participants} participants</div>
                </div>
        <div class="activity-actions">
            ${activity.is_joined ? 
                `<button class="leave-btn" onclick="leaveActivity(${activity.id})">Leave Activity</button>` :
                `<button class="join-btn" onclick="joinActivity(${activity.id})">Join Activity</button>`
            }
        </div>
    `;
    
    return activityDiv;
}

async function joinActivity(activityId) {
    try {
        const response = await fetch(`/api/activities/${activityId}/join`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Successfully joined activity!');
            loadActivities(); // Refresh the activities list
        } else {
            alert(data.error || 'Failed to join activity');
        }
    } catch (error) {
        console.error('Error joining activity:', error);
        alert('Error joining activity. Please try again.');
    }
}

async function leaveActivity(activityId) {
    try {
        const response = await fetch(`/api/activities/${activityId}/leave`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Successfully left activity');
            loadActivities(); // Refresh the activities list
        } else {
            alert(data.error || 'Failed to leave activity');
        }
    } catch (error) {
        console.error('Error leaving activity:', error);
        alert('Error leaving activity. Please try again.');
    }
}

async function addActivity() {
    const form = document.getElementById('activity-form');
    const formInputs = form.querySelectorAll('input, textarea, select');
    
    // Get form data
    const activityData = {
        title: formInputs[0].value.trim(),
        description: formInputs[1].value.trim(),
        category: formInputs[2].value,
        location: formInputs[3].value.trim(),
        date: formInputs[4].value,
        time: formInputs[5].value,
        price: parseFloat(formInputs[6].value) || 0,
        max_participants: parseInt(formInputs[7].value) || 0,
        organizer_name: currentUser.username,
        contact_info: formInputs[8].value.trim()
    };
    
    // Validate required fields
    if (!activityData.title || !activityData.description || !activityData.category || 
        !activityData.location || !activityData.date || !activityData.time || !activityData.contact_info) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(activityData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Activity added successfully!');
            form.reset();
            loadActivities();
        } else {
            alert(data.error || 'Error adding activity');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding activity. Please try again.');
    }
}

function filterActivities() {
    const category = document.getElementById('category-filter').value;
    const location = document.getElementById('location-filter').value;
    
    let url = '/api/activities?';
    if (category) url += `category=${category}&`;
    if (location) url += `location=${location}`;
    
    fetch(url, { credentials: 'include' })
        .then(response => response.json())
        .then(activities => {
            const container = document.getElementById('activities-grid');
            container.innerHTML = '';
            
            activities.forEach(activity => {
                const activityElement = createActivityElement(activity);
                container.appendChild(activityElement);
            });
        })
        .catch(error => {
            console.error('Error filtering activities:', error);
        });
}

function showNearbyActivities() {
    if (!userLocation) {
        alert('Please set your location in your profile to see nearby activities');
        return;
    }
    
    let url = `/api/activities?user_location=${encodeURIComponent(userLocation)}`;
    
    fetch(url, { credentials: 'include' })
        .then(response => response.json())
        .then(activities => {
            const container = document.getElementById('activities-grid');
            container.innerHTML = '';
            
            if (activities.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: white; grid-column: 1 / -1;">No activities found near your location. Try adding one!</p>';
            } else {
                activities.forEach(activity => {
                    const activityElement = createActivityElement(activity);
                    container.appendChild(activityElement);
                });
            }
        })
        .catch(error => {
            console.error('Error loading nearby activities:', error);
        });
}

// Mindfulness
async function loadMindfulnessContent(category = null) {
    try {
        let url = '/api/mindfulness';
        if (category) url += `?category=${category}`;
        
        const response = await fetch(url, { credentials: 'include' });
        const content = await response.json();
        
        const container = document.getElementById('mindfulness-content');
        container.innerHTML = '';
        
        if (content.length === 0) {
            // Add some sample content
            const sampleContent = [
                {
                    title: '5-Minute Breathing Exercise',
                    content_type: 'meditation',
                    content: 'Find a comfortable position and focus on your breath...',
                    duration: 5,
                    category: 'breathing'
                },
                {
                    title: 'Nature Sounds Meditation',
                    content_type: 'audio',
                    content: 'Listen to calming nature sounds...',
                    duration: 10,
                    category: 'nature'
                },
                {
                    title: 'Daily Affirmations',
                    content_type: 'text',
                    content: 'I am worthy of love and respect...',
                    duration: 2,
                    category: 'affirmations'
                }
            ];
            
            sampleContent.forEach(item => {
                const itemElement = createMindfulnessElement(item);
                container.appendChild(itemElement);
            });
        } else {
            content.forEach(item => {
                const itemElement = createMindfulnessElement(item);
                container.appendChild(itemElement);
            });
        }
    } catch (error) {
        console.error('Error loading mindfulness content:', error);
    }
}

function createMindfulnessElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'mindfulness-item';
    
    const icon = getMindfulnessIcon(item.content_type);
    
    itemDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <i class="${icon}" style="font-size: 2rem; color: #4f46e5;"></i>
            <div>
                <h3 style="margin: 0; color: #1f2937;">${item.title}</h3>
                <span style="color: #6b7280; font-size: 0.875rem;">${item.duration} minutes</span>
            </div>
        </div>
        <p style="color: #6b7280; line-height: 1.5;">${item.content}</p>
        <button onclick="startMindfulness('${item.title}')" style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 1rem;">Start Session</button>
    `;
    
    return itemDiv;
}

function getMindfulnessIcon(contentType) {
    switch (contentType) {
        case 'meditation': return 'fas fa-om';
        case 'audio': return 'fas fa-volume-up';
        case 'text': return 'fas fa-quote-left';
        default: return 'fas fa-spa';
    }
}

function startMindfulness(title) {
    alert(`Starting ${title} session...\n\nThis would typically open a meditation timer or audio player.`);
}

// Community
async function loadCommunityPosts() {
    try {
        const response = await fetch('/api/community/posts', {
            credentials: 'include'
        });
        const posts = await response.json();
        
        const container = document.getElementById('community-posts');
        container.innerHTML = '';
        
        if (posts.length === 0) {
            // Add some sample posts
            const samplePosts = [
                {
                    content: 'Today I found peace in a simple walk through the park. Nature has a way of healing us when we least expect it.',
                    category: 'gratitude',
                    timestamp: new Date().toISOString(),
                    anonymous_id: 'user_123456'
                },
                {
                    content: 'Remember: You are stronger than you think, braver than you believe, and more capable than you imagine.',
                    category: 'inspiration',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    anonymous_id: 'user_789012'
                }
            ];
            
            samplePosts.forEach(post => {
                const postElement = createCommunityPostElement(post);
                container.appendChild(postElement);
            });
        } else {
            posts.forEach(post => {
                const postElement = createCommunityPostElement(post);
                container.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error('Error loading community posts:', error);
    }
}

function createCommunityPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'community-post';
    
    const date = new Date(post.timestamp).toLocaleDateString();
    
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-category">${post.category}</span>
            <span class="post-timestamp">${date}</span>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-footer">
            <span class="post-author">Anonymous ${post.anonymous_id.slice(-4)}</span>
            <div class="post-likes">
                <i class="fas fa-heart"></i>
                <span>${post.likes || 0}</span>
            </div>
        </div>
    `;
    
    return postDiv;
}

async function addCommunityPost() {
    const content = document.getElementById('post-content').value.trim();
    const category = document.getElementById('post-category').value;
    
    if (!content) {
        alert('Please enter some content');
        return;
    }
    
    const postData = {
        content: content,
        category: category
    };
    
    try {
        const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
            credentials: 'include',
            body: JSON.stringify(postData)
        });
        
        if (response.ok) {
            alert('Post shared successfully!');
            document.getElementById('post-content').value = '';
            loadCommunityPosts();
        } else {
            alert('Error sharing post');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error sharing post');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Add some sample data on first load
function addSampleData() {
    // This would typically be done on the backend
    console.log('App initialized with sample data');
}

async function loadHappeningNow() {
    const grid = document.getElementById('happening-now-grid');
    grid.innerHTML = '<div class="loading">Loading activities...</div>';
    try {
        const response = await fetch('/api/activities', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to load activities');
        const activities = await response.json();
        grid.innerHTML = '';
        if (activities.length === 0) {
            grid.innerHTML = '<div class="empty">No activities happening now.</div>';
            return;
        }
        activities.forEach(activity => {
            grid.appendChild(createHappeningNowElement(activity));
        });
    } catch (err) {
        grid.innerHTML = '<div class="error">Could not load activities.</div>';
    }
}

function createHappeningNowElement(activity) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.innerHTML = `
        <img src="${activity.image_url || 'bg.png'}" alt="${activity.title}" class="activity-img">
        <div class="activity-info">
            <h3>${activity.title}</h3>
            <p>${activity.description}</p>
            <div class="activity-meta">
                <span><i class="fas fa-calendar-alt"></i> ${activity.date} ${activity.time}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>
                <span><i class="fas fa-user"></i> ${activity.organizer_name || activity.organizer_username || 'Organizer'}</span>
            </div>
            <div class="activity-actions">
                ${activity.is_joined ?
                    `<button class="leave-btn" onclick="leaveActivity(${activity.id})">Leave</button>` :
                    `<button class="join-btn" onclick="joinActivity(${activity.id})">Join</button>`
                }
            </div>
        </div>
    `;
    return card;
}
