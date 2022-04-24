var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
var app = express();
const bcrypt = require('bcrypt')
// const fs = require("fs")
const path = require('path');
//database connection
var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'b1tz1ap4tsdy5nf9ev3r-mysql.services.clever-cloud.com',
  user: 'ujbmujruwb2dijez',
  password: 'ZkdJXHX5fS8dqaxgcroU',
  database: 'b1tz1ap4tsdy5nf9ev3r'
})
connection.connect(function (err) {
  if (err) throw err
  console.log('database connected...')

})
//admin middile ware
function isAdmin(req,res,next){
  if(req.session.admin){
    next()
  }else{
    res.render('error')
  }
  }

//image uploading hedder
const multer = require('multer');
const storage = multer.diskStorage({
  destination: './public/images',
  filename: (req, file, cb) => {
    return cb(null, `pic_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storage
});
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/loginA');
});
//home page all details of students
router.get('/home',isAdmin, (req, res) => {
  var sql = `select * from images;`
  connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      //console.log(result);
      res.render('admin/home', { result })
    }
  })

})
//notification  page
router.get('/notification',isAdmin, (req, res) => {
  connection.query(`SELECT * FROM notification `, function (err, result, fields) {
    if (err) throw err;
    else {
     // console.log(result);
      res.render('admin/notification', { result })
    }

  });
})

//Addnotification  page
router.get('/addnotification',isAdmin, (req, res) => {
  res.render('admin/addNotification')
})
//add notification operation
router.post('/addnotification', async (req, res) => {
  console.log(req.body);
  date = Date.now().toString();
  var nowDate = new Date();
  var date1 = nowDate.getDate() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getFullYear();
  var sql = `INSERT INTO notification VALUES ("${date}","${req.body.title}","${req.body.About}","${req.body.cgpa}","${date1}")`;
  await connection.query(sql, async function (err, result) {
    if (err) throw err;
    else {
      // var title=req.body.date;
      // var sql=`create table ${title}(name varchar(200),phone bigint,branch varchar(100),rno bigint,cgpa float);`
      // await connection.query(sql,(err,result)=>{
      //   if (err) throw err;
      //   else{
      res.redirect('/admin/notification')
      //   }
      // })
    }
  })
})

//admin login operation
router.post('/loginA',async (req, res) => {
  var sql = `select * from admin where username="${req.body.username}"`;
  await connection.query(sql, function (err, result) {
    if (err) throw err;
    else {
      bcrypt.compare(req.body.password, result[0].password, function (err, status) {
        if (status) {
          req.session.admin = result[0];
          res.redirect('/admin/home')
        } else {
          res.redirect('/admin/')
        }
      });
    }
  })
})

//logout admin
router.get('/logoutA',(req,res)=>{
  req.session.destroy();
  res.redirect('/admin');
})
//delete notification
router.get('/deleteNotification/:id',isAdmin, async (req, res) => {
  let Id = req.params.id;
  var sql = `delete from notification where id="${Id}"`;
  await connection.query(sql, async function (err, result) {
    if (err) throw err;
    else {
          res.redirect('/admin/notification')
    }
  })
})
//student details page
router.get('/students',isAdmin, (req, res) => {
  res.render('admin/students')
})
//all students details
router.get('/allstudents',isAdmin, async (req, res) => {
  var sql = `select * from student`;
  await connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      res.render('admin/allstudents', { result })
    }
  })
})
//select students branch wise
router.post('/branch', async (req, res) => {
  console.log(req.body);
  let branch = req.body.selected;
  var sql = `select * from student where branch="${branch}";`
  await connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      res.render('admin/branchstudents', { result })
    }
  })
})
//delete student
router.get('/deletestudent/:ph',isAdmin, async (req, res) => {
  phone = req.params.ph;
  console.log(phone);
  var sql = `DELETE FROM student WHERE phone="${phone}";`
  await connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      res.redirect('/admin/allstudents')
    }
  })

})
//notification applayed students
// router.get('/notificationApplyed/:title',isAdmin, async (req, res) => {
//   res.send(req.params.title)
//   var title = req.params.title;
//   var sql = `select * from ${title};`
//   await connection.query(sql, (err, result) => {
//     if (err) throw err;
//     else {
//       res.render('admin/applayed', { result, title })
//     }
//   })
// })
//selecting single student for edit details
router.post('/search', (req, res) => {
  var sql = `select * from student where phone=${req.body.search};`
  connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      console.log(result);
      result = result[0];
      res.render('admin/singlestudent', { result })
    }
  })
})
//change student details
router.post('/changeDetails', (req, res) => {
  console.log(req.body);
  var sql=`UPDATE student SET
  rno = '${req.body.regno}',
  name = "${req.body.name}",
  branch = "${req.body.branch}",
  email = "${req.body.email}",
  cgpa = "${req.body.cgpa}"
WHERE
  phone = '${req.body.phone}';`
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.redirect('/admin/students')
    }
  })
})






app.use('/profile', express.static('public/images'));
// inserting the image
router.post('/insertimage', upload.single('pic'), async (req, res) => {

  var sql = `insert into images values("${req.file.filename}");`
  await connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      res.redirect("/admin/home");

    }
  })
})
//delete image of front page
router.get('/deleteimg/:img',isAdmin, (req, res) => {
  var image = req.params.img;
  var sql = `DELETE FROM images WHERE name="${image}";`
  connection.query(sql, (err, result) => {
    res.redirect('/admin/home');
  })
})

// edit student details
// router.post('/changeDetails',(req,res)=>{
//   console.log(req.body);
// })
module.exports = router;
