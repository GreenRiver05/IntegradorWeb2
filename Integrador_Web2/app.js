import express, { urlencoded } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import controladorErrores from "./controllers/controladorErrores.js";
import controladorSolicitudes from "./controllers/controladorSolicitudes.js";
//const translate = requiere("node-google-translate-skidz");
import translate from 'node-google-translate-skidz';
import { Console } from "console";






const app = express(); //Creamos una instancia de una aplicación Express.
const port = 8100; //definimos el numero de puerto en el que el servidor escuchara en el server.listen(port)
app.use(express.urlencoded({ extended: true })); //middleware ¿?
const __filename = fileURLToPath(import.meta.url); //obtenemos el nombre del archivo actual
const __dirname = path.dirname(__filename); //obtenemos el directorio del archivo actual
//const apiDinamica = "https://collectionapi.metmuseum.org/public/collection/v1/objects/"; //definimos la URL bpara la API de un museo

app.use(cors()); // Habilitar CORS para permitir solicitudes de cualquier origen // Habilitar CORS para todas las rutas
app.set("views", path.join(__dirname, "views"));//Esta línea configura el directorio donde se encuentran las vistas
//(archivos de plantillas) de tu aplicación. __dirname es una variable que contiene la ruta del directorio actual,
// y path.join(__dirname, "views") crea una ruta absoluta al directorio views.
app.set("view engine", "pug");//Esta línea establece el motor de plantillas que se utilizará para renderizar las vistas. 
//En este caso, se está utilizando Pug, un motor de plantillas que permite escribir HTML
// de manera más concisa y con una sintaxis simplificada.
app.use(express.static(path.join(__dirname, "public")));//Esta línea configura el middleware para servir archivos estáticos como imágenes,
//archivos CSS y JavaScript desde el directorio public. Esto permite que los archivos en ese
//directorio sean accesibles públicamente a través de la URL.
app.use(express.json());// Este middleware se utiliza para analizar las solicitudes entrantes con cargas útiles JSON. 
//Es decir, convierte el cuerpo de las solicitudes JSON en un objeto JavaScript accesible a través de req.body.
app.use(express.urlencoded({ extended: false })); //Este middleware se utiliza para analizar las solicitudes entrantes con datos
//codificados en URL (como los enviados por formularios HTML). La opción { extended: false } indica que solo se pueden
//analizar objetos con cadenas o matrices simples.


app.get("/", controladorSolicitudes.obtenerIndex);

app.post('/traducir', async (req, res) => {

    let datosParaTraducir = req.body;

    console.log(datosParaTraducir);
    try {
        const traducciones = await Promise.all(datosParaTraducir.map(async (item) => {

            const [tituloTraducido, nombreObjetoTraducido, culturaTraducida, dinastiaTraducida, fechaTraducida] = await Promise.all([
                translate({ text: item.titulo, source: 'en', target: 'es' }),
                translate({ text: item.nombreObjeto, source: 'en', target: 'es' }),
                translate({ text: item.cultura, source: 'en', target: 'es' }),
                translate({ text: item.dinastia, source: 'en', target: 'es' }),
                translate({ text: item.fecha, source: 'en', target: 'es' })
            ]);

            return {
                titulo: tituloTraducido.translation,
                nombreObjeto: nombreObjetoTraducido.translation,
                cultura: culturaTraducida.translation,
                dinastia: dinastiaTraducida.translation,
                fecha: fechaTraducida.translation
            };
        }));
        console.log(traducciones);
        res.json(traducciones);
    } catch (err) {
        console.error('Error al traducir los datos:', err);
        res.status(500).send('Error al traducir los datos');
    }
});



app.use(controladorErrores.error404); //se utiliza en una aplicación de Express.js para manejar errores 404,
// que ocurren cuando un usuario intenta acceder a una ruta que no existe en el servidor.

//esto arranca el servidor en el puerto definido en la linea 8
app.listen(port, () => {
    console.log(`La aplicación está funcionando en http://localhost:${port}`);

});



/*
async function datos() { //definimos una funcion asincrona para obtener datos de la API
    const res = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects/4"); //solicitud
    const data = await res.json(); //convertimos la respuesta en Json
    console.log(data);
    return data;
  }


//ruteo de peticiones base
server.get("/", async (req, res) => {
    res.send(await datos()); //enviamos al navegador los datos obtenidos por la funcion datos() como respuesta
    //res.send("LosPerritos"); //break point
   
});

//ruteo de peticiones user
server.get("/user", (req, res) => {
    res.send("Soy Gabby");
});

//ruteo dinamico ---->   ":" parametro dinamico
server.get("/otro/:id", async(req, res) => {
    const param = req.params.id; //obtenemos el parametro ID de la url
    console.log(param);
    const dato = await fetch(apiDinamica + param); //realizaomos una solicitud a la API con el parametro dinamico ID
    const resultado = await dato.json(); //convertimos la respuesta den Json
    res.send(await resultado); //enviamos al navegador los datos obtenidos como respuesta
})


//ruteo de peticiones proyecto
server.get("/proyecto",(req,res)=>{
    res.sendFile(__dirname + "/index.html");//enviamos al navegador el archivo index.html como respuesta
})


*/