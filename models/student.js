var mongoose = require("mongoose");
var Schema = mongoose.Schema

var studentSchema = new Schema({
    "name": {type:String, required:true, index: { unique:true }},
});

var studentModel = mongoose.model("student",studentSchema);
module.exports = studentModel