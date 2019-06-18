const mongoose = require('mongoose');

const { Schema } = mongoose;

const taskSchema = new Schema({
  coord:String,
  pasajero: String,
  direccion: String,
  estado: {
    type: String,
    default: "En espera"},
  notifico: String,
  asignado: String,
  test :{
    type: String,
    default:"prueba"
  }
});  
module.exports = mongoose.model('task', taskSchema);
