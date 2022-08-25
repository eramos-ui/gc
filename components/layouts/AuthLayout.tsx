import { PropsWithChildren  } from "react";


import { Box } from "@mui/material";
import Head from "next/head";

interface Props {
    children?: React.ReactNode | undefined    
    title: string | '';
}

export const AuthLayout: React.FC<PropsWithChildren<Props>> = ({ children, title }) => {
  return (
    <>
        <Head>
        <title> { title.toString() }</title>
        </Head>
        {/* <nav>
            <AdminNavbar />
        </nav>
        <SideMenu /> */}
        <main  style={{
            margin: '80px auto',
            maxWidth:'1440px',
            padding:'0px  30px'
        }}>
            <Box display = 'flex' justifyContent='center' alignItems='center' height="calc(100vh - 200px)" >
            {/* <Box display='flex' flexDirection='column'> */}
               {/* <Typography variant='h1' component='h1' >
                { icon }
                {' '}
                { title }

               </Typography>
               <Typography variant='h2' sx={{ md: 1 }}>{ subTitle} </Typography> */}
                { children }
         
            </Box>
        </main>

    </>
  )
}
