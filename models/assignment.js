var mongoose = require("mongoose");
var Schema = mongoose.Schema
var Course = require("./course.js");

var assignmentSchema = new Schema({
    "name" : {type:String, required:true, lowercase:true },
    "courseid": {type:Schema.Types.ObjectId, required:true, ref: Course }
});

var assignmentModel = mongoose.model("assignment", assignmentSchema);
module.exports = assignmentModel 