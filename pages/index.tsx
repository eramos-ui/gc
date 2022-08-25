import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';

//import { Presentation } from '../components/ui'
import LoginPage from './auth/login';
import HomePage from './admin/home'
import LoadingPage from './loading';


const Home: NextPage = () => {
    const session=useSession();
    //console.log('Home session',session.status)
    if ( session.status === 'loading'){
      return (<LoadingPage />)
    }
    let logged= true;

   if ( session.status !== 'authenticated'){
       logged = false;
    }
   if ( !logged){
     return (<LoginPage  />)
   }
  return (
     <HomePage />
    //  <LoginPage />
   )
  }
export default Home
