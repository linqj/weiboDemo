/**
 * Created by linqiaojuan on 17-8-10.
 */
var express = require('express')
var router = express.Router();
var Post=require('../models/post');
router.get('/all', (req, res, next) => {
        Post.get(undefined, function(err, posts) {
            if (!err) {
                res.end(JSON.stringify({
                    status:1,
                    posts:posts
                }));
            }
            else{
                res.end(JSON.stringify({
                    status:1,
                    posts:[]
                }));
            }
        });
});
module.exports = router;

