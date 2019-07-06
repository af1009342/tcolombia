
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const engine = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');

const socket = require('socket.io');

// initializations
const app = express();
require('./database');
require('./passport/local-auth');

// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
  secret: 'mysecretsession',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  app.locals.signinMessage = req.flash('signinMessage');
  app.locals.signupMessage = req.flash('signupMessage');
  app.locals.infoMessage = req.flash('infoMessage');
  app.locals.user = req.user;
//console.log(app.locals);
  next();
});

// routes
app.use('/', require('./routes/index'));



// Starting the server
const server = app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('socket connection opened:', socket.id);
  

  
  socket.on('chat:message', function(data) {
    io.sockets.emit('chat:message', data);
    console.log('chat:message');
    console.log(data);
     });

socket.on('chat:typing', function(data) {
  socket.broadcast.emit('chat:typing', data);
  console.log('chat:typing');
  console.log(data);
});

//socket oper - coord
socket.on('coord:oper', function(data) {
  console.log('server entro coord:oper');
  console.log(data);
  socket.broadcast.emit('coord:oper', data);  
  
});
socket.on('oper:coord', function(data) {
  socket.broadcast.emit('oper:coord', data);  
  console.log(data);
});

//socket oper - motor
socket.on('oper:motor', function(data) {
  console.log('entro en oper:motor');
  socket.broadcast.emit('oper:motor', data);  
  console.log(data);
});
socket.on('motor:oper', function(data) {
  socket.broadcast.emit('motor:oper', data);  
  console.log(data);
});

socket.on('disconnect', function() {
  console.log('Got disconnect!', socket.id);
});

});
