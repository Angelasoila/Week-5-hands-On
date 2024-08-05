const express = require ('express');
const app = express();
const mysql = require ('mysql');
const cors = require ('cors');
const bcrypt = require ('bcrypt');
const dotenv = require ('dotenv');

app.use(express.json())
app.use (cors())
dotenv.config()

//starting our connection
const db= mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD
})

db.connect ((err)=>{
    if (err) return console.log("error connecting to mysql")
        console.log("connected to mysql", db.threadId);


//creating a db table
db.query (`CREATE A DATABASE IF NOT EXISTS Expense_tracker`,(err, result) => {
   if (err) return console.log (err)

    console.log ("Database Expense_tracker created/checked");

//selecting our database
db.changeUser ({database: 'Expense_tracker'}, (err) =>{
    if (err) return console.log (err)

        console.log("changed to expense tracker")


//create users table
const createuserstable=`
  CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL
)`
db.query (createuserstable,(err,result)=>{
    if (err) return console.log (err)

        console.log("Users table checked/created")
    })
})
})
})

//userregistration route
app.post('/api/register', async(req, res)=>{
    try{
        const users = `SELECT * FROM users WHERE email = ?`
        db.query(users, [req.body.email], (err, data)=>{
        if (data.length > 0) return res.status (409).json ("User already exists")

            const salt= bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync (req.body.password, salt)

            const createUser = `INSERT INTO users (email, username, password) VALUES (?)`
            value = [
                req.body.email,
                req.body.username,
                hashedPassword
            ]

//insert user in db
db.query(createUser,[value], (err,data)=>{
    if (err) res.status (500).json ("Something went wrong")
        return res.status (200).json("User created successfully")
})
})
    }
    catch (err){
        res.status(500).json ("Internal server error")
    }
})

//user login
app.post('/api/login', async(req,res)=>{
    try{
      const users= `SELECT * FROM users WHERE email = ? `
      db.query (users,[req.body.email], (err,data)=>{
      if (data.length === 0) return res.status (404).json ("User not found")

        //check if password is valid
        const isPasswordValid = bcrypt.compareSync [req.body.password, data[0].password]
        if (!isPasswordValid) return res.status (400).json ("Invalid email or password")
            return res.status (200).json ("Login successful")
      })
      }
    catch (err) {
        res.status (500).json ("Internal server error")
    }
})

//starting the server
app.listen (3000,() =>{
    console.log ("sever is running on port 3000")
})