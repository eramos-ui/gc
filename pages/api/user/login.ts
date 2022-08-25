import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypts from 'bcryptjs';

import { db, dbOrganization } from '../../../database'
import { User } from '../../../models'
import { jwt } from '../../../utils';


type Data = 
|{  message: string }
|{
    token            : string;
    user             : {
        email               : string;
        name                : string;
        role                : string;
        organization        : string; 
        nameOrganization?   : string;   
    }
}

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    switch( req.method ) {
        case 'POST':
            return loginUser( req, res )
        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }
}
const loginUser= async ( req: NextApiRequest, res: NextApiResponse<Data> ) =>{
    const { email='', password= ''} =req.body;
    
    await db.connect();
    const user = await User.findOne({ email });   
    if ( !user ) {
        await db.disconnect();
        return  res.status(400).json({ message: 'Correo o contraseña no válidos' });
    }
    if ( !bcrypts.compareSync( password, user.password!) ){
        await db.disconnect();
        return  res.status(400).json({ message: 'Correo o contraseña no válidos' });
    }
    const { role, name, _id, organization ='' }= user;
    const org = await dbOrganization.getOrganizationById( organization || '' );
    await db.disconnect();
    //console.log('loginUser organization', {org} );
    // const {  _idOrganization, nameOrganization }= organizationBelongs;
    //console.log('id, nombre', nameOrganization )
    const token = jwt.signToken( _id, email  );
    return  res.status(200).json({
        token,
        user : {
            email, 
            name, 
            role,
            organization,//este es el _id
            nameOrganization: org?.nameOrganization         
    
        }
      })
}