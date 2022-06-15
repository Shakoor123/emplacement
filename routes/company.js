var express = require('express');
var router = express.Router();
var bcrypt=require('bcrypt');
const async = require('hbs/lib/async');
var saltRounds=7;
//mysql connection
const fs = require('fs')
var mysql = require('mysql')
var connection = mysql.createConnection({
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.dbDatabase,
  port: 3306,
  ssl: { ca: fs.readFileSync("CA.pem") }
})
connection.connect(function (err) {
  if (err) throw err
  console.log('database connected...')

})

//get company register
router.get('/',(req,res)=>{
    res.render('company/CompanyRegister')
})
//operation register
router.post('/',async(req,res)=>{
    console.log(req.body);


    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
        var sql = `INSERT INTO companies VALUES ("${req.body.name}","${req.body.email}","${req.body.mobile}","${req.body.cgpa}","${req.body.about}","${hash}",NULL)`;
        await connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.redirect('/company/login')
          }
        })
    });

})
//get company login
router.get('/login',(req,res)=>{
    res.render('company/CompanyLogin')
})
//operation login
router.post('/login',async(req,res)=>{
    var sql = `select COUNT(*) AS c from companies`;
  await connection.query(sql, async function (err, result) {
    if (err) throw err;
    else {
      //console.log(result[0].c);
      let s = result[0].c;
      var sql = `select email from companies`;
      await connection.query(sql, (err, result) => {
        if (err) throw err;
        else {
          let com = 0;
          for (let i = 0; i < s; i++) {
            if (result[i].email == req.body.email) {
              com++;
            }
          }
          if (com != 0) {

            var sql = `select * from companies where email="${req.body.email}"`;
            connection.query(sql, function (err, result) {
              if (err) throw err;
              else {
                bcrypt.compare(req.body.password, result[0].password, function (err, status) {
                  if (status) {
                    req.session.company = result[0];
                    res.redirect('/company/home')
                  } else {
                    res.redirect('/company/login')
                  }
                });
              }
            })
          } else {
            com = 0;
            res.redirect('/company/login')

          }
        }
      })
    }
  })


})
//company home page
router.get('/home',async(req,res)=>{
    company=req.session.company
    if(company.flag.length > 5){
      var sql = `select * from student JOIN s${company.flag} on student.phone = s${company.flag}.phone;`
         await connection.query(sql, (err, students) => {
            if (err) throw err;
            else {
              res.render('company/CompanyHome',{company,students})
             }
          })
     
    
    }else{
      res.render('company/CompanyHome',{company})
    }
    
})





module.exports = router;
