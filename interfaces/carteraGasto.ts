export interface ICarteraGasto {
    _id             : string;
    documento       : string;
    documentoRef    : string;
    fechaDocumento  : string;
    fechaMovimiento : string;
    tipoMovimiento  : string;
    monto           : number; 
    entradaSalida   : string;
    tipoDocumento   : string;
    nroDocumento    : number;
    tipoDocumentoRef: string;
    nroDocumentoRef : number;
    idTipoMovimiento: number;

    createdAt?      : string;
    updatedAt?      : string;
}