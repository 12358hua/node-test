/**
 * Created by 华 on 2020/4/18.
 */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swig = require('swig');
var bodyParser = require('body-parser');

var Admin = require('./routes/admin');
var Api = require('./routes/api');
var Main = require('./routes/main');
var User = require('./models/user');

var app = express();

// 设置访问css路径
app.use('/public',express.static(__dirname+'/public'));
// view engine setup
// app.set('views', './views');
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');//这是默认的jade模板
// 使用swig模板
app.engine('html',swig.renderFile);
app.set('view engine','html');
swig.setDefaults({cache:false});

//bodyParser的设置,设置后自动在方法上加body参数，用来接收前端发送过来的数据。
app.use(bodyParser.urlencoded({extended:true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// cookie的设置
app.use(function (req, res, next) {
  // console.log(req.cookies.userinfo); // 第二次访问，输出chyingp
  req.userinfo = {};
  if(req.cookies.userinfo){
    try{
      req.userinfo = JSON.parse(req.cookies.userinfo);
      
      // 已知id所以用findById,也可以用find，判断是否为管理员
      User.findById(req.userinfo.id).then(result=>{
        req.userinfo.isAdmin = Boolean(result.isAdmin);
        console.log(req.userinfo)
        next();
      })
    }catch(err){
      console.log(err)
      next();
    }
  }else{
    next();
  }
});


app.use('/admin', Admin);
app.use('/api', Api);
app.use('/',Main);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
