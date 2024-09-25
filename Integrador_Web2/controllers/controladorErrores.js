const error404 = (req, res) => {
    res.status(404).render("error", {
     
      message: "El recurso que estás buscando no existe.",
    });
  };
  
  export default {
    error404,
  };