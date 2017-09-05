const db=require('./DB.js')
const express=require('express')
const uuid=require('node-uuid')
const crypto=require('crypto')
const app=express.Router()
const Regex=require('regex')

const local={
    username:null,
    token:null
}

app.post('/api/login/GetUser',CheckToken)

app.post('/api/login/GetUser',(req,res)=>{
    let {username,password}=req.body
    // password=createMd5Pwd(password)
    db.Login.findOne({username},(err,doc)=>{
        switch(true){
            case !!err:
                console.log(err)
                break
            case !doc:
                res.send({state:0,msg:'账户错误！'})
                break
            case doc.password===password:
                let token=CreateToken(username)
                res.send({state:1,msg:'登陆成功！','token':token})
                break
            case doc.password!==password:
                res.send({state:0,msg:'密码错误！'})
                break
            default:
                res.send({state:0,msg:'未知错误！'})
        }
    })
})

app.post('/api/login/Registered',(req,res)=>{
    let newUser=new db.Login({
        username:req.body.username,
        password:req.body.password
    })
    let {username,password}=req.body
    db.Login.findOne({username},(err,doc)=>{
        switch(true){
            case !!err:
                console.log(err)
                break
            case !username:
                res.send({state:0,msg:'用户名为空！'})
                break
            case (!/^[\da-zA-Z\uze00-\u9fff]{3,20}$/.test(username)):
                res.send({state:0,msg:'请正确输入用户名（3~20个字符，包含字母/中文/数字）'})
                break
            case !password:
                res.send({state:0,msg:'密码为空！'})
                break
            case !doc:
                newUser.save((err,data)=>{
                    res.send({state:1,msg:'注册成功！'})
                })
                break
            case doc.username===username:
                res.send({state:0,msg:'帐户已经存在！'})
                break
            default:
                res.send({state:0,msg:'未知错误！'})
        }
    })
})

app.get('/api/GetUserInfo',(req,res)=>{
    db.UserInfo.findOne({}).exec((err,data)=>{
        if(err){
            res.json({state:0,msg:err})
        }else{
            res.json({state:1,userinfo:{data,username:local.username,token:local.token}})
        }
    })
})

app.get('/api/signout',(req,res)=>{
    signout();
    res.json({state:1,msg:'已退出'})
})

app.post('/api/CreatedArticle',(req,res)=>{
    let {title,types,sourceContent,content}=req.body;
    let date=new Date();
    let createdArticleTime=date.toLocaleString();
    let createdArticleYear=date.getFullYear();
    let createdArticleMonth=date.getMonth()+1;
    types=types.split(';');
    let article={
        title:title,
        date:createdArticleTime,
        types:types,
        sourceContent:sourceContent,
        content:content,
        author:local.username
    }
    let archive={
        title:title,
        time:createdArticleTime,
        createdYear:createdArticleYear,
        createdMonth:createdArticleMonth
    }
    db.Article(article).save()
    .then((data)=>{
        archive.id=data._id
        db.Archive(archive).save()
    })
    .then(()=>{
        res.json({state:1,msg:'创建成功！'})
    })
    .catch((err)=>{
        res.json({state:0,msg:err})
    })
})

app.post('/api/SaveArticle',(req,res)=>{
    let {title,types,date,content}=req.body;
    let article={
        date:(new Date()).toLocaleDateString(),
        content:content,
        types:types,
        title:title,
        author:local.username
    }
    types=types.split(';');
    db.TemporaryArticle(article).save((err,data)=>{
        if(err){
            res.json({state:0,msg:err})
        }else{
            res.json({state:1,msg:'保存成功！'})
        }
    })
})

app.get('/api/GetArticleList',(req,res)=>{
    let limit=Number(req.query.limit) || 1;
    let start=Number(req.query.skip) || 1;
    let NavTypes=String(req.query.NavTypes)
    // db.Article.count().then((count)=>{
    //     return db.Article.find({title:'Hello'}).skip((start-1)*limit).sort({date:-1}).limit(limit).exec((err,data)=>{
    //         res.json({state:1,'articles':data,'total':count})
    //     })
    // })
    // .catch((error)=>{
    //     res.json({state:0,msg:error})
    // })
    if(NavTypes===''){
        db.Article.count().then((count)=>{
            return db.Article.find().skip((start-1)*limit).sort({date:-1}).limit(limit).exec((err,data)=>{
                res.json({state:1,'articles':data,'total':count})
            })
        })
    }else{
        db.Article.find({types:NavTypes}).skip((start-1)*limit).sort({date:-1}).limit(limit).exec((err,data)=>{
        }).then((data)=>{
            db.Article.find({types:NavTypes}).count().then(count=>{
                res.json({state:1,'articles':data,'total':count})
            })
        })
    }
})

app.delete('/api/RemoveArticle',(req,res)=>{
    let id=req.query.id;
    db.Article.remove({'_id':id}).exec((err,data)=>{
        if(err){
            res.json({state:0,msg,err})
        }else{
            res.json({state:1,msg:'删除成功！'})
        }
    })
})

app.put('/api/UpdateArticle',(req,res)=>{
    let {sourceContent,content,_id,title,types}=req.body;
    let data={
        sourceContent:sourceContent,
        content:content,
        title:title,
        types:types.split(';'),
    }
    db.Article.update({'_id':_id},{$set:data},err=>{
        if(err){
            res.json({state:0,msg:err})
        }else{
            res.json({state:1,msg:'更改成功！'})
        }
    })
})

app.post('/api/CreatedNav',(req,res)=>{
    let {type,title,icon}=req.body;
    let date=new Date();
    let createdNavTime=date.toLocaleString();
    let nav={
        type:type,
        title:title,
        date:createdNavTime,
        author:local.username,
        icon:icon
    }
    db.Nav(nav).save((err,data)=>{
        if(err){
            res.json({state:0,msg:err})
        }else{
            res.json({state:1,msg:'成功创建导航！'})
        }
    })
})

app.get('/api/GetNavList',(req,res)=>{
    db.Nav.count().then((count)=>{
        return db.Nav.find().exec((err,data)=>{
            // for(var a=0;a<count;a++){
            //     if(data[a].type==='first'){
            //         res.json({state:1,'NavLists':data[a++],'NavListCount':count})
            //     }
            //     return 
            // }
            res.json({state:1,'NavLists':data,'NavListCount':count})
        })
    })
    .catch(err=>{
        res.json({state:0,msg:err})
    })
})

app.delete('/api/RemoveNavList',(req,res)=>{
    let id=req.query.id
    db.Nav.remove({'_id':id}).exec((err,data)=>{
        if(err){
            res.json({state:0,msg:err})
        }else{
            res.json({state:1,msg:'成功删除导航！'})
        }
    })
})

app.put('/api/UpdateNavList',(req,res)=>{
    let {type,title,icon,_id}=req.body
    let data={
        type:type,
        title:title,
        icon:icon
    }
    db.Nav.update({'_id':_id},{$set:data},err=>{
        if(err){
            res.json({state:0,msg:err})
        }else{
            res.json({state:1,msg:'导航更新成功！'})
        }
    })
})

app.get('/api/Detaile/:id',(req,res)=>{
    let id =req.params.id;
    db.Article.findOne({'_id':id}).exec((err,data)=>{
        if(err){
            res.json({state:0,msg:err})
        }else{
            res.json({state:1,'article':data})
        }
    })
})

function signout(){
    local.token=null;
}

//创建token
function CreateToken(username){
    let token=uuid.v4()
    local.token=token
    local.username=username
    return token
}
//检查是否存在token，不存在则返回登录界面
function CheckToken(req,res,next){
    let token=req.headers.authorization
    let url=req.url
    if(local.token===token || url==='/api/login/GetUser'){
        next()
    }else{
        res.status(403).send('您没有权利访问！')
    }
}
//过滤非法操作访问
function isIllegal(req,res,next){
    let token=req.headers.authorization
    if(!local.token&&token){
        res.status(403).send('您没有权利访问！')
    }else{
        next()
    }
}

module.exports=app