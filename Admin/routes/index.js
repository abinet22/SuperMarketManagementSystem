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
router.get('/dashboard', ensureAuthenticated, async function(req, res) {
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
    "Select  COUNT(productid) as transCount,shopid from transaction where postdate between '"+ finalDate +"' and '"+ lastpost +"' GROUP BY shopid ORDER BY COUNT(productid) DESC ",
   
    "Select  SUM(total) as qty from transaction where postdate between '"+ finalDate +"' and '"+ lastpost +"'",
    "Select  SUM(total) as qty from transaction where postdate between '"+ yest +"' and '"+ finalDate +"'",
   
    "Select  SUM(quantity) as qty,COUNT(productid) as transCount,shopid from inventorylog where postdate between '"+ finalDate +"' and '"+ lastpost +"' GROUP BY shopid,productid",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ monthpost +"' and '"+ lastpost +"' && userid ='"+ req.user.userid+"'",
    "Select  SUM(quantity) as qty from transaction where postdate between '"+ llweek +"' and '"+ weekpost +"' && userid ='"+ req.user.userid+"'",
   
    "Select  COUNT(productid) as transCount,SUM(quantity) as qty,description,shopid from transaction where postdate between '"+ finalDate +"' and '"+ lastpost +"' GROUP BY productid,shopid ORDER BY COUNT(productid) DESC ",
    "Select  SUM(quantity) as qty ,shopid,description from transaction  where postdate between '"+ finalDate +"' and '"+ lastpost +"'GROUP BY shopid,productid ORDER BY SUM(quantity) ASC LIMIT 10",
    "Select  SUM(quantity) as qty ,shopid,description from transaction where postdate between '"+ finalDate +"' and '"+ lastpost +"' GROUP BY shopid,productid ORDER BY SUM(quantity) DESC LIMIT 10",
    "Select  SUM(total) as total,shopid from transaction where postdate between '"+ finalDate +"' and '"+ lastpost +"' GROUP BY shopid ORDER BY quantity DESC ",
    "Select  * from shops",
   
 
  ];
    
    connection.query(queries.join(';'), function (error, results, fields) {
    
    if (error) throw error;
    
  console.log( results[3]);
    res.render('dashboard', {
      frequency: results[0], // First query from array

      todaysale: results[1],
      yeserday: results[2],

      weekday: results[3],
      monthday: results[4],
      lweekday: results[5],


      frequntlysold: results[6],
      listsoldqty: results[7],
      mostsoldbyshop: results[8],
      totalsalebyshop: results[9],
      shoplist: results[10],
     
      user:req.user      // Second query from array
    });
    
    });
});
router.get('/adduser', ensureAuthenticated, async function(req, res) {
  connection.query('Select * from shops', function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      console.log(results);
      res.render('adduser',{shoplist:results})
    }
  });
});
router.get('/userlist', ensureAuthenticated, async function(req, res)
{
connection.query('Select * from users', function(error, results, fields) {
  if (error) 
      {
          console.log(error);
      }
  else
  {
    console.log(results);
    res.render('userlist',{userlist:results})
  }
});
}
);
router.get('/addnewshop', ensureAuthenticated, (req, res) => res.render('addshop'));
router.get('/shoplist', ensureAuthenticated, async function(req, res){
  connection.query('Select * from shops', function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      console.log(results);
      res.render('shoplist',{shoplist:results})
    }
  });
});

router.get('/addcategory', ensureAuthenticated, async function(req, res)
{
  connection.query('Select * from productCategory', function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      console.log(results);
      res.render('addproductcategory',{procatlist:results})
    }
  });
});
router.get('/addproduct', ensureAuthenticated, async function(req, res) {
  connection.query('Select * from productCategory', function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      console.log(results);
      res.render('addproduct',{procatlist:results})
    }
  });
});
router.get('/productlist', ensureAuthenticated, async function (req, res) {
  connection.query('Select * from productlist', function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      console.log(results);
      res.render('productlist',{productlist:results})
    }
  });
});

router.get('/report', ensureAuthenticated, (req, res) => res.render('report'));
router.get('/stastics', ensureAuthenticated, (req, res) => res.render('stastics'));



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
  
router.post('/addnewsystemuser',async function(req,res)
{
    const {username,password,retypepassword,userroll,assignshop} = req.body;
let errors = [];
var shoplist =[];
connection.query('Select * from shops', function(error, results, fields) {
  if (error) 
      {
        errors.push({ msg: 'Please add all required fields' });
      }
  else
  {
    shoplist = results;
  }
});
if (!username || !password || !retypepassword || !userroll || !assignshop){
  errors.push({ msg: 'Please add all required fields' });
 
}
if (errors.length > 0) {
  res.render('adduser', {
    errors,
    shoplist:shoplist
  });
}
else if( password != retypepassword)
{
  res.render('adduser', {
    shoplist:shoplist,
  error_msg:'Password not match'
    
  });
}
 else {
  const v1options = {
    node: [0x01, 0x23],
    clockseq: 0x1234,
    msecs: new Date('2011-11-01').getTime(),
    nsecs: 5678,
  };
  userid = uuidv4(v1options);

  connection.query('Select * from users where username=? ', username, function(error, results, fields) {
      if (error) 
          {
              console.log(error);
          }
     else if(results.length>0)
       {
          res.render('adduser',
          {  shoplist:shoplist,
              error_msg:'User Name Already There'
          })
      }
      else
      {
          bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
              var  newpassword = hash;
              connection.query('Insert into users(username,password,userroll,userid,isactive,assignshop) values(?,?,?,?,?,?) ', [username,newpassword,userroll,userid,"Yes", assignshop], function(error, results, fields) {
                  if (error) 
                      {
                        res.render('adduser',{
                          shoplist:shoplist,
                          error_msg:'Something is wrong please try later'
                        })
                      }
                  else
                  {
                    res.render('adduser',{
                      shoplist:shoplist,
                      success_msg:'You are successfully add new system user'
                    })
                  }
                 
              });
              });
            });
          
      
       
      }
     
  });

 }
   
});
router.post('/addnewshop',async function(req,res)
{
    const {shopname,address,phone} = req.body;
let errors = [];
if (!shopname || !address || !phone){
  errors.push({ msg: 'Please add all required fields' });
 
}
if (errors.length > 0) {
  res.render('addshop', {
    errors,
    
  });
}

 else {
  const v1options = {
    node: [0x01, 0x23],
    clockseq: 0x1234,
    msecs: new Date('2011-11-01').getTime(),
    nsecs: 5678,
  };
  shopid = uuidv4(v1options);

  connection.query('Select * from shops where shopname=? ', shopname, function(error, results, fields) {
      if (error) 
          {
              console.log(error);
          }
     else if(results.length>0)
       {
          res.render('addshop',
          {
              error_msg:'Shop Name Already There'
          })
      }
      else
      {
        connection.query('Insert into shops(shopname,shopaddress,shopid,shoptelephone) values(?,?,?,?) ', [shopname,address,shopid,phone], function(error, results, fields) {
          if (error) 
              {
                res.render('addshop',{
                  error_msg:'Error occurs please try again'
                })
              }
          else
          {
            res.render('addshop',{
              success_msg:'You are successfully add new shop'
            })
          }
         
      });
          
      
       
      }
     
  });

 }
   
});
router.post('/addnewproductcategory',async function(req,res)
{
    const {catname} = req.body;
let errors = [];
var procatlist =[];
connection.query('Select * from productCategory', function(error, results, fields) {
  if (error) 
      {
        errors.push({ msg: 'Please add all required fields' });
      }
  else
  {
    procatlist = results;
  }
});
if (!catname){
  errors.push({ msg: 'Please add all required fields' });
 
}
if (errors.length > 0) {
  res.render('addproductcategory', {
    errors,
    procatlist:procatlist
  });
}

 else {
  const v1options = {
    node: [0x01, 0x23],
    clockseq: 0x1234,
    msecs: new Date('2011-11-01').getTime(),
    nsecs: 5678,
  };
  catid = uuidv4(v1options);

  connection.query('Select * from productCategory where procategoryname=? ', catname, function(error, results, fields) {
      if (error) 
          {
              console.log(error);
          }
     else if(results.length>0)
       {
          res.render('addproductcategory',
          {    procatlist:procatlist,
              error_msg:'Product Category Name Already There'
          })
      }
      else
      {
        connection.query('Insert into productCategory(procategoryname,catid) values(?,?) ', [catname,catid], function(error, results, fields) {
          if (error) 
              {
                res.render('addproductcategory',{
                  procatlist:procatlist,
                  error_msg:'Something is wrong please try later'
                })
              }
          else
          {
            res.render('addproductcategory',{
              procatlist:procatlist,
              success_msg:'You are successfully add new product category'
            })
          }
         
      });
          
      
       
      }
     
  });

 }
   
});
router.post('/addnewproduct',async function(req,res) 
{
    const {proname,procategory,price} = req.body;
let errors = [];
var procatlist =[];
connection.query('Select * from productCategory', function(error, results, fields) {
  if (error) 
      {
        errors.push({ msg: 'Please add all required fields' });
      }
  else
  {
    procatlist = results;
  }
});
if (!proname){
  errors.push({ msg: 'Please add all required fields' });
 
}
if (errors.length > 0) {
  res.render('addproduct', {
    errors,
    procatlist:procatlist
  });
}

 else {
  const v1options = {
    node: [0x01, 0x23],
    clockseq: 0x1234,
    msecs: new Date('2011-11-01').getTime(),
    nsecs: 5678,
  };
  proid = uuidv4(v1options);

  connection.query('Select * from productlist where productname=? ', proname, function(error, results, fields) {
      if (error) 
          {
              console.log(error);
          }
     else if(results.length>0)
       {
          res.render('addproduct',
          {    procatlist:procatlist,
              error_msg:'Product  Name Already There'
          })
      }
      else
      {
        connection.query('Insert into productlist(proid,productname,productcategory,price) values(?,?,?,?) ', [proid,proname,procategory,price], function(error, results, fields) {
          if (error) 
              {
                res.render('addproduct',{
                  procatlist:procatlist,
                  error_msg:'Something is wrong please try later'
                })
              }
          else
          {
            res.render('addproduct',{
              procatlist:procatlist,
              success_msg:'You are successfully add new product'
            })
          }
         
      });
          
      
       
      }
     
  });

 }
   
});
module.exports = router;