# SkillShare Platform

The **SkillShare Platform** is a collaborative web-based application designed to empower individuals to both teach and learn in an engaging and supportive environment. In today’s fast-paced world, lifelong learning is more essential than ever, yet many people struggle to find a centralized platform to facilitate skill sharing, structured learning, and motivation tracking. SkillShare aims to bridge that gap by integrating content sharing, progress tracking, and community features into a single, intuitive platform.

---

## ✨ Key Features

- **User Profiles & Authentication**
  - Secure login/signup using OAuth 2.0 and password-based forms
  - Public profiles, follow/unfollow functionality
  - Highlight top skills and posts
  - Real-time feedback, accessibility, and error handling

- **Skill Sharing**
  - Create and share skill posts with multimedia (up to 3 images or a 30-second video)
  - Custom descriptions and predefined progress templates
  - Showcase shared skills on profile and in global feed

- **Learning Plan Management**
  - Create, edit, and delete structured learning plans
  - Add, update, and track progress of learning steps
  - Responsive UI with real-time progress visualization
  - Toast notifications, loading states, and empty state messages

- **User Engagement & Interactivity**
  - Like and comment on posts
  - Delete/edit your comments; post owners can moderate
  - Real-time notifications on interactions
  - Notification center for user-specific alerts

---

## 👥 Contributors and Responsibilities

### 1. Gunawardana T.G.H.M – *User Authentication and Profile Management*

**Frontend:**
- Login/signup with OAuth 2.0
- Profile forms and displays
- Follow/unfollow functionality
- Highlights section for skills
- Real-time feedback, design consistency

**Backend:**
- OAuth 2.0, secure authentication
- CRUD operations for profiles
- Follower/following relationship management
- API development for highlights and user preferences
- Activity logging, query optimization, API documentation

---

### 2. Wijesinghe K. B – *Interactivity, Engagement, and Notifications*

**Frontend:**
- Like, unlike, and comment on posts
- Comment moderation by post owners
- Notifications for likes and comments

**Backend:**
- Comments and likes stored in dedicated collections
- CRUD operations for comments
- Notification generation and storage
- User-specific notification retrieval

---

### 3. Thushara L.G.T – *Learning Plan Creation and Tracking*

**Frontend:**
- Plan and step management with validations
- Responsive UI with grid layouts
- Loading indicators, error messages, and confirmation dialogs
- Toast notifications and empty state visuals

**Backend :**
- CRUD operations for plans and steps
- Real-time progress tracking and updates
- Authenticated user access using JWT
- Secure endpoints with Spring Security

---

### 4. Dewmini L.K.R – *Skill Sharing and Progress Updates*

**Frontend:**
- Post creation with media support
- Templates for learning progress updates
- Display posts in profile and feed

**Backend:**
- REST API for posts management
- Media upload and retrieval (images/videos)
- Optimized queries for post data fetching

---

## 🔐 Security & Usability

- Secure JWT-based authentication
- Role-based access control
- Clean, intuitive interface design
- Responsive layouts for mobile and desktop

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Spring Boot, RESTful APIs
- **Database:** MongoDB
- **Authentication:** OAuth 2.0, JWT
- **Media Handling:** Cloud storage for images/videos

---

## 📌 Future Enhancements

- AI-based skill recommendations
- Collaborative projects and mentorships
- Gamification elements for motivation
- Analytics for learning trends and performance

---

## 📄 License

This project is developed for academic and educational purposes. All rights reserved by the respective contributors.

---

## 📬 Contact

For inquiries, suggestions, or contributions, please reach out to the respective team members or submit a pull request.

