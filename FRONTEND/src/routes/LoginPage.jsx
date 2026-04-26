import React, { useEffect, useState } from 'react'
import { Form, useActionData, useNavigate } from 'react-router-dom'
import { useUsers } from "../context/UserContext.jsx"
import { Loading } from "../components/Loading.jsx"

// Todo esto es lo necesario para que Material UI funcione bien.
import {
    Container,          // Contenedor principal responsive
    Box,                // Wrapper flexible para layout
    Card,               // Tarjeta con sombra (estilo template MUI)
    CardContent,        // Contenido interno de la tarjeta
    TextField,          // Input con label flotante
    Button,             // Botón principal
    FormControlLabel,   // Checkbox + label
    Checkbox,           // Checkbox MUI
    Typography,         // Texto tipográfico
    Stack,              // Layout vertical con separación automática
    IconButton,         // Botón solo de icono
    InputAdornment,     // Iconos dentro de inputs
    Alert               // Mensaje de error
} from '@mui/material'

// Esto es para los iconos de mostrar/ocultar contraseña
import { Visibility, VisibilityOff } from '@mui/icons-material'

/**
 *
 * Componente que muestra un formulario para el logeo del usuario.
 *
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 1.13.0
 * @constructor
 */
const LoginPage = () => {
    const actionData = useActionData()
    const navigate = useNavigate()
    const { user, changeUserInformation } = useUsers()

    const [passwordShown, setPasswordShown] = useState(false)
    const [cargando, setCargado] = useState(true)

    useEffect(() => {
        console.log(actionData)
        if (actionData) navigate('/dashboard')
    }, [actionData, navigate])

    // comprueba la conexión con el servidor para poder cargar la app.
    useEffect(() => {
        try {
            fetch('http://localhost:80/', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then((response) => response.json())
                .then(data => {
                    if (!data.status == 200) navigate('/error')
                })
                .catch(() => navigate('/error'))
                .finally(() => setCargado(false))
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        if (!actionData) return
        if (actionData.success) {
            changeUserInformation(actionData.username, actionData.token, true)
        }
    }, [actionData])

    return (
        // CAMBIO: Container centra el panel como en los templates oficiales MUI
        <Container
            maxWidth={false} // Se elimina la limitación de ancho
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {cargando ? (
                <Loading />
            ) : (
                // Card de Material-UI para un panel con sombra y bordes redondeados
                <Card sx={{ width: '100%', maxWidth: 520, boxShadow: 6 }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Tipografia principal */}
                        <Typography
                            variant="h4"
                            component="h1"
                            align="center"
                            gutterBottom
                        >
                            Iniciar sesión
                        </Typography>

                        {/* Un alert */}
                        {actionData?.error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {actionData.error}
                            </Alert>
                        )}

                        {/* Reemplazo de div convencionales */}
                        <Form method="POST">
                            <input
                                type="text"
                                name="token"
                                id="token"
                                defaultValue={user.token}
                                hidden
                            />

                            <Stack spacing={2}>
                                {/* TextField para usuario con la misma función */}
                                <TextField
                                    label="Usuario"
                                    name="user"
                                    required
                                    fullWidth
                                    inputProps={{ minLength: 1, maxLength: 16 }}
                                />

                                {/* TextField + InputAdornment para contraseña */}
                                <TextField
                                    label="Contraseña"
                                    name="password"
                                    type={passwordShown ? 'text' : 'password'}
                                    required
                                    fullWidth
                                    inputProps={{ minLength: 0, maxLength: 255 }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {/* Funcionalidad de IconButton */}
                                                <IconButton
                                                    type="button"
                                                    onClick={() =>
                                                        setPasswordShown(prev => !prev)
                                                    }
                                                    edge="end"
                                                    aria-label="mostrar u ocultar contraseña"
                                                >
                                                    {passwordShown
                                                        ? <VisibilityOff />
                                                        : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {/* Checkbox para mantener sesión */}
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="keepSession"
                                            defaultChecked={!!user.token}
                                        />
                                    }
                                    label="Mantener la sesión iniciada"
                                />

                                {/* Botón iniciar sesión */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ textTransform: 'none' }}
                                >
                                    Iniciar sesión
                                </Button>
                            </Stack>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </Container>
    )
}

export default LoginPage