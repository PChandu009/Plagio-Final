var express = require("express");
var app = express();
var User = require("../models/users.js");
var Student = require("../models/student.js");
var Course = require("../models/course.js");
var File = require("../models/file.js");
var Assignment = require("../models/assignment.js");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Promise = require("promise");
var mammoth = require("mammoth");
var algos = require("./algos.js");
app.get("/addCourse", function (request, response) {
    response.render("addCourse", { layout: "coursesLayout" });

});

app.post("/newCourse", function (req, res) {
    let course = new Course();
    course.crn = req.body.crn;
    course.name = req.body.name;
    course.trisemester = req.body.trisemester;
    course.instructor_id = mongoose.Types.ObjectId(req.session.user._id);
    course.save(function (err, result) {
        if (err) {
            res.send({ success: false, message: "Course is not added", data: err });
        } else {
            res.send({ success: true, message: "Course added successfully", data: result });
        }
    });
});

app.get("/courses", function (req, res) {
    console.log("req.session.userid",req.session.user._id);
    Course.find({instructor_id:req.session.user._id}, function(err, results){
        if(!err){
            console.log(results);
            res.render("courses", { layout: "coursesLayout", Courses:results, err:null });
        }else{
            console.log("err", err);
            res.render("courses", { layout: "layout", courses:[], err: err });
        }
    });
});

app.get("/assignments/:courseid", function (req, res) {
    let courseId = req.params.courseid;
    console.log("courseId",courseId);
    console.log("req.session.userid", req.session.user._id);
    Course.findOne({ _id:courseId,  instructor_id:req.session.user._id}, function(crsErr, crsResult){
        if(!crsErr){
            console.log(crsResult);
            Assignment.find({courseid:crsResult._id}, function(AsgnErr,AsgnResult){
                if(!AsgnErr)
                    res.render("course", { layout: "courseLayout", course:crsResult, courseid:crsResult._id, assignments: AsgnResult,  err:null });
                else
                    res.render("course", { layout: "courseLayout", courses:[], err: AsgnErr });    
            });
        }else{
            console.log("err", crsErr);
            res.render("course", { layout: "courseLayout", course:[], err: crsErr });
        }
    });
});

app.get("/addAssignment/:courseid", function(req,res){
    //let course = getCourseById(req.params.courseid);
    
    Course.findOne({_id:req.params.courseid}, function(err, course){
        if(!err)
            res.render("addAssignment", { layout: "courseLayout", course: course, courseid:req.params.courseid });
        else
            res.render("assignments", { layout: "courseLayout", courses:[], err: AsgnErr });    
    })
    
});

app.post("/newAssignment", function (req, res) {
    assignemnt = new Assignment();
    assignemnt.name = req.body.name;
    assignemnt.courseid = mongoose.Types.ObjectId(req.body.courseid);
    assignemnt.save(function (err, result) {
        if (err) {
            res.send({ success: false, message: "Assignemnt is not added", data: err });
        } else {
            res.send({ success: true, message: "Assignemnt added successfully", data: result });
        }
    });
});

app.get("/files/:assignmentid", function(req,res){
    let aId = req.params.assignmentid;
    console.log("assignmentid", aId);
    Assignment.findOne({_id:aId}, function(AssignErr,AsgnResult){
        if(!AssignErr){
            console.log("assignment", AsgnResult);
            File.find({assignmentid:AsgnResult._id}, function(err,files){
                if(err){
                    res.render("assignment",{layout:"assignmentLayout", assignment:{}});
                }else{
                    Course.findOne({_id:AsgnResult.courseid}, function(CrsErr, CrsResult){
                        if(!CrsErr){
                            AsgnResult.course = CrsResult;
                            AsgnResult.files = files;
                            //console.log("assignment-with-course-details", AsgnResult);
                            res.render("assignment",{layout:"assignmentLayout", assignment:AsgnResult});
                        }else{
                            res.render("assignment",{layout:"assignmentLayout", assignment:AsgnResult});
                        }
                    });
                }
            });
        }else{
            res.render("assignments", { layout: "assignmentLayout", assignment:{}, err: AssignErr });    
        }
    });
});

app.post("/assignment/files", function(req,res){
    console.log(req.files.assignmentFiles.name);
    console.log(req.body);
    if (!req.files)
      return res.status(400).send('No files were uploaded.');
   
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
    let uFile = req.files.assignmentFiles;
    let destPath = '/uploads/assignFiles/'+uFile.name;
    // Use the mv() method to place the file somewhere on your server 
    uFile.mv('./assets'+destPath, function(err) {
        if (err){
            return res.status(500).send(err);
        }
        else{
            let student=new Student();
            student.name = uFile.name.split("_")[0];
            recordStudent(student).then(function(sDoc){
                let file = new File();
                file.name = uFile.name;
                file.path = destPath;
                file.studentid = sDoc._id;
                file.assignmentid =  mongoose.Types.ObjectId(req.body.assignmentId);
                console.log("file", file);
                mammoth.extractRawText({path: "./assets"+destPath})
                .then(function(result){
                    console.log(result);
                    var html = result.value.replace(/\n+(?=)/g, " "); // The generated HTML
                    result.value = html;
                    var messages = result.messages; // Any messages, such as warnings during conversion
                    console.log(typeof messages);
                    file.data = result;
                    //res.render("parsedocx", {layout:"layout", data:result});
                    file.save(function(err, fDoc){
                        if(err){
                            res.send({success:false, message:"File processing failed save", data:err});
                        }else{
                            res.send({success:true, message:"File Uploaded", data:fDoc});
                        }
                    });
                }, function(err){
                    res.send({success:false, message:"File processing failed", data:err});
                });
                
                
            }, function(err){
                res.send({success:false, message:"File reading failed", data:err});
            });
            
        }
    });
});

app.get("/fileDataWithHwords/:sfid/:dfid", function(req,res){
    File.findOne({_id:mongoose.Types.ObjectId(sfid)}, function(err, sFile){
        if(!err){
            File.findOne({_id:mongoose.Types.ObjectId(dfid)}, function(err, dFile){

            });
        }
    });
});

app.post("/checkPlagarismOfAssignment/:asgnmntid/:gramsize", function(req,res){
    let asgnmntid = req.params.asgnmntid;
    let gramSize = req.params.gramsize || 2;
    File.find({assignmentid:mongoose.Types.ObjectId(asgnmntid)}, function(err, results){
        let files = [];
        for(let i=0; i<results.length; i++){
            let file = {};
            for(let j=0; j<results.length; j++){
                if(i!=j){
                    let result1 = results[i];
                    let result2 = results[j];
                    if(result1.data && result1.data.value && result2.data && result2.data.value){
                        let src1 = result1.data.value.trim();
                        let src2 = result2.data.value.trim();
                        let lev = algos.levenshtein(src1,src2,gramSize);
                        let fuzzy = algos.fuzzySet(src1,src2,gramSize);
                        console.log("check plagarism", lev, fuzzy );
                        file= { aid: asgnmntid, sfid: result1._id, waid: result2._id, plags:  {lev:lev, fuzzy: fuzzy, max: Math.max(lev.plag,fuzzy.plag) }};
                        File.update({_id:file.sfid}, {$addToSet:{plags:{waid: file.waid, plags:file.plags}}}, function(err,result){
                            console.log("err", err);
                            console.log("result", result);
                        });
                        files.push(file);
                    }
                }
            }
        }

        res.send(files);
    });
    
});

app.get("/filedata/:fid", function(req,res){
    File.findOne({_id:req.params.fid}, function(err, file){
        if(!err){
            res.send({success:true, data: file.data.value});
        }else{
            res.send({success:false, data: err});
        }
    });
});

function recordStudent(student){
    let studentQuery = Student.findOneAndUpdate({name:student.name}, {name:student.name} , {upsert:true,new:true});
    return new Promise(function(resolve,reject){
        studentQuery.exec(function(err,doc){
           if(err)
                reject(err);
           else {
                console.log(doc);
                resolve(doc);
           }
        });
    });
}

function getCourseById(courseid){
    if(courseid){
        let courseP =  Course.findOne({_id:courseid}).exec();
        return courseP.then(function(doc){
            console.log("doc",doc);
            return doc;
        });
    }
}

module.exports = app

