# 🛡️ CareerShield AI

**A Smarter, Safer Career Guardian for Students**

CareerShield AI is an all-in-one career companion designed to protect students and recent graduates from the hidden dangers of the modern job market, optimize resumes for Applicant Tracking Systems (ATS), and coach users through mock interviews—all powered by modern AI APIs and a premium interactive user interface.

---

## 🌟 Key Features

### 🛡️ Pillars: The Shield 
- **Fake Job & Internship Detector**: Analyzes company metadata, website registration databases, URL history, and linguistic patterns to expose data-harvesting scams and malicious listings.

- **AI Resume & ATS Optimizer**: 
  - Allows uploading resumes (`.pdf`, `.docx`, `.doc`, `.txt`) up to 5MB.
  - Scores resumes across five domains: **Technical Skills**, **Soft Skills**, **Industry Keywords**, **Action Verbs**, and **Experience Match**.
  - Pinpoints missing keywords and provides actionable formatting/structural improvement tips.
  - Backend automatically cleans up uploaded files post-analysis to prevent storage leaks.
- **AI Career Coach & Mock Interviews**: Configures custom career goals and provides realistic audio/text mock interviews with real-time feedback on user responses.
- **AI Career Roadmap Generator**: Dynamically designs customized, step-by-step career path guides.
- **AI Project Recommendations**: Suggests targeted projects matching the user's career path to fill identified skill gaps.

### 💬 Interactive Assistant
- **Floating AI Assistant (Chat Modal)**: Accessible from anywhere on the platform, providing instantaneous answers to career development and job search safety questions.

### 🔑 Authentication & Access Control
- **Secure Authentication Flow**: Traditional Email/Password signup/login and Google OAuth login integration.
- **Password Protection**: Strong security utilizing `bcryptjs` hashing.
- **Session Management**: Secure client-side state combined with authorization headers using JSON Web Tokens (JWT).
- **Premium Route Guards**: Protected client-side routes (`/resume-scanner`, `/placement-preparation`, `/project-recommendation`, `/career-roadmap`) that prompt unauthorized users to sign in.

---

## 🚀 Tech Stack

### Frontend Architecture
- **Framework**: React 19 (Utilizing Hooks, Portals, Context, and modern React APIs)
- **Development Tooling**: Vite (For HMR and instant build pipelines)
- **Styling**: Tailwind CSS v4.0 (Leveraging modern native CSS custom properties)
- **Animations**: Framer Motion (High-performance spring physics, scroll-triggered animations, page transitions, and hover states)
- **Routing**: React Router DOM v7
- **Primitives**: Radix UI (Aria-compliant headless UI components)

### Backend Architecture
- **Environment**: Node.js & Express
- **Database**: MongoDB (Mongoose ODM)
- **File Upload Engine**: Multer (Optimized using disk storage with automatic fallback to memory storage for serverless-ready deployments)
- **Security Utilities**: `bcryptjs` (Password hashing) and `jsonwebtoken` (JWT creation/verification)
- **CORS Management**: Dynamically controlled origins to protect APIs against unauthorized requests

---

## 📁 Repository Structure

```text
├── backend/
│   ├── config/             # Database connection setups
│   ├── controllers/        # Business logic for auth & AI analysis
│   ├── middleware/         # Auth token verification & route protection
│   ├── models/             # Mongoose schemas (User database models)
│   ├── routes/             # Express routing interfaces (auth, analysis)
│   ├── uploads/            # Temporary storage folder for uploaded resumes
│   ├── server.js           # Express main server entrypoint
│   └── package.json        # Backend dependencies & running scripts
├── frontend/
│   ├── src/
│   │   ├── assets/         # Images, fonts, and static vectors
│   │   ├── components/     # Reusable blocks (Navbar, Hero, ChatModal, etc.)
│   │   │   ├── auth/       # AuthModal, LoginForm, SignupForm, ProtectedRoute
│   │   │   └── ui/         # Base UI components
│   │   ├── context/        # React global state managers (Auth, etc.)
│   │   ├── pages/          # Full page layout views (Login, Signup, etc.)
│   │   ├── App.jsx         # Client-side router & master UI container
│   │   ├── index.css       # Core Tailwind directives & scrollbar stylings
│   │   └── main.jsx        # Frontend entrypoint
│   ├── package.json        # Frontend dependencies & Vite setup
│   └── vite.config.js      # Vite compilation configurations
├── package.json            # Root configuration for workspace-wide commands
└── README.md               # Documentation guide
```

---

## 🛠️ Installation & Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and [MongoDB](https://www.mongodb.com/) installed on your machine.

---

### Setup Configurations

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "CareerShield AI"
   ```

2. **Install all dependencies** (Runs npm install in both `/backend` and `/frontend`):
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `backend` folder:
   ```env
   PORT=3000
   
   # MongoDB configurations
   # Provide your full connection string MONGODB_URI, OR individual credentials:
   MONGODB_USER=your_mongodb_username
   MONGODB_PASS_ENC=your_base64_encoded_mongodb_password
   MONGODB_HOST=your_mongodb_host_url
   MONGODB_DB=careershield_ai
   
   # JWT secret key for signature validation
   JWT_SECRET=your_jwt_signature_secret_key
   
   # Frontend URL (For CORS validation)
   FRONTEND_URL=http://localhost:5173
   ```
   > [!NOTE]
   > The backend supports passwords that are Base64-encoded in the `.env` configuration file for extra security. Ensure you encode your database password (e.g. `Buffer.from('myPassword').toString('base64')`) if utilizing `MONGODB_PASS_ENC`.

---

### Running the Application

You can spin up the development environment in multiple ways:

#### Option A: Running from the Root (Recommended)
You can launch both applications directly from the workspace root using the following workspace scripts:

- **Run Frontend Client** (`http://localhost:5173`):
  ```bash
  npm run dev
  ```
- **Run Backend API Server** (`http://localhost:3000`):
  ```bash
  npm run backend
  ```

#### Option B: Running Separately

1. **Start the API Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend client**:
   ```bash
   cd ../frontend
   npm run dev
   ```

---

## 🎨 Design System & Aesthetics

CareerShield AI adopts a high-end, futuristic, and responsive dark theme:
* **Glassmorphism**: Backdrop blurs (`backdrop-blur-md`), dark border accents, and multi-layered translucent cards.
* **Vibrant Gradients**: Neon-emerald (representing security/shield) transitioning into sapphire-blue and deep indigo (representing growth/development).
* **Smooth Transitions**: Micro-interactions utilizing `framer-motion` for buttery-smooth hover elevations, routing page shifts, and springy modal entrances.

---

## 📜 License & Acknowledgements

&copy; 2026 CareerShield AI. All rights reserved. Built with 🛡️ for students everywhere.
