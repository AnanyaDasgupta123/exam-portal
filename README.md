# Exam Portal 📝

An online exam portal built using **Node.js**, **Express**, and **MySQL** that allows admins to create exams and users to take them securely.  
This project was developed as part of my backend and full-stack learning journey.

---

## 🚀 Features
- User authentication (login & registration)
- Admin panel to create and manage exams
- Online examinations
- Automatic evaluation of answers
- Result generation and display
- Email notifications using Nodemailer

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** EJS, HTML, CSS
- **Email Service:** Nodemailer
- **Version Control:** Git & GitHub

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/AnanyaDasgupta123/exam-portal.git
```
### 2. Navigate to the project direcotry
cd exam-portal
### 3. Install dependencies
npm install

### 4. Configure environment variables

Create a .env file in the root directory and add:

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=exam_portal
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

5. Start the server using Nodemon
nodemon

6. Open your browser and visit
http://localhost:3001
