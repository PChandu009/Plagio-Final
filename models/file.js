var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Student = require("./student.js");
var Assignment = require("./assignment.js");

var fileSchema = new Schema({
    "name" : {type:String, required:true, index: {unique:true } },
    "path" : {type:String, required:true },
    "data" : {type:Object, required:true },
    "assignmentid": {type:Schema.Types.ObjectId, ref: Assignment },
    "studentid": {type:Schema.Types.ObjectId, ref: Student },
    "plags": {type: Array}
});

var fileModel = mongoose.model("file", fileSchema);
module.exports = fileModel 