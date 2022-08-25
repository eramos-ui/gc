import '../styles/globals.css'
import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from '../context/';//datos del usuario
import { CssBaseline, ThemeProvider } from '@mui/material';
import { lightTheme } from '../themes';
import { UIProvider } from '../context/ui';

 
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <UIProvider>
          <ThemeProvider theme = { lightTheme }>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
         </UIProvider>
      </AuthProvider>
    </SessionProvider>
  )
}

export default MyApp;
