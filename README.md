# TaskTribe Server - Backend README

````md id="l4x0a1"
# TaskTribe Server - Backend API

TaskTribe Server is the backend service for the TaskTribe Project Management Application.  
Built using Node.js, Express, PostgreSQL, Prisma ORM, Clerk Authentication, and Inngest event-driven architecture.

---

# 🌐 Live Backend URL

🔗 https://tasktrive-server-project-management.vercel.app/

---

#  Backend Features

## 🔐 Authentication & Authorization
- Clerk Authentication Integration
- Protected API Routes
- Organization-based Access Control
- Middleware Authentication

## 👥 Workspace Management
- Create Workspace
- Update Workspace
- Delete Workspace
- Workspace Member Management

## 📁 Project Management
- Create Projects
- Update Project Details
- Project Analytics
- Project Member System

## ✅ Task Management
- Create Tasks
- Assign Members
- Update Task Status
- Task Priority & Type
- Due Date Tracking

## 💬 Comment System
- Add Comments to Tasks
- Task Discussion Support

## 📩 Email Integration
- Nodemailer Email Service
- Invitation & Notification Support

## ⚡ Inngest Background Functions
- Clerk User Synchronization
- Organization Sync
- Workspace Member Sync
- Background Event Processing

---

# 🛠️ Tech Stack

## Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Inngest
- Clerk Authentication
- Nodemailer

## Database Hosting
- Neon PostgreSQL

## Deployment
- Vercel

---

# 📂 Backend Folder Structure

```bash
tasktribe_server/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── generated/
│   ├── inngest/
│   ├── middlewares/
│   ├── routes/
│   └── db.js
│
├── index.js
├── prisma.config.js
├── vercel.json
└── package.json
````

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/tasktribe_server.git
cd tasktribe_server
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Setup Environment Variables

Create a `.env` file:

```env
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

DATABASE_URL=
DIRECT_URL=

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_PASS=
SMTP_USER=
EMAIL_FROM=
```

---

# ▶️ Run Development Server

```bash
npm run dev
```

---

# 🚀 Production Start

```bash
npm start
```

---

# 📦 Available Scripts

```bash
npm run dev
npm start
npm run postinstall
```

---

# 🧩 API Architecture

## Controllers

Handles business logic for:

* Workspaces
* Projects
* Tasks
* Comments

## Routes

Manages API endpoints:

* `/api/workspaces`
* `/api/projects`
* `/api/tasks`
* `/api/comments`
* `/api/inngest`

## Middleware

* Authentication Middleware
* Request Protection

---

# ⚡ Inngest Event System

TaskTribe uses Inngest for event-driven background processing.

## Current Events

### User Events

* `clerk/user.created`
* `clerk/user.updated`
* `clerk/user.deleted`

### Workspace Events

* `clerk/organization.created`
* `clerk/organization.updated`
* `clerk/organization.deleted`

### Membership Events

* `clerk/organizationMembership.created`

---

# 🗄️ Prisma Database Schema

## Enums

### WorkspaceRole

```prisma
enum WorkspaceRole {
  ADMIN
  MEMBER
}
```

### TaskStatus

```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

### TaskType

```prisma
enum TaskType {
  TASK
  BUG
  FEATURE
  IMPROVEMENT
  OTHER
}
```

### ProjectStatus

```prisma
enum ProjectStatus {
  ACTIVE
  PLANNING
  COMPLETED
  ON_HOLD
  CANCELLED
}
```

### Priority

```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

---

# 🧱 Database Models

## User Model

```prisma
model User {
  id        String   @id
  name      String
  email     String   @unique
  image     String
  createdAt DateTime
  updatedAt DateTime
}
```

## Workspace Model

```prisma
model Workspace {
  id          String   @id
  name        String
  slug        String   @unique
  description String?
  ownerId     String
  image_url   String
}
```

## WorkspaceMember Model

```prisma
model WorkspaceMember {
  id          String
  userId      String
  workspaceId String
  role        WorkspaceRole
}
```

## Project Model

```prisma
model Project {
  id          String
  name        String
  description String?
  priority    Priority
  status      ProjectStatus
  workspaceId String
  progress    Int
}
```

## ProjectMember Model

```prisma
model ProjectMember {
  id        String
  userId    String
  projectId String
}
```

## Task Model

```prisma
model Task {
  id          String
  title       String
  description String?
  status      TaskStatus
  type        TaskType
  priority    Priority
  assigneeId  String
}
```

## Comment Model

```prisma
model Comment {
  id      String
  content String
  userId  String
  taskId  String
}
```

---

# 🔄 Database Relationships

* One User → Many Workspaces
* One Workspace → Many Projects
* One Project → Many Tasks
* One Task → Many Comments
* Many Users ↔ Many Projects
* Many Users ↔ Many Workspaces

---

# 📡 Main API Routes

## Workspace Routes

```bash
/api/workspaces
```

## Project Routes

```bash
/api/projects
```

## Task Routes

```bash
/ api/tasks
```

## Comment Routes

```bash
/ api/comments
```

## Inngest Routes

```bash
/ api/inngest
```

---

# 🔒 Authentication Flow

```text
Client → Clerk Authentication → Express Middleware → Protected Routes → Database
```

---

# ⚡ Prisma Generate

Prisma client is generated automatically after installation using:

```bash
npx prisma generate
```

---

# 🚀 Deployment

## Backend Hosting

* Vercel

## Database

* Neon PostgreSQL

## ORM

* Prisma ORM

---

# 👨‍💻 Author

## Jakaria Ahmed

Aspiring Full Stack MERN/PERN Developer passionate about scalable backend systems and modern web development.

---

# 📌 Future Improvements

* Real-time Socket.IO Integration
* Activity Logs
* Notification System
* File Upload System
* Advanced Role Permissions
* AI Task Suggestions

---


```
```
