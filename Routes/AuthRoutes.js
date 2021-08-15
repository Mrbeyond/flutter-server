const {Router} = require('express');
const router = Router();
const {db} = require('./../Models/DB')

router.get('/signup', (req,res)=>{
  console.log(req);
  res.status(200).json(5000);
})


module.exports = router;