import { ClaseMovimiento } from "../models";
import { db } from "./";
import { IClaseMovimiento } from "../interfaces";



export const getAllGastos = async ( organization: string, status: string) : Promise<IClaseMovimiento[]> => {
    await db.connect();
    const gastos= await ClaseMovimiento.find({ organization, ingresoGasto:'G'})
                .select('-idOrganization -createdAt -updatedAt -__v -organization ' ).lean();
    //const gastosOrd=gastos.sort((a, b) =>  a.name.localeCompare(b.name) );
                
            
    await db.disconnect();
      
    return JSON.parse(JSON.stringify(gastos));


}