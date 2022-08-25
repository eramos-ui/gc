import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database'
import { User, Organization } from '../../../models'
import bcrypts from 'bcryptjs';
import { jwt, validations } from '../../../utils';

type Data = 
|{  message: string }
|{
    token: string;
    user: {
    email: string;
    name: string;
    role: string
    organization?: string;//este es el _id
    
    }
}

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    switch( req.method ) {
        case 'POST':
            return registerUser( req, res )
        default:
            res.status(400).json({
                message: 'Bad request'
            })

    }
}
const registerUser= async ( req: NextApiRequest, res: NextApiResponse<Data> ) =>{
    const { email='', password= '', name = ''} =req.body as { email: string, password: string, name: string };

    if ( password.length < 6 ) {
        return  res.status(400).json({ message: 'Contraseña debe tener al menos 6 caracteres' });
    }
    if ( name.length <2 ) {
        return  res.status(400).json({ message: 'El nombre debe ser de al menos 3 caracteres' });
    }
    //validar email
    if ( !validations.isValidEmail( email) ){
        return  res.status(400).json({ message: 'El correo no tiene formato adecuado' });
    }
    await db.connect();
    const user= await User.findOne({ email });
    if ( user ){
        await db.disconnect();
        return  res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    const org = await Organization.findOne( { id:'0' } );
    console.log('org en registrar',org)
    const newUser= new User({
        email: email.toLocaleLowerCase(), //se graba en minúscula
        password:bcrypts.hashSync( password ),
        role: 'admin',       
        name,
        organization: org,
    });
    try {
        await newUser.save({ validateBeforeSave: true })
    }catch( error ){
        console.log(error);
        await db.disconnect();
        return res.status(500).json({ message: 'Revisa logs del servidor'});
    }

    const { role, _id }= newUser;
    const token = jwt.signToken( _id, email  );
    return  res.status(200).json({
        token,
        user : {
            email, 
            name, 
            role,
            organization:org?._id,//este es el _id
            
        }
      })
}