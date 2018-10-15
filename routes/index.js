var    express     = require("express");
var    router      = express.Router();
var    passport    = require("passport");
var    User        = require("../models/user");
var    Campground  = require("../models/campground");

router.get("/", function(req, res){
    res.render("landing");
});



//==============================
//AUTH ROUTES
//==============================


//Show Register form
router.get("/register", function(req, res){
    
    res.render("register");
    
});

router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email: req.body.email,
        avartar: req.body.avartar,
    });
    
    //eval(require('locus'));
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome to YelpCamp " + user.username);
          res.redirect("/campgrounds"); 
        });
    });
});


//Show Login Form
router.get("/login", function(req,res){
    res.render("login");
});

//passport.authenticate works as middleware
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req,res){
    
 
});


//Logout route
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    
    res.redirect("/login");
    
}


//User Profiles
router.get("/users/:id", function(req, res){
   User.findById(req.params.id, function(err, foundUser){
      if(err){
          req.flash("error", "Something went wrong");
          res.redirect("/");
      } 
       Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    })
   }); 
});

module.exports = router;