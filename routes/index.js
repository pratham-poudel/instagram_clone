var express = require('express');
var router = express.Router();
const userModel=require('./users');
const postModel=require('./post');

const upload=require('./multer');
const passport = require('passport');
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));






router.post('/update',upload.single('file'),async function(req,res){
  if(!req.file){
  return res.status(400).send('No files were uploaded');
  
  }
  const user=await userModel.findOne({username:req.session.passport.user});
  user.nicknames=req.body.username;
  user.name=req.body.name;
  user.bio=req.body.bio;
  
  user.profileImage=req.file.filename;
  await user.save();
  res.redirect("/profile");
  
  });






passport.use(new localStrategy(userModel.authenticate()));

router.post('/register',function(req,res){
var userdata=new userModel({
  username: req.body.username,
  nicknames:req.body.username,
  name: req.body.name,
  email:req.body.email,
  password:req.body.password,

});

userModel.register(userdata,req.body.password).then(function(registereduser){
passport.authenticate("local")(req,res,function(){
  res.redirect('/profile');
})

})

});

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.post('/login', passport.authenticate("local",
{
  successRedirect:"/profile",
  failureRedirect:"/"

}
),function(req, res) {
  res.render('index');
});

router.get('/feed', async function(req, res) {
  const user= await userModel.findOne({username:req.session.passport.user})
  const posts=await postModel.find().populate("user");
  console.log(posts);
  res.render('feed', {footer: true,posts,user});
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user= await userModel.findOne({username:req.session.passport.user}).populate("posts");
  console.log(user);
  res.render('profile',{footer: true,user});
});

router.get('/search', async function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit', function(req, res) {
  res.render('edit', {footer: true});
});

router.get('/upload', function(req, res) {
  res.render('upload', {footer: true});
});

router.post('/upload', upload.single('image'), async function(req, res) {
  
      const users = await userModel.findOne({ username: req.session.passport.user });
      const post = await postModel.create({
          picture: req.file.filename,
          caption: req.body.caption,
          user: users._id,
      });

     

      users.posts.push(post._id);
      await users.save();

      res.redirect('/feed');
  
});

router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err){
      return next(err);
    }
    res.redirect('/');
  });

  
  
  });
  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/");
  }



  router.get('/username/:username', async function(req, res) {
    const regex = new RegExp(`^${req.params.username}`, "i");
    const user=await userModel.find({username:regex});
    res.json(user);        
  });


  router.get('/like/:id', async function(req, res) {
    const post=await postModel.findOne({_id:req.params.id})
    const user= await userModel.findOne({username:req.session.passport.user}) 

    if(post.likes.indexOf(user._id)===-1){
      post.likes.push(user._id);
    }else{
      post.likes.splice(post.likes.indexOf(user._id),1);
    }
    await post.save();
    res.redirect('/feed');     
  });

module.exports = router;
