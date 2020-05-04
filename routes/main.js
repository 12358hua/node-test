/**
 * Created by 华 on 2020/4/18.
 */
var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var Content = require('../models/content');

var datas = {
    userinfo:'',
    page:0,
    atpage:0,
    contents:[],
    limit:0,
    count:0,
    category:'',//分类id
    categories:[]
}

router.use(function(req,res,next){
    datas = {
        userinfo: req.userinfo,
        categories: []
    }
    Category.find().then(function(categories) {
        datas.userinfo = req.userinfo;
        datas.categories = categories;
        next();
    });
})

router.get('/', function(req, res, next) {
  datas.category = req.query.category || '';//分类id
  var where = {};
    // 当前页数
  var page = Number(req.query.page || 1);
  if(page<1 || page == 0){
    page = 1;
  }
  // 显示条数
  var limit = 3;
  // 总页数
  var atpage = 0;
  // 计算开始查询的条数
  skip = (page - 1) * limit;

  if(datas.category){
    where.category = datas.category
  }
  console.log(where)
  
  Content.where(where).countDocuments().then(count=>{
     atpage = Math.ceil(count /limit); //计算总页数
     page = Math.min(page,atpage);     //谁小取谁
     page = Math.max(page,1);          //谁大取谁，但不能小于1
     datas.count = count;
     return Content.where(where).find().sort({addTime:-1}).limit(limit).skip(skip).populate(['category','user'])
    }).then(result=>{
        console.log(result)
        datas.contents = result;
       if(result){
           console.log(atpage,page,req.userinfo)
           datas.userinfo = req.userinfo,
           datas.page = page,
           datas.atpage = atpage,
           datas.limit = limit,
           datas.category = where.category
           res.render('main/index',datas);
       }
   })
   return;
});

/**
 * 内容详情页
 */
router.get('/view',function(req,res,next){
    var contentId = req.query.contentid || '';
    console.log(contentId)
    if(contentId){
        Content.findOne({
            _id:contentId
        }).populate(['category','user']).then(result=>{
            datas.contents = result;
            datas.userinfo = req.userinfo;
            console.log(datas)
            if(result){
                res.render('main/view',datas)
                result.views ++ ;
                result.save();
            }
        })
    }
})

module.exports = router;