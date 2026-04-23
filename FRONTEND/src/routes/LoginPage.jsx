import React, {useEffect, useState} from 'react'
import {Form, useActionData, useNavigate, useSubmit} from 'react-router-dom'
import {useUsers} from "../context/UserContext.jsx";
import {Loading} from "../components/Loading.jsx";


/**
 *
 * Componente que muestra un formulario para el logeo del usuario.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.3.2
 * @constructor
 */
const LoginPage = () => {
    const actionData = useActionData();
    const navigate = useNavigate();
    const submit = useSubmit();
    const {user} = useUsers();

    const [passwordShown, setPasswordShown] = useState(false);
    const [token, setToken] = useState('');
    const [cargando, setCargado] = useState(true);
    const [conexion, setConexion] = useState(true);

    useEffect(() => {
        if (actionData) navigate('/dashboard');

    }, [actionData, navigate]);

    useEffect(() => {
        /**
         * Comprueba si la cookie existe en el navegador, si existe, manda el formulario con
         * la cookie.
         *
         * @author Alex Bernardos Gil
         * @version 1.0.0
         * @returns {Promise<boolean>}
         */
        const getToken = async () => {

            const userToken = user.token;
            setToken(userToken);
            if (userToken) {
                const form = document.querySelector(".login-form");
                form.querySelector('#token').value = userToken;
                form.querySelector('#keepSession').checked = true;
                await submit(form);
                return true;
            }

            return false;
        };
        getToken();
    }, [submit, user.token])

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
    }, [token, actionData])


    return (
        <div className='center-login'>
            {cargando ? (
                <Loading />
            ) :  (
                <div className='login-section'>
                    {actionData?.error && <div className="message">{actionData.error}</div>}
                    <fieldset>
                        <legend>Iniciar sesión</legend>
                        <Form className='login-form' method='POST'>
                            <input type="text" name="token" id="token" defaultValue={token} hidden/>
                            <div>
                                <input type="text" placeholder='Usuario'
                                       id='user' name='user' required minLength={1} maxLength={16}/>
                            </div>
                            <div>
                                <div className='password-group'>
                                    <input aria-describedby='password-addon'
                                           placeholder='Contraseña'
                                           type={passwordShown ? 'text' : 'password'}
                                           name="password" id="password" required minLength={0} maxLength={255}/>
                                    <button className="eye-password-button" type='button'
                                            id="password-addon" role='option' onClick={() => {
                                        setPasswordShown(!passwordShown)
                                    }}>
                                        {
                                            passwordShown ?
                                                (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                         className="bi bi-eye" viewBox="0 0 16 16">
                                                        <path
                                                            d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                                                        <path
                                                            d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                                                    </svg>

                                                ) :
                                                (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                         className="bi bi-eye-slash" viewBox="0 0 16 16">
                                                        <path
                                                            d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"></path>
                                                        <path
                                                            d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"></path>
                                                        <path
                                                            d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"></path>
                                                    </svg>
                                                )
                                        }
                                    </button>
                                </div>
                            </div>
                            <div className='keepSession-container'>
                                <label htmlFor="keepSession" className='keepSession'>
                                    <input type="checkbox" name="keepSession" id="keepSession"
                                           defaultChecked={!!token}/>
                                    Mantener la sesión iniciada
                                </label>
                            </div>
                            <input type="submit" value="Iniciar sesión"/>
                        </Form>
                    </fieldset>
                </div>
            )}
        </div>
    )
}
export default LoginPage