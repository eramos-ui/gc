
export interface ICartola {
    _id             : string;

    fechaDocumento  : string;
    comentario      : string; 
    casa            :{
        codigo: string;      
    }
    documento      :{
      _id          : string;
      tipoDocumento: string;
      nroDocumento : number;
      familiaName  : string;
      comentario   : string; 
    } 
    documentoRef?    :{
      _id           : string;
      tipoDocumento : string;
      nroDocumento  : number; 
    } 
    tipoMovimiento  :{
     _id             : string;
     name            : string;     
     idTipoMovimiento: number;
     ingresoSalda    : number;
    }
    entradaSalida?    : string;
    monto             : number; 
    mesPago?          : number;
    tipoDocumento     : string;
    nroDocumento      : number;
    tipoDocumentoRef  : string;
    nroDocumentoRef   : number;
    usado             : number;
    saldo?            : number;   
    total?            : number;
    idTipoMovimiento? : number;

    createdAt?        : string;
    updatedAt?        : string;
}
