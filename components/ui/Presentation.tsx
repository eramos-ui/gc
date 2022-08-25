import { Typography } from "@mui/material"
//import { useSession } from "next-auth/react";
//import { useRouter } from 'next/router';

import { PpalLayout } from "../layouts"

export const Presentation = () => {

  return (
    <PpalLayout title={'Gastos comunes'} pageDescription={'sistema para administrar gastos comunes'} >
        <Typography variant='h1' component= 'h1' sx={{ mt: 3 }}>Gestión de gastos comunes</Typography>
        <Typography variant='h2' sx={{ mb: 1, mt:2 }}>Este sistema permite registar los ingresos y gastos de un condominio.</Typography>
        <Typography variant='h2' sx={{ mb: 1 }}>El sistema administra dos fondos: el Fondo de Operación y el Fondo de Emergencia.</Typography>
        <Typography variant='h2' sx={{ mb: 1 }}>Los ingresos se regitran en parte como ingresos al Fondo de Operación y en parte como aportes al
                Fondo de Emergencia, de acuerdo a montos establecidos para cada casa.</Typography>
        <Typography variant='h2' sx={{ mb: 1 }}>Con esos valores se pueden generar 2 tipos de informes:</Typography>
        <Typography variant='h2' sx={{ mb: 1 }}>Informes mensuales de ingresos, gastos y saldos del Fondo Normal y del Fondo de Emergencia.</Typography>
        <Typography variant='h2' sx={{ mb: 1 }}>Informes de movimientos , con los ingresos, gastos y saldos ordenados en forma cronológica para un rango de fechas específico.
                En este informe, presionando la lupa, se pueden revisar todos los movimientos de una casa.</Typography>
    </PpalLayout>
  )
}
