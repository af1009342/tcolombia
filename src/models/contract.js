const mongoose = require('mongoose');
const { Schema } = mongoose;
//esquema de Contratos
const contractSchema = new Schema({
    Codcontract:{
                    type:String
                    //unique:true
                },
    cliente:{
        type: Schema.Types.ObjectId,
        ref:'client'
    },
    nit_cc: String,        
    valor: Number,    
    ficha:[{
        type: Schema.Types.ObjectId,
        ref:'tab'
    }]

});

module.exports = mongoose.model('contract', contractSchema);
