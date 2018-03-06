var express = require('express');
var router = express.Router();
var pages = require('../pages/pages');
var mongodb = require('mongodb');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/profileSettings',function (req,res) {
    if(logedInUser!=null){
        res.render('profileSettings',{title:"Change Settings",user:logedInUser});
    }
    else {
        res.redirect('/');
    }
})

router.post('/changeusersettings',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Cannot connect to db");
        }else {
            console.log("Connected");
            var db=client.db('startup');
            var collection = db.collection("users");
            var updUser={user:req.body.user,login:req.body.login,password:req.body.password};
            collection.updateOne({user:logedInUser.user,login:logedInUser.login,password:logedInUser.password},{$set:updUser},function(err, results) {
                if(err){
                    console.log("You are not registered")
                }

                else{
                    logedInUser.user = req.body.user;
                    logedInUser.login = req.body.login;
                    logedInUser.password = req.body.password;
                    res.redirect('/')
                }

                client.close()
            })
        }
    })
});


router.get('/newuser',pages.newUser);

router.post('/adduser',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Unable to connect to server");
        }
        else{
            console.log("Connected");
            var db = client.db('startup');

            var collection = db.collection("users");

            collection.insertOne({user:req.body.user , login: req.body.login, password: req.body.password},function (err,result) {
                if(err){
                    console.log("Cannot add new student to database",err);
                }else{
                    console.log("User had been added");
                }
                client.close()
            });
        }
    })
});


module.exports = router;
