import { GetServerSideProps } from 'next';
import {  getSession } from 'next-auth/react';

import { Presentation } from "../../components/ui";

const HomePage = () => {
  //console.log('Home page')
  return (
    <Presentation />
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {//302
  const session = await getSession( { req });
  //console.log('session in HomePage', session);
  if ( !session ){
     return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        }
     } 
  }
  return {
      props: {       }
  }
}

 export default HomePage;