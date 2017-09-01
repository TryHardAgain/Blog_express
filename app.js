// const fs=require('fs')
const opn=require('opn')
// const path=require('path')
const api=require('./server/API')
const bodyParser=require('body-parser')
// const html=fs.readFileSync(path.resolve(__dirname,'../dist/index.html'),"utf-8")
//创建renderer实例
// const renderer=require('vue-server-renderer').createRenderer()
const express=require('express')
const cors=require('cors')
const server=express()
server.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
//模板
server.engine('jade', require('jade').__express)
server.set("view engine","ejs");
// server.use(cors({
//     origin:['http://api.finance.ifeng.com/akdaily/?code=sh600000&type=last'],
//     methods:['GET','POST','OPTIONS'],
//     allowHeaders:['Content-Type','Authorization']
// }))
// server.use(express.static(path.resolve(__dirname,'../dist')))
//返回一个仅仅用来解析json格式的中间件。这个中间件能接受任何body中任何Unicode编码的字符。支持自动的解析gzip和 zlib。
server.use(bodyParser.json())
//表单提交，接受form请求,返回一个中间件，这个中间件用来解析body中的urlencoded字符， 只支持utf-8的编码的字符。同样也支持自动的解析gzip和 zlib
//返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
server.use(bodyParser.urlencoded({extended:false}))
// server.get('*',function(req,res){
//     res.send(html)
// })
server.use('/api',api)
server.post('/api',api)
server.listen(3000,(error=>{
    if(error) throw error
    console.log('Server is running at localhost:3000')
    // opn("http://localhost:3000/")
}))