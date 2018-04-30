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


router.get('/:user',function (req,res){
    var MongoClient = mongodb.MongoClient;

    MongoClient.connect(connectUrl, function (err, client) {
        if (err) {
            console.log("Cannot connect to db");
        } else {
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection("users");
            collection.find({login:req.params.user}).toArray(function (err,result) {
                if(err){
                    console.log(err);
                    res.send("Cannot find user");
                }else if(result[0]!=null||result[0]!=undefined){
                    res.render('userProfile',{title:"Profile",logedUser:req.session.logedInUser,user:result[0],professions:professions});
                }
                else{
                    res.render('userProfile',{title:"Profile",logedUser:req.session.logedInUser,user:req.session.logedInUser,professions:professions})
                }
            })
        }
    });
});

router.get('/:user/profileSettings',function (req,res) {

    if(req.session.logedInUser!=null){
        res.render('profileSettings',{title:"Change Settings",user:req.session.logedInUser,errors:errors,ownErrors:ownErrors,success:success});
        errors=null;
        ownErrors=null;
        success=null;
    }
    else {
        res.redirect('/');
    }
});





router.post('/:user/uploadback',function (req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(files.meImage!=undefined) {
            var oldpath = files.meImage.path;
            var newpath = 'c:\\users\\pc\\webstormprojects\\startup-for-startups\\uploads\\';
            var extension = files.meImage.name.substr(files.meImage.name.length - 3);
            console.log(extension);
            if(extension!='jpg'&&extension!='png'&&extension!='jpeg'&&extension!='PNG'){
                ownErrors=['We support only jpg and png extensions'];

                success=false;
                res.redirect("/user/"+req.session.logedInUser.login+"/profileSettings");
            }
            else {
                errors=null;
                ownErrors=null;
                success=null;
                var name = req.session.logedInUser.login;

                newpath = 'c:\\users\\pc\\webstormprojects\\startup-for-startups\\public\\uploads\\' + name + '.' + extension;

                fs.rename(oldpath, newpath, function (err) {
                    if (err) res.send(err);
                    else {

                        newpath = '../../uploads/' + name + '.' + extension;


                        var MongoClient = mongodb.MongoClient;

                        MongoClient.connect(connectUrl, function (err, client) {
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
                                    points:req.session.logedInUser.points,
                                    back: newpath
                                };
                                collection.updateOne({
                                    user: req.session.logedInUser.user,
                                    login: req.session.logedInUser.login,
                                    password: req.session.logedInUser.password,
                                    points:req.session.logedInUser.points,
                                    back: req.session.logedInUser.back
                                }, {$set: updUser}, function (err, results) {
                                    if (err) {
                                        console.log("You are not registered")
                                    }

                                    else {
                                        req.session.logedInUser.back = newpath;
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
            ownErrors=['We support only jpg and png extensions'];
            success=false;
            res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings');
        }
    })});






router.post('/:user/uploadimage',function (req,res) {
        if (req.session.logedInUser) {
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                    if (files.myImage != undefined) {
                        var oldpath = files.myImage.path;
                        var newpath = 'c:\\users\\pc\\webstormprojects\\startup-for-startups\\uploads\\';
                        var extension = files.myImage.name.substr(files.myImage.name.length - 3);
                        console.log(extension);
                        if (extension != 'jpg' && extension != 'png' && extension != 'jpeg' && extension != 'PNG') {
                            ownErrors = ['We support only jpg and png extensions'];

                            success = false;
                            res.redirect("/user/" + req.session.logedInUser.login + "/profileSettings");
                        }
                        else {
                            errors = null;
                            ownErrors = null;
                            success = null;
                            var name = req.session.logedInUser.login;

                            newpath = 'c:\\users\\pc\\webstormprojects\\startup-for-startups\\public\\uploads\\' + name + '.' + extension;

                            fs.rename(oldpath, newpath, function (err) {
                                if (err) res.send(err);
                                else {

                                    newpath = '../../uploads/' + name + '.' + extension;


                                    var MongoClient = mongodb.MongoClient;

                                    MongoClient.connect(connectUrl, function (err, client) {
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
                                                points: req.session.logedInUser.points,
                                                img: newpath
                                            };
                                            collection.updateOne({
                                                user: req.session.logedInUser.user,
                                                login: req.session.logedInUser.login,
                                                password: req.session.logedInUser.password,
                                                points: req.session.logedInUser.points,
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
                    else {
                        ownErrors = ['We support only jpg and png extensions'];
                        success = false;
                        res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings');
                    }
                }
            )
        }
    }
    );

router.post('/:user/changeusersettings',function (req,res) {
    if(req.session.logedInUser) {
        if (req.body.password != '') {
            req.check('password', 'Password should be 4-14 digits length').isLength({min: 4, max: 14});
            req.check('password', 'Password confirmation failed').equals(req.body.password_confirm);
            req.check('oldPassword', 'Old password is incorrect').equals(atob(req.session.logedInUser.password));
        }
        req.check('user', 'Field name should not be empty').isLength({min: 1, max: 20});
        if (req.body.mail != '')
            req.check('mail', 'Invalid email').isEmail();

        if (req.validationErrors()) {
            console.log(req.validationErrors());
            errors = req.validationErrors();
            success = false;
            res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings');
        }

        else {
            errors = null;
            ownErrors = null;
            success = null;
            var MongoClient = mongodb.MongoClient;

            MongoClient.connect(connectUrl, function (err, client) {
                if (err) {
                    console.log("Cannot connect to db");
                } else {
                    console.log("Connected");
                    var db = client.db('startup');
                    var collection = db.collection("users");
                    var updUser = {
                        user: req.body.user,
                        login: req.session.logedInUser.login,
                        password: btoa(req.body.password),
                        img: req.session.logedInUser.img,
                        points: req.session.logedInUser.points,
                        profession: req.body.profession,
                        asked: req.session.logedInUser.asked,
                        answered: req.session.logedInUser.answered,
                        mail: req.body.mail
                    };
                    if (req.body.password == '') {
                        updUser.password = req.session.logedInUser.password;
                    }

                    if (req.body.profession == "Choose profession") {
                        updUser.profession = null;
                    }

                    console.log(atob(updUser.password));
                    collection.updateOne({
                        user: req.session.logedInUser.user,
                        login: req.session.logedInUser.login,
                        password: req.session.logedInUser.password,
                        img: req.session.logedInUser.img,
                        profession: req.session.logedInUser.profession,
                        asked: req.session.logedInUser.asked,
                        answered: req.session.logedInUser.answered,
                        mail: req.session.logedInUser.mail
                    }, {$set: updUser}, function (err, results) {
                        if (err) {
                            console.log("You are not registered")
                        }

                        else {

                            req.session.logedInUser = updUser;
                            console.log(req.body.profession);
                            res.redirect('/user/' + req.session.logedInUser.login + '/profileSettings')
                        }

                        client.close()
                    })
                }
            })
        }
    }
});



module.exports = router;
