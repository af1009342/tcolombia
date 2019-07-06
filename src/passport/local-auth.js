const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');
const Contract = require('../models/contract');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',  
  passReqToCallback: true
}, async (req, email, password, done) => {
  const user = await User.findOne({'email': email})
  console.log('role del usuario que se va a guardar normalmente');
  console.log(req.body.role);
  if(user) {
    return done(null, false, req.flash('signupMessage', 'The Email is already Taken.'));
  } else {
    const newUser = new User();
    newUser.email = email;
    newUser.role = req.body.role;
    newUser.password = newUser.encryptPassword(password);    
  console.log(newUser)
    await newUser.save();
    done(null, newUser);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const user = await User.findOne({email: email});
  console.log('Signin');
  console.log(user);
  if(!user) {
    return done(null, false, req.flash('signinMessage', 'No User Found'));
  }
  if(!user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Incorrect Password'));
  }
  return done(null, user);
}));

passport.use('local-signup-asign', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',  
  passReqToCallback: true,
  session: false
}, async (req, email, password, done) => {
  const user = await User.findOne({'email': email})
  console.log('role del usuario que se va vincular o a guardar');
  console.log(req.body.role);
  const updateContract = await Contract.findOne({'Codcontract': req.body.codcontract_user});
  console.log(updateContract);
  if(user) {    
    const already_link = await Contract.findOne({'Codcontract': req.body.codcontract_user},{ coordinadores: user._id});  
    if(already_link){
      return done(null, false, req.flash('signupMessage', 'The Email '+user.email+' was already linked with the Contract.'+req.body.codcontract_user));     
    }else{
      updateContract.coordinadores.push(user);    
    await updateContract.save();
    return done(null, false, req.flash('infoMessage', 'The Email  '+user.email+' has linked with the Contract.'+req.body.codcontract_user));
    }
    
  } else {
    const newUser = new User();
    newUser.email = email;
    newUser.role = req.body.role;
    newUser.password = newUser.encryptPassword(password);    
  console.log(newUser)
    await newUser.save();
    
    updateContract.coordinadores.push(newUser);    
    await updateContract.save();
    done(null, newUser);
  }
}));