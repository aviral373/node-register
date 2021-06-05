const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const  bodyParser = require('body-parser')
const User = require('./model/user')
const bcrypt  = require('bcryptjs')
const jwt = require('jsonwebtoken')
mongoose.connect('mongodb://localhost:27017/login-app-db',{
    useNewUrlParser:true,
    useUnifiedTopology: true
    ,useCreateIndex: true
})
const app =  express()
const JWT_SECRET =  '5rrfeh4374heshrsfseyg&&)#&)@r89effdxfsd' 
app.use('/',express.static(path.join(__dirname,'static')))
app.use(bodyParser.json());

app.listen(9999, ()=> {
    console.log('server is up at http://localhost:9999/')
})
app.post('/api/login', async (req,res)=>{
    const {username, password} = req.body
    const  user  = User.findOne({username}).lean()
    if(!user){
        return res.json({status:'error',error: 'Invalid username/password'})
    }
    if(await bcrypt.compare(password,user.password)){
        //
        const token = jwt.sign({id : user._id, username = user.username}, JWT_SECRET)
        return res.json({status:'ok',data:token})
    }
})
app.post('/api/register', async (req,res )=>{
    const {username,password :plainTextPassword} =  req.body
    if(!username || typeof username !== 'string'){
        return res.json({status:'error' ,error: 'Invalid Username'})
    }
    if(plainTextPassword.length < 5){
        return res.json({
            status:'error',
            error: 'Password is too short'
        })
    }
    const password  = await bcrypt.hash(plainTextPassword,10)

    try{
        const response = await User.create({
            username,
            password
        })
            console.log('User created successfully: ',response)
    }catch(error){
        if(error.code ===11000){
            return res.json({status:'error',error : 'Username is already in use'})
        }
        throw error
    }

    res.json({status:'ok'});
})

app.post('/api/change-password',(req,res)=>{
    const {token} = req.body
    jwt.verify(token,JWT_SECRET)
})
