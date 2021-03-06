var express = require('express');
var pages = require('../pages/pages');
var router = express.Router();
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var index=require('./index');

function logedIn(req,res) {
    if(req==undefined)return false;
    if(req.session.logedInUser)return true;
    return false
};

router.get("/:id/",function (req,res) {
    var MongoClient = mongodb.MongoClient;
    errors=null;
    ownErrors=null;
    success=null;
    MongoClient.connect(connectUrl,function (err,client) {
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
                    if(req.session.logedInUser==null){
                        req.session.whereFrom='question/'+req.params.id+"/";
                    }
                    else{
                        req.session.whereFrom=null;
                    }

                    res.render('question',{question:result[0],ans:result[0].answers,logedInUser:req.session.logedInUser,errors:errors,ownErrors:ownErrors,success:success})

                }
                else{
                    res.redirect('/feed');
                }
                client.close();
            })
        }
    });

});

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


router.post("/:id/post_answer",function (req,res) {
    if(req.session.logedInUser) {
        whereFrom = null;
        errors = null;
        ownErrors = null;
        success = null;
        req.check('answer', 'Answer field should not be empty').isLength({min: 1});
        if (req.validationErrors()) {
            success = false;
            errors = req.validationErrors();
            res.redirect('/question/' + req.params.id + '/');
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

                    collection.find({"_id": ObjectId(req.params.id)}).toArray(function (err, result) {
                        if (err) {
                            res.send(err);
                        }
                        else if (result) {
                            var q = result[0];
                            d = getDate()
                            var ans = {
                                author: req.session.logedInUser,
                                text: req.body.answer,
                                date: d
                            };
                            if (q.answers.length == 0) {
                                q.answers = [ans];
                            }
                            else {
                                q.answers[q.answers.length] = ans;
                            }

                            collection.updateOne({"_id": ObjectId(req.params.id)}, {
                                $set: {
                                    answers: q.answers,
                                    lastAnswer: ans,
                                    howManyAns: q.howManyAns + 1
                                }
                            }, function (err, result) {
                                if (err) {
                                    res.send(err);
                                } else if (result) {
                                    console.log();
                                    res.redirect('/question/' + req.params.id + "/");
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
        }
    }
});


router.post('/:id/givePoints/:login',function (req,res) {
    if(logedIn(req,res)){
        var MongoClient = mongodb.MongoClient;

        MongoClient.connect(connectUrl,function (err,client) {
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
                        var a=result[0].answered;
                        p++;
                        a++;
                        collection.updateOne(result[0],{$set:{points:p,answered:a}},function (err,result) {
                            if(err){
                                res.send(err);
                            }else{
                                var collection = db.collection('questions');
                                collection.find({"_id":ObjectId(req.params.id)}).toArray(function (err,result) {
                                    if(err)
                                        res.send(err);
                                    else{
                                        var qu=result[0];
                                        qu.closed=true;
                                        collection.updateOne({"_id": ObjectId(req.params.id)}, {$set:qu}, function (err, result) {
                                            if(err)
                                                res.send(err);
                                            else
                                                res.redirect('/question/'+req.params.id+"/");
                                        })
                                    }

                                })
                            }

                        });
                    }
                });

            }
        })
    }

    else
        res.redirect('/login')
});

module.exports = router;