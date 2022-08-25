import Organization from "../models/Organization";
import { db } from "./";



export const getOrganizationById = async ( id: string) => {
    await db.connect();

    const organization = await Organization.findOne( { _id:  id } );
    await db.disconnect();
    if ( !organization ){
          return null;
    }
    const {  name ='' , _id  } = organization;
    return {
       _idOrganization : _id,
       nameOrganization: name 
    }

}


