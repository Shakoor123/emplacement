var express = require('express');
const async = require('hbs/lib/async');
const fs = require('fs')
var router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();
// const dotenv = require("dotenv");
// const fs = require("fs")
// dotenv.config();
const saltRounds = 10;
//database connection
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

/* GET home page. */
router.get('/', function (req, res, next) {
  var user = req.session.user;
  var image;
  var sql = `select * from images;`
  connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      images = result;
    }
  })
  var sql = `select * from notification`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    else {

      res.render('index', { user, result, images });
    }
  })

});
//sign up page getting
router.get('/signup', (req, res) => {
  if (req.session.signup) {
    sign = req.session.signup;
    res.render('signup', { sign });
  } else {
    res.render('signup');
  }
})
//sign up operation
router.post('/signup', async (req, res) => {
  var sql = `select COUNT(*) AS c from student`;
  await connection.query(sql, async function (err, result) {
    if (err) throw err;
    else {
      //console.log(result[0].c);
      let s = result[0].c;
      var sql = `select phone from student`;
      await connection.query(sql, (err, result) => {
        if (err) throw err;
        else {
          let com = 0;
          for (let i = 0; i < s; i++) {
            if (result[i].phone == req.body.mobile) {
              com++;
            }
          }
          if (com != 0) {
            req.session.signup = true;
            res.redirect('/signup')
          } else {
            com = 0;
            bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
              var sql = `INSERT INTO student VALUES ("${req.body.regno}","${req.body.name}","${req.body.branch}","${req.body.email}","${req.body.mobile}","${req.body.cgpa}","${hash}")`;
              await connection.query(sql, function (err, result) {
                if (err) throw err;
                else {
                  req.session.signup = false;
                  res.redirect('/login')
                }
              })
            });
          }
        }
      })
    }
  })

})
//login user page
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    var loginFail = req.session.Fail;
    res.render('login', { loginFail })
  }
})
//login operation
router.post('/login', async (req, res) => {
  var sql = `select COUNT(*) AS c from student`;
  await connection.query(sql, async function (err, result) {
    if (err) throw err;
    else {
      //console.log(result[0].c);
      let s = result[0].c;
      var sql = `select phone from student`;
      await connection.query(sql, (err, result) => {
        if (err) throw err;
        else {
          let com = 0;
          for (let i = 0; i < s; i++) {
            if (result[i].phone == req.body.mobile) {
              com++;
            }
          }
          if (com != 0) {

            var sql = `select * from student where phone=${req.body.mobile}`;
            connection.query(sql, function (err, result) {
              if (err) throw err;
              else {
                bcrypt.compare(req.body.password, result[0].password, function (err, status) {
                  if (status) {
                    req.session.user = result[0];
                    req.session.loggin = true;
                    res.redirect('/')
                  } else {
                    req.session.Fail = true;
                    res.redirect('/login')
                  }
                });
              }
            })
          } else {
            com = 0;
            req.session.Fail = true;
            res.redirect('/login')

          }
        }
      })
    }
  })
})
//logout operation
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login')
})
//cgpa kk poovaan
router.get('/cgpa', (req, res) => {
  user = req.session.user;
  res.render('cgpa', { user })
})
router.get('/about', (req, res) => {
  user = req.session.user;
  res.render('about', { user })
})
//applay button
router.get("/apply/:id", async (req, res) => {
  if (req.session.user) {
    var user=req.session.user
    var nofiCgpa;
    var sql=`select cgpa from notification where id="${req.params.id}"`;
    await connection.query(sql,async(err,result)=>{
      if(err){
        console.log(err);
      }
      nofiCgpa=result[0].cgpa;
      if(user.cgpa>=nofiCgpa){

        const insertApply=async()=>{
          var sql=`insert into s${req.params.id} values(${req.session.user.phone})`
          await connection.query(sql,(err,result)=>{
            if(err){
              console.log(err);
             }else{
              res.redirect('/')
            }
         })
    
        }
    
    
    
        var sql = `select * from s${req.params.id}`
        await connection.query(sql, async (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result.length);
            if(result.length!=0){
    
            let applayUser=false;
            result.forEach(element => {
              if (req.session.user.phone == element.phone) {
                applayUser = true;
              }
              // insertApply();
            });
            if(applayUser==true){
              res.redirect('/')
            }else{
              insertApply();
            }
          }
          else{
            insertApply()
          }
          }
        })
    
      }else{
        console.log("you cant applay");
        res.redirect('/cgpa')
    
      }
    })

    



  } else {
    console.log("you cant applay");
    res.redirect('/login')
  }


})

module.exports = router;
