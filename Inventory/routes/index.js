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
  connection.query('Select * from productlist', function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      //console.log(results);
      res.render('dashboard',{productlist:results,
      user:req.user
      })
    }
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
  connection.query('Select * from inventory', function(error, results, fields) {
    if (error) 
        {
            console.log(error);
        }
    else
    {
      console.log(results);
      res.render('report',{
        shoplist:results,
        user:req.user
           })
    }
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
  

router.post('/addnewtransaction',async function(req,res)
{
    const {pTableData} = req.body;
    console.log(pTableData);
let errors = [];
var productlist =[];
connection.query('Select * from productlist', function(error, results, fields) {
  if (error) 
      {
        errors.push({ msg: 'Please add all required fields' });
      }
  else
  {
    productlist = results;
  }
});
var values = [];
const copyItems = [];
myObj = JSON.parse(pTableData);

// before
for (let i = 0; i < myObj.length; i++) {
  copyItems.push(myObj[i]);
}
const datetrans = new Date();
const v1options = {
  node: [0x01, 0x23],
  clockseq: 0x1234,
  msecs: new Date('2011-11-01').getTime(),
  nsecs: 5678,
};
transid = uuidv4(v1options);

// after
copyItems.forEach((item) => {
  //console.log(item.UnitPrice);
  values.push([req.user.userid,req.user.assignshop,transid,item.ProductId,item.ProductDescription,item.UnitPrice,item.Quanity,item.Total,datetrans]);
 
  var sql = "INSERT INTO transaction (userid,shopid,transactionid,productid, description, price ,quantity ,total,postdate) VALUES ?";
  connection.query(sql,[values], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");

  });

  var sqludt = "UPDATE inventory SET quantity = quantity - "+ item.Quanity +" WHERE productid = "+ "'"+ item.ProductId +"'" + " && shopid = '"+ req.user.assignshop + "'";
  connection.query(sqludt, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  // connection.query('INSERT INTO transaction(userid,shopid,transactionid,productid, description, price ,quantity ,'+
  //   ' total,postdate) VALUES ?', [values], function(err,result) {
  //   if(err) {
  //     res.render('dashboard',{
  //       productlist:productlist,
  //       user:req.user,
  //       error_msg:'Something is wrong please try later'
  //     });

  //   }
  //  else {
  
  //   }
  // });

});

res.render('dashboard',{
  productlist:productlist,
  user:req.user,
  success_msg:'You are successfully add new transaction'
});

   
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
       connection.query("SELECT productid,procategory,productname,quantity  FROM inventory where productname LIKE "+"'"+ searchStr +"%'"+" LIMIT "+req.body.start +","+ req.body.length +""
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
        
      
        

//   NewLoad.count({isstart:"Yes"}, function(err, c) {
//       recordsTotal=c;
//       console.log(c);
//       NewLoad.count({
//         $and: [
//            {isstart:"Yes" },
//             searchStr 
//         ]
//      }, function(err, c) {
//           recordsFiltered=c;
//           console.log(c);
//           console.log(req.body.start);
//           console.log(req.body.length);
//           NewLoad.find({
//             $and: [
//                {isstart:"Yes" },
//                 searchStr 
//             ]
//          }, 'loadfrom loadto loadingdt loadprice',{'skip': Number( req.body.start), 'limit': Number(req.body.length) }, function (err, results) {
//                   if (err) {
//                       console.log('error while getting results'+err);
//                       return;
//                   }
          
//                   var data = JSON.stringify({
//                       "draw": req.body.draw,
//                       "recordsFiltered": recordsFiltered,
//                       "recordsTotal": recordsTotal,
//                       "data": results
//                   });
//                   res.send(data);
//               });
      
//         });
//  });
 
});
module.exports = router;