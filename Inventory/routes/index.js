const express = require('express');
const router = express.Router();

const connection = require('../database/dbconnection');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));
router.get('/dashboard', ensureAuthenticated, async function (req, res) {


  var queries = [
    "Select * from productlist",
      "Select * from productcategory",
      "Select * from inventory where shopid='"+ req.user.assignshop+"'",
    ];
    
    connection.query(queries.join(';'), function (error, results, fields) {
    
    if (error) throw error;
   console.log(results[1]);
   console.log(results[0]);
   console.log(results[2]);
   
    res.render('dashboard', {
      productlist: results[0], // First query from array
      procategory: results[1],
      inventory:results[2],
      user:req.user      // Second query from array
    });
    
    });

});

router.get('/inventorylist', ensureAuthenticated, async function(req, res)
{
 res.render('inventorylist',
 {
  user:req.user
 })
});
router.get('/inventoryalert', ensureAuthenticated, async function(req, res) {
  connection.query("Select * from inventory where shopid = '"+ req.user.assignshop + "' && quantity <=50 ", function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      console.log(results);
      res.render('alertlist',{userlist:results,
        user:req.user})
    }
  });
});


router.get('/report', ensureAuthenticated, async function(req, res) {
  var d =  new Date();
  var dnow =  new Date();
  var yest =  new Date(new Date().getTime() - 24*60*60*1000);
  var lastweek =  new Date(new Date().getTime() - 24*60*60*1000*7);
  var lastmonth =  new Date(new Date().getTime() - 24*60*60*1000*30);
  var llweek =  new Date(new Date().getTime() - 24*60*60*1000*14);
  var llmonth =  new Date(new Date().getTime() - 24*60*60*1000*60);
  yest.setHours(0, 0, 0, 0);
  d.getTime();
  d.setHours(0, 0, 0, 0);

  finalDate = d.toISOString().split('T')[0]+' '+d.toTimeString().split(' ')[0];
  lastpost = dnow.toISOString().split('T')[0]+' '+dnow.toTimeString().split(' ')[0];
  yestpost = yest.toISOString().split('T')[0]+' '+yest.toTimeString().split(' ')[0];
  weekpost = lastweek.toISOString().split('T')[0]+' '+lastweek.toTimeString().split(' ')[0];
  monthpost = lastmonth.toISOString().split('T')[0]+' '+lastmonth.toTimeString().split(' ')[0];
  lweekpost = llweek.toISOString().split('T')[0]+' '+llweek.toTimeString().split(' ')[0];
  lmonthpost = llmonth.toISOString().split('T')[0]+' '+llmonth.toTimeString().split(' ')[0];
  var queries = [
    "Select  COUNT(productid) as transCount,description, productid from transaction where shopid='"+req.user.assignshop+"' GROUP BY productid ORDER BY COUNT(productid) DESC ",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ finalDate +"' and '"+ lastpost +"' && userid ='"+ req.user.userid+"'",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ yest +"' and '"+ finalDate +"' && userid ='"+ req.user.userid+"'",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ weekpost +"' and '"+ lastpost +"' && userid ='"+ req.user.userid+"'",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ monthpost +"' and '"+ lastpost +"' && userid ='"+ req.user.userid+"'",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ llweek +"' and '"+ weekpost +"' && userid ='"+ req.user.userid+"'",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ llmonth +"' and '"+ monthpost +"' && userid ='"+ req.user.userid+"'",
    "Select  SUM(quantity) as qty,description from transaction where shopid='"+req.user.assignshop+"' GROUP BY productid ORDER BY SUM(quantity) DESC LIMIT 10",
    "Select  COUNT(productid) as transCount,description from transaction where shopid='"+req.user.assignshop+"' GROUP BY productid ORDER BY COUNT(productid) DESC LIMIT 10",
    "Select  quantity,productname from inventory where shopid='"+req.user.assignshop+"'  ORDER BY quantity DESC LIMIT 10",
    "Select  quantity,productname from inventory where shopid='"+req.user.assignshop+"' ORDER BY quantity ASC LIMIT 10",
 
  ];
    // console.log("today",finalDate);
    // console.log("lastpst",lastpost);
    // console.log("yest",yestpost);
    // console.log("lweek",weekpost);
    // console.log("lmon",monthpost);
    // console.log("llweek",lweekpost);
    // console.log("llmon",lmonthpost);
    connection.query(queries.join(';'), function (error, results, fields) {
    
    if (error) throw error;
    console.log("dessm",results[9]);
    console.log("acesm",results[10]);
    // console.log(yestpost);
    //  console.log(req.user.userid);
    // console.log(results[0]);
    res.render('report', {
      frequency: results[0], // First query from array
      todaysale: results[1],
      yeserday: results[2],
      weekday: results[3],
      monthday: results[4],
      lweekday: results[5],
      lmonthday: results[6],
      mostsoldqty: results[7],
      mostfreqently: results[8],
      largeqty: results[9],
      smallqty: results[10],
      user:req.user      // Second query from array
    });
    
    });
  
  });
router.get('/stastics', ensureAuthenticated, async function(req, res)  {
  res.render('stastics',{
    user:req.user
  })
});



router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
  

router.post('/addnewinventorylist',async function(req,res)
{
    const {pTableData} = req.body;
   // console.log(pTableData);
 
const postdate = new Date();
  var values = [];
  var inventory = [];
const copyItems = [];
myObj = JSON.parse(pTableData);
for (let i = 0; i < myObj.length; i++) {
  copyItems.push(myObj[i]);
}
  if(copyItems.length >0)
  {

copyItems.forEach((item) => {
  //console.log(item.UnitPrice); item.ShelveNumber 
  var productid  = item.ProductId ;
  // inventory.push([req.user.assignshop,req.user.assignshop,item.ProductId,"catid",item.ProductCategory,item.ProductDescription,item.NewQuantity,item.ShelveNumber,postdate]);

  // values.push([req.user.userid,req.user.assignshop,item.ProductId,item.ProductCategory,item.ProductDescription,item.NewQuantity,item.BuyingPrice,postdate]);

  connection.query("Select * from inventory where shopid='"+ req.user.assignshop +"' && productid='"+ productid +"'", function (error, results, fields) {
        
    if (error)
    {
      res.json({messages:'error'});  
    }
   else if(results.length == 0)
    {
  
      connection.query('INSERT INTO inventory (inventoryid,shopid,productid,procategoryid, procategory ,productname ,quantity,shelfno,postdate,productcode) VALUES(?,?,?,?,?,?,?,?,?,?)',[req.user.assignshop,req.user.assignshop,item.ProductId,"catid",item.ProductCategory,item.ProductDescription,item.NewQuantity,item.ShelveNumber,postdate,item.ProductCode], function (error, results, fields) {
  
        if (error) {
          res.json({messages:'error'});  
        }
        connection.query('INSERT INTO inventorylog (userid,shopid,productid, procategory ,productname ,quantity,buyingprice,postdate)  VALUES (?,?,?,?,?,?,?,?)',[ req.user.userid,req.user.assignshop,item.ProductId,item.ProductCategory,item.ProductDescription,item.NewQuantity,item.BuyingPrice,postdate], function(err,result) {
          if (error) 
          {
            res.json({messages:'error'});  
          }
        
         
        }); 
       
        
        });
   
    }
    else{
      var sqludt = "UPDATE inventory SET quantity = quantity + "+ item.NewQuantity +" WHERE productid = "+ "'"+ item.ProductId +"'" + " && shopid = '"+ req.user.assignshop + "'";
      connection.query(sqludt, function (error, results, fields) {
  
        if (error){
          res.json({messages:'error'});  
        }
        connection.query('INSERT INTO inventorylog (userid,shopid,productid, procategory ,productname ,quantity,buyingprice,postdate)  VALUES (?,?,?,?,?,?,?,?)',[ req.user.userid,req.user.assignshop,item.ProductId,item.ProductCategory,item.ProductDescription,item.NewQuantity,item.BuyingPrice,postdate], function(err,result) {
          if (error) {
            res.json({messages:'error'});  
          }
        
        
        }); 
       
        
        });
     
    }
    });
    res.json({messages:'success'});  
});
  }
  else{
    res.json({messages:'error'});  
  }


   
});

router.post('/populateZipCodes',async function(req, res){
  var c =0 ;
  
  var searchStr = req.body.search.value;
  // if(req.body.search.value)
  // {
  // //  var  regex = new RegExp(req.body.search.value, "i")
  //         searchStr = regex;
  // }
  // else
  // {
  //      searchStr='';
  // }

  var recordsTotal = 0;
  var recordsFiltered=0;
  // var skip = (page-1) * req.body.draw; 
  // var limit = skip + ',' + numPerPage; 
  connection.query("Select count(*) AS namesCount from inventory where shopid = '"+ req.user.assignshop + "' && productname LIKE "+"'"+ searchStr +"%' ", function(error, rows, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      recordsTotal = rows[0].namesCount;
      recordsFiltered=Math.ceil(recordsTotal / req.body.draw);
      //console.log(c);
       // console.log(req.body.start);
       // console.log(req.body.length);
       connection.query("SELECT productcode,procategory,productname,quantity  FROM inventory where productname LIKE "+"'"+ searchStr +"%'"+" LIMIT "+req.body.start +","+ req.body.length +""
       , function (error, results,fields) {
               if (error) {
                   console.log('error while getting results'+error);
                   return;
               }
       
               var data = JSON.stringify({
                   "draw": req.body.draw,
                   "recordsFiltered": recordsFiltered,
                   "recordsTotal": recordsTotal,
                   "data": results
               });
            //   console.log("data", data);
               res.send(data);
           });
    //console.log(rows[0].namesCount);
     // res.render('inventorylist',{productlist:rows})
    }
 

  })
        
 
});
module.exports = router;