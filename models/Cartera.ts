import mongoose, { Schema, model, Model } from 'mongoose';
import { ICartera } from '../interfaces';

const carteraSchema = new Schema({
    casa            : { type: Schema.Types.ObjectId, ref: 'Casa', required: true },
    tipoMovimiento  : { type: Schema.Types.ObjectId, ref: 'ClaseMovimiento', required: true },
    documento       : { type: Schema.Types.ObjectId, ref: 'Documento', required: true },
    documentoRef    : { type: Schema.Types.ObjectId, ref: 'Documento', required: true },    
    fechaDocumento  : { type: String, required: true },
    fechaMovimiento : { type: String, required: true },
    monto           : { type: Number, required: true },
    mesPago         : { type: Number, required: true },
    entradaSalida   : { type: String, required: true },
    tipoDocumento   : { type: String, required: true },
    nroDocumento    : { type: Number, required: true },
    tipoDocumentoRef: { type: String, required: true },
    nroDocumentoRef : { type: Number, required: true },
    idTipoMovimiento: { type: Number, required: true },
}, {
    timestamps  : true,
})

const Cartera:Model<ICartera> = mongoose.models.Cartera || model('Cartera',carteraSchema);

export default Cartera;