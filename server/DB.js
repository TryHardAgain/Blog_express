const mongoose=require('mongoose')
const Schema=mongoose.Schema
mongoose.Promise=global.Promise
mongoose.connect('mongodb://192.168.72.89:27017/operations',{auto_reconnect:true})
const db=mongoose.connection
db.on('error',()=>console.log('Mongo connection error'))
db.once('open',()=>console.log('Mongo connection success'))

const loginSchema=new Schema({
    username:String,
    password:String
})
const userinfoSchema=new Schema({
    username:String,
    password:String,
    Head_portrait:String
})
const temporaryArticleSchema=new Schema({
    title:String,
    date:Date,
    content:String,
    types:Array,
    author:String,
    sourceContent:String
})
const articleSchema=new Schema({
    title:String,
    date:Date,
    content:String,
    types:Array,
    author:String,
    sourceContent:String
})
const archiveSchema=new Schema({
    username:String,
    time:Date,
    id:String,
    createdYear:Number,
    createdMonth:Number,
})
const navSchema=new Schema({
    type:String,
    date:Date,
    author:String,
    title:String,
    icon:String
})
const Models={
    Login:mongoose.model('Login',loginSchema),
    UserInfo:mongoose.model('UserInfo',userinfoSchema),
    TemporaryArticle:mongoose.model('TemporaryArticle',temporaryArticleSchema),
    Article:mongoose.model('Article',articleSchema),
    Archive:mongoose.model('Archive',archiveSchema),
    Nav:mongoose.model('Nav',navSchema)
}

module.exports=Models