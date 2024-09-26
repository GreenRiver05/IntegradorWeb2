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
        $buscador.innerHTML = `Error ${err.status}: ${message} || ERROR EN DEPARTAMENTOS`;
    }
    // $departamento.addEventListener('input', (event) => {
    //     const selectedOption = Array.from($listaDepartamentos.options).find(option => option.value === event.target.value);
    //     if (selectedOption) {
    //         console.log('ID del departamento seleccionado:', selectedOption.dataset.id);
    //         // Aquí puedes guardar el ID en una variable o enviarlo a tu servidor
    //     }
    // });
}


async function cargarLocalidades() {

    try {
        let res = await fetch('localidades.json'),
            json = await res.json();

        if (!res.ok) throw { status: res.status, statusText: res.statusText }; //SI "res.ok" ES FALSO, ENTONCES EL "throw" RETORNA EL FLUJO AL "catch"

        Object.values(json).forEach(el => {
            const option2 = document.createElement("option");
            option2.value = el;
            $fragmentLocalidades.appendChild(option2);

        });
        $listaLocalidad.appendChild($fragmentLocalidades);

    } catch (err) {
        let message = err.statusText || "Ocurrió un error";
        $tarjetas.innerHTML = `Error ${err.status}: ${message} || ERROR EN LOCALIDADES`;
    }

}


async function cargarArtes(objectIDs) {
    let tarjetasPresentacion = "";
    let numTarjetas = 0;

    for (const el of objectIDs) { //se utiliza un bucle for/of en lugar de forEach para poder usar await dentro del bucle.

        //console.log(el);
        if (numTarjetas >= 20) break;

        try {
            let resObjeto = await fetch(URL_OBJETOID + el);
            if (!resObjeto.ok) continue;

            let jsonObjeto = await resObjeto.json();


            // if (jsonObjeto.culture.trim() !== "" && jsonObjeto.objectDate.trim() !== "") {


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

            let datosTraducidos = await resLocal.json();
            console.log('Objeto traducido:', datosTraducidos[0].titulo);

            numTarjetas++;
            tarjetasPresentacion += `
                            <article class="col-12 col-md-6 col-lg-3 d-flex pt-5 ">
                                <div class="card x-auto mb-3 h-100 ">
                                    <img src="${jsonObjeto.primaryImageSmall !== "" ? jsonObjeto.primaryImageSmall : '/img/noImagen.jpeg'}" class="card-img-top" alt="${datosTraducidos[0].titulo}" />
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
                                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#imagenesModal" onclick="cargarImagenesAdicionales(${el},'${datosTraducidos[0].titulo}')">
                                        Fotos Adicionales
                                        </button>
                                    </div>
                                </div>
                            </article>`;




            //   }

        } catch (err) {
            console.error(`Error al procesar el ID ${el}: ${err.status || 'N/A'} - ${err.statusText || 'N/A'} `);

        }
    };

    $tarjetas.innerHTML = tarjetasPresentacion;

}


async function cargarImagenesAdicionales(objectID, tituloTraducido) {
    $tarjetas.innerHTML = "";
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
        cargarArtes(mezclarArreglo);

    } catch (err) {

        let message = err.statusText || "Ocurrió un error";
        $tarjetas.innerHTML = `Error ${err.status || 'N/A'}: ${message} || ERROR AL CARGAR PRESENTACION DE ARTE`;

    }
}


async function obtenerValor() {

    const palabraClave = document.getElementById("palabra clave");
    //console.log("Palabra Clave seleccionada:", palabraClave);

    const departamento = document.getElementById("departamento");
    const opcionDepartamento = Array.from(departamento.list.options).find(option => option.value === departamento.value);
    const departamentoId = opcionDepartamento ? `&departmentId=${opcionDepartamento.dataset.id}` : null;
    //console.log("ID del departamento seleccionado:", departamento);

    const localidad = document.getElementById("localidad").value !== "" ? `&geoLocation=${document.getElementById("localidad").value}` : "";
    //console.log("Localidad seleccionada:", localidad);

    console.log(URL_BUSCAR + `q=${palabraClave.value}${departamentoId}${localidad}`);

    try {

        let res = await fetch(URL_BUSCAR + `q=${palabraClave.value}${departamentoId}${localidad}`),
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

            cargarArtes(mezclarArreglo);
        }



    } catch (err) {

        let message = err.statusText || "Ocurrió un error";
        $tarjetas.innerHTML = `Error ${err.status || 'N/A'}: ${message} || ERROR AL CARGAR PRESENTACION DE ARTE`;


    }

}


cargarDepartamentos();
cargarLocalidades();
artePresentacion();


async function crearPaginas(objectIDs) {
    let tarjetasPresentacion = "";
    let numObjetos = 0;
    let paginaActual = 1;
    let objetosPorPagina = 20;
    let paginas = [];


    for (const el of objectIDs) { // Asegúrate de que 'mezclarArreglo' esté definido o usa 'objectIDs' directamente.
        if (paginaActual > 5) break;

        if (numObjetos >= objetosPorPagina) {
            paginas.push({ pagina: paginaActual, objetos: tarjetasPresentacion });
            tarjetasPresentacion = "";
            numObjetos = 0;
            paginaActual++;
        }

        try {
            let resObjeto = await fetch(URL_OBJETOID + el);
            if (!resObjeto.ok) continue;

            let jsonObjeto = await resObjeto.json();
            tarjetasPresentacion += `<div>${jsonObjeto.title}</div>`; // Ajusta esto según tus necesidades
            numObjetos++;
        } catch (error) {
            console.error("Error fetching object:", error);
        }
    }

    // Añadir la última página si tiene objetos
    if (numObjetos > 0) {
        paginas.push({ pagina: paginaActual, objetos: tarjetasPresentacion });
    }

    // Generar botones de paginación
    generarBotonesPaginacion(paginas);
}

function generarBotonesPaginacion(paginas) {
    const contenedorBotones = document.getElementById("contenedorBotones");
    contenedorBotones.innerHTML = ""; // Limpiar botones anteriores

    paginas.forEach(pagina => {
        let boton = document.createElement("button");
        boton.textContent = `Página ${pagina.pagina}`;
        boton.onclick = () => mostrarPaginas(pagina.objetos);
        contenedorBotones.appendChild(boton);
    });
}

function mostrarPaginas(objetos) {
    const contenedorObjetos = document.getElementById("contenedorObjetos");
    contenedorObjetos.innerHTML = objetos;
}
