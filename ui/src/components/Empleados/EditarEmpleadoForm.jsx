import React, { useState } from 'react';
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { useMensaje } from "../../hooks/useMensaje.js";

/**
 * Formulario de edición de un empleado existente.
 * Envía POST a VITE_BACKEND_EMPLEADO con id en el body → el backend llama a actualizar().
 *
 * Campos que espera actualizar.mjs:
 *   id, nombre, apellidos, fecha_nacimiento, telefono,
 *   ID_contrato, ID_departamento, usuario, email, contrasenia
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.2
 * @param {Object}   empleado                   - Fila del empleado tal como llega del listado
 * @param {Function} funcionDeCierreDeFormulario - Cierra el formulario sin guardar
 * @param {Function} handleEmpleadoActualizado   - Callback tras actualización exitosa
 */
export function EditarEmpleadoForm({ empleado, funcionDeCierreDeFormulario, handleEmpleadoActualizado }) {

    const { user } = useUsers();

    const [enviando, setEnviando]           = useState(false);
    const [mensaje, setMensaje]             = useMensaje();
    const [passwordShown, setPasswordShown] = useState(false);

    // Inicializamos con los datos del empleado recibido.
    // Las claves del body deben coincidir exactamente con lo que lee actualizar.mjs:
    //   const { nombre, apellidos, fecha_nacimiento, telefono,
    //           ID_contrato, ID_departamento, usuario, email, contrasenia, id } = req.body;
    const [form, setForm] = useState({
        id:               empleado?.ID               ?? '',
        nombre:           empleado?.Nombre            ?? '',
        apellidos:        empleado?.Apellidos         ?? '',
        email:            empleado?.email             ?? '',
        telefono:         empleado?.telefono          ?? '',
        fecha_nacimiento: empleado?.fecha_nacimiento
            ? new Date(empleado.fecha_nacimiento).toISOString().split('T')[0]
            : '',
        ID_departamento:  empleado?.ID_DEPARTAMENTO   ?? '',
        ID_contrato:      empleado?.ID_CONTRATO       ?? '',
        // USERNAME viene en mayúsculas del SELECT * de listado.mjs
        usuario:          empleado?.USERNAME          ?? '',
        contrasenia:      '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        try {
            const response = await apiFetch(
                import.meta.env.VITE_BACKEND_EMPLEADO,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'token': user?.token,
                    },
                    body: new URLSearchParams(form).toString(),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMensaje({ tipo: 'success', texto: 'Empleado actualizado correctamente.' });
                // Recargamos la tabla y cerramos tras un momento para que el usuario vea el feedback
                setTimeout(() => {
                    handleEmpleadoActualizado?.();
                }, 1000);
            } else {
                setMensaje({ tipo: 'danger', texto: data?.message ?? 'Error al actualizar el empleado.' });
            }
        } catch (err) {
            console.error(err);
            setMensaje({ tipo: 'danger', texto: 'Error de conexión con el servidor.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="superponer">
            <div
                className="card confirmacion"
                style={{ width: 'min(95dvw, 1200px)', overflowY: 'auto' }}
            >
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span className="small text-muted">ID: {empleado?.ID} — {form.usuario}</span>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Editar empleado</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <h4 className="mb-2 mt-1 border-bottom pb-1 small fw-semibold">Información personal</h4>

                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="nombre" className="form-label small mb-1">
                                    Nombre <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="nombre"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="apellidos" className="form-label small mb-1">Apellidos</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="apellidos"
                                    name="apellidos"
                                    value={form.apellidos}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-4 mb-2">
                                <label htmlFor="fecha_nacimiento" className="form-label small mb-1">
                                    Fecha de nacimiento <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    id="fecha_nacimiento"
                                    name="fecha_nacimiento"
                                    value={form.fecha_nacimiento}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4 mb-2">
                                <label htmlFor="telefono" className="form-label small mb-1">
                                    Teléfono <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="form-control form-control-sm"
                                    id="telefono"
                                    name="telefono"
                                    value={form.telefono}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-4 mb-2">
                                <label htmlFor="ID_contrato" className="form-label small mb-1">
                                    ID Contrato <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    id="ID_contrato"
                                    name="ID_contrato"
                                    value={form.ID_contrato}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="col-md-4 mb-2">
                                <label htmlFor="ID_departamento" className="form-label small mb-1">
                                    ID Departamento <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    id="ID_departamento"
                                    name="ID_departamento"
                                    value={form.ID_departamento}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <h4 className="mb-2 mt-2 border-bottom pb-1 small fw-semibold">Cuenta de acceso</h4>

                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="email" className="form-label small mb-1">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Usuario: solo lectura — el backend no permite cambiarlo */}
                            <div className="col-md-6 mb-2">
                                <label htmlFor="usuario" className="form-label small mb-1">
                                    Usuario <span className="text-muted">(no editable)</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="usuario"
                                    value={form.usuario}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor="contrasenia" className="form-label small mb-1">
                                Nueva contraseña <span className="text-danger">*</span>
                            </label>
                            <div className="input-group input-group-sm">
                                <input
                                    type={passwordShown ? "text" : "password"}
                                    className="form-control form-control-sm"
                                    id="contrasenia"
                                    name="contrasenia"
                                    value={form.contrasenia}
                                    onChange={handleChange}
                                    placeholder="Introduce la contraseña para confirmar los cambios"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setPasswordShown(prev => !prev)}
                                >
                                    {passwordShown ? "Ocultar" : "Ver"}
                                </button>
                            </div>
                            <div className="form-text small text-muted">
                                Requerida para aplicar cualquier cambio. Se actualizará en la cuenta del empleado.
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={funcionDeCierreDeFormulario}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={enviando}
                            >
                                {enviando ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
