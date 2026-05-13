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

    if (cargando) {
        return <Loading />;
    }

    return (
        <div className="superponer">
            <div
                className="card confirmacion"
                style={{ width: 'min(95dvw, 1200px)', overflowY: 'auto' }}
            >
                <div className="card-header d-flex justify-content-end">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={() => {
                            funcionDeCierreDeFormulario();
                        }}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Registro</h2>

                    { actionData && actionData[1] && (
                        <div className={`alert ${actionData[0] ? 'alert-success' : 'alert-danger'} py-1 px-2 small mb-2`}>
                            {actionData[1]}
                        </div>
                    )}

                    {actionData?.error && (
                        <div className="alert alert-danger py-1 px-2 small mb-2">
                            {actionData.error}
                        </div>
                    )}

                    <Form method="POST">

                        <input
                            type="hidden"
                            name="token"
                            defaultValue={user.token}
                        />

                        <h4 className="mb-2 mt-1 border-bottom pb-1 small fw-semibold">Información</h4>

                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label htmlFor={"nombre"} className="form-label small mb-1">
                                    Nombre <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="nombre"
                                    name="nombre"
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor={"apellidos"} className="form-label small mb-1">Apellidos</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="apellidos"
                                    name="apellidos"
                                />
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-4 mb-2">
                                <label htmlFor={"fecha_nacimiento"} className="form-label small mb-1">
                                Fecha de nacimiento <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    id="fecha_nacimiento"
                                    name="fecha_nacimiento"
                                    required={"bday"}
                                />
                            </div>

                            <div className="col-md-4 mb-2">
                                <label htmlFor={"telefono"} className="form-label small mb-1">
                                    Teléfono <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="form-control form-control-sm"
                                    id="telefono"
                                    name="telefono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-4 mb-2">
                                <label htmlFor={"id_contrato"} className="form-label small mb-1">
                                    ID Contrato <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className={`form-control form-control-sm`}
                                    name="id_contrato"
                                    id="id_contrato"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="col-md-4 mb-2">
                                <label htmlFor={"id_departamento"} className="form-label small mb-1">
                                    ID Departamento <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className={`form-control form-control-sm`}
                                    name="id_departamento"
                                    id="id_departamento"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <h4 className="mb-2 mt-2 border-bottom pb-1 small fw-semibold">
                            Cuenta de acceso
                        </h4>

                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label htmlFor={"username"} className="form-label small mb-1">
                                    Usuario <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="username"
                                    id="username"
                                    required
                                    autoComplete={"email"}
                                />
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor={"email"} className="form-label small mb-1">Email</label><span className="text-danger">*</span>
                                <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    name="email"
                                    id="email"
                                    autoComplete={"username"}
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor={"password"} className="form-label small mb-1">
                                Contraseña <span className="text-danger">*</span>
                            </label>
                            <div className="input-group input-group-sm">
                                <input
                                    type={passwordShown ? "text" : "password"}
                                    className="form-control form-control-sm"
                                    name="password"
                                    id="password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setPasswordShown(!passwordShown)}
                                >
                                    {passwordShown ? "Ocultar" : "Ver"}
                                </button>
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor={"confirmPassword"} className="form-label small mb-1">
                                Confirmar contraseña <span className="text-danger">*</span>
                            </label>
                            <div className="input-group input-group-sm">
                                <input
                                    type={confirmPasswordShown ? "text" : "password"}
                                    className="form-control form-control-sm"
                                    name="confirmPassword"
                                    id={"confirmPassword"}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() =>
                                        setConfirmPasswordShown(!confirmPasswordShown)
                                    }
                                >
                                    {confirmPasswordShown ? "Ocultar" : "Ver"}
                                </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button className="btn btn-primary btn-sm" type="submit" disabled={seEstaEnviando}>
                                { seEstaEnviando ? "Registrando..." : "Registrar"}
                            </button>
                        </div>

                    </Form>
                </div>
            </div>
        </div>
    );
};
