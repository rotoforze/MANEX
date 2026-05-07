const Permissions = {
    '/': {
        "GET": ['*'],
    },
    '/login': {
        "GET": ['*'],
    },
    '/empleados': {
        "GET": ['>1'],
        "POST": ['5', '7', '8'],
        "DELETE": ['5', '7', '8'],
    },
    '/productos': {
        "GET": ['>1'],
        "POST": ['6', '7', '8'],
        "DELETE": ['6', '7', '8'],
    },
    '/contratos': {
        "GET": ['>1'],
        "POST": ['5', '7', '8'],
        "DELETE": ['5', '7', '8'],
    },
    '/departamentos': {
        "GET": ['>1'],
        "POST": ['7', '8'],
        "DELETE": ['7', '8'],
    }
}

export default Permissions;