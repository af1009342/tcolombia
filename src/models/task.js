const mongoose = require('mongoose');
const { Schema } = mongoose;


function toLower (v) {
  return v.toLowerCase();
}

const taskSchema = new Schema({
  id_reg_mas: String,
  contrato: String,
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
  },
  nit_cc: Number,
  
  tel_cel: Number,
  email: { type: String, set: toLower } , 
  tiempo_partida: Date,  
  ida_dire: String,
  ida_dire2: String,
  depar_ciu_ida: String,
  des_i_dire: String,
  depar_ciu_des_i: String,
  tiempo_recogida: Date,
  reg_dire: String,
  depar_ciu_reg_r: String,
  des_reg_dire: String,
  tipo_trayecto: String,
  fecha_modificada: {
    type: Date    
  }
});  
module.exports = mongoose.model('task', taskSchema);

//tipo_trayecto2=testido

//direccion=&
