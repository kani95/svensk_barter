global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const express = require('express');
let app = express();
var router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const {MongoClient} = require('mongodb');
let url = "mongodb://localhost:27017/"

// Mongo URI
const mongoURI = 'mongodb://127.0.0.1:27017';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;
//let cors = require('cors');

app.use(express.static(__dirname), express.json());

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS'){
      res.header('Access-Control-Allow-Methods', 'POST, GET');
      return res.status(200).json({});
    }
    next();
});
        

app.listen(3003,"127.0.0.1",() =>{})

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files });
    }
  });
});


// @route POST /upload
// @desc  Uploads file to DB
router.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  console.log("in upload");
  res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
router.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});


router.get('/getAllListings/:searchword', (req, res) => {
    // fetch all metadata about listing from mongoDB
    let searchword = req.params.searchword.split(' ')
    console.log(searchword)

    MongoClient.connect(url, (err, db) => {
        let dbo = db.db("Test")
        let productsAllListingsArray = []
        let servicesAllListingsArray = []

        dbo.collection("Users").find({}).toArray(function (err, users) {

          if (err) {
            res.sendStatus(500)
            db.close();
          }
          else {
            users.forEach(user => {
              user.posts.forEach(listing => {
                for (let i = 0; i < searchword.length; i++) {
                  if (listing.title.match(new RegExp(searchword[i], "i"))) {
                      if(listing.tag.includes("product")) {
                        productsAllListingsArray.push(listing)
                        break
                      } else if (listing.tag.includes("service")) {
                        servicesAllListingsArray.push(listing)
                        break
                      } else {
                        res.sendStatus(304).send('No tag for listing')
                        break
                      }
                  } 
                }
              })
            })
            res.send({allProducts: productsAllListingsArray, allServices: servicesAllListingsArray})
            db.close();
            //for loop som matchar sökordet, placerar rätt resultat i initierad array, (om tomt sökord placera alla listings i array)
          }
        })
        
    })
})

router.get('/getAllListings/', (req, res) => {
    // fetch all metadata about listing from mongoDB
    let searchword = req.params.searchword
    console.log(typeof searchword)
    // KAN BEHÖVA CHECK IFALL SEARCHWORD ÄR TOMT

    MongoClient.connect(url, (err, db) => {
        let dbo = db.db("Test")
        let productsAllListingsArray = []
        let servicesAllListingsArray = []

        dbo.collection("Users").find({}).toArray(function (err, users) {

          if (err) {
            res.sendStatus(500)
            db.close();
          }
          else {
            users.forEach(user => {
              user.posts.forEach(listing => {
                if(listing.tag.includes("product")) {
                  productsAllListingsArray.push(listing)
                } else if (listing.tag.includes("service")) {
                  servicesAllListingsArray.push(listing)
                } else {
                  res.sendStatus(304).send('No tag for listing')
                }
              })
            })
            res.send({allProducts: productsAllListingsArray, allServices: servicesAllListingsArray})
            db.close();
            //for loop som matchar sökordet, placerar rätt resultat i initierad array, (om tomt sökord placera alla listings i array)
          }
        })
        
    })
})


module.exports = router;