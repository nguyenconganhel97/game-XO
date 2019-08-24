const mysql = require('mysql');

function getConnection(){
    return mysql.createConnection({
          host:'localhost',
          user: 'root',
          password :'@Ab1598753',
          database : 'slot'
      });
  }

  module.exports= getConnection();