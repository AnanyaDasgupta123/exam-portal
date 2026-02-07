const mysql=require('mysql2');
const connectToDatabase=()=>{
    try{
        const con=mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456789',
            database: 'exam'
        });
         console.log('Connected to MySQL!');
    return con;
    }catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
}
con=connectToDatabase();
module.exports=con;

