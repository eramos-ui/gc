export interface IDocumento {
    _id             : string;
    tipoDocumento   : string;
    nroDocumento    : number;
    fechaDocumento  : string;
    casa            :{
        codigo: string;      
    }
    usuario?        : string;
    familiaName     : string;
    idUsuario       : number; 
    tipoMovimiento  :{
        name            : string;     
        idTipoMovimiento: number;
        ingresoSalda    : number
       }
    monto           : number; 
    comentario?     : string;
    
    createdAt?      : string;
    updatedAt?      : string;

}
