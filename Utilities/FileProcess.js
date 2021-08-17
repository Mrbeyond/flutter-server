const multer = require('multer');
const { /*join,*/ extname } = require('path');
const { gallery } = require('../landingUtils');

// const dataUri = require("datauri/parser");
// const dataParser= new dataUri();

// const dataURI = file => dataParser.format(extname(file.originalname).toString(), file.buffer);
// {
const fileFilter = (req, file, cb)=>{
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
}

const limits={
  fileSize: 1*1024*1024,
}

const LOCAL = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, gallery);
  },
  filename: (req, file, cb)=>{
    cb(null, `${req.UID}_pp_${Date.now()}${extname(file.originalname)}`);
  },
  fileFilter
})

const CLOUD = multer.memoryStorage();


// }
module.exports={
  LOCAL_MULTER: multer({LOCAL}),
  CLOUD_MULTER: multer({storage: CLOUD, fileFilter, limits})
}