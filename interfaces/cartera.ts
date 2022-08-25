export interface ICartera {
    _id             : string;
    documento       : string;
    documentoRef    : string;
    fechaDocumento  : string;
    fechaMovimiento : string;
    casa?           : string;
    tipoMovimiento? : string;
    mesPago         : number;
    monto           : number; 
    entradaSalida   : string;
    tipoDocumento   : string;
    nroDocumento    : number;
    tipoDocumentoRef: string;
    nroDocumentoRef : number;
    idTipoMovimiento: number;//antiguo idClaseMovimiento

    createdAt?      : string;
    updatedAt?      : string;
}
