var express = require('express');
const app = express();
var router = express.Router();
const {MongoClient} = require('mongodb');
const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');  

let url = "mongodb://localhost:27017/"
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Om användaren loggar in,
// params = användarnamn, hashat lösenord
// kolla om användarnamn finns, om det finns, kolla om hashat lösenord matchar
// om det matchar, returnera ett nytt sessionID, lägg även till nytt sessionID
// i databasen.
// om inte finns returnera status, baserat på status skriv felmeddelane. 
// returnerna en session ID/Token

router.post("/login", (req, res) => {
  let username = req.body.username;
  let pw = req.body.password;
  let myquery = { userID: username, password: pw}

  MongoClient.connect(url, (err, db) => {
    let dbo = db.db("tvitter");
    dbo.collection("users").findOne(myquery, function(err, result) {
      if (err) {
        res.sendStatus(500)

      } 
      else if (result != null) {
        
        //Skapar sessionID
        let sessionIDvalue = uuidv4();
        let newSessionID = { $set: {sessionID: sessionIDvalue} };
        
        dbo.collection("users").updateOne(myquery, newSessionID, function(err, result2) {
          if (err) {
            db.close();
            res.sendStatus(500)
 
          }
          else {
            db.close()
            res.status(200).send({sessionID: sessionIDvalue})
  
          }
        });
      } 
      else {
        //If we dont find a result
        res.sendStatus(500)
        db.close();

      }
    })
  })
})

// Om användaren registerar sig,
// params = användarnamn, hashat lösenord
// kolla om användarnamn finns, om det finns returna fel, annnars lägg till
// användare.
// returnear status (ok)
router.post("/register", (req, res) => {

    let username = req.body.username;
    let pw = req.body.password;
    let myquery = { userID: username}
  
    MongoClient.connect(url, (err, db) => {
      let dbo = db.db("tvitter");
      dbo.collection("users").findOne(myquery, function(err, result) {
        if (err) {
          res.sendStatus(500)
        } 
        else if (result != null) {
          //Det finns redan en användare med namnet
          res.sendStatus(500)
          db.close();
        } 
        else {
          //skapa användarobjekt
          let id = uuidv4();
          let newUser = {userID: username, password: pw, email: mail, sessionID: id, min_limit: min, max_limit: max, is_active: yes, admin: no, posts: []}
          dbo.collection('users').insertOne(newUser, function(err, result) {
            if (err) {throw err}
            else {
              db.close();
              res.sendStatus(200)
            }
          });
        }
      })
    })
  })

  // Om användare loggar ut
// params = session ID
// ta bort session ID, returna status
// returnarar status (ok)
router.patch("/logout", (req, res) => {
    let id = req.body.sessionID;
    let myquery = { sessionID: id}
  
    MongoClient.connect(url, (err, db) => {
      let dbo = db.db("tvitter");
      dbo.collection("users").findOne(myquery, function(err, result) {
        if (err) {
          res.sendStatus(500)
        } 
        else if (result != null) {
          let sessionIDvalue = uuidv4();
          let newSessionID = { $set: {sessionID: sessionIDvalue} };
          dbo.collection("users").updateOne(myquery, newSessionID, function(err, result2) {
            if (err) {
              db.close();
              res.sendStatus(500)
            }
            else {
              db.close()
              res.sendStatus(200)
            }
          });
  
        } 
        else {
          //If we dont find a result
          res.status(500).send("nothing found!")
          db.close();
        }
      })
    })
  })
  
  

module.exports = router;