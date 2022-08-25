export interface IClaseMovimiento {
    _id               : string;
    name              : string;
    ingresoGasto      : string;
    ingresoSalda      : number;
    organization?     : string;
    idTipoMovimiento  : number;

    createdAt?     : string;
    updatedAt?     : string;

}