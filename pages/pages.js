module.exports.login=function (req,res) {
    res.render('login',{title:'Login page'});
};

module.exports.landing = function (req,res) {
    res.render('landing',{title:'Landing page'});
};

module.exports.delUser = function (req,res) {
    res.render('removeuser',{title:'Delete user'});
};


module.exports.newUser = function (req,res) {
    res.render('newuser',{title:'Add user'});
};

module.exports.profile = function (req,res) {
    res.render('userProfile',{title:"Profile",logedUser:req.session.logedInUser});
};

module.exports.signup = function (req,res) {
    res.render('signup',{title:"Sign Up"});
};