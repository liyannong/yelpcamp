//Before running any files, you have to 
//SAVE THEM FIRST!!!!!!
require('dotenv').config();

var  express     = require("express"),
     app         = express(),
     bodyParser  = require("body-parser"),
     mongoose    = require("mongoose"),
     flash       = require("connect-flash"),
     passport    = require("passport"),
  LocalStrategy  = require("passport-local"),
  methodOverride = require("method-override"),
     Campground  = require("./models/campground"),
     Comment     = require("./models/comment"),
     User        = require("./models/user"),
     seedDB      = require("./seeds");


var  commentRoutes  =  require("./routes/comments"),
     campgroundRoutes  = require("./routes/campgrounds"),
     indexRoutes     =  require("./routes/index");


mongoose.connect("mongodb://liyannong:Souga123.@ds119343.mlab.com:19343/yelpcamp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();
app.locals.moment = require('moment');

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


///////////////////////
//You have to put this middleware after passport.use, or it will not work in every page
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//==============================
//IMPORT ROUTES FILES
//==============================
app.use(indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The yelpcamp server has started!");
});