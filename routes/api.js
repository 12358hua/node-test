/**
 * Created by 华 on 2020/4/18.
 */
var express = require('express');
var router = express.Router();
var UserMongo = require('../models/user');
var Content = require('../models/content');

var requistCode;
router.use(function(req,res,next){
  requistCode = {
      code:0,
      message:''
  };
  next();
})

// 注册
router.post('/user/register', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var repassword = req.body.repassword;
  // 用户名的判断
  if(username == ''){
    requistCode.code = 1;
    requistCode.message = '用户名不能为空';
    res.json(requistCode);
    return;
  }
  // 密码的判断
  if(password == ''){
    requistCode.code = 2;
    requistCode.message = '密码不能为空';
    res.json(requistCode);
    return;
  }
  // 二次密码的判断
  if(repassword !== password){
    requistCode.code = 3;
    requistCode.message = '两次密码输入不一致';
    res.json(requistCode);
    return;
  }
  UserMongo.findOne({
    username:username
  }).then(result=>{
    console.log(result)
    if(result){
      requistCode.code = 4;
      requistCode.message = '用户名已存在';
      res.json(requistCode);
      return;
    }
    var usermon = new UserMongo({
      username:username,
      password:password
    });
    return usermon.save();
  }).then(result=>{
    console.log(result)
    requistCode.message = '注册成功';
    res.json(requistCode);
    return;
  })
});

// 登陆
router.post('/user/login',function(req,res){
  var username = req.body.username;
  var password = req.body.password;
  if(username == '' || password == ''){
    requistCode.code = 1;
    requistCode.message = '用户名或密码错误';
    res.json(requistCode);
    return;
  }
  UserMongo.findOne({
    username:username,
    password:password
  }).then(result=>{
    // console.log(result)
    requistCode.message = '登陆成功';
    requistCode.userinfo = {
      username:result.username,
      id:result._id
    }

    res.cookie('userinfo', JSON.stringify(requistCode.userinfo), { maxAge: 900000, httpOnly: true });
    res.json(requistCode);
    return;
  })
})
// 退出登陆
router.get('/user/logout',function(req,res,next){
  // 清空cookie
  res.clearCookie('userinfo');
  requistCode.code = 1;
  requistCode.message = '退出成功';
  res.json(requistCode);
})

/**
 * 评论
 */
router.get('/comment',function(req,res,next){
  var contentId = req.query.contentid || '';
  Content.findOne({
    _id:contentId
  }).then(result=>{
    if(result){
      console.log(result)
      requistCode.code = 1;
      requistCode.message = '评论查询成功';
      requistCode.data = result.comments;
      res.json(requistCode);
    }
  })
})

// 提交评论
router.post('/comment/post',function(req,res,next){
  var contentId = req.body.contentid || '';
  var postData = {
      username: req.userinfo.username,
      postTime: new Date(),
      content: req.body.content
  };
  Content.findOne({
    _id:contentId
  }).then(result=>{
    console.log(result)
    if(result){
      result.comments.push(postData);
      return result.save();
    }
  }).then(result=>{
    console.log(result)
    requistCode.code = 1;
    requistCode.message = '评论提交成功';
    requistCode.data = result;
    res.json(requistCode);
  })
})
module.exports = router;
