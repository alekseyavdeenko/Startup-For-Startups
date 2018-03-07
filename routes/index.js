var express = require('express');

var router = express.Router();
var mongodb = require('mongodb');
var pages = require('../pages/pages');
global.logedInUser=null;
// global.logedInUser={
//     user:"Max Riepkin",
//     login:"repkin1998",
//     password:"rms1998"
// }
/* GET home page. */



router.get('/logout',function (req,res) {
    logedInUser = null;
    res.redirect('/');
})



router.get('/', function(req, res, next) {
    if(logedInUser!=null) res.render('index', { title: logedInUser.user, login:logedInUser.login.toString() });
    else res.render('index', { title: "Not logged in" });
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

            collection.insertOne({user:req.body.user , login: req.body.login, password: req.body.password , img:'../../images/default_avatar.gif'},function (err,result) {
                if(err){
                    console.log("Cannot add new student to database",err);
                }else{
                    res.redirect('/login');
                    console.log("User had been added");
                }
                client.close()
            });
        }
    })
});


router.get('/landing',pages.landing);


router.get('/removeuser',pages.delUser);

router.post('/deleteuser',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Failed to connect server",err);
        }else {
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection('users');

            collection.removeOne({user:req.body.user,login:req.body.login,password:req.body.password},function (err,result) {
                if(err){
                    console.log("Cannot delete");
                }else{
                    console.log("Deleted");
                }
                client.close();
            })
        }
    })
})


router.get('/drop',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Unable to connect to the server",err)
        }else{
            console.log("Connected");
            var db = client.db('startup');
            db.collection('users').drop();
            res.redirect('/');
        }
    });
});

router.get('/userlist',function (req,res) {
   var MongoClient = mongodb.MongoClient;

   var url = 'mongodb://localhost:27017/startup';

   MongoClient.connect(url,function (err,client) {
       if(err){
         console.log("Unable to connect to the server",err)
       }else{
         console.log("Connected");
         var db = client.db('startup');
         var collection = db.collection('users');

         collection.find({}).toArray(function (err,result) {
             if(err){
               res.send(err)
             }else if(result.length){
               res.render('userlist',{
                 "userlist":result
               });
             }else {
               res.send("No documents found");
             }
             client.close()
         });
       }
   });
});



module.exports = router;
