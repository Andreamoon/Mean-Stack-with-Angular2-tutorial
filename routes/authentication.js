const User = require('../models/user'); // Import User Model Schema
const jwt = require('jsonwebtoken'); // Compact, URL-safe means of representing claims to be transferred between two parties.
const config = require('../config/database'); // Import database configuration

module.exports = (router) => {
  /* ==============
     Register Route
  ============== */
  router.post('/register', (req, res) => {
    // Check if email was provided
    if (!req.body.email) {
      res.json({ success: false, message: 'Devi registrare una E-mail' }); // Return error
    } else {
      // Check if username was provided
      if (!req.body.username) {
        res.json({ success: false, message: 'Devi registrare un username' }); // Return error
      } else {
        // Check if password was provided
        if (!req.body.password) {
          res.json({ success: false, message: 'Devi registrare una password' }); // Return error
        } else {
          // Create new user object and apply user input
          let user = new User({
            email: req.body.email.toLowerCase(),
            username: req.body.username.toLowerCase(),
            password: req.body.password
          });
          // Save user to database
          user.save((err) => {
            // Check if error occured
            if (err) {
              // Check if error is an error indicating duplicate account
              if (err.code === 11000) {
                res.json({ success: false, message: 'Username or e-mail gia esistente' }); // Return error
              } else {
                // Check if error is a validation rror
                if (err.errors) {
                  // Check if validation error is in the email field
                  if (err.errors.email) {
                    res.json({ success: false, message: err.errors.email.message }); // Return error
                  } else {
                    // Check if validation error is in the username field
                    if (err.errors.username) {
                      res.json({ success: false, message: err.errors.username.message }); // Return error
                    } else {
                      // Check if validation error is in the password field
                      if (err.errors.password) {
                        res.json({ success: false, message: err.errors.password.message }); // Return error
                      } else {
                        res.json({ success: false, message: err }); // Return any other error not already covered
                      }
                    }
                  }
                } else {
                  res.json({ success: false, message: 'Could not save user. Error: ', err }); // Return error if not related to validation
                }
              }
            } else {
              res.json({ success: true, message: 'Acount registrato!' }); // Return success
            }
          });
        }
      }
    }
  });
/* ============================================================
      Route to check if user's email is available for registration
   ============================================================ */
   router.get('/checkEmail/:email', (req, res) => {
     // Check if email was provided in paramaters
     if (!req.params.email) {
       res.json({ success: false, message: 'Inserisci una E-mail' }); // Return error
     } else {
       // Search for user's e-mail in database;
       User.findOne({ email: req.params.email }, (err, user) => {
         if (err) {
           res.json({ success: false, message: err }); // Return connection error
         } else {
           // Check if user's e-mail is taken
           if (user) {
             res.json({ success: false, message: 'E-mail gia esistente' }); // Return as taken e-mail
           } else {
             res.json({ success: true, message: 'E-mail disponibile' }); // Return as available e-mail
           }
         }
       });
     }
   });

   /* ===============================================================
      Route to check if user's username is available for registration
   =============================================================== */
   router.get('/checkUsername/:username', (req, res) => {
     // Check if username was provided in paramaters
     if (!req.params.username) {
       res.json({ success: false, message: 'Inserisci un Username' }); // Return error
     } else {
       // Look for username in database
       User.findOne({ username: req.params.username }, (err, user) => {
         // Check if connection error was found
         if (err) {
           res.json({ success: false, message: err }); // Return connection error
         } else {
           // Check if user's username was found
           if (user) {
             res.json({ success: false, message: 'Username gia esistente' }); // Return as taken username
           } else {
             res.json({ success: true, message: 'Username disponibile' }); // Return as vailable username
           }
         }
       });
     }
   });

   /* ========
  LOGIN ROUTE
  ======== */
  router.post('/login', (req, res) => {
    // Check if username was provided
  if (!req.body.username) {
    res.json({ success: false, message: 'No username was provided' }); // Return error
  } else {
    // Check if password was provided
    if (!req.body.password) {
      res.json({ success: false, message: 'No password was provided.' }); // Return error
    } else {
      // Check if username exists in database
      User.findOne({username:req.body.username.toLowerCase()},(err,user)=>{
        if(err){
            res.json({ success: false, message: err }); // Return error
        }else{
            if(!user){
                  res.json({ success: false, message: 'Username non trovato' }); // Return error
            }else{
              const validePassword = user.comparePassword(req.body.password);
                if(!validePassword){
                    res.json({ success: false, message: 'password non valida' });
                }else{
                  //inserisco un token criptando l'id dell user sul browser a cui aggiungo un secret e una durata
                  const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h' }); // Create a token for client
                  res.json({ success: true, message: 'Hai effettuato il login', token: token, user: { username: user.username } });
                }
             }
          }
      });

    }
  }
});
/* ================================================
  MIDDLEWARE - Used to grab user's token from headers prima di questa route non ce nessuna autenticazione per tutte quelle dopo ci vuole
  ================================================ */
  router.use((req, res, next) => {
    const token = req.headers['authorization']; // Create token found in headers
    // Check if token was found in headers
    if (!token) {
      res.json({ success: false, message: 'Non ce nessun token' }); // Return error
    } else {
      // Verify the token is valid
      jwt.verify(token, config.secret, (err, decoded) => {
        // Check if error is expired or invalid
        if (err) {
          res.json({ success: false, message: 'Token invalid: ' + err }); // Return error for token validation
        } else {
          req.decoded = decoded; // Create global variable to use in any request beyond
          next(); // Exit middleware
        }
      });
    }
  });

/* ===============================================================
     Route to get user's profile data
  =============================================================== */
  router.get('/profile', (req, res) => {
    // Search for user in database
    User.findOne({ _id: req.decoded.userId }).select('username email').exec((err, user) => {
      // Check if error connecting
      if (err) {
        res.json({ success: false, message: err }); // Return error
      } else {
        // Check if user was found in database
        if (!user) {
          res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
        } else {
          res.json({ success: true, user: user }); // Return success, send user object to frontend for profile
        }
      }
    });
  });
  return router; // Return router object to main index.js
}
