import { resolve } from "path";


const obtenerIndex = (req, res) => {
    res.sendFile(resolve("index.html"));

   


};

export default {
    obtenerIndex,
    
}