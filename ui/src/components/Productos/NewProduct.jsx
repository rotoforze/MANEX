import React, { useEffect, useState } from 'react';
import { Form, useActionData, useNavigate, useNavigation } from 'react-router-dom';
import { useUsers } from "../../context/UserContext.jsx";
import { Loading } from "../Loading.jsx";
import "../../../public/styles/tablaPermisos.css";

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

    if (cargando) {
        return <Loading />;
    }

    return (
        <div className="superponer">
            <div className="card confirmacion" style={{width: '90dvw', maxWidth: '600px', maxHeight: '90dvh', overflowY: 'auto'}}>
                <div className="card-header d-flex justify-content-end">
                    <button className={"bi-x bi btn btn-outline-danger"} onClick={() => {
                        funcionDeCierreDeFormulario();
                    }}></button>
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Nuevo producto</h2>

                    {actionData && actionData[1] && (
                        <div className={`alert alert-sm ${actionData[0] ? 'alert-success' : 'alert-danger'}`} style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                            {actionData[1]}
                        </div>
                    )}

                    {actionData?.error && (
                        <div className="alert alert-danger alert-sm" style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                            {actionData.error}
                        </div>
                    )}

                    <Form method="POST">

                        <input
                            type="hidden"
                            name="token"
                            defaultValue={user.token}
                        />

                        <h4 className="mb-2 mt-1 border-bottom pb-1" style={{fontSize: '0.9rem'}}>
                            Información del producto
                        </h4>

                        <div className="row g-2">

                            <div className="col-md-6 mb-2">
                                <label htmlFor="nombre" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
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
                                <label htmlFor="estado" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Estado <span className="text-danger">*</span>
                                </label>

                                <select
                                    className="form-select form-select-sm"
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

                        <div className="mb-2">
                            <label
                                htmlFor="descripcion"
                                className="form-label mb-1"
                                style={{fontSize: '0.85rem'}}
                            >
                                Descripción
                            </label>

                            <textarea
                                className="form-control form-control-sm"
                                id="descripcion"
                                name="descripcion"
                                rows="3"
                                maxLength="512"
                            ></textarea>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button
                                className="btn btn-primary btn-sm"
                                type="submit"
                                disabled={seEstaEnviando}
                            >
                                {seEstaEnviando
                                    ? "Registrando..."
                                    : "Registrar"}
                            </button>
                        </div>

                    </Form>

                </div>
            </div>
        </div>
    );
}