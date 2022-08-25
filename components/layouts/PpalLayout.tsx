import { PropsWithChildren } from "react";
import Head from "next/head";
import { Navbar, SideMenu } from "../ui";


interface Props {
    children?: React.ReactNode | undefined ;   
    title: string;
    pageDescription: string;
    imageFullUrl?: string;
}
export const PpalLayout : React.FC<PropsWithChildren<Props>> = ( { children, title, pageDescription, imageFullUrl  } ) => {
  
  return (
    <>
        <Head>
            <title>{ title }</title>
            <meta name ='description' content={ pageDescription } />
            <meta name ='og:title' content={ title } />
            <meta name ='og:description' content={ pageDescription } />
            {
                imageFullUrl && (
                    <meta name ='og:image' content={ imageFullUrl } />
                )
            }
        </Head>
        <nav>
           <Navbar />
        </nav>
        {/* Side Bar */}
        <SideMenu />
        <main  style= {{
            margin: '80px auto',
            maxWidth: '1440px',
            padding: '0px 30px'
        }}
        >
           {children}
        </main>
        <footer>
            {/* por hacer */}
        </footer>
    </>    
  )
}
