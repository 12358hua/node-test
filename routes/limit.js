var limits = function(req,res,page,limit,atpage,skip,mgodb,htmlpages,url){
  // 显示条数
  var limit = limit;
  // 总页数
  var atpage = atpage;
  // 计算开始查询的条数
  skip = (page - 1) * limit;
   return mgodb.countDocuments().then(count=>{
     console.log(count)
     atpage = Math.ceil(count /limit); //计算总页数
     page = Math.min(page,atpage);     //谁小取谁
     page = Math.max(page,1);          //谁大取谁，但不能小于1
     return mgodb.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(result=>{
         console.log(result)
         if(result){
            res.render(htmlpages,{
                userinfo:req.userinfo,
                contents:result,
                page:page,
                atpage:atpage,
                limit:limit,
                count:count,
                url:url
            });
        }
     })
   })
}

module.exports = {
    limits:limits
};