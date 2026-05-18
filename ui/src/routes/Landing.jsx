import React from 'react';
import { Link } from 'react-router-dom';
import '../../public/styles/Landing.css';

const FEATURES = [
    {
        icon: 'bi-people-fill',
        title: 'Gestión de empleados',
        desc: 'Alta, edición y baja de empleados. Consulta contratos, departamentos y datos personales de toda la plantilla en un único lugar.',
        color: '#0d6efd',
        bg: '#e7f1ff',
    },
    {
        icon: 'bi-clock-history',
        title: 'Control de fichajes',
        desc: 'Registro de entradas y salidas en tiempo real. Historial completo por empleado con filtros avanzados por fecha y tipo.',
        color: '#198754',
        bg: '#d1e7dd',
    },
    {
        icon: 'bi-calendar-check-fill',
        title: 'Solicitudes de vacaciones',
        desc: 'Los empleados solicitan sus vacaciones y RRHH las revisa y aprueba. Todo el flujo gestionado sin papel ni emails.',
        color: '#0dcaf0',
        bg: '#cff4fc',
    },
    {
        icon: 'bi-exclamation-triangle-fill',
        title: 'Gestión de incidencias',
        desc: 'Apertura, seguimiento y cierre de incidencias por empleado. Trazabilidad completa de cada caso con comentarios y estados.',
        color: '#ffc107',
        bg: '#fff3cd',
    },
    {
        icon: 'bi-box-seam-fill',
        title: 'Inventario de productos',
        desc: 'Catálogo de productos con estados y precios. Mantén el stock de tu empresa siempre bajo control.',
        color: '#6f42c1',
        bg: '#e8d5ff',
    },
    {
        icon: 'bi-file-earmark-text-fill',
        title: 'Contratos y departamentos',
        desc: 'Gestión centralizada de tipos de contrato y estructura departamental. Define y modifica la organización de tu empresa.',
        color: '#fd7e14',
        bg: '#ffe5d0',
    },
];

const ROLES = [
    {
        icon: 'bi-person-fill',
        title: 'Empleado',
        desc: 'Acceso a tu espacio personal con todo lo que necesitas en el día a día.',
        items: [
            'Consulta y edita tu perfil',
            'Registra tus fichajes de entrada y salida',
            'Solicita y consulta el estado de tus vacaciones',
            'Abre y hace seguimiento de tus incidencias',
        ],
    },
    {
        icon: 'bi-person-badge-fill',
        title: 'Recursos Humanos',
        desc: 'Herramientas para gestionar el equipo y los procesos de personal.',
        items: [
            'Gestión completa de empleados',
            'Aprobación de solicitudes de vacaciones',
            'Supervisión de incidencias del equipo',
            'Acceso al historial de fichajes de la plantilla',
        ],
    },
    {
        icon: 'bi-building-fill',
        title: 'Gerencia',
        desc: 'Visión global y control total de todos los módulos de la plataforma.',
        items: [
            'Dashboard con estadísticas en tiempo real',
            'Administración de contratos y departamentos',
            'Gestión de inventario y productos',
            'Control de permisos y niveles de acceso',
        ],
    },
];

export const Landing = () => {
    React.useEffect(() => {
        document.body.classList.add('landing-active');
        return () => document.body.classList.remove('landing-active');
    }, []);

    const scrollToFeatures = () => {
        document.getElementById('landing-features').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing-page">

            {/* ── Navbar ── */}
            <nav className="landing-nav">
                <span className="landing-logo">MANEX</span>
                <Link to="/login" className="btn btn-primary landing-nav-btn">
                    Iniciar sesión
                </Link>
            </nav>

            {/* ── Hero ── */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <span className="landing-badge">
                        <i className="bi bi-building me-2"></i>Plataforma de gestión empresarial
                    </span>
                    <h1 className="landing-title">
                        La gestión de tu empresa,{' '}
                        <span className="landing-title-accent">todo en un lugar</span>
                    </h1>
                    <p className="landing-subtitle">
                        MANEX integra empleados, fichajes, vacaciones, incidencias e inventario
                        en una plataforma intuitiva, segura y adaptada a cada rol de tu organización.
                    </p>
                    <div className="landing-hero-actions">
                        <Link to="/login" className="btn btn-primary btn-lg landing-cta-primary">
                            Iniciar sesión <i className="bi bi-arrow-right ms-2"></i>
                        </Link>
                        <button className="btn btn-outline-light btn-lg landing-cta-secondary" onClick={scrollToFeatures}>
                            Descubrir más <i className="bi bi-chevron-down ms-2"></i>
                        </button>
                    </div>
                </div>

                <div className="landing-hero-visual">
                    <div className="hero-icon-grid">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="hero-icon-card">
                                <div className="hero-icon-bubble" style={{ background: f.bg }}>
                                    <i className={`bi ${f.icon}`} style={{ color: f.color }}></i>
                                </div>
                                <span>{f.title.split(' ').slice(-1)[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="landing-features" className="landing-features-section">
                <div className="landing-container">
                    <div className="landing-section-header">
                        <h2>Todo lo que necesitas</h2>
                        <p>Seis módulos diseñados para cubrir cada aspecto de la gestión de tu empresa</p>
                    </div>
                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon" style={{ background: f.bg }}>
                                    <i className={`bi ${f.icon}`} style={{ color: f.color }}></i>
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Roles ── */}
            <section className="landing-roles-section">
                <div className="landing-container">
                    <div className="landing-section-header">
                        <h2>Diseñado para cada rol</h2>
                        <p>Cada usuario ve y puede hacer exactamente lo que necesita, ni más ni menos</p>
                    </div>
                    <div className="roles-grid">
                        {ROLES.map((r, i) => (
                            <div key={i} className="role-card">
                                <div className="role-icon">
                                    <i className={`bi ${r.icon}`}></i>
                                </div>
                                <h3>{r.title}</h3>
                                <p className="role-desc">{r.desc}</p>
                                <ul className="role-list">
                                    {r.items.map((item, j) => (
                                        <li key={j}>
                                            <i className="bi bi-check2-circle"></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section className="landing-cta-section">
                <div className="landing-container landing-cta-content">
                    <h2>¿Listo para empezar?</h2>
                    <p>Accede a tu espacio de trabajo y gestiona tu empresa con eficiencia</p>
                    <Link to="/login" className="btn btn-light btn-lg landing-cta-dark">
                        Iniciar sesión <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <span className="landing-logo landing-logo-sm">MANEX</span>
                <span className="landing-footer-copy">
                    © {new Date().getFullYear()} · Plataforma de gestión empresarial
                </span>
            </footer>

        </div>
    );
};
