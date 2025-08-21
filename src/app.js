import express from 'express';
import bodyParser from 'body-parser'
import path from 'path';
import { fileURLToPath } from 'url';
//set up and configure express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

//directorio raiz para enviar a la raiz del portafolio
app.get('/', (req, res) => {
    res.redirect('/login.html');
});


//start the server
app.listen(8081, () => {
    console.log("Server is running.");
});