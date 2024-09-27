const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const URL_OBJETOS = "https://collectionapi.metmuseum.org/public/collection/v1/objects";
const URL_OBJETOID = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
const URL_OBJETOSPRESENTACION = "https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true&q=&hasImages=true";
const URL_BUSCAR = "https://collectionapi.metmuseum.org/public/collection/v1/search?"

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]') //tooltips
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const $tarjetas = document.getElementById("tarjetas"),
    $fragmentTarjetas = document.createDocumentFragment();

const $listaDepartamentos = document.getElementById("listaDepartamentos"),
    $fragmentDepartamento = document.createDocumentFragment();

const $listaLocalidad = document.getElementById("listaLocalidad"),
    $fragmentLocalidades = document.createDocumentFragment();


async function cargarDepartamentos() {

    try {
        let res = await fetch(URL_DEPARTAMENTOS),
            json = await res.json();

        if (!res.ok) throw { status: res.status, statusText: res.statusText }; //SI "res.ok" ES FALSO, ENTONCES EL "throw" RETORNA EL FLUJO AL "catch"

        json.departments.forEach(el => {
            const option = document.createElement("option");
            option.value = el.displayName;
            option.dataset.id = el.departmentId;
            $fragmentDepartamento.appendChild(option);

        });
        $listaDepartamentos.appendChild($fragmentDepartamento);

    } catch (err) {
        let message = err.statusText || "Ocurrió un error";
        $tarjetas.innerHTML = `Error ${err.status}: ${message} || ERROR EN DEPARTAMENTOS`;
    }
}


async function cargarLocalidades() {

    try {
        let res = await fetch('localidades.json'),
            json = await res.json();

        if (!res.ok) throw { status: res.status, statusText: res.statusText }; //SI "res.ok" ES FALSO, ENTONCES EL "throw" RETORNA EL FLUJO AL "catch"

        Object.values(json).forEach(el => {
            const option2 = document.createElement("option");
            option2.value = el.city;
            option2.dataset.id = el.objectID;
            $fragmentLocalidades.appendChild(option2);

        });
        $listaLocalidad.appendChild($fragmentLocalidades);

    } catch (err) {
        let message = err.statusText || "Ocurrió un error";
        $tarjetas.innerHTML = `Error ${err.status}: ${message} || ERROR EN LOCALIDADES`;
    }

}


async function crearPaginas(objectIDs, parametro) {

    let tarjetasPresentacion = "";
    let numObjetos = 0;
    let paginaActual = 1;
    let objetosPorPagina = 20;
    let paginas = [];
    let contadorObjetoConsoleLog = 0;

    for (const el of objectIDs) { //se utiliza un bucle for/of en lugar de forEach para poder usar await dentro del bucle.

        if (parametro === "presentacion" && paginaActual > 1) {
            numObjetos = 0;
            break;
        }

        if (parametro === "buscador" && paginaActual > 5) {
            numObjetos = 0;
            break;
        }
        //console.log(el);

        if (numObjetos >= objetosPorPagina) {
            console.log(`pagina N°: ${paginaActual}`);
            paginas.push({ pagina: paginaActual, tarjetas: tarjetasPresentacion });
            tarjetasPresentacion = "";
            numObjetos = 0;
            paginaActual++;
        }

        try {
            let resObjeto = await fetch(URL_OBJETOID + el);
            if (!resObjeto.ok) continue;

            let jsonObjeto = await resObjeto.json();

            // if (jsonObjeto.culture.trim() !== "" && jsonObjeto.objectDate.trim() !== "") { SOLO TRAER OBJETOS CON CULTURAS Y FECHA 

            let resLocal = await fetch('http://localhost:8100/traducir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{
                    titulo: jsonObjeto.title.trim() !== "" ? jsonObjeto.title : 'A stranger',
                    nombreObjeto: jsonObjeto.objectName.trim() !== "" ? jsonObjeto.objectName : 'Not cataloged',
                    cultura: jsonObjeto.culture.trim() !== "" ? jsonObjeto.culture : 'Not registered',
                    dinastia: jsonObjeto.dynasty.trim() !== "" ? jsonObjeto.dynasty : 'Unknown',
                    fecha: jsonObjeto.objectDate.trim() !== "" ? jsonObjeto.objectDate : 'A stranger',
                }])
            });

            if (!resLocal.ok) throw { status: resLocal.status, statusText: resLocal.statusText };
            contadorObjetoConsoleLog++;
            let datosTraducidos = await resLocal.json();
            // console.log('Objeto traducido:', datosTraducidos[0].titulo);
            console.log(`objeto N°: ${contadorObjetoConsoleLog}`);


            tarjetasPresentacion += `
                            <article class="col-12 col-md-6 col-lg-3 d-flex pt-5 ">
                                <div class="card x-auto mb-3 h-100 ">
                                    <img src="${jsonObjeto.primaryImageSmall !== "" ? jsonObjeto.primaryImageSmall : '/img/noImagen.jpeg'}"
                                     class="card-img-top"
                                     alt="${datosTraducidos[0].titulo}" 
                                     data-bs-toggle="tooltip"
                                     data-bs-title="<b><u>FECHA:</u></b> ${jsonObjeto.objectDate.trim() !== "" ? datosTraducidos[0].fecha : `<span style="color: red;">${datosTraducidos[0].fecha}</span>`}"
                                     data-bs-custom-class="custom-tooltip"
                                     data-bs-html="true"/>
                                    <div class="card-body">
                                        <h5 class="card-title text-center">${jsonObjeto.title.trim() !== "" ? datosTraducidos[0].titulo : `<span style="color: red;">${datosTraducidos[0].titulo}</span>`}</h5>
                                        <p class="card-text pt-5">
                                        <b>Nombre de Objeto:</b> ${jsonObjeto.objectName.trim() !== "" ? datosTraducidos[0].nombreObjeto : `<span style="color: red;">${datosTraducidos[0].nombreObjeto}</span>`}
                                        </p>
                                        <p class="card-text">
                                            <b>Cultura:</b> ${jsonObjeto.culture.trim() !== "" ? datosTraducidos[0].cultura : `<span style="color: red;">${datosTraducidos[0].cultura}</span>`}
                                        </p>
                                        <p class="card-text">
                                           <b>Dinastía:</b>  ${jsonObjeto.dynasty.trim() !== "" ? datosTraducidos[0].dinastia : `<span style="color: red;">${datosTraducidos[0].dinastia}</span>`}
                                        </p>
                                         ${jsonObjeto.additionalImages && jsonObjeto.additionalImages.length > 0 ? `
                                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#imagenesModal" onclick="cargarImagenesAdicionales(${el},'${datosTraducidos[0].titulo}')">
                                        Fotos Adicionales
                                        </button>` : ''}
                                        </div>
                                </div>
                            </article>`;
            numObjetos++;

        } catch (err) {
            console.error(`Error al procesar el ID ${el}: ${err.status || 'N/A'} - ${err.statusText || 'N/A'} `);

        }
    };

    if (numObjetos > 0) {
        paginas.push({ pagina: paginaActual, tarjetas: tarjetasPresentacion });
        console.log(`pagina N°: ${paginaActual}`);
    }
    //console.log("TERMINE LA PAGINACION")
    // console.log(paginas[0]);
    // console.log(paginas[1]);
    generarBotonesPaginacion(paginas);
    $tarjetas.innerHTML = paginas[0].tarjetas;
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        var tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
            customClass: 'custom-tooltip'
        });
    });
}


function generarBotonesPaginacion(paginas) {
    //console.log("GENERANDO BOTONES")
    const contenedorBotones = document.getElementById("contenedorBotones");


    paginas.forEach(el => {
        let boton = document.createElement("button");
        boton.textContent = `Página ${el.pagina}`;
        boton.onclick = () => mostrarPaginas(el.tarjetas);
        contenedorBotones.appendChild(boton);
        // console.log("GENERANDO BOTON: "+el.pagina);
        //console.log("INFO: "+el.tarjetas); 
    });
}


function mostrarPaginas(tarjetas) {
    $tarjetas.innerHTML = "";
    $tarjetas.innerHTML = tarjetas;
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        var tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
            customClass: 'custom-tooltip'
        });
    });

}


async function cargarImagenesAdicionales(objectID, tituloTraducido) {

    try {

        let resObjeto = await fetch(URL_OBJETOID + objectID);
        if (!resObjeto.ok) throw new Error(`Error al obtener el objeto: ${resObjeto.status} - ${resObjeto.statusText}`);

        let jsonObjeto = await resObjeto.json();
        let imagenesAdicionales = jsonObjeto.additionalImages;

        if (!imagenesAdicionales || imagenesAdicionales.length === 0) {
            throw new Error('No se encontraron imágenes adicionales.');
        }
        function cambiarTamañoImagen(url) { //funcion para cambiar la URL de las imagen para que me traiga las mas chicas y no las orginales
            console.log(url);
            let nuevaUrl = url.replace('/original/', '/web-large/');
            console.log(nuevaUrl);
            return nuevaUrl;
        }


        let imagenesHTML = imagenesAdicionales.map(img => `
            <div class="col-4">
                <img src="${cambiarTamañoImagen(img)}" class="img-fluid" alt="Imagen adicional">
            </div>
        `).join('');

        document.getElementById("imagenesModalLabel").innerHTML = jsonObjeto.title.trim() !== "" ? tituloTraducido : `<span style="color: red;">${tituloTraducido}</span>`;
        document.getElementById('imagenesAdicionales').innerHTML = imagenesHTML;
    } catch (err) {
        console.error(`Error al cargar imágenes adicionales para el ID ${objectID}: ${err.message}`);
    }
}


async function artePresentacion() {

    try {

        let res = await fetch(URL_OBJETOSPRESENTACION),
            json = await res.json();


        if (!res.ok) throw { status: res.status, statusText: res.statusText }; //SI "res.ok" ES FALSO, ENTONCES EL "throw" RETORNA EL FLUJO AL "catch"

        let mezclarArreglo = json.objectIDs.sort(() => 0.5 - Math.random()); //mezclamos el array de objectIDs de manera aleatoria.

        console.log(mezclarArreglo);
        crearPaginas(mezclarArreglo, "presentacion");

    } catch (err) {

        let message = err.statusText || "Ocurrió un error";
        $tarjetas.innerHTML = `Error ${err.status || 'N/A'}: ${message} || ERROR AL CARGAR PRESENTACION DE ARTE`;

    }
}


async function obtenerValor() {
    $tarjetas.innerHTML = "";
    contenedorBotones.innerHTML = "";

    const palabraClave = document.getElementById("palabra clave").value;
    const stringClave = palabraClave === "" ? `q=*` : `q=${(palabraClave)}`;
    console.log("Palabra Clave seleccionada:", palabraClave);
    console.log("Palabra Clave seleccionada:", stringClave);
    const departamento = document.getElementById("departamento");
    const opcionDepartamento = Array.from(departamento.list.options).find(option => option.value === departamento.value);
    const departamentoId = opcionDepartamento ? `&departmentId=${opcionDepartamento.dataset.id}` : "";
    //console.log("ID del departamento seleccionado:", departamento);

    const localidad = document.getElementById("localidad").value !== "" ? `&geoLocation=${document.getElementById("localidad").value}` : "";
    //console.log("Localidad seleccionada:", localidad);

    console.log(URL_BUSCAR + stringClave + departamentoId + localidad);

    try {

        let res = await fetch(URL_BUSCAR + stringClave + departamentoId + localidad),
            json = await res.json();
        console.log(json);
        console.log(res.ok);

        if (!res.ok) throw { status: res.status, statusText: res.statusText }; //SI "res.ok" ES FALSO, ENTONCES EL "throw" RETORNA EL FLUJO AL "catch"

        if (json.total == 0) {

            let palabraClaveText = document.getElementById("palabra clave").value !== "" ? `Palabra Clave: ${document.getElementById("palabra clave").value}` : "";
            let departamentoText = opcionDepartamento ? `Departamento: ${opcionDepartamento.dataset.id}` : "";
            let localidadText = document.getElementById("localidad").value !== "" ? `Localidad=${document.getElementById("localidad").value}` : ""

            $tarjetas.innerHTML = `No se encontro Arte con: ${palabraClaveText}   ----   ${departamentoText}   -----   ${localidadText}`;

        } else {
            let mezclarArreglo = json.objectIDs.sort(() => 0.5 - Math.random()); //mezclamos el array de objectIDs de manera aleatoria.

            crearPaginas(mezclarArreglo, "buscador");
        }



    } catch (err) {

        let message = err.statusText || "Ocurrió un error";
        $tarjetas.innerHTML = `Error ${err.status || 'N/A'}: ${message} || ERROR AL CARGAR PRESENTACION DE ARTE`;


    }

}


cargarDepartamentos();
cargarLocalidades();
artePresentacion();


// async function consumirLocalidades() { 

//     const misLocalidades = {};
//     let numAux = 0;
//     let numLocalidades = 0;
//     let numTOTAL = 0
//     const maxLocalidades = 1000;
//     try {

//         let resTodos = await fetch(URL_OBJETOS),
//             jsonTodos = await resTodos.json();

//         if (!resTodos.ok) throw { status: resTodos.status, statusText: resTodos.statusText }; //SI "res.ok" ES FALSO, ENTONCES EL "throw" RETORNA EL FLUJO AL "catch"

//         if (numLocalidades == 0) {

//             for (const el of jsonTodos.objectIDs) { //se utiliza un bucle for/of en lugar de forEach para poder usar await dentro del bucle.
//                 if (numAux >= maxLocalidades) break; // Sal del bucle si ya has alcanzado el límite
//                 numTOTAL++;
//                 console.log(`OBJETOS ENCONTRADOS: ${numTOTAL} //// OBJETO ID: ${el}`);
               
//                 try {
//                     let resSolo = await fetch(URL_OBJETOID + el);
//                     let jsonSolo = await resSolo.json();

//                     if (!resSolo.ok) throw { status: resSolo.status, statusText: resSolo.statusText };

//                     if (jsonSolo && jsonSolo.city.trim() !== "" && !Object.values(misLocalidades).some(loc => loc.city === jsonSolo.city)) {
//                         misLocalidades[numAux] = {
//                             objectID: el,
//                             city: jsonSolo.city
//                         }
//                         numLocalidades++;
//                         numAux++;
//                         console.log(`ID: ${el} - Localidad: ${jsonSolo.city} LOCALIDADES GUARDADAS: ${numLocalidades}`);
//                     }
//                 } catch (err) {
//                     console.error(`Error al procesar el ID ${el}:`, err);
//                 }

//             };

//             const data = JSON.stringify(misLocalidades, null, 2);

//             fs.writeFile('localidades.json', data, (err) => {
//                 if (err) {
//                     console.error('Error al escribir el archivo:', err);
//                 } else {
//                     console.log('Archivo escrito correctamente');
//                 }
//             });
//         }

//     } catch (err) {

//         let message = err.statusText || "Ocurrió un error";
//         // $localidades.innerHTML = `Error ${err.status}: ${message}`;
//         console.log(message);
//     }
// }

