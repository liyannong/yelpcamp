var    express = require("express");
var    router  = express.Router();
var    Campground  = require("../models/campground");
var middleware = require("../middleware/index.js");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//==============================
//CAMPGROUNDS ROUTES
//==============================
router.get("/", function(req, res){
    
    //Get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){
        
        if(err){
            console.log(err);
        }else{
             //You have to add view engine to omit the suffix
             //The latter campgrounds is the data we sent in, which is the var above
           res.render("campgrounds/index", {campgrounds : allCampgrounds, currentUser : req.user});  
        }
    });


 
});

//CREATE - add new campground to DB
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//New has to be placed before :id
//Or it will be override
router.get("/new", middleware.isLoggedIn, function(req, res){
   //Needs to add ejs here, why?
   //Beacause you forgot to save it!!
   res.render("campgrounds/new"); 
});


//If you see campground == null, that is because each time you delete and create new data(although they are same data).
//Their Id in the database has changed so you can't access them, just go to /campgrounds page before you go to the detail page
//See https://www.udemy.com/the-web-developer-bootcamp/learn/v4/questions/2028596 for complete explanation
router.get("/:id", function(req, res){
   
   //Fuck!!! this should be "comments"!!!! with s!!!!!
   //Took 1 hour to find this stupid stuff!@!!!!!!!!!
   /////
   //PAY ATTN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   //////
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       
       if(err)
            console.log(err);
       else{
           console.log(foundCampground);
       
            res.render("campgrounds/show", {campground : foundCampground});
       }
   });
  
});


//EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit",{campground: foundCampground});
        });
});

//Update Route
//Here don't add /edit after id, since you want to put it in /:id page
// UPDATE CAMPGROUND ROUTE
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//Destroy Route
router.delete("/:id",  middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    });
});




module.exports = router;