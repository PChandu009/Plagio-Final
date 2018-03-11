var mongoose = require("mongoose");
var Schema = mongoose.Schema

var userSchema = new Schema({
    "username": {type:String, required:true, index: { unique:true }},
    "email" : {type:String, required:true, lowercase:true, index: {unique:true } },
    "password": {type:String, required:true},
    "phonenum":{type:String, required:true}
});

var userModel = mongoose.model("user",userSchema);
module.exports = userModel