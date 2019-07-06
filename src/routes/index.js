const router = require('express').Router();
const passport = require('passport');
const Task = require('../models/task');
const Client = require('../models/client');
const Contract = require('../models/contract');
const Ficha = require('../models/tab');
const User = require('../models/user');

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

/* router.post('/admin/signup', passport.authenticate('local-signup-asign', {  
  successRedirect: '/admin/signup',
  failureRedirect: '/admin/signup',
  failureFlash: true
}));  */

router.post('/admin/signup', async (req, res, next) => {  
  const newUser = new User(req.body);
  console.log("---------------newUser----------------");
  console.log(newUser);
  const user = await User.findOne({'email': newUser.email});
  console.log("user-------------------");
  console.log(user);
  const updateContract = await Contract.findOne({'Codcontract': req.body.codcontract_user});       
  if(updateContract){
  console.log("if updateContract exist then---------");
  console.log(updateContract);
    if(user) {
      console.log("if user exist then--------------------");    
      const already_link = await Contract.findOne({'Codcontract': newUser.codcontract_user},{ coordinadores: user._id});  
      if(already_link){
        console.log("ya lo habian vinculado----------");    
        req.flash('signupMessage', 'The Email '+newUser.email+' was already linked with the Contract.'+req.body.codcontract_user);     
        res.status(200).send({message:"oksss"});
      }else{
        console.log("acaba de ser vinculado--------");    
        updateContract.coordinadores.push(user);    
      await updateContract.save();
      req.flash('signupMessage', 'The User with the email  '+newUser.email+' has linked with the Contract.'+req.body.codcontract_user);
      res.status(200).send({message:"oksss"});
            }    
    } else {
      console.log("el usuario o su correo no existe, primero se crea")
      const newUser = new User();
      newUser.email = req.body.email;
      newUser.role = req.body.role;
      newUser.password = newUser.encryptPassword(req.body.password);    
    console.log(newUser)
      await newUser.save();    
      updateContract.coordinadores.push(newUser);    
      await updateContract.save();
      
      req.flash('signupMessage', 'The Email  '+newUser.email+' was created and linked with the Contract.'+req.body.codcontract_user);
      res.status(200).send({message:"oksss"});
    }
   
  }else{
    req.flash('signupMessage', 'Error, we couln´t find the contract: '+req.body.codcontract_user+'');
    res.status(200).send({message:"oksss"});
  }


});




router.post('/admin/client/add', async (req, res, next) => {  
  const newClient = new Client(req.body);
  const client = await newClient.save(); 
  console.log(client);
  res.status(200).json({client});   
});

router.post('/admin/contract/add', async (req, res, next) => {
 //console.log(req.body);
  const updateContract = await Contract.findOne({'Codcontract': req.body.Codcontract});
  if(!updateContract){
    console.log("contrato no existe, procedemos-------------------");
    //--------------------
    const newUser = new User(req.body);    
    console.log("newUser");
    console.log(newUser);
    const user = await User.findOne({'email': newUser.email});
    const newFicha = new Ficha(req.body);
    newFicha.contract = req.body._id;
    const ficha = await newFicha.save();
    const newContract = new Contract(req.body);

    if(user) {
      console.log("if user exist then--------------------");    
      const already_link = await Contract.findOne({'Codcontract': req.body.Codcontract},{ coordinadores: user._id});  
      if(already_link){
        console.log("ya lo habian vinculado----------");    
        req.flash('signupMessage', 'The Email '+newUser.email+' was already linked with the Contract.'+req.body.Codcontract);     
        res.status(200).send({contract_id: already_link._id});
      }else{
        console.log("acaba de ser vinculado--------");    
        newContract.coordinadores.push(user);    
      //await updateContract.save();
      req.flash('signupMessage', 'The User with the email  '+newUser.email+' has linked with the Contract.'+req.body.Codcontract);
      //res.status(200).send({message:"oksss"});
            }    
    } else {
      console.log("el usuario o su correo no existe, primero se crea");
      newUser.password = newUser.encryptPassword(req.body.password);    
      console.log(newUser);
      await newUser.save();    
      newContract.coordinadores.push(newUser);    
      //await updateContract.save();        
      req.flash('signupMessage', 'The Email  '+newUser.email+' was created and linked with the Contract.'+req.body.Codcontract);
      //res.status(200).send({message:"oksss"});
    }       
    //--------------------
    

    newContract.nit_cc = req.body.nit_cc_client;    
    newContract.ficha.push(ficha);
    console.log("ficha");
    console.log(ficha);
    const contract = await newContract.save();
    console.log("contract");
    console.log(contract);
      const client = await Client.findOne({'nit_cc_client': req.body.nit_cc_client});

      if(!client){
        console.log("cliente con nit "+ req.body.nit_cc_client +" no existe se salva y se vincula al contrato");
        const newClient = new Client(req.body);
        newClient.contract = contract._id;
        await newClient.save();
        console.log(newClient);
        await Contract.findByIdAndUpdate(contract._id, {$set:{cliente: newClient._id}});        
        console.log("updateContract");      
      }else{
        console.log("cliente ya existia entonces solo se vincula al contrato");
        client.contract = contract._id;
        const newClient = await client.save();
        console.log(newClient);
        await Contract.findByIdAndUpdate(contract._id, {$set:{cliente: newClient._id}});        
        console.log("updateContract");      
      }
     
      
    res.status(200).json({contract_id: contract._id});
  }else{
    console.log("Error, we couln´t create the contract: "+req.body.Codcontract+" because already exist-------------------");
    req.flash('signupMessage', 'Error, we couln´t create the contract: '+req.body.Codcontract+' because already exist');
    res.status(200).send({contract_id: updateContract._id});
  }
/*  

 
        const updateFicha = await Ficha.findOne({'tab': req.body.tab},{'Dependencia': req.body.Dependencia});
        console.log("updateFicha");
        console.log(updateFicha);
  
 
  
  
  newContract.cliente = client;
  
  

  res.status(200).json({newContract}); */
  
     
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

router.get('/data/admin/contract/:codcontract_user/', async (req, res, next) => {
  const { codcontract_user } = req.params;
  const selcontract = await Contract.find({$text: {$search: codcontract_user , 
    "$caseSensitive": false, 
    "$diacriticSensitive": false}}).populate('cliente');
  console.log(selcontract);
  res.status(200).json({selcontract});
});

router.get('/data/admin/client/:nit_cc_client_val/', async (req, res, next) => {
  const { nit_cc_client_val } = req.params;
  const nit_cc_client = await Client.find({$text: {$search: nit_cc_client_val , 
    "$caseSensitive": false, 
    "$diacriticSensitive": false}});
  console.log(nit_cc_client);  
  res.status(200).json({nit_cc_client});
});

router.get('/data/contract/:contractId/', async (req, res, next) => {
  const { contractId } = req.params;  
  const ficha = await Contract.findById(contractId).populate('ficha').populate('cliente');
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
