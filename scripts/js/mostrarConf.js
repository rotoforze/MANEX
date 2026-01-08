let datosConfiguracion=[];

//Cargo las confiuraciones

function cargarDatosConfiguracion(ruta) {
    fetch(ruta)
        .then(res => res.json())
        .then(data => {
             datosConfiguracion= data;
            
        })
        .catch(error => console.log("Error al cargar los datos de los configuracion:", error));

}