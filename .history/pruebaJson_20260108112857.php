<?php
function crearArchivoJSON($nombreSeccion, $nuevoDato, $rutaArchivo)
{
    // Compruebo si el archivo existe
    if (file_exists($rutaArchivo)) {

        //Obtengo el contenido del JSON
        $contenidoArchivo = file_get_contents($rutaArchivo);

        //Decodifico el contenido de ese JSON
        $contenidoDecodificado = json_decode($contenidoArchivo, true);

        // Compruebo el contenido si esta vacio o no se lee, se crea un nuevo array
        if (!is_array($contenidoDecodificado)) {
            $contenidoDecodificado = [];
        }
    } else {
        $contenidoDecodificado = [];
    }

    // Compruebo si la seccion esta creada y sino la creo
    if (!isset($contenidoDecodificado[$nombreSeccion]) || !is_array($contenidoDecodificado[$nombreSeccion])) {
        $contenidoDecodificado[$nombreSeccion] = [];
    }

    // Agregolos datos a la seccion
    $contenidoDecodificado[$nombreSeccion][] = $nuevoDato;

    // Convierto el array a formato json
    $contenidoFinalJSON = json_encode($contenidoDecodificado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    // Añado el contenido al archivo
    if (file_put_contents($rutaArchivo, $contenidoFinalJSON)) {
        echo "Datos añadidos correctamente a la sección '$nombreSeccion' en $rutaArchivo<br>";
    } else {
        echo "Error al guardar los datos en el archivo $rutaArchivo<br>";
    }
}



$rutaArchivo = 'config.json';

// Añadir otra sección con configuración general
$configuracion = [
    "hostname" => "producción",
    "version" => "1.0.2"
];
crearArchivoJSON("configuracion", $configuracion, $rutaArchivo);
