//para probar ir a url: http://localhost:3000/api/auth/signin, ver _app dónde se usa <SessionProvider>
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import Credentials  from 'next-auth/providers/credentials';
import {  dbUsers } from '../../../database';

export default NextAuth ({
    providers: [
      Credentials({ //para manejar autenticación propia
        name: 'Custom Login',
        credentials: {//como un formulario
          email: { label: 'Correo:', type: 'email', placeholder: 'correo@google.com'},
          password: { label: 'Contraseña:' , type: 'password', placeholder: 'Contraseña' }
       },
       async authorize(credentials) {//m+etodo de autenticación
          //console.log('credentials:',credentials) //muestra los datos del form de credentials
          return  await dbUsers.checkUserEmailPassword( credentials!.email, credentials!.password )
          //return { name: 'Perico Pérez', correo: 'pericoperez@gmail.com',role: 'admin'};
          //return null; //si falla     
        }
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      ],
      //Custom pages
      pages: {
        signIn: '/auth/login',
        newUser: '/auth/register' 
      },
      //Callbacks, antes trabajaba explicitando jws, ahono no hace falta, se ocula NEXTAUTH_SECRET y JWT_SECRET_SEED
      //callbacks: cómo se firma, la data que se graba en los toke, la info de la sesiónn, crear al usuario en la BD
      // los callback se van pasando los datos s/orden en que aparecen
      jwt: {
        //secret: process.envJWT_SECRET_SEED  // de´recated
      },
      session: {//la duración de la session
         maxAge: 2*24*60*60, //2 días
         strategy: 'jwt',
         updateAge: 86400, //actulice cada día
      },
      callbacks: {//usaremos 2: uno para crear el jsw y otro para crear la session
        async jwt({ token, account, user }) {
          //aquí se puede agregar informacion al token (una especie de payload)
          //console.log({  account })
          if ( account ){
            token.accessToken = account.access_token;
            switch( account.type ){
              case 'credentials'://si el autenticación propia se adiciona el usuario
                //console.log('credentials callback',{ token, account, user })
                token.user = user;
                break;
              case 'oauth'://red social
                //crear usuario en la BD
                
                token.user = await dbUsers.oAuthToDbUser( user?.email || '', user?.name || '' );//299
                break;

            }
          }
          return token;
        } ,
        async session({ session, token, user }) {//el token es el de la funcion anterior
          //aquí se puede hacer modificaciones a la session
          session.accessToken =  token.accessToken;
          session.user = token.user as any;//el as any saca el error que marca
          //console.log('Custom provider session.user', session.user );          
          
          return session;  //esta es la que va en hook de la session
        }  
      }
});