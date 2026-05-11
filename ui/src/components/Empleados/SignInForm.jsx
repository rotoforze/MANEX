import React, {useEffect, useState} from 'react';
import {Form, useActionData, useNavigate, useNavigation} from 'react-router-dom';
import { useUsers } from "../../context/UserContext.jsx";
import { Loading } from "../Loading.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";

export function SignInForm( { funcionDeCierreDeFormulario, handleNuevoRegistro } ) {

    const actionData = useActionData();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const { user } = useUsers();
    const seEstaEnviando = navigation.state === 'submitting';

    const [cargando, setCargado] = useState(true);
    const [passwordShown, setPasswordShown] = useState(false);
    const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);

    useEffect(() => {
        apiFetch(import.meta.env.VITE_BACKEND)
            .then(res => res.json())
            .then(data => {
                if (data.status !== 200) navigate('/error');
            })
            .catch(() => navigate('/error'))
            .finally(() => setCargado(false));
    }, [navigate]);
    useEffect(() => {
        if (!actionData) return;
        if (actionData.success) {
            handleNuevoRegistro();
        }
    }, [actionData, navigate]);

    return (
        <section className="w-100 mt-3">
            {cargando ? (
                <Loading />
            ) : (
                <div className="card shadow-sm w-100">
                    { actionData && actionData[1] && <div className={`alert ${actionData[0] ? 'alert-success' : 'alert-danger'}`}>{actionData[1]}</div>}
                    <div className="card-body p-4">

                        <h2 className="text-center mb-4">Registro</h2>

                        {actionData?.error && (
                            <div className="alert alert-danger">
                                {actionData.error}
                            </div>
                        )}

                        <Form method="POST">

                            <input
                                type="hidden"
                                name="token"
                                defaultValue={user.token}
                            />

                            <h4 className="mb-3 border-bottom pb-2">Información</h4>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor={"nombre"}>
                                        Nombre <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor={"apellidos"}>Apellidos</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="apellidos"
                                        name="apellidos"
                                    />
                                </div>
                            </div>


                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor={"fecha_nacimiento"}>
                                    Fecha de nacimiento <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fecha_nacimiento"
                                        name="fecha_nacimiento"
                                        required={"bday"}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor={"telefono"}>
                                        Teléfono <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="telefono"
                                        name="telefono"
                                        required
                                    />
                                </div>

                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor={"id_contrato"}>
                                        ID Contrato <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control`}
                                        name="id_contrato"
                                        id="id_contrato"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor={"id_departamento"}>
                                        ID Departamento <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control`}
                                        name="id_departamento"
                                        id="id_departamento"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <h4 className="mb-3 mt-4 border-bottom pb-2">
                                Cuenta de acceso
                            </h4>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor={"username"}>
                                        Usuario <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        id="username"
                                        required
                                        autoComplete={"email"}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor={"email"}>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        id="email"
                                        autoComplete={"username"}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor={"password"}>
                                    Contraseña <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={passwordShown ? "text" : "password"}
                                        className="form-control"
                                        name="password"
                                        id="password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setPasswordShown(!passwordShown)}
                                    >
                                        {passwordShown ? "Ocultar" : "Ver"}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor={"confirmPassword"}>
                                    Confirmar contraseña <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={confirmPasswordShown ? "text" : "password"}
                                        className="form-control"
                                        name="confirmPassword"
                                        id={"confirmPassword"}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            setConfirmPasswordShown(!confirmPasswordShown)
                                        }
                                    >
                                        {confirmPasswordShown ? "Ocultar" : "Ver"}
                                    </button>
                                </div>
                            </div>

                            <button className="btn btn-primary w-100" type="submit" disabled={seEstaEnviando}>
                                { seEstaEnviando ? "Registrando..." : "Registrar"}
                            </button>

                        </Form>
                    </div>
                </div>
            )}
        </section>
    );
};
