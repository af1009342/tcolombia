const router = require('express').Router();
const passport = require('passport');
const Task = require('../models/task');
const Client = require('../models/client');
const Contract = require('../models/contract');
const Ficha = require('../models/tab');

router.get('/', (req, res, next) => {
  res.render('index');
});

//queda pendiente ver por que se indefine allow que es un componente del objeto con los permisos
//lo mas probables es que se por el tema del caracter * que va al final de cada dirección /signup* 
// toca hacer un debugger

router.get('/signup',isAuthenticated ,role_allow , (req, res, next) => {
  res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {  
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
})); 







router.get('/signin', (req, res, next) => {
  res.render('signin');
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/profile',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/profile',  isAuthenticated, (req, res, next) => {
  res.render('profile');
});

router.get('/logout',(req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.get('/coord', role_allow);


router.get('/coord', async (req, res, next) => {
  const tasks = await Task.find();
  console.log(tasks);
  res.render('coord', {
    tasks
  });  
});


router.get('/coord/:usuario', async (req, res, next) => {
  let { usuario } = req.params;
  const tasks = await Task.find({ coord:  usuario });    
  res.render('coord', {
    tasks
  });  
});


router.post('/coord/add', async (req, res, next) => {
  const newTask = new Task(req.body);  
  const tasks = await newTask.save();  
  res.status(200).json({success: true});   
});

//admin rutas
router.post('/admin/client/add', async (req, res, next) => {  
  const newClient = new Client(req.body);
  const client = await newClient.save(); 
  console.log(client);
  res.status(200).json({client});   
});

router.post('/admin/contract/add', async (req, res, next) => {
  console.log(req.body);
  const newContract = new Contract(req.body);
  const contract = await newContract.save(); 

  const newClient = new Client(req.body);
  newClient.contract = contract._id;
  const client = await newClient.save();  

  const newFicha = new Ficha(req.body);
  newFicha.contract = contract._id;
  const ficha = await newFicha.save();
  
  newContract.cliente = client;
  newContract.ficha.push(ficha);
  await newContract.save();

  res.status(200).json({newContract});   
});

router.post('/admin/:contractId/ficha/add', async (req, res, next) => {
  const { contractId } = req.params;
  const newFicha = new Ficha(req.body);  
  const ficha = await newFicha.save();
  const contract = await Contract.findById(contractId);
  contract.ficha.push(ficha);
  await contract.save();
  res.status(200).json({contract});   
});

router.put('/admin/:contractId/:fichaId/remove', async (req, res, next) => {
  const { contractId } = req.params;
  const { fichaId } = req.params;
  const contract = await Contract.findByIdAndUpdate(contractId, { $pull: {
    'ficha': fichaId }});
  res.status(200).json({success: true});   
});


router.get('/data/contract/:contractId/', async (req, res, next) => {
  const { contractId } = req.params;  
  const {ficha} = await Contract.findById(contractId).populate('ficha').populate('cliente');
  console.log(ficha);
  res.status(200).json({ficha});   
});


//admin rutas fin

router.get('/coord/delete/:id', async (req, res, next) => {
  let { id } = req.params;
  await Task.remove({_id: id});
  res.status(200).json({success: true});
});



/* router.post('/coord/add', async (req, res, next) => {
  const newTask = new Task(req.body);  
  const tasks = await newTask.save();  
  res.render('coord', {
    tasks
  });   
}); */


router.get('/oper*', role_allow);

router.get('/oper', async (req, res, next) => {
  const tasks = await Task.find();
  res.render('oper', {
    tasks
  });
  console.log("cuerpo:"+req.body);
});

router.put('/oper/edit/:taskId', role_allow , async (req, res, next) => {
  const { taskId } = req.params;
  console.log("taskId: ");
  console.log(taskId);
  const newTask  = req.body;
  console.log("newTask:");
  console.log(newTask);
  const wasAsigned = await Task.findById(taskId);
  if(wasAsigned.asignado){
    console.log("fue signado");
    res.status(500).send('Ya fue signado');
  }else{
    const oldUser = await Task.findByIdAndUpdate(taskId, newTask);
    res.status(200).json({success: true});
  }  
});


router.get('/oper/edit/:idTask', async (req, res, next) => {
   let { idTask } = req.params;
   console.log(req.body._id);
  await Task.update({_id: idTask}, req.body);  
  /*res.render('oper', {
    tasks
  }); */
  console.log("actualizarrr"+ idTask);
  res.send("actulizado");
});


router.get('/motor', (req, res, next) => {
  res.render('motor');  
});

/**
router.get('/motor', role_allow);

router.get('/motor/:user', (req, res, next) => {
  let { user } = req.params;
  res.render('motor', {
    tasko: user
  });  
});
 */

router.put('/motor/edit/:taskId',  async (req, res, next) => {
  const { taskId } = req.params;
  console.log("taskId: ");
  console.log(taskId);
  const newTask  = req.body;
  console.log("newTask:");
  console.log(newTask);
  const wasAsigned = await Task.findById(taskId);
  console.log("wasAsigned:");
  console.log(wasAsigned);

   if(wasAsigned.asignado){
    console.log("fue signado");
    res.status(500).send('Ya fue signado');
  }else{
    const oldUser = await Task.findByIdAndUpdate(taskId, newTask);
    res.status(200).json({success: true});
  }
});

router.get('/tabla', async (req, res, next) => {
  const tasks = await Task.find();
  res.render('tabla', {
    tasks
  });  
});

router.get('/data/oper', async (req, res, next) => {
  const tasks = await Task.find();
  res.json(tasks);
});

router.get('/data/coord/:coord', async (req, res, next) => {
  let { coord } = req.params;
  const tasks = await Task.find({ coord:  coord });
  req.session.name = coord;    
  res.json(tasks);
});

router.get('/data/motor/:notifico', async (req, res, next) => {
  let { notifico } = req.params;
  req.session.name = notifico;  
  const newNotifico = await Task.find({ notifico: { $regex: notifico }});  
  res.json(newNotifico);
});

router.get('/chat', (req, res, next) => {
  res.render('chat');  
});

//

function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}

function role_allow(req, res, next) {
  
  const admin = [
    {route: '/profile', allow: true},
    {route: '/signup', allow: true},
    {route: '/oper', allow: true},    
    {route: '/coord', allow: true},
    {route: '/logout', allow: true},
    {route: '/motor', allow: false}
    ];

    const coord = [
      {route: '/profile', allow: true},
      {route: '/signup', allow: false},
      {route: '/oper', allow: false},
      {route: '/coord', allow: true},
      {route: '/logout', allow: true},
      {route: '/motor', allow: false}
      ];

      const oper = [
        {route: '/profile', allow: true},
        {route: '/signup', allow: false},
        {route: '/oper', allow: true},
        {route: '/coord', allow: false},
        {route: '/logout', allow: true},
        {route: '/motor', allow: false}
        ];

        const motor = [
          {route: '/profile', allow: true},
          {route: '/signup', allow: false},
          {route: '/oper', allow: false},
          {route: '/coord', allow: false},
          {route: '/logout', allow: true},
          {route: '/motor', allow: true}
          ];

  tmp_allow = new Boolean(false);

  if(req.user.role==='admin'){        
    var str = req.path;
    var n = str.indexOf("/", 1);
    if(n>0){
      var res_cut = str.substring(0, n);
    }else{
      var res_cut = str;
    }  
    const resultado = admin.find( rout => rout.route === res_cut );
     if (typeof resultado === "undefined" || resultado.allow === false){
      console.log('the page is not available...'); // print into console
      tmp_allow = new Boolean(false);
        res.redirect('/');
      }else{
        return next();
      }
  }
  
  if(req.user.role==='coord'){
    var str = req.path;
    var n = str.indexOf("/", 1);
    if(n>0){
      var res_cut = str.substring(0, n);
    }else{
      var res_cut = str;
    }  
    const resultado = coord.find( rout => rout.route === res_cut );
     if (typeof resultado === "undefined" || resultado.allow === false){
      console.log('the page is not available...'); // print into console
      tmp_allow = new Boolean(false);
        res.redirect('/');
      }else{
        return next();
      }
 }

 if(req.user.role==='oper'){
  var str = req.path;
  var n = str.indexOf("/", 1);
  if(n>0){
    var res_cut = str.substring(0, n);
  }else{
    var res_cut = str;
  }  
    
    const resultado = oper.find( rout => rout.route === res_cut );  
     if (typeof resultado === "undefined" || resultado.allow === false){
      console.log('the page is not available...'); // print into console
      tmp_allow = new Boolean(false);
        res.redirect('/');
      }else{
        return next();
      }
}

if(req.user.role==='motor'){
  var str = req.path;
  var n = str.indexOf("/", 1);
  if(n>0){
    var res_cut = str.substring(0, n);
  }else{
    var res_cut = str;
  }  
  const resultado = motor.find( rout => rout.route === res_cut );
     if (typeof resultado === "undefined" || resultado.allow === false){
      console.log('the page is not available...'); // print into console
      tmp_allow = new Boolean(false);
        res.redirect('/');
      }else{
        return next();
      }
}
 
}

module.exports = router;
