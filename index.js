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
app.post("/check_admin",(req,res)=>{
    const {uid,pwd}=req.body;
    console.log(req.body)
    const sql="select * from admin_user where uid=? and pwd=?";
    const values=[uid,pwd]
    con.query(sql,values,(err,result)=>{
        if(result.length!=0)
        {
            res.render('admin_dashboard');
        }
        else{
            res.render("admin",{msg:"Wrong User ID and Password"})
        }
    })
})

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
app.post("/check_student",(req,res)=>{
    const {Email,password}=req.body;
    const sql="select  name from tb_student where Email=? and password=?"
    const values=[Email,password]
    con.query(sql,values,(err,result)=>{
        if(result.length!=0)
        {
           // window.localStorage.setItem("email",Email)
            console.log(result)
            req.session.user = { uid: Email };
            req.session.save(); 
            console.log("User ="+req.session.user.uid)
            res.render("student_dashboard",{uname:result[0]['name']});
        }
        else{
            res.render("sign_in",{msg:"Wrong User ID and Password"})
        }
    })
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out");
        }
        res.render("home");
    });
})
app.get("/Exam",(req,res)=>{
    const sql="select *from tb_category"
   con.query(sql,(err,result)=>{
    res.render("exam", {
    uname: "name",
    data: result
});
   })
})

app.get("/select",(req,res)=>{
  const cid=req.query.cid;
   const sql="select * from tb_questions  where cid="+cid;
   con.query(sql,(err,result)=>{
       res.render("exam_view", {
       uname: "name",
       data: result
     });
   })
})
app.post("/submit_ans", (req, res) => {
  const answers = req.body;
  const studentEmail = req.session.user.uid;
  console.log("email= "+studentEmail)
  let values = [];

  Object.keys(answers).forEach((key) => {
    if (key.startsWith("ans_")) {
      const qNo = key.split("_")[1];
      const selected = answers[key];
      const correct = answers[`txt_${qNo}`];
      const isCorrect = selected === correct ? 1 : 0;

      values.push([
        studentEmail,
        qNo,
        selected,
        correct,
        isCorrect
      ]);
    }
  });

  const sql = `INSERT INTO tb_student_answers
    (student_email, question_no, selected_answer, correct_answer, is_correct)
    VALUES ?
  `;
  con.query(sql, [values], (err) => {
    if (!err) {
       console.log("Answers Saved"); 
       res.redirect("show_result")
    }
    else{
          console.log("Error"+err);
    }
  });
});
app.get("/show_result",(req,res)=>{
    const sql="select is_correct,count(*) as 'Count' from tb_student_answers group by is_correct"
    con.query(sql,(err,result)=>{
        console.log(result)
        res.render("result",{data:result})
    })
});

app.get("/review_exam",(req,res)=>{
       const sql="select * from tb_student_answers"
       con.query(sql,(err,result)=>{
            res.render("review",{data:result})
       })
})

app.listen(3001,()=>{
    console.log("Server is running at port 3001")
})
