import { Casa, Familia } from "../models";
import { db } from "./";
import { IFamilia } from '../interfaces/familia';
import { ICasa } from "../interfaces";



export const getAllFamilias = async ( organization: string, status: string) : Promise<IFamilia[]> => {
    await db.connect();
    //console.log('getAllFamilias organization,status',organization,status) 
    const familias= await Familia.find({ organization})
                .select('-idOrganization -createdAt -updatedAt -casa -__v -organization ' ).lean();
    // console.log('getAllFamilias familias',familias) 
    const familiasOrd=familias.sort((a, b) => a.mesInicio - b.mesInicio );
                
            
    await db.disconnect();
      
    return JSON.parse(JSON.stringify(familiasOrd));


};
export const getFamiliaById = async ( id: string) : Promise<IFamilia> => {
    await db.connect();
    const familia = await Familia.findById( id );    
    //console.log('getFamiliaById',familia)
    await db.disconnect();      
    return JSON.parse(JSON.stringify(familia));

};
export const getCasaByCodigo = async ( codigo: string): Promise<ICasa> => {    
    await db.connect();
    const casa = await Casa.findOne( { codigo } );    
    await db.disconnect();      
    //console.log('getCasaByCodigo',codigo,casa) 
    return JSON.parse(JSON.stringify(casa));

};