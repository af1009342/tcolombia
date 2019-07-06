const mongoose = require('mongoose');
const { Schema } = mongoose;
//esquema de fichas de Contratos


const tabSchema = new Schema({
  tab: String,
  Dependencia: String,
  valor_ficha: Number ,
  valor_ficha_ejecutado: Number ,
  contract:{
    type: Schema.Types.ObjectId,
    ref:'contract'
}
});


module.exports = mongoose.model('tab', tabSchema);
