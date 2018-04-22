var express = require('express');

var router = express.Router();
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var pages = require('../pages/pages');
var validator=require("express-validator");
/* GET home page. */

global.errors=null;
global.ownErrors=null;
global.success=true;
global.connectUrl="mongodb://startup:startup228@ds247759.mlab.com:47759/startup";
router.get('/logout',function (req,res) {
    //logedInUser = null;
    console.log(req.session.logedInUser.user);
    req.session.destroy();
    res.redirect('/');
})






function logedIn(req,res) {
    if(req==undefined)return false;
    if(req.session.logedInUser)return true;
    return false
};


router.get('/', function(req, res, next) {

    if(logedIn(req,res)) {
        console.log(req.session.cookie.maxAge);
        res.render('index', { title: req.session.logedInUser.user, login:req.session.logedInUser.login.toString() });
    }
    else res.render('index', { title: "Not logged in" });
});

router.get('/feed',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    MongoClient.connect(connectUrl,function (err,client) {
        if(err){
            console.log("Unable to connect to the server",err)
        }else{
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection('questions');
            if(!logedIn(req,res)||req.session.logedInUser.profession==null||req.session.logedInUser.profession==''){
                collection.find().toArray(function (err,result) {
                    console.log(result);
                    if(err){
                        res.send(err)
                    }else if(result[0]){
                        res.render('newsLine',{
                            title:"Feed",
                            questionList:result
                        });
                    }else {
                        console.log("No questions");
                        res.send("No documents found");
                    }
                    client.close()
                });
            }
            else{
                console.log(req.session.logedInUser.profession);
                collection.find({theme:req.session.logedInUser.profession}).toArray(function (err,result) {
                    if(err){
                        res.send(err)
                    }else if(result.length){
                        res.render('newsLine',{
                            title:"Feed",
                            questionList:result
                        });
                    }else {
                        console.log("No questions on selected theme");
                        collection.find().toArray(function (err,result) {
                            if(err){
                                res.send(err)
                            }else if(result.length){
                                res.render('newsLine',{
                                    title:"Feed",
                                    questionList:result
                                });
                            }else {
                                console.log(req.session.logedInUser);
                                console.log(result);
                                res.send("No documents found");
                            }
                    })
                    }
                    client.close()
                });
            }

        }
    });
})

router.get('/signup',function (req,res) {
    res.render('signup', { success:success, errors:errors ,ownErrors:ownErrors});

});

router.post('/adduser',function (req,res) {
    errors=null;
    ownErrors=null;
    success=null;

    var MongoClient = mongodb.MongoClient;


    req.check('password','Password should be 4-14 digits length').isLength({min:4,max:14});
    req.check('password','Password confirmation failed').equals(req.body.confirm_password);
    req.check('login','Login should be 4-14 digits length').isLength({min:4,max:14});
    req.check('user','Field name should not be empty').isLength({min:1,max:20});

    if(req.validationErrors()){
        console.log(req.validationErrors());
        errors=req.validationErrors();
        success=false;
        res.redirect('/signup');
    }
    else {


        MongoClient.connect(connectUrl, function (err, client) {
            if (err) {
                console.log("Unable to connect to server");
            }
            else {
                console.log("Connected");
                var db = client.db('startup');

                var collection = db.collection("users");
                collection.find({login:req.body.login}).toArray(function (err,result) {
                    if (err) {
                        console.log("Cannot add to db");
                    }
                    console.log(result);
                    if (result!=null && result[0]!=null) {


                        req.session.success=false;
                        myErrors=['User with such login is already registered'];
                        res.redirect('/signup');

                        console.log("Already registered");
                        client.close();
                    }
                    else {

                        collection.insertOne({
                            user: req.body.user,
                            login: req.body.login,
                            password: req.body.password,
                            img: '../../images/default_avatar.gif',
                            points: 0
                        }, function (err, result) {
                            if (err) {
                                console.log("Cannot add new student to database", err);
                            } else {
                                res.redirect('/login');
                                console.log(req.body.login);
                            }
                            client.close()
                        });
                    }
                });


            }
        })
    }
});



router.get('/landing',pages.landing);

router.get('/ask',function (req,res) {
    res.render('ask', { success:success, errors:errors ,ownErrors:ownErrors});
    errors=null;
    ownErrors=null;
    success=null;
});

router.get('/removeuser',pages.delUser);


function getDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var minutes = today.getMinutes();

    if(dd<10) {
        dd = '0'+dd
    }
    if(mm<10) {
        mm = '0'+mm
    }
    var date={
        day: dd,
        month:mm,
        year:yyyy,
        hour:hour,
        minutes:minutes
    };
    return date;
}


router.post('/ask_question',function (req,res) {
    if(logedIn(req,res)) {
        if(req.session.logedInUser.points!=null&&req.session.logedInUser.points>=1){
            errors=null;
            ownErrors=null;
            success=null;
            req.check('theme','Theme should be selected').isLength({min:1});
            req.check('question','Question field should not be empty').isLength({min:1});
            if(req.validationErrors()){
                console.log(req.validationErrors());
                errors=req.validationErrors();
                success=false;
                res.redirect('ask');
            }
            else {
                var MongoClient = mongodb.MongoClient;
                MongoClient.connect(connectUrl, function (err, client) {
                    if (err) {
                        console.log("Failed to connect to server", err);
                    } else {
                        console.log("Connected");
                        var db = client.db('startup');
                        var collection = db.collection('questions');

                        var d = getDate();
                        console.log(d);
                        collection.insert({
                            theme: req.body.theme,
                            question: req.body.question,
                            date: d,
                            author: req.session.logedInUser,
                            answers: [],
                            howManyAns: 0,
                            closed:false,
                            lastAnswer: null
                        }, function (err, result) {
                            if (err) {
                                console.log("Cannot add a question");
                            }
                            else {
                                collection = db.collection('users');
                                console.log(req.session.logedInUser);
                                req.session.logedInUser.points--;
                                console.log(req.session.logedInUser);
                                collection.updateOne({login: req.session.logedInUser.login}, {$set: {points: req.session.logedInUser.points}}, function (err, result) {
                                    if (err) {
                                        res.send(err);
                                    }
                                    else {
                                        res.redirect('/');
                                    }
                                });

                            }
                        });
                    }
                })
            }
        }else{
            console.log(req.session.logedInUser);
            ownErrors=['Not enough points to ask question('];
            success=false;
            res.redirect('ask');
        }
    }
    else{
        req.session.whereFrom='/ask';
        res.redirect('login')
    }
});



router.post('/deleteuser',function (req,res) {
    var MongoClient = mongodb.MongoClient;


    MongoClient.connect(connectUrl,function (err,client) {
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
});





router.get('/drop',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    MongoClient.connect(connectUrl,function (err,client) {
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


router.get('/dropQuestions',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    MongoClient.connect(connectUrl,function (err,client) {
        if(err){
            console.log("Unable to connect to the server",err)
        }else{
            console.log("Connected");
            var db = client.db('startup');
            db.collection('questions').drop();
            res.redirect('/');
        }
    });
});

router.get("/unlimPoints",function (req,res) {
    var MongoClient = mongodb.MongoClient;
    MongoClient.connect(connectUrl, function (err, client) {
        if (err) {
            console.log("Failed to connect to server", err);
        } else {
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection('users');
            collection.updateOne({login:req.session.logedInUser.login},{$set:{points:1000}},function (err,result) {
                if(err){
                    res.send(err);
                }
                else{
                    req.session.logedInUser.points=100;
                    console.log(result[0]);
                    res.redirect('/');
                }
                })
            }
            })
});


router.get('/userlist',function (req,res) {
    var MongoClient = mongodb.MongoClient;
    MongoClient.connect(connectUrl, function (err, client) {
        if (err) {
            console.log("Failed to connect to server", err);
        } else {
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection('users');
         collection.find({}).toArray(function (err,result) {
             console.log(result);
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
