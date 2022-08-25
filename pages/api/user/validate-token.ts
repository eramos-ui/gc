import type { NextApiRequest, NextApiResponse } from 'next'
//import bcrypt from 'bcryptjs';

import { db } from '../../../database'
import { User } from '../../../models'
import { jwt } from '../../../utils';

type Data = 
|{  message: string }
|{
    token: string;
    user: {
    email: string;
    name: string;
    role: string;
    organization?: string

    }
}

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    switch( req.method ) {
        case 'GET':
            return checkJWT( req, res )
        default:
            res.status(400).json({
                message: 'Bad request'
            })

    }
}
const checkJWT= async ( req: NextApiRequest, res: NextApiResponse<Data> ) =>{
    const { token = ''} =req.cookies;//esta es una alternativa, otra opción es req.headers
    let userId= '';
    try{
        userId= await jwt.isValidToken( token );

    }catch (error){
        return  res.status(401).json({ message: 'Token de autorización no es válido' });
    }     
    //res.status(200).json({  token } as any) ;//para probar la API
    await db.connect();
    
    const user= await User.findById( userId ).lean();
    await db.disconnect();
     if ( !user ) {
       return  res.status(400).json({ message: 'No existe usuario' });
     }

    const { role, name, _id, email }= user;
    return  res.status(200).json({
        token : jwt.signToken( _id, email ),
        user : {
            email, 
            name, 
            role
        }
      })
}
