/**
 * Created by 华 on 2020/4/18.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Category = require('../models/category');
var Content = require('../models/content');
// 引入封装好的查询方法
var limit_query = require('./limit');

router.use(function(req,res,next){
  if(!req.userinfo.isAdmin){
    console.log('对不起，只有管理员才能访问改页面');
    res.render('admin/noadmin');
    return;
  }
  next();
})
/**
 * 后台管理首页
 */
router.get('/', function(req, res, next) {
  console.log('您是管理员');
  res.render('admin/index',{
    userinfo:req.userinfo
  });
});

/**
 * 用户管理
 */
router.get('/user',function(req,res,next){
  // 当前页数
  var page = Number(req.query.page || 1);
  if(page<1 || page == 0){
    page = 1;
  }
  // 显示条数
  var limit = 2;
  // 总页数
  var atpage = 0;
  // 计算开始查询的条数
  var skip = (page - 1) * limit;
  
  User.count().then(count=>{
    atpage = Math.ceil(count /limit); //计算总页数
    page = Math.min(page,atpage);     //谁小取谁
    page = Math.max(page,1);          //谁大取谁，但不能小于1
    
    console.log(req.query.page);
    User.find().limit(limit).skip(skip).then(result=>{
      if(result){
        console.log(result);
        res.render('admin/user_index',{
          userinfo:req.userinfo,
          users:result,
          page:page,
          atpage:atpage,
          limit:limit,
          count:count,
          url:'/admin/user'
        });
      }
    })
  })
  
})

/**
 * 分类管理
 */
router.get('/category',function(req,res,next){
   // 当前页数
   var page = Number(req.query.page || 1);
   if(page<1 || page == 0){
     page = 1;
   }
   // 显示条数
   var limit = 2;
   // 总页数
   var atpage = 0;
   // 计算开始查询的条数
   var skip = (page - 1) * limit;
   
   Category.count().then(count=>{
     atpage = Math.ceil(count /limit); //计算总页数
     page = Math.min(page,atpage);     //谁小取谁
     page = Math.max(page,1);          //谁大取谁，但不能小于1
     
     console.log(req.query.page);
     Category.find().sort({_id:-1}).limit(limit).skip(skip).then(result=>{
       if(result){
         console.log(result);
         res.render('admin/category_index',{
           userinfo:req.userinfo,
           categories:result,
           page:page,
           atpage:atpage,
           limit:limit,
           count:count,
           url:'/admin/category'
         });
       }
     })
   })
})
// 添加分类页面
router.get('/category/add',function(req,res,next){
  res.render('admin/category_add',{
    userinfo:req.userinfo
  })
})
// post方式访问则是保存数据
router.post('/category/add',function(req,res,next){
  console.log(req.body.name)
  var name = req.body.name || '';
  if(req.body.name == ''){
    res.render('admin/error',{
      userinfo:req.userinfo,
      message:'分类名称不能为空',
    })
    return;
  }
  console.log(req.body.name)
  Category.findOne({
    name:name
  }).then(result=>{
    if(result){
      console.log(result)
      res.render('admin/error',{
        userinfo:req.userinfo,
        message:'分类名称已存在',
      })
      return Promise.reject();
    }
    return new Category({
      name:name
    }).save();
  }).then(result=>{
    console.log(result)
    res.render('admin/success',{
      userinfo:req.userinfo,
      message:'分类保存成功',
      url:'/admin/category'
    })
  }).catch(reject=>{
    console.log(reject)
  })
})

/**
 * 修改分类
 */
router.get('/category/edit',function(req,res,next){
  var id = req.query.id || '';
  Category.findOne({
    _id:id,
  }).then(result=>{
    if(!result){
      res.render('admin/error',{
        userinfo:req.userinfo,
        message:'分类不存在',
      })
      return Promise.reject();
    }else{
      res.render('admin/category_edit',{
        userinfo:req.userinfo,
        category:result,
      })
    }
  })
})
// 分类修改的保存
router.post('/category/edit',function(req,res,next){
  console.log(req.body.value)
  var id = req.query.id || '';
  var value = req.body.value || '';
  Category.findOne({
    _id:id,
  }).then(result=>{
    if(!result){
      res.render('admin/error',{
        userinfo:req.userinfo,
        message:'分类不存在',
      })
      return Promise.reject();
    }else{
      if(value == result.name){
        res.render('admin/success',{
          userinfo:req.userinfo,
          message:'修改成功',
          url:'/admin/category'
        })
        return Promise.reject();
      }else{
        return Category.findOne({
          _id:{$ne:id},
          name:value
        })
      }
      
    }
  }).then(nameSus=>{
    if(nameSus){
      res.render('admin/error',{
        userinfo:req.userinfo,
        message:'分类名已存在',
        url:'/admin/category'
      })
      return Promise.reject();
    }else{
      Category.update({
        _id:id,
      },{
        name:value
      }).then(succeName=>{
        res.render('admin/success',{
          userinfo:req.userinfo,
          message:'修改成功',
          url:'/admin/category'
        })
      })
      return;
    }
  })
  
})

/**
 * 分类删除
 */
router.get('/category/delete',function(req,res,next){
  console.log(req.body.value)
  var id = req.query.id || '';
  Category.findOne({
    _id:id
  }).then(result=>{
    if(result){
      Category.remove({
        _id:id
      }).then(removes=>{
        res.render('admin/success',{
          userinfo:req.userinfo,
          message:'删除成功',
          url:'/admin/category'
        })
      })
    }
    return;
  })
})

/**
 * 内容管理
 */
router.get('/content', function(req, res, next) {
  // 当前页数
  var page = Number(req.query.page || 1);
  if(page<1 || page == 0){
    page = 1;
  }
  // 显示条数
  var limit = 2;
  // 访问的页面
  var htmlpages = 'admin/content_index'
  // url
  var url = '/admin/content'
  // 调用封装好的查询方法
  limit_query.limits(req, res,page,2,0,0,Content,htmlpages,url)
});

// 添加内容页面
router.get('/content/add',function(req,res,next){
  Category.find().sort({_id:-1}).then(result=>{
    if(result){
      res.render('admin/content_add',{
        userinfo:req.userinfo,
        categories:result
      });
    }
  })
})
// 提交内容
router.post('/content/add',function(req,res,next){
  console.log(req.body);
  if(req.body.title == '' || req.body.category == ''){
    res.render('admin/error',{
      userinfo:req.userinfo,
      message:'标题或分类不能为空',
    })
    return;
  }
  new Content({
    category: req.body.category,
    user:req.userinfo.id.toString(),
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
  }).save().then(data=>{
    console.log(123)
    res.render('admin/success',{
      userinfo:req.userinfo,
      message:'内容添加成功',
      url:'/admin/content'
    })
  })
})

// 修改内容
router.get('/content/edit',function(req,res,next){
  var id = req.query.id || '';
  var categories = [];
  Category.find().sort({_id:1}).then(data=>{
    categories = data;
    return Content.findOne({
      _id:id
    }).populate('category')
  }).then(result=>{
    console.log(categories)
    if(!result){
      res.render('admin/error',{
        userinfo:req.userinfo,
        message:'指定的内容不存在'
      })
      return Promise.reject();
    }else{
      res.render('admin/content_edit',{
        userinfo:req.userinfo,
        content:result,
        categories
      })
    }
  })
})

// 修改内容后保存
router.post('/content/edit',function(req,res,next){
    var category = req.body.category;
    var title = req.body.title;
    var description = req.body.description;
    var content = req.body.content;
  if(req.body.title == '' || req.body.category == ''){
    res.render('admin/error',{
      userinfo:req.userinfo,
      message:'标题或分类不能为空',
    })
    return;
  }
  Content.findOne({
    _id:req.query.id
  }).then(result=>{
    console.log(result)
    if(result){
      if(category == result.category && title == result.title && description == result.description && content == result.content){
        res.render('admin/success',{
          userinfo:req.userinfo,
          message:'修改成功',
          url:'/admin/content'
        })
        return Promise.reject();
      }else{
        return Content.findOne({
          _id:{$ne:req.query.id},
          title:title
        })
      }
    }
  }).then(eress=>{
    if(eress){
      res.render('admin/error',{
        userinfo:req.userinfo,
        message:'标题已存在'
      })
    }else{
      Content.update({_id:req.query.id},{
        category: category,
        title: title,
        addTime:new Date(),
        description: description,
        content: content
      }).then(upsucc=>{
        res.render('admin/success',{
          userinfo:req.userinfo,
          message:'修改成功',
          url:'/admin/content'
        })
      })
    }
  })
})
// 内容删除
router.get('/content/delete',function(req,res,next){
  console.log(req.body.value)
  var id = req.query.id || '';
  Content.findOne({
    _id:id
  }).then(result=>{
    if(result){
      Content.remove({
        _id:id
      }).then(removes=>{
        res.render('admin/success',{
          userinfo:req.userinfo,
          message:'删除成功',
          url:'/admin/content'
        })
      })
    }
  })
})
module.exports = router;
