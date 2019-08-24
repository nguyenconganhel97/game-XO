var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';
var randomstring = require("randomstring");
var sqlConnector=require('../sqlConnector.js');

router.get('/',function(req,res){
    // console.log(req.session);
    // console.log(req.session.cookie.path);
    
    if(!req.session.user){
        if(req.session.loginStatus){
            var obj=req.session.loginStatus;
            delete req.session.loginStatus;
           return res.render('Login.ejs',{loginStatus:obj});
            
        }else{
            // return res.render('people.ejs')
            return res.render('Login.ejs');
        }

    }else{
        return res.redirect('../')
    }
})
router.get('/getListTK',function(req,res){
    var q="SELECT * FROM doctruyen.user";
    sqlConnector.query(q,function(err,result){
        if(err){
            return res.status(200).json({Success:false});
        }else{
            if(result.length<=0){
                return res.status(200).json({Success:false});
            }else{
                return res.status(200).json({Success:true,list:result});
            }
        }
    })
})

router.post('/loginprocess',function(req,res){
    console.log(req.body);
    var q="SELECT * FROM game.users where username=? and password=?;";
    console.log(decrypt("058ad9992f"));
    sqlConnector.query(q,[req.body.username,encrypt(req.body.password)],function(err,result){
        if(err){
            console.log(err);
            req.session.loginStatus={Success:false,Message:"Lỗi CSDL"};
            return res.redirect('./')
        }else{
            if(result.length<=0){
                req.session.loginStatus={Success:false,Message:"Sai username hoặc password!"};
                return res.redirect('./')
            }else{
                // result[0].Password="********";
                req.session.user=result[0];
                return res.redirect('./');
            }
        }
    })
})

router.get('/changepassword',function(req,res){
    if(req.session.user){
        if(req.session.changeStatus){
            var obj=req.session.changeStatus;
            delete req.session.changeStatus;
            return res.render('changepass.ejs',{changeStatus:obj});
        }else{
            return res.render('changepass.ejs')
        }
        
    }else{
        // if(req.session)
        return res.redirect('/');
    }
})

router.get('/register',function(req,res){
    if(req.session.user){
        return res.redirect('/');
    }else{
        if(req.session.registerStatus){
            return res.render('register.ejs',{registerStatus:req.session.registerStatus});
        }else{
            return res.render('register.ejs');
        }
    }
})

router.post('/register',function(req,res){
    console.log(req.body);
    var q1="SELECT * FROM game.users where username=?"
    sqlConnector.query(q1,[req.body.username],function(err,result){
        if(err){
            req.session.registerStatus={success:false,message:"Lỗi hệ thống!"}
            console.log(err);
            return res.redirect('./register');
        }else{
            if(result.length>0){
                req.session.registerStatus={success:false,message:"Đã tồn tại username:"+req.body.username}
                return res.redirect('./register');
            }else{
                var q2="SELECT * FROM game.users where email=?";
                sqlConnector.query(q1,[req.body.email],function(err2,result2){
                    if(err2){
                        req.session.registerStatus={success:false,message:"Lỗi hệ thống!"}
                        console.log(err);
                        return res.redirect('./register');
                    }else{
                        if(result.length>0){
                            req.session.registerStatus={success:false,message:"Đã tồn tại email:"+req.body.email}
                            return res.redirect('./register');
                        }else{
                            var q3="INSERT INTO `game`.`users` (`username`, `password`, `fullName`, `email`, `token`) VALUES (?,?,?,?,?);";
                            sqlConnector.query(q3,[req.body.username.trim(),encrypt(req.body.password),req.body.full_name,req.body.email,randomstring.generate(64)],function(err3,result3){
                                if(err3){
                                    req.session.registerStatus={success:false,message:"Lỗi hệ thống!"}
                                    console.log(err);
                                    return res.redirect('./register');
                                }else{
                                    req.session.registerStatus={success:true,message:"Đăng ký thành công!"}
                                    return res.redirect('./register');
                                }


                            })
                        }
                    }
                })
            }
        }
    })
})

router.post('/changepassword',function(req,res){
    console.log(req.body);
    if(!(req.body.newpass && req.body.newpass && req.body.confirmnewpass)){
        req.session.changeStatus={Success:false,Message:"Lỗi định dạng đầu vào, liên hệ admin!"};
        return res.redirect('./changepassword');
    }
    if(encrypt(req.body.password)!=req.session.user.password){
        req.session.changeStatus={Success:false,Message:"Password cũ sai!"};
        return res.redirect('./changepassword');
    }else{
        if(req.body.newpass != req.body.confirmnewpass){
            req.session.changeStatus={Success:false,Message:"Password confirm không đúng, vui lòng thử lại!"};
            return res.redirect('./changepassword');
        }
        var q="UPDATE `game`.`users` SET `password` = ? WHERE `username`=?";
        sqlConnector.query(q,[encrypt(req.body.newpass),req.session.user.username],function(err,result){
            if(err){
                req.session.changeStatus={Success:false,Message:"Lỗi CSDL, thử lại sau!"};
                return res.redirect('./changepassword');
            }else{
                console.log(result);
                if(result.affectedRows>0){
                    req.session.changeStatus={Success:true,Message:"Đổi pass thành công!"};
                    req.session.user.Password=encrypt(req.body.newpass);
                    res.redirect('./changepassword');
                }else{
                    req.session.changeStatus={Success:true,Message:"Đổi pass thất bại, thử lại sau!"};
                    return res.redirect('./changepassword');
                }
            }
        })
    }
})

function test(){
    changepass("","",function(abc,xyz){
        abc.result;
    })
}

router.get('/logout',function(req,res){
    req.session.destroy();
    return res.redirect('/')
})



function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}
module.exports = router;