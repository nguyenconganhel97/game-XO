var express = require('express');
var router = express.Router();

router.post('/tinhtong',function(req,res){
    console.log(req.body);
    // console.log(req.headers);
    if(req.body.a && req.body.b){
        if(!isNaN(req.body.a) && !isNaN(req.body.b)){
            return res.status(200).json({Success:true,Total:parseInt(req.body.a)+parseInt(req.body.b)});
            
        }
        return res.status(200).json({Success:false,Message:"Định dạng đầu vào không phù hợp"})
    }else{
        return res.status(200).json({Success:false,Message:"Thiếu dữ liệu"})
    }
})

router.post('/tinhnhan',function(req,res){
    console.log(req.body);
    console.log(req.headers);
    return res.status(200).json({});
})

router.get('/tinhtong/:a/:b',function(req,res){
    console.log(req.body);
    console.log(req.params);
    if(!isNaN(req.params.a) && !isNaN(req.params.b)){
        return res.status(200).json({Success:true,total:parseInt(req.params.a)+parseInt(req.params.b)});
    }
    return res.status(200).json({Success:false});
})

module.exports = router;