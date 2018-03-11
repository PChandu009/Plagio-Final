var mongoose = require("mongoose");
var Schema = mongoose.Schema
var User = require("./users.js");

var courseSchema = new Schema({
    "crn": {type:String, required:true},
    "name" : {type:String, required:true },
    "trisemester" : {type:String, required:true},
    "instructor_id": {type:Schema.Types.ObjectId, ref: User }
});

var courseModel = mongoose.model("course", courseSchema);
module.exports = courseModel 