import React, { useState } from 'react';
import { useMensaje } from "../../hooks/useMensaje.js";
import { useUsers } from "../../context/UserContext.jsx";
import { enviarUsuario } from "../../utils/RegisterNewUser.js";

export function SignInForm({ funcionDeCierreDeFormulario, handleNuevoRegistro }) {

    const { user } = useUsers();
    const [seEstaEnviando, setSeEstaEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();
    const [passwordShown, setPasswordShown] = useState(false);
    const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setSeEstaEnviando(true);
        setMensaje(null);

        const formData = new FormData(event.currentTarget);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            setMensaje({ tipo: 'danger', texto: 'Las contraseñas no coinciden.' });
            setSeEstaEnviando(false);
            return;
        }

        try {
            const resultado = await enviarUsuario(
                user?.token ?? '',
                '',
                formData.get('nombre') ?? '',
                formData.get('apellidos') ?? '',
                formData.get('fecha_nacimiento') ?? '',
                formData.get('telefono') ?? '',
                formData.get('id_contrato') ?? '',
                formData.get('id_departamento') ?? '',
                formData.get('username') ?? '',
                formData.get('email') ?? '',
                password,
            );

            const [ok, mensaje] = resultado;

            if (ok === true) {
                handleNuevoRegistro();
            } else {
                setMensaje({ tipo: 'danger', texto: mensaje ?? 'Error al registrar el empleado.' });
            }
        } catch (error) {
            console.error(error);
            setMensaje({ tipo: 'danger', texto: 'Error de conexión con el servidor.' });
        } finally {
            setSeEstaEnviando(false);
        }
    }

    return (
        <div className="superponer">
            <div className="card confirmacion" style={{ width: 'min(95dvw, 1200px)', overflowY: 'auto' }}>
                <div className="card-header d-flex justify-content-end">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Registro</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <h4 className="mb-2 mt-1 border-bottom pb-1 small fw-semibold">Información</h4>

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
                                    required
                                />
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-4 mb-2">
                                <label htmlFor="id_contrato" className="form-label small mb-1">
                                    ID Contrato <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    id="id_contrato"
                                    name="id_contrato"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="col-md-4 mb-2">
                                <label htmlFor="id_departamento" className="form-label small mb-1">
                                    ID Departamento <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    id="id_departamento"
                                    name="id_departamento"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <h4 className="mb-2 mt-2 border-bottom pb-1 small fw-semibold">Cuenta de acceso</h4>

                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="username" className="form-label small mb-1">
                                    Usuario <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="username"
                                    name="username"
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="email" className="form-label small mb-1">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    id="email"
                                    name="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor="password" className="form-label small mb-1">
                                Contraseña <span className="text-danger">*</span>
                            </label>
                            <div className="input-group input-group-sm">
                                <input
                                    type={passwordShown ? 'text' : 'password'}
                                    className="form-control form-control-sm"
                                    id="password"
                                    name="password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setPasswordShown(p => !p)}
                                >
                                    {passwordShown ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor="confirmPassword" className="form-label small mb-1">
                                Confirmar contraseña <span className="text-danger">*</span>
                            </label>
                            <div className="input-group input-group-sm">
                                <input
                                    type={confirmPasswordShown ? 'text' : 'password'}
                                    className="form-control form-control-sm"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setConfirmPasswordShown(p => !p)}
                                >
                                    {confirmPasswordShown ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button
                                className="btn btn-secondary btn-sm"
                                type="button"
                                onClick={funcionDeCierreDeFormulario}
                                disabled={seEstaEnviando}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                type="submit"
                                disabled={seEstaEnviando}
                            >
                                {seEstaEnviando ? 'Registrando...' : 'Registrar'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
