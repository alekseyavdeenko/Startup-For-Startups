var express = require('express');

var router = express.Router();
var mongodb = require('mongodb');

var logedInUser=null;
/* GET home page. */

router.get("/login",function (req,res) {
    res.render('login',{title:'Login page'});
})

router.post('/log',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Cannot connect to db");
        }else {
            console.log("Connected");
            var db=client.db('startup');
            var collection = db.collection("users");

            collection.find({login:req.body.login,password:req.body.password}).toArray(function(err, results) {
                if(err){
                    console.log("You are not registered")
                }

                else if(results.length){

                    logedInUser = results[0];
                    res.redirect('/')
                }
                else {
                    console.log("Not reg");

                    res.redirect('/login');
                }
                client.close()
            })
        }
    })
});

router.get('/logout',function (req,res) {
    logedInUser = null;
    res.redirect('/');
})

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

router.get('/', function(req, res, next) {
    if(logedInUser!=null) res.render('index', { title: logedInUser.user });
    else res.render('index', { title: "Not logged in" });
});




router.get('/landing',function (req,res) {
    res.render('landing',{title:'Landing page'});
})



router.get('/removeuser',function (req,res) {
    res.render('removeuser',{title:'Delete user'});
})

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

router.get('/newuser',function (req,res) {
    res.render('newuser',{title:'Add user'});
})

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
})

router.get('/edituser',function (req,res) {
    res.render('edituser',{title:"Edit user"});
})

router.get('/editinguser',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Unable to connect database",err);
        }else{
            console.log("Connected");

            var db = client.db("startup");

            var collection = db.collection("users");

            collection.updateOne({user:req.body.user, login:req.body.login, password:req.body.password},function (err,result) {
                if(err){
                    console.log("Cannot make a change in database",err)
                }else{
                    res.redirect('/userlist');
                }
                client.close();
            });
        }
    })
})



module.exports = router;
