# Civic Connect

**Civic Connect** is a full-stack web application built using the **MERN** (MongoDB, Express.js, React, Node.js) stack. It serves as a digital bridge between citizens and local authorities, streamlining civic engagement, grievance reporting, and community updates.

---

## 🚀 Features

* **User Authentication:** Secure registration and login for citizens and administrators.
* **Grievance Reporting:** Citizens can submit complaints regarding local issues (e.g., roads, sanitation, water) with category tags and real-time status tracking.
* **Admin Dashboard:** Dedicated administrative interface to manage, update, and track the progress of reported civic issues.
* **Responsive UI:** Optimized for seamless performance across desktop, tablet, and mobile screens.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** (Vite)
* **CSS / Component Styling**
* **State Management & Routing:** React Router DOM

### Backend
* **Node.js** & **Express.js** (REST API architecture)
* **Database:** MongoDB via Mongoose ORM
* **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing

---

## 📂 Project Structure

```text
Civic-Connect/
├── Client/      # Frontend React application
└── Server/      # Backend Node.js / Express API
```



## ⚙️ Installation & Setup

Follow these steps to set up and run the project locally on your machine.

Prerequisites:
- Node.js installed (v16+ recommended)
- MongoDB Atlas account or a local MongoDB instance

1. Clone the Repository
git clone https://github.com/abhinavb20/Civic-Connect.git
cd Civic-Connect

2. Backend Setup
Navigate to the server directory:
cd Server

Install the backend dependencies:
npm install

Create a .env file in the root of the Server folder and add your configuration details:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

Start the backend development server:
npm run dev

3. Frontend Setup
Open a new terminal window and navigate to the client directory:
cd Client

Install the frontend dependencies:
npm install

Start the Vite development server:
npm run dev

Open your browser and navigate to the local URL provided (usually http://localhost:5173).


🌐 Deployment

The backend contains root route configurations and dynamic port binding fixes, making it optimized for continuous deployment platforms such as Render, Vercel, or Heroku.


📄 License

This project is open-source and available under the MIT License.
