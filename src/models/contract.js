const mongoose = require('mongoose');
const { Schema } = mongoose;
//esquema de Contratos
const contractSchema = new Schema({
    Codcontract:{
                    type:String,
                    index:true
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
    }],
    coordinadores:[{
        type: Schema.Types.ObjectId,
        ref:'user'
    }]

});

contractSchema.index({Codcontract: 'text'});

module.exports = mongoose.model('contract', contractSchema);
