import { ClaseMovimiento } from "../models";
import { db } from "./";
import { IClaseMovimiento } from '../interfaces';



export const getAllClaseMovimiento = async ( organization: string) : Promise<IClaseMovimiento[]> => {
    await db.connect();
    const clases= await ClaseMovimiento.find({ organization})
                 .select('-createdAt -updatedAt -__v -organization ' ).lean();
    await db.disconnect();
    return JSON.parse(JSON.stringify(clases));


}

export const getClaseMovimientoByIdTipoMov = async ( idTipoMovimiento: number) : Promise<IClaseMovimiento> => {
    await db.connect();
    const clase= await ClaseMovimiento.findOne(  { idTipoMovimiento } )
                 .select('-createdAt -updatedAt -__v -organization ' ).lean();
    await db.disconnect();
    return JSON.parse(JSON.stringify( clase));


}