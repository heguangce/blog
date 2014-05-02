
/*
 * GET home page.
 */

//exports.index = function(req, res){
//  res.render('index', { title: 'Express' });
//};
var crypto = require('crypto'),//crypto 是 Node.js 的一个核心模块，我们用它生成散列值来加密密码
    User = require('../models/user.js'),
    Post = require('../models/post.js');

module.exports=function(app){
    app.get('/', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

   app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg',function(req,res){
        var password=req.body.password,
              passwordre=req.body['password-repeat'];
        if(password!=passwordre){
            req.flash('error','两次输入密码不一致');
        }
       //生成md5
        var md5=crypto.createHash('md5');
        var pwByMd5=md5.update(req.body.password).digest('hex');
        var newUser=new User({name:req.body.name,password:pwByMd5,email:req.body.email});
        User.get(newUser.name,function(err,user){
            if(user){
                req.flash('error','用户已存在');
                return res.redirect('/reg');//返回注册页
            }
            newUser.save(function(err,user){
               if(err){
                   req.flash('error', err);
                   return res.redirect('/reg');//注册失败返回主册页
               }
                req.session.user = user;//用户信息存入 session
                req.flash('success', '注册成功!');
                res.redirect('/');//注册成功后返回主页
            });
        });

    });

    app.get('/login', checkNotLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()});
    });

    app.post('/login', checkNotLogin);
    app.post('/login',function(req,res){
        var name=req.body.name;
        var md5=crypto.createHash('md5');
        var password=md5.update(req.body.password).digest('hex');
        User.get(name,function(err,user){
            if(!user){
                req.flash('error','不存在此账户名');
                return res.redirect('/login');//登录失败返回登录页
            }
			if(user.password!=password){
				req.flash('error','密码错误');
				return res.redirect('/login');
			}
            req.session.user=user;
			req.flash('success','登录成功');
			res.redirect('/');
        });
    });

    app.get('/post', checkLogin);
    app.get('/post', function (req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function (req, res) {
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');//发表成功跳转到主页
        });
    });

   app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');//登出成功后跳转到主页
    });

    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!');
            res.redirect('/login');
        }
        next();
    }


    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录!');
            res.redirect('back');//返回之前的页面
        }
        next();
    }
};

