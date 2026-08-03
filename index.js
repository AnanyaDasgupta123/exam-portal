const con=require('./model/connect')
const bcrypt = require('bcrypt');
const nodemailer=require("nodemailer");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const express=require('express')
const app=express();

app.use(express.static("public"))
app.use(cookieParser());
app.use(session({
    // A secret string for signing the session ID cookie, protecting it from tampering.
    secret: "Hello123", 
    resave: false, // Prevents saving the session back to the store if it hasn't been modified.
    saveUninitialized: false, // Forces a session that is "uninitialized" to be saved to the store.
    cookie: { secure: 'auto' } // Use secure cookies in production with HTTPS.
}));

app.set('view engine','ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
/*--------------------------UTILITY FUNCTION----------------------*/
const hashPassword = async (plainPassword) => {
  try {
    const saltRounds = 10; // Adjust the cost factor as needed (higher = slower/more secure)
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
    // Store the 'hashedPassword' in your database
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};
/*----------------------------------------------------------------*/

app.get("/home",(req,res)=>{
    res.render("home");
})

// ADMIN
app.get("/admin",(req,res)=>{
    res.render("admin",{msg:''})
})
app.post("/check_admin", (req, res) => {

    con.query("SELECT COUNT(*) AS total FROM tb_category", (err, category) => {

        if (err) return res.send(err);

        con.query("SELECT COUNT(*) AS total FROM tb_questions", (err, questions) => {

            if (err) return res.send(err);

            con.query("SELECT COUNT(*) AS total FROM tb_student", (err, students) => {

                if (err) return res.send(err);

                con.query("SELECT COUNT(*) AS total FROM exam_attempts", (err, attempts) => {

                    if (err) return res.send(err);

                    res.render("admin_dashboard", {
                        totalCategory: category[0].total,
                        totalQuestions: questions[0].total,
                        totalStudents: students[0].total,
                        totalAttempts: attempts[0].total
                    });

                });

            });

        });

    });

});

app.get("/Category",(req,res)=>{
    const sql="select * from tb_category"
     con.query(sql,(err,result)=>{
        res.render("category",{data:result});
    })
})
app.post("/save",(req,res)=>{
    console.log(req.body)
    const {cid,cname}=req.body;
    const sql="insert into tb_category values (?,?)"
    const values=[cid,cname];
    con.query(sql,values,(err,result)=>{
        if(!err){
            console.log("Data Saved")
            res.redirect("/Category");
        }
        else{
            console.log("Error"+err)
        }
    })
})


app.get("/del/category",(req,res)=>{
    const cid=req.query.cid
    console.log(cid)
    const sql="delete from tb_category where cid=?"
    con.query(sql,cid,(err,result)=>{
        res.redirect("/Category")
    })
})
app.get("/Question",(req,res)=>{
    const sql="select * from tb_category"
    con.query(sql,(err,result)=>{
        res.render("question",{data:result,msg:''});
    })
})
app.post("/question/save",(req,res)=>{
    console.log(req.body)
    const {cid,question,op1,op2,op3,op4,ca}=req.body;
    const sql="insert into tb_questions(cid,question,op1,op2,op3,op4,ca) values (?,?,?,?,?,?,?)"
    const values=[cid,question,op1,op2,op3,op4,ca];
    con.query(sql,values,(err,result)=>{
        if(!err){
            console.log("Data saved")
            const sql1="select * from tb_category"
            con.query(sql1,(err,result)=>{
            res.render("question",{data:result,msg:"Data Saved"});
        }) 
        }
        else
            console.log("Error"+err);
    })
    })
app.get("/Show_All_Questions",(req,res)=>{
    const sql="select * from tb_questions"
    con.query(sql,(err,result)=>{
       res.render("show_all",{data:result});
    })
    

})

//STUDENT
app.get("/Register",(req,res)=>{
    res.render("registration",{msg:''});
})

async function sendEmail(to,subject,text) {
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: "dasguptaananya647@gmail.com", 
      pass: "mjrl dajo krgh czuo", 
    },
  });

  
  const mailOptions = {
    from: `dasguptaananya647@gmail.com`, 
    to: `${to}`,              
    subject: `${subject}`,                 
    text: 'This is the plain text body of the email.', 
    html: `${text}`, 
  };

  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId); 
  } catch (error) {
    console.error('Error sending email:', error);
  }
}


app.post("/register",async(req,res)=>{
    const{Name,InstituteName,course,Email,Address,Contact}=req.body;
     let password= Math.floor(1000 + Math.random() * 9000);
     
     //const encrypt_pass = await hashPassword("password");
     encrypt_pass=password;
     // console.log("Final Hashed Password:", hashed);
    
     // let encrypt_pass=hashPassword(""+password);
      console.log(encrypt_pass)
    const sql="insert into tb_student (Name,InstituteName,course,Email,Address,Contact,password) values (?,?,?,?,?,?,?)"
    const values=[Name,InstituteName,course,Email,Address,Contact,encrypt_pass]
    con.query(sql,values,(err,result)=>{
        if(!err){
                let subject="Online Exam Portal";
               
                let text="User Id :"+Email+"<br> Password : "+password;
                sendEmail(Email,subject,text);
                 res.render("registration",{msg:"Data Saved"})
                 console.log("Data Saved")
        }
        else{
            console.log("Error"+err)
        }
    })
})
app.get("/Signin",(req,res)=>{
    res.render("sign_in",{msg:''});
})

app.post("/check_student", (req, res) => {
    const { Email, password } = req.body;
    const sql = "SELECT name FROM tb_student WHERE Email=? AND password=?";
    const values = [Email, password];
    con.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Database Error");
        }
        if (result.length == 0) {
            return res.render("sign_in", {
                msg: "Wrong User ID and Password"
            });
        }
        req.session.user = { uid: Email };
        req.session.save(() => {
            // Total available exams
            const availableSql = "SELECT COUNT(*) AS availableExams FROM tb_category";
            con.query(availableSql, (err, availableResult) => {
                if (err) {
                    console.log(err);
                    return res.send("Database Error");
                }
                // Completed exams
                const completedSql = `
                    SELECT COUNT(DISTINCT category_id) AS completedExams
                    FROM exam_attempts
                    WHERE student_email = ?
                `;
                con.query(completedSql, [Email], (err, completedResult) => {
                    if (err) {
                        console.log(err);
                        return res.send("Database Error");
                    }
                    // Total attempts
                    const attemptsSql = `
                        SELECT COUNT(*) AS totalAttempts
                        FROM exam_attempts
                        WHERE student_email = ?
                    `;
                    con.query(attemptsSql, [Email], (err, attemptsResult) => {
                        if (err) {
                            console.log(err);
                            return res.send("Database Error");
                        }
                    const recentSql = `SELECT c.cname,ea.score,ea.status,ea.end_time FROM exam_attempts ea
                                        JOIN tb_category c ON ea.category_id = c.cid
                                        WHERE ea.student_email = ? ORDER BY ea.end_time DESC LIMIT 5`;
                                con.query(recentSql, [Email], (err, recentResult) => {

                                    if (err) {
                                        console.log(err);
                                        return res.send("Database Error");
                                   }
                                   console.log(recentResult);
                            res.render("student_dashboard", {
                                    uname: result[0].name,
                                    availableExams: availableResult[0].availableExams,
                                    completedExams: completedResult[0].completedExams,
                                    totalAttempts: attemptsResult[0].totalAttempts,
                                    recentAttempts: recentResult
                   
                                }); });
                    });
                });
            });
        });
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out");
        }
        res.render("home");
    });
})
app.get("/Exam",(req,res)=>{
    const sql="SELECT c.cid,c.cname,c.description,c.duration_minutes,c.difficulty,c.status,COUNT(q.id) AS total_questions FROM tb_category c LEFT JOIN tb_questions q ON c.cid = q.cid GROUP BY c.cid, c.cname,c.description, c.duration_minutes,c.difficulty,c.status ORDER BY c.cid";
    con.query(sql,(err,result)=>{
           if (err) {
        console.log(err);
        return res.send(err);
    }
    res.render("exam", {
    uname: "name",
    data: result
})
    })
});

app.get("/select/:cid", (req, res) => {

    const cid = req.params.cid;
    if (!req.session.user) {
        return res.redirect("/Signin");
    }

    const email = req.session.user.uid;

    const durationSql =
        "SELECT duration_minutes FROM tb_category WHERE cid=?";

    con.query(durationSql, [cid], (err, durationResult) => {

        if (err) {
            console.log(err);
            return res.send("Duration Fetch Error");
        }

        if (durationResult.length === 0) {
            return res.send("Category not found");
        }
    // Continue loading questions and progress from here...
        // Function to load questions and render exam
        function loadExam() {

            const attemptId = req.session.attemptId;

            const attemptSql = `
    SELECT start_time
    FROM exam_attempts
    WHERE attempt_id = ?
`;

con.query(attemptSql, [attemptId], (err, attemptResult) => {

    if (err) {
        console.log(err);
        return res.send("Attempt Fetch Error");
    }

    const startTime = new Date(attemptResult[0].start_time);
    const durationMinutes=durationResult[0].duration_minutes;
    const now = new Date();

    const elapsedSeconds =Math.floor((now - startTime) / 1000);
    const allowedSeconds =durationMinutes * 60;
    const remainingSeconds = allowedSeconds - elapsedSeconds;

            const questionSql = `
                SELECT *
                FROM tb_questions
                WHERE cid=?
            `;

            con.query(questionSql, [cid], (err, questions) => {

                if (err) {
                    console.log(err);
                    return res.send("Question Fetch Error");
                }

                const progressSql = `
                    SELECT question_no, selected_option
                    FROM exam_progress
                    WHERE attempt_id = ?
                `;

                con.query(progressSql, [attemptId], (err, progressRows) => {

                    if (err) {
                        console.log(err);
                        return res.send("Progress Fetch Error");
                    }

                    let savedAnswers = {};

                    progressRows.forEach(row => {
                        savedAnswers[row.question_no] = row.selected_option;
                    });

                    res.render("exam_view", {
                        uname: "name",
                        data: questions,
                        durationMinutes: durationMinutes,
                        remainingSeconds: Math.max(0, remainingSeconds),
                        attemptId: attemptId,
                        savedAnswers: savedAnswers
                    });

                });

            });
             });
        }
   
        // Check if an IN_PROGRESS attempt already exists
        const checkAttemptSql = `
            SELECT attempt_id
            FROM exam_attempts
            WHERE student_email = ?
            AND category_id = ?
            AND status = 'IN_PROGRESS'
            LIMIT 1
        `;

        con.query(checkAttemptSql, [email, cid], (err, attemptRows) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            // Existing attempt found
            if (attemptRows.length > 0) {

                req.session.attemptId = attemptRows[0].attempt_id;

                console.log("Resuming Attempt:", req.session.attemptId);

                return loadExam();
            }

            // No active attempt, create a new one
            const attemptSql = `
                INSERT INTO exam_attempts
                (student_email, category_id, status)
                VALUES (?, ?, 'IN_PROGRESS')
            `;

            con.query(attemptSql, [email, cid], (err, attemptResult) => {

                if (err) {
                    console.log(err);
                    return res.send("Attempt Creation Error");
                }

                req.session.attemptId = attemptResult.insertId;

                console.log("New Attempt:", req.session.attemptId);

                loadExam();

            });

        });

    });

});
app.post("/submit_ans", (req, res) => {

    const answers = req.body;

    if (!req.session.user) {
        return res.send("Session expired or user not logged in");
    }

    const studentEmail = req.session.user.uid;
    const attemptId = req.session.attemptId;

    // STEP 1 : Check whether exam is already submitted
    const checkStatusSql = `
        SELECT status
        FROM exam_attempts
        WHERE attempt_id = ?
    `;

    con.query(checkStatusSql, [attemptId], (err, statusResult) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if (statusResult.length === 0) {
            return res.send("Invalid Attempt");
        }

        if (statusResult[0].status !== "IN_PROGRESS") {
            return res.send("This exam has already been submitted.");
        }

        // STEP 2 : Validate Exam Time
        const validateSql = `
            SELECT
                ea.start_time,
                c.duration_minutes
            FROM exam_attempts ea
            JOIN tb_category c
            ON ea.category_id = c.cid
            WHERE ea.attempt_id = ?
        `;

        con.query(validateSql, [attemptId], (err, validateResult) => {

            if (err) {
                console.log(err);
                return res.send("Validation Error");
            }

            const startTime = new Date(validateResult[0].start_time);
            const durationMinutes = validateResult[0].duration_minutes;

            const now = new Date();

            const elapsedSeconds = (now - startTime) / 1000;
            const allowedSeconds = (durationMinutes * 60);
            const remainingSeconds=allowedSeconds-elapsedSeconds;

            if (elapsedSeconds > allowedSeconds) {
                console.log("Exam Time Exceeded");
            }

            // STEP 3 : Delete previous answers (helps while testing)
            const deleteSql = `
                DELETE FROM tb_student_answers
                WHERE attempt_id = ?
            `;

            con.query(deleteSql, [attemptId], (err) => {

                if (err) {
                    console.log(err);
                    return res.send("Delete Error");
                }

                let values = [];

                Object.keys(answers).forEach((key) => {

                    if (key.startsWith("txt_")) {

                        const qNo = key.split("_")[1];

                        const selected = answers[key];
                        const correct = answers[`ans_${qNo}`];

                        const isCorrect =
                            selected === correct ? 1 : 0;

                        values.push([
                            attemptId,
                            studentEmail,
                            qNo,
                            selected,
                            correct,
                            isCorrect
                        ]);
                    }

                });

                const insertSql = `
                    INSERT INTO tb_student_answers
                    (
                        attempt_id,
                        student_email,
                        question_no,
                        selected_answer,
                        correct_answer,
                        is_correct
                    )
                    VALUES ?
                `;

                con.query(insertSql, [values], (err) => {

                    if (err) {
                        console.log(err);
                        return res.send("Insert Error");
                    }

                    const statsSql = `
                        SELECT
                            COUNT(*) AS total,
                            SUM(is_correct) AS score
                        FROM tb_student_answers
                        WHERE attempt_id = ?
                    `;

                    con.query(statsSql, [attemptId], (err, statsResult) => {

                        if (err) {
                            console.log(err);
                            return res.send("Stats Error");
                        }

                        const total = statsResult[0].total;
                        const score = statsResult[0].score || 0;

                        const updateSql = `
                            UPDATE exam_attempts
                            SET
                                score = ?,
                                total_questions = ?,
                                end_time = NOW(),
                                status = 'SUBMITTED'
                            WHERE attempt_id = ?
                        `;

                        con.query(updateSql,
                            [score, total, attemptId],
                            (err) => {

                                if (err) {
                                    console.log(err);
                                    return res.send("Update Error");
                                }

                                console.log("Exam Submitted Successfully");

                                res.redirect("/show_result");

                            });

                    });

                });

            });

        });

    });

});
app.post("/save-answer", (req, res) => {
    console.log("SAVE ROUTE HIT");
    console.log(req.body);
    const {
        attemptId,
        questionNo,
        selectedOption
    } = req.body;

    const sql = `
        INSERT INTO exam_progress
        (attempt_id, question_no, selected_option)

        VALUES (?, ?, ?)

        ON DUPLICATE KEY UPDATE

        selected_option = VALUES(selected_option)
    `;

    con.query(
        sql,
        [attemptId, questionNo, selectedOption],
        (err) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false
                });
            }

            res.json({
                success: true
            });

        }
    );

});
app.get("/show_result",(req,res)=>{
    console.log("Show Result Attempt ID =", req.session.attemptId);
    const attemptId = req.session.attemptId;

    const sql = `
        SELECT
            score,
            total_questions
        FROM exam_attempts
        WHERE attempt_id = ?
    `;

    con.query(sql,[attemptId],(err,result)=>{

        if(err){
            console.log(err);
            return;
        }
        console.log("attemptId =", attemptId);
        console.log("result =", result);
        if(result.length === 0){
            return res.send("No exam attempt found");
        }
        res.render("result",{
            data:result[0],
            uname:"name"
        });

    });

});

app.get("/review_exam",(req,res)=>{

    const attemptId = req.session.attemptId;

    const sql = `
        SELECT *
        FROM tb_student_answers
        WHERE attempt_id = ?
    `;

    con.query(sql,[attemptId],(err,result)=>{

        if(err){
            console.log(err);
            return;
        }

        res.render("review",{data:result, uname:"name"});
    });

});
app.listen(3001,()=>{
    console.log("Server is running at port 3001")
})
