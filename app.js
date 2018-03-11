var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();  // make express app
var http = require('http').Server(app);
var session = require("express-session");
var mongoose = require('mongoose');
var User = require("./models/users.js");
var Course = require("./models/course.js");
var File = require("./models/file.js");
var Assignment = require("./models/assignment.js");
var expressLayouts = require('express-ejs-layouts');
var fileUpload = require('express-fileupload');
mongoose.connect('mongodb://localhost:27017/plagio',{useMongoClient:true});
var levenshtein = require('fast-levenshtein');
var algos = require("./controllers/algos.js");
var async = require("async");
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 36000000 }, saveUninitialized:true,resave:true}))
// set up the view engine

//setting user login data to the local variables
app.use(function (request, response,next) {
//   request.session.user = {
//                             "_id" : mongoose.Types.ObjectId("59e3e1783db91012843e3bcc"),
//                             "username" : "pchand09",
//                             "email" : "poornachandu3@gmail.com",
//                             "phonenum" : "6605280912",
//                         };
  response.locals.user = request.session.user;
  response.locals.active = request.path.split('/')[1];
//   console.log(response.locals.active);
  next();
});

app.use(fileUpload());
app.use(express.static(__dirname + '/assets'));
app.set("views", path.resolve(__dirname, "views")); // path to views
app.set("view engine", "ejs"); // specify our view engine
app.use(bodyParser.urlencoded({ extended: false }));

// http GET (default and /new-entry)
app.use(expressLayouts);

app.get("/", function (request, response) {
    // let files = [
    //     {
    //         _id: "safsda",
    //         name: "course1",
    //         assignments: [{
    //             _id:"sdfsdw",
    //             name: "assign1",
    //             files: []
    //         }]
    //     }
    // ]
    if(request.session.user){
    async.parallel([function(callback){
        Course.find({"instructor_id": request.session.user._id}, function(err,courses){
            callback(err,courses);
        });
    }, function(callback){
        Assignment.find({}, function(err, assgns){
            callback(err, assgns);
        });
    }, function(callback){
        File.find({}, function(err, files){
            callback(err, files);
        });
    }], function(err,results){
            if(!err){
                // console.log("results", results);
                response.render("index", { layout: "layout", courses: results[0], assignments:results[1], files: results[2] });
            }
    });
    }else{
        response.render("index", { layout: "layout"});
    }
    
    
  
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/logout", function (req, res) {
  req.session.user = null;
  res.redirect("/login");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/login", function (req, res) {
  let user = {
      username: req.body.username,
      password: req.body.password
  }
  User.findOne(user, function (err, result) {
      if (!err) {
          console.log("user details", result);
          if (result != null) {
              req.session.user = result;
              res.app.locals.userid = result._id;
              console.log(req.session);
              res.send({ success: true, message: "login success", data: result });
          } else {
              res.send({ success: false, message: "Invalid Credentials", data: result });
          }
      }
  });


});


app.post("/signup", function (req, res) {
  var user = {};
  user.username = req.body.username
  user.email = req.body.email
  user.password = req.body.password
  user.phonenum = req.body.phonenum
  var newUser = User(user);
  newUser.save(function (err, result) {
      if (err) {
          res.send({ success: false, message: "signup failed due to unknow reason", data: result })
      }
      else {
          res.send({ success: true, message: "signup success", data: result });
      }
  })
})

app.post("/levenplag", function (request, response) {
  console.log(request.body);
  let src1 = request.body.source1;
  let src2 = request.body.source2;
  let gram = request.body.gram || 2;
  let gram2 = request.body.gram || 2;
  console.log(gram, gram2);
  let loopcount = 0;
  let src1A = actualArray(src1.split(" "));
  let src2A = actualArray(src2.split(" "));
  let Plags = [];
  let PlagsDA = [];
  for (let i = 0, k = 0; (src1A.length >= (i + gram2)); i = i + gram, k++) {
      let srcWord = src1A.slice(i, i + gram2).join(" ");
      console.log("i", i, srcWord);
      PlagsDA[k] = [];
      for (let j = 0, l = 0; (src2A.length >= (j + gram2)); j = j + gram, l++) {
          let dstWord = src2A.slice(j, j + gram2).join(" ");

          let maxLength = Math.max(dstWord.length, srcWord.length);
          let plag = (maxLength - levenshtein.get(srcWord, dstWord)) / maxLength;
          console.log("j", j, srcWord, dstWord, plag);
          if (plag) {
              Plags.push(plag);
              PlagsDA[k][l] = plag;
          } else {
              Plags.push(0);
              PlagsDA[k][l] = 0;
          }
          loopcount++;
      }
      loopcount++;
  }
  console.log("loopcount", loopcount);
  let sum = 0.0;
  let length = 0;

  for (let i = 0; i < Plags.length; i++) {
      sum += Plags[i]
  }

  for (let i = 0; i < Plags.length; i++) {
      if (Plags[i] > 0)
          length++;
  }
  let sumD = 0;
  let max = 0;
  console.log("PlagsDA", PlagsDA);
  for (let i = 0; i < PlagsDA.length; i++) {
      max = PlagsDA[i][0];
      for (let j = 0; j < PlagsDA[i].length; j++) {
          if (PlagsDA[i][j] > max) {
              max = PlagsDA[i][j];
          }
      }
      sumD += max;
  }
  console.log("old split plagarism", (sum / length) * 100);
  response.send({ plag: (sumD / PlagsDA.length) * 100 });
});

function actualArray(array) {
  let newArray = [];
  for (let i = 0; i < array.length; i++) {
      if (array[i] && array[i].length > 0) {
          newArray.push(array[i]);
      }
  }
  return newArray;
}


app.use(function(req,res, next){
  if(!req.session.user){
    res.redirect("/login");
  }else{
    next();
  }
}, require("./controllers/user.js"));


// 404 Error
app.use(function (request, response) {
  response.status(404).render("404");
});

// Listen for an application request on port 8081
http.listen(8081, function () {
  console.log('App listening on http://127.0.0.1:8081/');
});
;