import bcrypt from 'bcryptjs';
import {Organization, User} from '../models';

import { db, dbOrganization } from "./";
import { connect } from './db';




export const checkUserEmailPassword = async ( email: string, password: string ) => {
   //console.log('checkUserEmailPassword', email)
   await db.connect();
   const user = await User.findOne ( { email });
   await db.disconnect();
   if ( !user ) {
      return null;
   }
   if ( !bcrypt.compareSync ( password, user.password!) ){
      return null;
   }
   const { role, name , _id, organization ='' } = user;
   const org = await dbOrganization.getOrganizationById(  organization );
   
   return {
      _id,
      email: email.toLocaleLowerCase(),
      role,
      name,
      organization,
      nameOrganization: org?.nameOrganization
   }
}
//esta función crea o verifica un usuario de oauth  --301
export const oAuthToDbUser = async ( oAuthEmail: string, oAuthName: string ) =>{
   
   await connect();
   const user= await User.findOne( { email: oAuthEmail});  //verificamos que no está repetido
   //console.log('oAuthToDbUser', oAuthEmail,user);
   if ( user ) {
      await  db.disconnect();
      const { _id, name, email, role, organization='' }= user;
      const org = await dbOrganization.getOrganizationById(  organization );
      return  { _id, name, email, role, organization,  nameOrganization: org?.nameOrganization };
   }
   
   const organ = await Organization.findOne({ idOrganization: 0});
   //console.log('Organizacion 0',organ?._id)

   const newUser= new User({ email:oAuthEmail , name: oAuthName , password: '@', role: 'admin', organization: organ })
   await newUser.save();
   await db.disconnect();
   const { _id, name, email, role }= newUser;
   return { _id, name, email, role, organization: organ, nameOrganization: organ?.name   };
}
export const getUserByEmail = async ( email: string ) =>{
   await connect();
   const user= await User.findOne( { email});  //verificamos que no está repetido
   await db.disconnect();
   if ( user ) {
      const { _id, name, email, role, organization='' }= user;
      const org = await dbOrganization.getOrganizationById(  organization );
      return  JSON.parse(JSON.stringify( { _id, name, email, role, organization,  nameOrganization: org?.nameOrganization }));
   }
}
