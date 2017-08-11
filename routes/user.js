var express = require('express')
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

router.get('/register', (req, res, next) => {
    res.render('register', {
        title: '用户注册',
    });
});
router.post('/register', (req, res) => {
    //生成口令的散列值
    if (req.body.username === undefined || req.body.password === undefined || req.body.username === "" || req.body.password === "") {
        res.end(
            JSON.stringify({status: 0, message: '用户名和密码不能为空'})
        )
    }
    else {

        var password = md5.update(req.body.password).digest('base64');
        var newUser = new User({
            name: req.body.username,
            password: password,
        });
        // 检查用户名是否已经存在
        User.get(newUser.name, function (err, user) {
            if (user)
                err = 'Username already exists.';
            if (err) {
                res.end(
                    JSON.stringify({status: 0, message: err})
                );
            }
            // 如果不存在则新增用户
            newUser.save(function (err) {
                if (err) {
                    res.end(
                        JSON.stringify({status: 0, message: '注册失败，服务器内部错误'})
                    )
                }
                res.end(JSON.stringify({status: 1}))
            });
        });
    }
});
router.get('/login', (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    else{
        res.render('login', {
            title: '用户登陆',
        });
    }
});
router.post('/login', (req, res, next) => {
    if (req.body.username === undefined || req.body.password === undefined || req.body.username === "" || req.body.password === "") {
        res.end(
            JSON.stringify({status: 0, message: '用户名和密码不能为空'})
        )
    }
    else {

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var checkUser = new User({
            name: req.body.username,
            password: password,
        });
        // 检查用户名是否已经存在
        User.get(checkUser.name, function (err, user) {
            if (!user) {
                err = '用户不存在.';
            }
            if (user.password != checkUser.password) {
                err = '密码错误';
            }
            if (err) {
                res.end(
                    JSON.stringify({status: 0, message: err})
                );
            } else {
                req.session.user = checkUser.name;
                res.end(
                    JSON.stringify({status: 1, message: '登录成功'})
                );
            }
        });
    }
});
router.get('/logout', (req, res, next) => {
    req.session.user = null;
    res.end(
        JSON.stringify({status: 1, message: '登出成功'})
    );
});
// router.delete('/logout', (req, res, next) => {
//     var user = req.session.user;
//     req.session.destroy(function (err) {
//         if (err) {
//             res.json({result: false, error: '登出失败'});
//             return;
//         }
//         delete user;
//         res.clearCookie('connect.sid');
//         res.end(res.json({result: true,message:'登出成功'}));
//     });
// });
module.exports = router