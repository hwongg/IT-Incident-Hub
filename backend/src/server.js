const app = require("./app");
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`IT Incident Hub disponible en el puerto ${port}`));
