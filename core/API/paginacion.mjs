const Paginacion = {
    MIN_PAGINACION: 0,
    MAX_PAGINACION_EMPLEADOS: 15,
    MAX_PAGINACION_PRODUCTOS: 25,
    MAX_PAGINACION_CONTRATOS: 15,
    MAX_PAGINACION_DEPARTAMENTOS: 15,

    DEFAULT_CANTIDAD_PAGINACION: 10,
    DEFAULT_PAGINA: 0,

    PARAMETROS_PERMITIDOS: ['cantidad', 'pagina', 'id', 'username', 'id_empleado', 'id_incidencia',
        'fecha_inicio', 'fecha_fin', 'estado', 'nombre', 'descripcion', 'tipo', 'observaciones', 'comentario',
        'apellidos', 'email', 'telefono', 'departamento', 'contrato'],
}

export default Paginacion;