const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')


function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        // console.log ( await getRecordsLogin(query))
        
        
        const user = await getUserByEmail(email)
        // console.log('user passport confing: ' + user.name)
        
      if (user == null) {
        console.log('no user with that email')
        return done(null, false, { message: 'La contraseña o el correo son incorrectos' })
        
      }
  
      try {
          // console.log('in')
        if (await bcrypt.compare(password, user.password)) {
            return done(null, user)
        } else {
          return done(null, false, { message: 'La contraseña o el correo son incorrectos' })
        }
      } catch (e) {
        return done(e)
      }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) =>  {
        return done(null, getUserById(id))
    })
}

module.exports = initialize