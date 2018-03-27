var express = require('express');

var router = express.Router();
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var pages = require('../pages/pages');
var validator=require("express-validator");
/* GET home page. */



router.get('/logout',function (req,res) {
    //logedInUser = null;
    console.log(req.session.logedInUser.user);
    req.session.destroy();
    res.redirect('/');
})

/* Sign up / Login render */
router.get("/signup",pages.signup);


function logedIn(req,res) {
    if(req.session.logedInUser)return true;
    return false
}

router.post('/question/:id/givePoints/:login',function (req,res) {
    if(logedIn(req,res)){
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Unable to connect to the server",err)
        }else{
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection('users');
            collection.find({login:req.params.login}).toArray(function (err,result) {
                if(err){
                    res.send(err);
                }
                else{
                    console.log(result[0]);
                    var p=result[0].points;
                    if(result[0].points==null){
                        p=1;
                    }else{
                        p++;
                    }
                    collection.updateOne(result[0],{$set:{points:p}},function (err,result) {
                        if(err){
                            res.send(err);
                        }else{

                            console.log("Points added");
                            res.redirect('/question/'+req.params.id);
                        }
                    });
                    client.close();
                }
            })
        }
    })
    }
    else{res.redirect('/login')}
});

router.get('/', function(req, res, next) {

    if(logedIn(req,res)) {
        console.log(req.session.cookie.maxAge);
        res.render('index', { title: req.session.logedInUser.user, login:req.session.logedInUser.login.toString() });
    }
    else res.render('index', { title: "Not logged in" });
});

router.get('/feed',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
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
            collection.find({login: req.body.login}, function (err,result) {
                if(err){
                    console.log("Cannot add to db");
                }
                else if(result.length){
                    res.redirect('/signup');
                    console.log("Already registered");
                    client.close();
                }
                else{

                    collection.insertOne({user:req.body.user , login: req.body.login, password: req.body.password , img:'../../images/default_avatar.gif'},function (err,result) {
                        if(err){
                            console.log("Cannot add new student to database",err);
                        }else{
                            res.redirect('/login');
                            console.log(req.body.login);
                        }
                        client.close()
                    });
                }
            });



        }
    })
});


router.get('/landing',pages.landing);

router.get('/ask',pages.ask);

router.get('/removeuser',pages.delUser);


router.post('/ask_question',function (req,res) {
    if(logedIn(req,res)) {
        if(req.session.logedInUser.points!=null&&req.session.logedInUser.points<=1){
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://localhost:27017/startup';
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log("Failed to connect to server", err);
            } else {
                console.log("Connected");
                var db = client.db('startup');
                var collection = db.collection('questions');


                collection.insert({
                    theme: req.body.theme,
                    question: req.body.question,
                    author: req.session.logedInUser,
                    answers: []
                }, function (err, result) {
                    if (err) {
                        console.log("Cannot add a question");
                    }
                    else {
                        collection=db.collection('users');
                        console.log(req.session.logedInUser);
                        req.session.logedInUser.points--;
                        console.log(req.session.logedInUser);
                        collection.updateOne({login:req.session.logedInUser.login},{$set:{points:req.session.logedInUser.points}},function (err,result) {
                            if(err){
                                res.send(err);
                            }
                            else{
                                res.redirect('/');
                            }
                        });

                    }
                });

            }
        })
        }else{res.send("Not enough points to ask a question!");}
    }
    else{
        res.redirect("/login");
    }
});



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
});


router.get("/question/:id/",function (req,res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/startup';
    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Failed to connect to server",err);
        }else{
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection('questions');
            collection.find({"_id":ObjectId(req.params.id)}).toArray(function (err,result) {
                if(err){
                    res.send(err);
                }else if(result){

                    res.render('question',{question:result[0],ans:result[0].answers,logedInUser:req.session.logedInUser})
                }
                else{
                    res.redirect('/feed');
                }
                client.close();
            })
        }
    });

});


router.post("/question/:id/post_answer",function (req,res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/startup';
    MongoClient.connect(url,function (err,client) {
        if(err){
            console.log("Failed to connect to server",err);
        }else {
            console.log("Connected");
            var db = client.db('startup');
            var collection = db.collection('questions');

            collection.find({"_id": ObjectId(req.params.id)}).toArray (function (err, result) {
                if (err) {
                    res.send(err);
                }
                else if (result) {
                    var q = result[0];
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1;
                    var yyyy = today.getFullYear();
                    if(dd<10) {
                        dd = '0'+dd
                    }
                    if(mm<10) {
                        mm = '0'+mm
                    }
                    var ans = {
                        author:req.session.logedInUser,
                        text:req.body.answer,
                        date:dd+"/"+mm+"/"+yyyy
                    };
                    if(q.answers.length==0){
                        q.answers=[ans];
                    }
                    else{
                        q.answers[q.answers.length]=ans;
                    }

                    collection.updateOne({"_id": ObjectId(req.params.id)}, {$set: {answers: q.answers}}, function (err, result) {
                        if (err) {
                            res.send(err);
                        } else if (result) {
                            console.log();
                            res.redirect('/question/' + req.params.id);
                        }
                        else {
                            res.redirect('/feed');
                        }
                        client.close();
                    })
                }
            })
        }


    });

});


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


router.get('/dropQuestions',function (req,res) {
    var MongoClient = mongodb.MongoClient;

    var url = 'mongodb://localhost:27017/startup';

    MongoClient.connect(url,function (err,client) {
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

router.get('/userlist',function (req,res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/startup';
    MongoClient.connect(url, function (err, client) {
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
