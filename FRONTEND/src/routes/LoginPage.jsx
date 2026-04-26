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
    Alert,              // Mensaje de error
    Link                // Enlaces estilizados
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

    // Estado que controla si la contraseña se muestra o no
    const [passwordShown, setPasswordShown] = useState(false)

    // Estado que almacena el valor escrito de la contraseña
    const [passwordValue, setPasswordValue] = useState('')

    const [cargando, setCargado] = useState(true)

    // Alterna la visibilidad de la contraseña
    const handleClickShowPassword = () => {
        setPasswordShown(prev => !prev)
    }

    // Evita que el icono robe el foco del input
    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    useEffect(() => {
        if (actionData) navigate('/dashboard')
    }, [actionData, navigate])

    // comprueba la conexión con el servidor para poder cargar la app.
    useEffect(() => {
        fetch('http://localhost:80/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => res.json())
            .then(data => {
                if (!data.status == 200) navigate('/error')
            })
            .catch(() => navigate('/error'))
            .finally(() => setCargado(false))
    }, [])

    useEffect(() => {
        if (!actionData) return
        if (actionData.success) {
            changeUserInformation(actionData.username, actionData.token, true)
        }
    }, [actionData])

    return (
        // Container que centra el panel como en los templates oficiales MUI
        <Container
            maxWidth={false}
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

                        {/* Un alert para errores */}
                        {actionData?.error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {actionData.error}
                            </Alert>
                        )}

                        {/* Formulario principal */}
                        <Form method="POST">
                            <input
                                type="text"
                                name="token"
                                id="token"
                                defaultValue={user.token}
                                hidden
                            />

                            <Stack spacing={2}>
                                {/* TextField para usuario */}
                                <TextField
                                    label="Usuario"
                                    name="user"
                                    required
                                    fullWidth
                                    inputProps={{ minLength: 1, maxLength: 16 }}
                                />

                                {/*
                                  TextField de contraseña:
                                  - Icono de ojo alineado a la IZQUIERDA
                                  - Ojo abierto/cerrado según estado
                                  - El icono solo aparece cuando hay texto
                                */}
                                <TextField
                                    label="Contraseña"
                                    name="password"
                                    type={passwordShown ? 'text' : 'password'}
                                    value={passwordValue}
                                    onChange={(e) => setPasswordValue(e.target.value)}
                                    required
                                    fullWidth
                                    inputProps={{ minLength: 0, maxLength: 255 }}
                                    InputProps={{
                                        startAdornment: passwordValue.length > 0 && (
                                            <InputAdornment position="start">
                                                {/* Icono de mostrar u ocultar contraseña */}
                                                <IconButton
                                                    type="button"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="start"
                                                    aria-label="mostrar u ocultar contraseña"
                                                >
                                                    {passwordShown
                                                        ? <VisibilityOff sx={{ color: '#1976d2' }} />
                                                        : <Visibility sx={{ color: '#1976d2' }} />}
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

                        {/* Navegación secundaria */}
                        <Box
                            sx={{
                                mt: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {/* Enlace a recuperación de contraseña */}
                            <Typography variant="body2">
                                ¿Has olvidado tu contraseña?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Recuperarla
                                </Link>
                            </Typography>

                            {/* Enlace a creación de cuenta */}
                            <Typography variant="body2">
                                ¿No tienes cuenta?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/register')}
                                >
                                    Crear cuenta
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Container>
    )
}

export default LoginPage