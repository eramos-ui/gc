//para poblar bd con datos de prueba

import type { NextApiRequest, NextApiResponse } from 'next';// en postam http://localhost:3000/api/seed

import { db, seedDatabase } from '../../database';//anduvo, ver https://www.youtube.com/watch?v=DT0-2e-i9cw
import { Casa, Organization, Familia, User, ClaseMovimiento, Documento, Cartera , 
     CarteraGasto, CounterIngreso, CounterGasto } from '../../models';




type Data = {
    message: string
//creado con snippet nextapi agregado a mano el handler (retorno)
};

export default async function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    console.log( 'process.env.NODE_ENV', process.env.NODE_ENV) 
    if ( process.env.NODE_ENV === 'production') {
        return res.status( 401 ).json({message:'No tiene acceso a este servicio'});
    }
   // http://localhost:3000/api/seedCasa insertará las casas, familias, claseMovimientos , organización y usuarios, documentos y carteras

   const organis= seedDatabase.initialData.organizations;
   const orgs= organis.map ( org =>{
        return{
            idOrganization: org.idOrganizacion,
            name          : org.name,
            isVigente     : org.isVigente
        }
    })
    await db.connect();
    await Organization.deleteMany();
    await Organization.insertMany( orgs );
    await db.disconnect();  
     
    
    const organizs=await Organization.find( );
    //console.log(organizs)
    await db.connect();
    
    const counteringre= seedDatabase.initialData.counterIngreso;
    
    const ctrIngre= counteringre.map( cl => {
        //const idOrgan = getOrganization( cl.idOrganizacion);
        const orga= organizs.find( xx => xx.idOrganization === cl.idOrganizacion );
        return {
            organization     : orga?._id,            
            seq :  cl.seq
        }
    })      
    //console.log('counteringre',counteringre,ctrIngre )
    await db.connect();
    await CounterIngreso.deleteMany();
    await CounterIngreso.insertMany(ctrIngre)
    await db.disconnect();      

    const countergasto= seedDatabase.initialData.counterGasto;
    
    const ctrGasto= countergasto.map( cl => {
        const orga= organizs.find( xx => xx.idOrganization === cl.idOrganizacion );
        return {
            organization     : orga?._id,            
            seq :  cl.seq
        }
    })      
    console.log('countergasto',countergasto,ctrGasto )
    await db.connect();
    await CounterGasto.deleteMany();
    await CounterGasto.insertMany(ctrGasto)
    await db.disconnect();      
    
    const users=seedDatabase.initialData.users;
    
    const usuarios= users.map( us => {
         const orga = organizs.find( org => org.idOrganization === us.idOrganizacion );
         return {
             name        : us.name,
             email       : us.email,
             idUsuario   : us.idUsuario,
             role        : us.role,
             organization: orga?._id,  
             password    : us.password,             
         }
    });
   
    
    await User.deleteMany();
    await User.insertMany( usuarios );        
    await db.disconnect();


    await db.connect();    

    const usuarioTodos=await User.find( );

    const clase= seedDatabase.initialData.claseMovimientos;
    //console.log('clase',clase)

    const clasesMov= clase.map( cl => {
        //const idOrgan = getOrganization( cl.idOrganizacion);
        const orga= organizs.find( x => x.idOrganization === cl.idOrganizacion );
        return {
            name             : cl.descripcion,
            ingresoGasto     : cl.IngresoGasto,
            ingresoSalda     : cl.IngresoSalda,
            organization     : orga?._id,            
            idTipoMovimiento : cl.idClaseMovimiento,
        }
    })
    
    await ClaseMovimiento.deleteMany();
    await ClaseMovimiento.insertMany( clasesMov );
    
    await db.disconnect();


     
    const datos= seedDatabase.initialData.casas;
    
    const dd =datos.map( cs =>{
        const orga= organizs.find( x => x.idOrganization === cs.idOrganizacion );
        return { codigo: cs.codigo, organization: orga?._id }
    }  )

    await db.connect();   
    const claseMovs=await ClaseMovimiento.find( );    
   
    await Casa.deleteMany();        
    await Casa.insertMany( dd );
    await db.disconnect();
    
    await db.connect();

    const homes=await Casa.find( );
    const familia= seedDatabase.initialData.familia;
    //console.log('organizs',organizs)
    const df= familia.map ( fa => {
        // const idCasa = getCasa ( fa.CodigoCasa )
        const casa= homes.find( x => x.codigo === fa.CodigoCasa ) as any;
        //const organi= organizs.find(z => z._id === casa.organizacion   )
        //const orr= Organization.findOne( {_id: casa._id  });
        //console.log('org',orr, casa._id) 
        return { name     : fa.Familia, 
            casa          : casa?._id,
            mesInicio     : fa.MesInicio,
            codigoCasa    : casa.codigo,
            idOrganization: fa.idOrganizacion,
            createdAt     : fa.FechaModificacion,
            organization  : casa.organization, 
        }
    });
    //console.log('familias',df)
    await Familia.deleteMany(); //borra todo
    await Familia.insertMany( df );//inserta data inicial
        
    //console.log(claseMovs);
    
     
    const doc = seedDatabase.initialData.documentos; 
    //console.log(doc)
    const docum= doc.map( dc => {
        
         const idUsuario=dc.idUsuario;
         const claseM= dc.ClaseMovimiento || 0;
         const user= usuarioTodos.find( u => u.idUsuario === idUsuario);
         const tipoMov= claseMovs.find ( c => c.idTipoMovimiento ===  claseM );
         const codigoCasa=dc.CodigoCasa;
         const home=homes.find( h => h.codigo === codigoCasa );
            
         return {
             tipoDocumento  : dc.TipoDocumento,
             nroDocumento   : dc.NroDocumento,
             fechaDocumento : dc.FechaDocumento,
             monto          : dc.Monto,
             comentario     : dc.Comentario,
             usuario        : user?._id,
             tipoMovimiento : tipoMov?._id,
             casa           : home?._id,
             familiaName    : dc.Familia,
         }
     });
     await Documento.deleteMany(); 
     await Documento.insertMany( docum );
     //console.log(docum)        
     await db.disconnect();

     const cartera =seedDatabase.initialData.cartera;
     await db.connect();
     const docums=await Documento.find( );
    
    
     const movs = cartera.map( ca => {
          const docume=docums.find( dd => dd.tipoDocumento === ca.TipoDocumento && dd.nroDocumento === ca.NroDocumento  );
          const documeRef=docums.find( dd => dd.tipoDocumento === ca.TipoDocumentoRef && dd.nroDocumento === ca.NroDocumentoRef  );
          const casa=homes.find( dd => dd.codigo === ca.CodigoCasa );
          const tipoMov= claseMovs.find ( c => c.idTipoMovimiento ===  ca.ClaseMovimiento );
          //console.log(docume?._id)   
          return {
             fechaDocumento  : ca.FechaDocumento,
             fechaMovimiento : ca.FechaMovimiento,
             documento       : docume?._id,
             documentoRef    : documeRef?._id,
             mesPago         : ca.mesPago,
             casa            : casa?._id,
             tipoMovimiento  : tipoMov?._id,
             monto           : ca.Monto,
             entradaSalida   : ca.EntradaSalida,
             tipoDocumento   : ca.TipoDocumento,
             nroDocumento    : ca.NroDocumento,
             tipoDocumentoRef: ca.TipoDocumentoRef,
             nroDocumentoRef : ca.NroDocumentoRef,
             idTipoMovimiento: ca.ClaseMovimiento

          }    
    })
    await Cartera.deleteMany(); 
    await Cartera.insertMany( movs );

    const carteragasto =seedDatabase.initialData.cateraGastos;  
    const movgs = carteragasto.map( ca => {
        //el gasto es de un sólo tipoMov
        const documeRef=docums.find( dd => dd.tipoDocumento === ca.TipoDocumentoRef && dd.nroDocumento === ca.NroDocumentoRef  );
        //busca en la Cartera de ingresos para tener la clase mov que no está en documento
        const tipoMovim= documeRef?.tipoMovimiento;//del gasto
        const docume=docums.find( dd => dd.tipoDocumento === ca.TipoDocumento && dd.nroDocumento === ca.NroDocumento); 
             //&& dd.tipoMovimiento.idTipoMovimiento === tipoMovim?.idTipoMovimiento);//encuentra el documento
        //const docume=Cartera.find( dd => dd.tipoDocumento === ca.TipoDocumento && dd.nroDocumento === ca.NroDocumento  );
        //const tipoMov= claseMovs.find ( c => c.idTipoMovimiento ===  ca.ClaseMovimiento );
        //const tipoMov= claseMovs.find ( c => c.idTipoMovimiento ===  tipoMovim?.idTipoMovimiento );
        const idDoc=docume?._id; 
        const idDocRef=documeRef?._id; 
        //const idTipoMov = tipoMov?._id;    
        return {
           documentoRef    : idDocRef,
           fechaDocumento  : ca.FechaDocumento,
           fechaMovimiento : ca.FechaMovimiento,
           documento       : idDoc,           
           tipoMovimiento  : tipoMovim,
           monto           : ca.Monto,
           entradaSalida   : ca.EntradaSalida,
           tipoDocumento   : ca.TipoDocumento,
           nroDocumento    : ca.NroDocumento,
           tipoDocumentoRef: ca.TipoDocumentoRef,
           nroDocumentoRef : ca.NroDocumentoRef,
           idTipoMovimiento: ca.ClaseMovimiento
        }    
    })

    //console.log(movgs);    
    await CarteraGasto.deleteMany(); 
    await CarteraGasto.insertMany( movgs );

    await db.disconnect();
    res.status(200).json({ message: 'Proceso realizado OK' })

}
