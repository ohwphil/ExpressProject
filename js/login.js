const mysql = require('mysql');
const config = require('../db_config.json');
const app = express();

app.listen(8080, function(){
    console.log('listening on 8080')
});
/*
var ele = ;
if(ele.addEventListener){
    ele.addEventListener("submit", callback, false);  //Modern browsers
}else if(ele.attachEvent){
    ele.attachEvent('onsubmit', callback);            //Old IE
}
*/

var pool = mysql.createPool(config)
pool.getConnection((err, conn) => {
  if(!err) {
    //연결 성공
    email = document.getElementById("email")
    password = document.getElementById("password")
  }
  conn.release();
});

// https://levelup.gitconnected.com/prevent-brute-force-attacks-in-node-js-419367ae35e6