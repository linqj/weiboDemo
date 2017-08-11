var express = require('express');
var path = require('path');
var fs = require('fs');
var morgan = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connect = require('connect');
var flash = require('connect-flash');
var debug = require('debug')('nodejs');
var routes = require('./routes/index');
var moment = require('moment');
var app = express();
// app.locals.dateformat = function(obj, format) {
//     if (format == undefined) {
//         format = 'YYYY-MM-DD HH:mm:ss';
//     }
//     var ret = moment(obj).format(format);
//     return ret == 'Invalid date' ? '0000-00-00 00:00:00' : ret;
// };
var index = require('./routes/index');
var user = require('./routes/user');
var post = require('./routes/post');
app.use(flash());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
// app.use(bodyParser.unlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret:settings.cookieSecret,
    key:settings.db,
    cookie:{maxAge:1000*60*60*24*30},
    resave: true,
    saveUninitialized:true,
    store:new MongoStore({
        url:'mongodb://'+settings.host+'/' + settings.db,
        autoRemove:'native'
    })
}));

// var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
// var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});
// app.use(express.logger({stream: accessLogfile}));
// app.error(function (err, req, res, next) {
//     var meta = '[' + new Date() + '] ' + req.url + '\n';
//     errorLogfile.write(meta + err.stack + '\n');
//     next();
// });
//日志功能
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('short', {stream: accessLogfile}));


// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));


app.use(function(req,res,next){
    res.locals.user=req.session.user;
    var err = req.flash('error');
    var success = req.flash('success');
    res.locals.error = err.length ? err : null;
    res.locals.success = success.length ? success : null;
    next();
});
app.use('/',index);
app.use('/user',user);
app.use('/post',post);
//错误日志放在router后面
app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLogfile.write(meta + err.stack + '\n');
    next();
});
// app.use('/users', users);
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error', {
        title:'404',
        message: '404 - ' + err.message,
        error: err
    });
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             title:'500',
//             message: err.message,
//             error: err
//         });
//     });
// }else if (app.get('env') === 'production') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             title:'500',
//             message: err.message,
//             error: err
//         });
//     });
// }


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
var debug = require('debug')('my-application');
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
module.exports = app;

