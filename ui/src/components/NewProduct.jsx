import React, { useEffect, useState } from 'react';
import { Form, useActionData, useNavigate, useNavigation } from 'react-router-dom';
import { useUsers } from "../context/UserContext.jsx";
import { Loading } from "./Loading.jsx";
import "../../public/styles/SignInPage.css";

export function NuevoProductoForm({ funcionDeCierreDeFormulario, handleNuevoProducto }) {

    const actionData = useActionData();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const { user } = useUsers();
    const seEstaEnviando = navigation.state === 'submitting';

    const [cargando, setCargado] = useState(true);

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND)
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
            handleNuevoProducto();
        }
    }, [actionData]);

    return (
        <section className="signin-container w-100 d-flex align-items-center justify-content-center">

            {cargando ? (
                <Loading />
            ) : (

                <div className="card shadow w-100 signin-form">

                    {actionData && actionData[1] && (
                        <div className={`alert ${actionData[0] ? 'alert-success' : 'alert-danger'}`}>
                            {actionData[1]}
                        </div>
                    )}

                    <div className="card-header d-flex justify-content-end">
                        <button
                            className={"bi-x bi btn btn-outline-danger"}
                            onClick={() => funcionDeCierreDeFormulario(false)}
                        ></button>
                    </div>

                    <div className="card-body p-4">

                        <h2 className="text-center mb-4">
                            Nuevo producto
                        </h2>

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

                            <h4 className="mb-3 border-bottom pb-2">
                                Información del producto
                            </h4>

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
                                    <label htmlFor={"estado"}>
                                        Estado <span className="text-danger">*</span>
                                    </label>

                                    <select
                                        className="form-select"
                                        id="estado"
                                        name="estado"
                                        required
                                    >
                                        <option value="">
                                            Selecciona un estado
                                        </option>

                                        <option value="En proceso de envio">
                                            En proceso de envío
                                        </option>

                                        <option value="Disponible">
                                            Disponible
                                        </option>

                                        <option value="No disponible">
                                            No disponible
                                        </option>

                                        <option value="En mantenimiento">
                                            En mantenimiento
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <div className="row">

                                <div className="mb-3">

                                    <label htmlFor={"descripcion"}>
                                        Descripción
                                    </label>
                                    <div className="input-group">
                                        <textarea
                                            className="form-control"
                                            id="descripcion"
                                            name="descripcion"
                                            rows="5"
                                            maxLength="512"
                                        ></textarea>
                                    </div>
                                </div>

                            </div>

                            <button
                                className="btn btn-primary w-100"
                                type="submit"
                                disabled={seEstaEnviando}
                            >
                                {seEstaEnviando
                                    ? "Registrando producto..."
                                    : "Registrar producto"}
                            </button>

                        </Form>

                    </div>
                </div>

            )}

        </section>
    );
}