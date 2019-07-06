const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientSchema = new Schema({
  nit_cc_client: String,
  name_client: String,
  dir_client: String,
  tel_client: String,
  contract:{
    type: Schema.Types.ObjectId,
    ref:'contract'
}
});
  
module.exports = mongoose.model('client', clientSchema);
