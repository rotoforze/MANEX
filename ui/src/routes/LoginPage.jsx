import React, { useEffect, useState } from 'react'
import { Form, useActionData, useNavigate } from 'react-router-dom'
import { useUsers } from "../context/UserContext.jsx"
import { Loading } from "../components/Loading.jsx"

import {
    Container,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Typography,
    Stack,
    IconButton,
    InputAdornment,
    Alert,
    Link
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

/**
 *
 * Componente que muestra un formulario para el logeo del usuario.
 *
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menendez Pedrosa
 * @version 1.13.0
 * @constructor
 */
const LoginPage = () => {
    const actionData = useActionData()
    const navigate = useNavigate()
    const { user, changeUserInformation } = useUsers()

    const [passwordShown, setPasswordShown] = useState(false);
    const [cargando, setCargado] = useState(true)

    useEffect(() => {
        console.log(actionData)
        if (actionData) navigate('/dashboard');

    }, [actionData, navigate]);

    // comprueba la conexion con el servidor para poder cargar la app.
    useEffect(() => {
        try {
            fetch('http://localhost:80/',
                {method: 'GET', headers: {'Content-Type': 'application/json'}})
                .then((response) => response.json())
                .then(data => {

                    if (!data.status == 200) navigate('/error');

                })
                .catch(() => navigate('/error'))
                .finally(() => setCargado(false));

        } catch (error) {
            console.error(error);
        }
    }, [navigate])

    useEffect(() => {
        if (!actionData) return
        if (actionData.success) {
            changeUserInformation(actionData.username, actionData.token, true)
        }
    }, [actionData, changeUserInformation])

    return (
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
                <Card sx={{ width: '100%', maxWidth: 520, boxShadow: 6 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            align="center"
                            gutterBottom
                        >
                            Iniciar sesion
                        </Typography>

                        {actionData?.error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {actionData.error}
                            </Alert>
                        )}

                        <Form method="POST">
                            <input
                                type="text"
                                name="token"
                                id="token"
                                defaultValue={user.token}
                                hidden
                            />

                            <Stack spacing={2}>
                                <TextField
                                    label="Usuario"
                                    name="user"
                                    required
                                    fullWidth
                                    inputProps={{ minLength: 1, maxLength: 16 }}
                                />

                                <TextField
                                    label="Contrasena"
                                    name="password"
                                    type={passwordShown ? 'text' : 'password'}
                                    required
                                    fullWidth
                                    inputProps={{ minLength: 0, maxLength: 255 }}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        type="button"
                                                        onClick={() => setPasswordShown((shown) => !shown)}
                                                        edge="end"
                                                        aria-label={passwordShown ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                                    >
                                                        {passwordShown ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="keepSession"
                                            defaultChecked={!!user.token}
                                        />
                                    }
                                    label="Mantener la sesion iniciada"
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ textTransform: 'none' }}
                                >
                                    Iniciar sesion
                                </Button>
                            </Stack>
                        </Form>

                        <Box
                            sx={{
                                mt: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Typography variant="body2">
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/FAQ.jsx')}
                                >
                                    ¿Problemas para iniciar sesión?
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
