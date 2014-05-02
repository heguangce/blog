
/*
 * GET users listing.
 */

var mongodb = require('./db');

//创建用户类与属性
var User=function(user){//这里类似于C#的构造方法
    this.name=user.name;
    this.email=user.email;
    this.password=user.password;
};

//导出用户处理模块
module.exports=User;

//存储用户信息
User.prototype.save=function(callback){
    //当请求传入一个用户对象时，需要将对象的属性记录下来
    var user={
        name:this.name,
        email:this.email,
        password:this.password
    };
    //打开数据库连接
    mongodb.open(function(err,db){
        //打开连接出错后，返回callback的错误信息
        if(err){
            return callback(err);
        };
        //从mongodb中打开集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //当打开集合没有出错时，向集合插入文档
            collection.insert(user,{safe:true},function(err,user){
                //无论插入成功与否，此时都需要关闭数据库连接了
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //插入文档没有出错后
                callback(null,user[0]);//user[0]为name
            });
        });
    });
};

//根据name获取用户详细信息
User.get=function(name,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查找key为name，value为name的文档
            collection.findOne({name:name},function(err,user){
                //无论查找成功与否，此时都需要将mongodb的连接关闭
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user);
            });
        });
    });
};