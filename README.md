Exam Portal 📝

A full-stack Online Examination Portal built with Node.js, Express.js, MySQL, and EJS. The system enables administrators to create and manage examinations while allowing students to securely take timed assessments, receive instant results, and track their performance.

This project was developed as part of my backend and full-stack development learning journey.

🚀 Features

👨‍💼 Admin Module
Secure admin login
Dashboard with exam statistics
Create, update, and delete exam categories
Add, edit, and remove questions
View total students, exams, and attempts

👨‍🎓 Student Module
Student registration and login
Browse available examinations
Timed online examinations
Automatic submission when the timer expires
Resume an unfinished exam
View detailed results after submission
Previous answers remain visible when resuming an attempt

⚙️ System Features
Automatic answer evaluation
Instant score calculation
MySQL database integration
Email notifications using Nodemailer
Server-side validation for exam duration
Responsive user interface using Bootstrap
🛠 Tech Stack

Backend: Node.js, Express.js

Frontend:EJS HTML5 CSS3 Bootstrap

Database: MySQL

Other Tools: Nodemailer Git & GitHub

📂 Installation & Setup
1. Clone the repository
git clone https://github.com/AnanyaDasgupta123/exam-portal.git
2. Navigate to the project directory
cd exam-portal
3. Install dependencies
npm install
4. Configure environment variables

Create a .env file in the project root and add:

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=exam_portal

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

5. Start the application
nodemon

If Nodemon is not installed globally:

npx nodemon
6. Open the application

After the server starts successfully, open your browser and visit:

http://localhost:3001/home

👩‍💻 Author
Ananya Dasgupta
GitHub: https://github.com/AnanyaDasgupta123