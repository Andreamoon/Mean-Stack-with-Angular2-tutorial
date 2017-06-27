const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require ('./config/database');
const path = require('path');
mongoose.Promise = global.Promise;
mongoose.connect(config.uri, (err)=>{
  if(err){
    console.log(' non posso connettere il database');
  }else{
    //console.log(config.secret)
    console.log('Database connesso:  '+ config.db);
  }
});


app.use(express.static(__dirname +'/clien/dist'));
//tutte le route invioano da index.html
app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});

app.listen(8080 ,() => {
  console.log('server running on port 8080');
});
