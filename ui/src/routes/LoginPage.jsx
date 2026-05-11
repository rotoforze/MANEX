import React, {useEffect, useState} from 'react'
import {Form, useActionData, useNavigate, useNavigation} from 'react-router-dom'
import {useUsers} from "../context/UserContext.jsx";
import {Loading} from "../components/Loading.jsx";
import '../../public/styles/mainPages.css'

/**
 *
 * Componente que muestra un formulario para el logeo del usuario.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.12.2
 * @constructor
 */
const LoginPage = () => {

    const actionData = useActionData();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const {user, changeUserInformation} = useUsers();
    const seEstaEnviando = navigation.state === 'submitting';

    const [passwordShown, setPasswordShown] = useState(false);
    const [cargando, setCargado] = useState(true);

    useEffect(() => {
        if (actionData) navigate('/Dashboard');

    }, [actionData, navigate]);

    // comprueba la conexión con el servidor para poder cargar la app.
    useEffect(() => {

        try {
            fetch(import.meta.env.VITE_BACKEND,
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
    }, [])

    useEffect(() => {
        if (!actionData) return;

        if (actionData.success) {
            changeUserInformation(actionData.username, actionData.id, actionData.token, true);
        }
    }, [actionData]);


    return (
        <main className="login-page d-flex align-items-center justify-content-center min-vh-100 px-3">
            {cargando ? (
                <Loading/>
            ) : (
                <section className="card login-card shadow-lg border-0 w-100">
                    <div className="card-body p-4 p-md-5">
                        <h1 className="h3 text-center mb-4 fw-semibold">
                            Iniciar sesion
                        </h1>

                        {actionData?.error && (
                            <div className="alert alert-danger" role="alert">
                                {actionData.error}
                            </div>
                        )}

                        <Form method="POST">
                            <input
                                type="text"
                                name="token"
                                id="token"
                                defaultValue={user.token}
                                hidden
                            />

                            <div className="d-grid gap-3">
                                <div>
                                    <label className="form-label" htmlFor="user">
                                        Usuario
                                    </label>
                                    <input
                                        className="form-control"
                                        id="user"
                                        type="text"
                                        name="user"
                                        required
                                        minLength={1}
                                        maxLength={16}
                                    />
                                </div>

                                <div>
                                    <label className="form-label" htmlFor="password">
                                        Contrasena
                                    </label>
                                    <div className="input-group">
                                        <input
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            type={passwordShown ? 'text' : 'password'}
                                            required
                                            minLength={0}
                                            maxLength={255}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setPasswordShown((shown) => !shown)}
                                            aria-label={passwordShown ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                        >
                                            <i
                                                className={`bi ${passwordShown ? 'bi-eye-slash' : 'bi-eye'}`}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="keepSession"
                                        name="keepSession"
                                        defaultChecked={!!user.token}
                                    />
                                    <label className="form-check-label" htmlFor="keepSession">
                                        Mantener la sesion iniciada
                                    </label>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg w-100"
                                    type="submit" disabled={seEstaEnviando}
                                >
                                    {seEstaEnviando ? "Iniciando sesión..." : 'Iniciar sesion'}
                                </button>
                            </div>
                        </Form>

                        <div className="mt-4 text-center">
                            <button
                                className="btn btn-link p-0"
                                type="button"
                                onClick={() => navigate('/faq')}
                            >
                                ¿Problemas para iniciar sesion?
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}
export default LoginPage
