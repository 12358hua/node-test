$(function(){
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');

    // 切换到注册
    $loginBox.find('a.colMint').on('click',function(){
        $registerBox.show();
        $loginBox.hide();
    })
    // 切换到登陆
    $registerBox.find('a.colMint').on('click',function(){
        $loginBox.show();
        $registerBox.hide();
    })
    // 注册请求
    $registerBox.find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$registerBox.find('[name="username"]').val(),
                password:$registerBox.find('[name="password"]').val(),
                repassword:$registerBox.find('[name="repassword"]').val()
            },
            dataType:'json',
            success:function(result){
                console.log(result);
                $registerBox.find('.colWarning').html(result.message);
                if(!result.code){
                    setTimeout(function(){
                        $loginBox.show();
                        $registerBox.hide();
                    },2000)
                }
            }
        })
    })
    // 登陆请求
    $loginBox.find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username:$loginBox.find('[name="username"]').val(),
                password:$loginBox.find('[name="password"]').val()
            },
            dataType:'json',
            success:function(result){
                console.log(result);
                if(!result.code){
                    window.location.reload();
                    // $userInfo.show();
                    // $loginBox.hide();
                    // $userInfo.find('.username').html(result.userinfo.username);
                    // $userInfo.find('.colDanger').html('您好，欢迎来到'+result.userinfo.username+'的博客');
                }
                
            }
        })
    })
    $('#logout').on('click',function(){
        $.ajax({
            type:'get',
            url:'/api/user/logout',
            success:function(result){
                console.log(result);
                if(result.code){
                    window.location.reload();
                }
            }
        })
    })
})