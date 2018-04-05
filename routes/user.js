var express = require('express');
var router = express.Router();
var pages = require('../pages/pages');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var mongodb = require('mongodb');
/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.logedInUser!=null){
      res.redirect('/'+req.session.logedInUser.login.toString());
  }
});


router.get('/:user',pages.profile);

router.get('/:user/profileSettings',function (req,res) {

    if(req.session.logedInUser!=null){
        res.render('profileSettings',{title:"Change Settings",user:req.session.logedInUser,errors:req.session.errors,ownErrors:req.session.ownErrors,success:req.session.success});
        req.session.errors=null;
        req.session.ownErrors=null;
        req.session.success=null;
    }
    else {
        res.redirect('/');
    }
});

router.post('/:user/uploadimage',function (req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(files.myImage!=undefined) {

            var oldpath = files.myImage.path;

            var newpath = 'c:\\users\\pc\\webstormprojects\\startup-for-startups\\uploads\\';

            var extension = files.myImage.name.substr(files.myImage.name.length - 3);

            if(extension!='jpg'&&extension!='png'){
                req.session.ownErrors=['We support only jpg and png extensions'];
                req.session.success=false;
                res.redirect("/user/"+req.session.logedInUser.login+"/profileSettings");
            }
            else {

                req.session.errors=null;
                req.session.ownErrors=null;
                req.session.success=null;
            var name = req.session.logedInUser.login;

            newpath = 'c:\\users\\pc\\webstormprojects\\startup-for-startups\\public\\uploads\\' + name + '.' + extension;

                fs.rename(oldpath, newpath, function (err) {
                    if (err) res.send(err);
                    else {

                        newpath = '../../uploads/' + name + '.' + extension;


                        var MongoClient = mongodb.MongoClient;

                        var url = 'mongodb://localhost:27017/startup';

                        MongoClient.connect(url, function (err, client) {
                            if (err) {
                                console.log("Cannot connect to db");
                            } else {
                                console.log("Connected");
                                var db = client.db('startup');
                                var collection = db.collection("users");
                                var updUser = {
                                    user: req.session.logedInUser.user,
                                    login: req.session.logedInUser.login,
                                    password: req.session.logedInUser.password,
                                    img: newpath
                                };
                                collection.updateOne({
                                    user: req.session.logedInUser.user,
                                    login: req.session.logedInUser.login,
                                    password: req.session.logedInUser.password,
                                    img: req.session.logedInUser.img
                                }, {$set: updUser}, function (err, results) {
                                    if (err) {
                                        console.log("You are not registered")
                                    }

                                    else {
                                        req.session.logedInUser.img = newpath;
                                        res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings');
                                    }

                                    client.close()
                                })
                            }
                        })

                    }
                });
            }
        }

        else{
            res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings');
        }
})});

router.post('/:user/changeusersettings',function (req,res) {

    req.check('password','Password should be 4-14 digits length').isLength({min:4,max:14});
    req.check('password','Password confirmation failed').equals(req.body.password_confirm);
    req.check('login','Login should be 4-14 digits length').isLength({min:4,max:14});
    req.check('user','Field name should not be empty').isLength({min:1,max:20});

    if(req.validationErrors()){
        console.log(req.validationErrors());
        req.session.errors=req.validationErrors();
        req.session.success=false;
        res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings');
    }

    else {
        req.session.errors=null;
        req.session.ownErrors=null;
        req.session.success=null;
        var MongoClient = mongodb.MongoClient;

        var url = 'mongodb://localhost:27017/startup';
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log("Cannot connect to db");
            } else {
                console.log("Connected");
                var db = client.db('startup');
                var collection = db.collection("users");
                var updUser = {
                    user: req.body.user,
                    login: req.body.login,
                    password: req.body.password,
                    img: req.session.logedInUser.img,
                    profession: req.body.profession
                };
                console.log(req.body.profession);
                collection.updateOne({
                    user: req.session.logedInUser.user,
                    login: req.session.logedInUser.login,
                    password: req.session.logedInUser.password,
                    img: req.session.logedInUser.img,
                    profession: req.session.logedInUser.profession
                }, {$set: updUser}, function (err, results) {
                    if (err) {
                        console.log("You are not registered")
                    }

                    else {

                        req.session.logedInUser = updUser;
                        console.log(req.session.logedInUser.profession);
                        res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings')
                    }

                    client.close()
                })
            }
        })
    }
});



module.exports = router;
