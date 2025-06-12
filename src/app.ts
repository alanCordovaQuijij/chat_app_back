import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { AppRoutes } from './presentation/routes';
import path from 'path';

const app = express();

app.use(morgan('dev'));
app.use(cors()); //sirve para comunicar con otros servidores
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api",AppRoutes.routes);
app.use('/files', express.static(path.join(__dirname, '..', 'uploads')));

//Configurar carpeta estática
//app.use(express.static("uploads"))


export default app;