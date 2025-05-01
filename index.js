const app =require('express')();
const http =require('http').Server(app);

const mongoose=require('mongoose');
mongoose.connect("mongodb+srv://shankarrajput93049:<db_GWDo9LuMpwRhCq17>@task-management.3mqzfxu.mongodb.net/?retryWrites=true&w=majority&appName=task-management")

http.listen (3000,function(){
    console.log('server is running');
});