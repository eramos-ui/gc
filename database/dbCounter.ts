
import { db } from '.';
import {  ICounterIngreso, ICounterGasto } from '../interfaces';
import { CounterGasto, CounterIngreso } from '../models';

 export const updateGetCounterIngreso = async (organization: string ) : Promise<ICounterIngreso[]> =>{
    await db.connect();
    const sequencia= await CounterIngreso.find( { organization});  
    const id=sequencia[0]._id;  
    const sequence: any= await CounterIngreso.findById( id);  
    const newSeq=sequence.seq +1;    
    //const newSeq=214;
    await CounterIngreso.findByIdAndUpdate( id,  { seq: newSeq })
    await db.disconnect();
    return JSON.parse(JSON.stringify({seq:newSeq}));
 }

 export const updateGetCounterGasto = async ( organization: string ) : Promise<ICounterGasto[]> =>{
   await db.connect();
   const sequencia= await CounterGasto.find( { organization});  
   const id=sequencia[0]._id;  

   const sequence: any= await CounterGasto.findById( id);  
   const newSeq=sequence.seq +1;    
   await CounterGasto.findByIdAndUpdate( id,  { seq: newSeq })
   await db.disconnect();
   return JSON.parse(JSON.stringify({seq:newSeq}));
}
