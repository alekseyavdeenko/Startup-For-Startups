var express = require('express');
var router = express.Router();
var pages = require('../pages/pages');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var mongodb = require('mongodb');
/* GET users listing. */
router.get('/', function(req, res, next) {
  if(logedInUser!=null){
      res.redirect('/'+logedInUser.login.toString());
  }
});


router.get('/:user',pages.profile);

router.get('/:user/profileSettings',function (req,res) {
    if(logedInUser!=null){
        res.render('profileSettings',{title:"Change Settings",user:logedInUser});
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

            var name = logedInUser.login;

            newpath = 'c:\\users\\pc\\webstormprojects\\startup-for-startups\\public\\uploads\\' + name + '.' + extension;
            if (extension == 'jpg' || extension == 'png') {
                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
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
                                    user: logedInUser.user,
                                    login: logedInUser.login,
                                    password: logedInUser.password,
                                    img: newpath
                                };
                                collection.updateOne({
                                    user: logedInUser.user,
                                    login: logedInUser.login,
                                    password: logedInUser.password,
                                    img: logedInUser.img
                                }, {$set: updUser}, function (err, results) {
                                    if (err) {
                                        console.log("You are not registered")
                                    }

                                    else {
                                        logedInUser.img = newpath;
                                        res.redirect('/user/' + logedInUser.login + '/profileSettings');
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
            res.redirect('/user/' + logedInUser.login + '/profileSettings');
        }
})});

router.post('/:user/changeusersettings',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Cannot connect to db");
        }else {
            console.log("Connected");
            var db=client.db('startup');
            var collection = db.collection("users");
            var updUser={user:req.body.user,login:req.body.login,password:req.body.password,img:logedInUser.img};
            collection.updateOne({user:logedInUser.user,login:logedInUser.login,password:logedInUser.password,img:logedInUser.img},{$set:updUser},function(err, results) {
                if(err){
                    console.log("You are not registered")
                }

                else{
                    logedInUser.user = req.body.user;
                    logedInUser.login = req.body.login;
                    logedInUser.password = req.body.password;
                    res.redirect('/user/'+logedInUser.login+'/profileSettings')
                }

                client.close()
            })
        }
    })
});



module.exports = router;
