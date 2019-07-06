const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientSchema = new Schema({
  nit_cc_client: Number,
  name_client:{
                type:String,
                index:true
              },
  dir_client: String,
  tel_client: String,
  contract:{
    type: Schema.Types.ObjectId,
    ref:'contract'
}
});

clientSchema.index({name_client: 'text'});

module.exports = mongoose.model('client', clientSchema);
