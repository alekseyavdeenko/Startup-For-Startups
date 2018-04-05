var express = require('express');
var pages = require('../pages/pages');
var router = express.Router();
var mongodb = require('mongodb');

router.get("/",function (req,res) {
   res.render('login',{success:req.session.success,ownErrors:req.session.ownErrors});

});


router.post('/log',function (req,res,next) {
    req.session.errors=null;
    req.session.ownErrors=null;
    req.session.success=null;
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

                    req.session.logedInUser=results[0];
                    req.session.ifLogedIn=true;
                    console.log(req.session.logedInUser.login);
                    if(req.body.remember){
                        req.session.cookie.maxAge = 365*24*60*60*1000;
                    }
                    if(req.session.whereFrom!=null){
                        var w=req.session.whereFrom;
                        req.session.whereFrom=null;
                        res.redirect('/'+w);
                    }
                    else{
                        res.redirect('/');
                    }
                }
                else {

                    req.session.success=false;
                    req.session.ownErrors=['User with such login is not registered'];
                    console.log("Not reg");
                    res.redirect('/login');
                }
                client.close()
            })
        }
    })
});


module.exports = router;