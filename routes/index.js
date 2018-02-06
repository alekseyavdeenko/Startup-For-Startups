var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

var nameOfRegisteredUser="";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: nameOfRegisteredUser });
});

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


                    console.log(nameOfRegisteredUser);
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
                    res.redirect("/userlist");
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
                    res.redirect("userlist");
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
