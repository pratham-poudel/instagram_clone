const mongoose=require('mongoose');
const plm=require('passport-local-mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/instaclone");

const userSchema=mongoose.Schema({
  username: String,
  nicknames:String,
  name: String,
  email:String,
  password:String,
  bio:String,
  profileImage:String,
  posts:[{ type:mongoose.Schema.Types.ObjectId , ref:"posts"


  }],


});
userSchema.plugin(plm);
module.exports=mongoose.model("user",userSchema);