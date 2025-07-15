# User-Management-Application

  - View all users
  - **Approve**, **De# 🔐 User Management Web Application

This is a full-stack **User Management Web App** built using **HTML, CSS, JavaScript, Bootstrap** for the frontend and **Spring Boot (Java)** for the backend. The application includes features like user registration, email verification, login, role-based access (User/Admin), and an admin dashboard to manage users.

---

## 🚀 Features

### 🔸 General
- Responsive layout using Bootstrap
- Clean and intuitive navigation

### 🧑 User Functionality
- **Signup** with:
  - Name, Email, Mobile, DOB, Security Question & Answer, User ID, Password (with confirmation)
  - Includes **email verification**
- **Login** using User ID and Password
- **User Dashboard**:
  - Displays personal information
  - Logout functionality

### 🛠️ Admin Functionality
- Admin login with `User ID`, `Password`, and role = `admin`
- Admin Dashboard:lete**, or **Archive** user accounts

---

## 🖥️ Frontend Tech Stack

| Technology  | Description                  |
|-------------|------------------------------|
| HTML5       | Markup language               |
| CSS3        | Styling and layout            |
| JavaScript  | Client-side logic             |
| Bootstrap   | Responsive design framework   |

---

## ⚙️ Backend Tech Stack

| Technology     | Description                      |
|----------------|----------------------------------|
| Java Spring    | Backend API and business logic   |
| Spring Boot    | Rapid server setup               |
| JDBC / JPA     | Database communication           |
| IntelliJ IDEA  | Development IDE                  |
| PostigreSQL    | Relational database              |

---

## 🧮 Database Structure

### `users` Table

| Column             | Type           |
|--------------------|----------------|
| id (PK)            | INT            |
| name               | VARCHAR        |
| email              | VARCHAR        |
| mobile             | VARCHAR        |
| dob                | DATE           |
| security_question  | VARCHAR        |
| security_answer    | VARCHAR        |
| user_id            | VARCHAR        |
| password           | VARCHAR        |
| role               | ENUM('user','admin') |
| status             | ENUM('pending', 'approved') |

## 📡 API Endpoints (Spring Boot)

| Endpoint                            | Method | Description                   |
|-------------------------------------|--------|-------------------------------|
| `/api/signup`                       | POST   | Register a new user           |
| `/api/login`                        | POST   | User/Admin login              |
| `/api/email-verification`          | POST   | Verify email after signup     |
| `/api/user/profile`                | GET    | Get user profile              |
| `/api/admin/users`                 | GET    | View all users                |
| `/api/admin/approve/{id}`          | POST   | Approve a user                |
| `/api/admin/delete/{id}`           | DELETE | Delete a user                 |

---

## ✅ How to Run the Application

### 💻 Frontend

1. Open `index.html` in a browser.
2. Navigate using the nav bar to Signup, Login, Admin, etc.

### ☕ Backend

1. Open the Spring Boot project in IntelliJ.
2. Set DB credentials in `application.properties`.
3. Run the main class to start the Spring server (`@SpringBootApplication`).
4. Backend will run at `http://localhost:8080`.

### 🛢️ Database

1. Create required tables in MySQL (you can use schema.sql or manually).
2. Connect Spring Boot with DB using JDBC or Spring Data JPA.

## 📌 Roles

- **User**: Can register, login, reset password, view personal dashboard.
- **Admin**: Can login, view all users, approve, delete, or archive users.

## 📷 Screenshots
