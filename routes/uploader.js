var express = require('express');
var router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ejs = require('ejs');


const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};


// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './routes/uploadedImages/',
  /*
  filename: function(req, file, cb){
    cb(null,'image.png')
  }
  */
  
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
  
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

router.post('/', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.send("error")
    } 
    else {
      if(req.file == undefined){
        res.send("No file selected");
      } 
      else {
        res.render('index');
       }
    }
  });
});

router.get("/videoStream.mp4", (req, res) => {
  //Read all files in the folder
  fs.readdir(path.join(__dirname, "./uploadedImages/"), (err, files) => {

      //Find most recently uploaded file
      let numOfFiles = files.length;
      files[numOfFiles-1];

      let filePath  = "./uploadedImages/" + String(files[numOfFiles-1]);
      console.log("filePath: " + filePath);
      res.sendFile(path.join(__dirname, filePath));

 
  });

  app.get('/video', function(req, res) {
    const path = './routes/uploadedImages/testVideo.mp4'
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] 
        ? parseInt(parts[1], 10)
        : fileSize-1
      const chunksize = (end-start)+1
      const file = fs.createReadStream(path, {start, end})
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
  });
  //res.sendFile(path.join(__dirname, "./uploadedImages/image.png"));
});


module.exports = router;
