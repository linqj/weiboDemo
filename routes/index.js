var express = require('express')
var router = express.Router();
var User = require('../models/user');
var Post=require('../models/post');
router.get('/', (req, res, next) => {
    res.render('index', {
        title: '首页ww',
        posts:[]
    });
});
router.post('/post',(req, res, next) => {
    var currentUser=req.session.user;
    var post=new Post(currentUser,req.body.post);
    post.save(function(err){
        if(err){
            res.end(
                JSON.stringify({status: 0, message: '请求数据失败'})
            );
        }else{
            res.end(
                JSON.stringify({status: 1, message: '发表成功'})
            );
            // res.redirect('/u/' + currentUser.name)
        }
    })
});

module.exports = router;

