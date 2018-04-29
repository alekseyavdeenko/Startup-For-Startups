var express = require('express');
var pages = require('../pages/pages');
var router = express.Router();
var mongodb = require('mongodb');

router.get("/",function (req,res) {
   res.render('login',{success:success,ownErrors:ownErrors});
    errors=null;
    ownErrors=null;
    success=null;
});


router.post('/log',function (req,res,next) {
    errors=null;
    ownErrors=null;
    success=null;
    var MongoClient = mongodb.MongoClient;



    MongoClient.connect(connectUrl,function (err,client) {
        if(err){
            console.log("Cannot connect to db");
        }else {
            console.log("Connected");
            var db=client.db('startup');
            var collection = db.collection("users");

            collection.find({login:req.body.login,password:btoa(req.body.password)}).toArray(function(err, results) {
                if(err){
                    console.log("You are not registered")
                }

                else if(results.length){

                    req.session.logedInUser=results[0];
                    req.session.ifLogedIn=true;
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

                    success=false;
                    ownErrors=['User with such login is not registered'];
                    console.log("Not reg");
                    res.redirect('/login');
                }
                client.close()
            })
        }
    })
});


module.exports = router;