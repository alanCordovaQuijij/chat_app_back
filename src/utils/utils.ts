import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entity/MongoEntities/Personas";
import moment from "moment";
import { Config } from "./keys";
import fs from "fs";

export const manejarError = (res: Response, next: NextFunction, error: any) => {
    console.error("Error: ", error);
    if (error.isBoom) {
      const { statusCode, message } = error.output.payload;
      res.status(statusCode).json({
        statusCode,
        message,
        data: error?.data?.data || null
      });
      return;
    }
    next(error);
  };

  export const crearUsaurioToken = (user: User) => {

    const expiration = moment().add(24, 'hours').unix();

    const payload = {
      token_type: "access",
      user_id: user._id,
      iat: moment().unix(),
      exp: expiration
    }

    return jwt.sign(payload, Config.SECRET_KEY_TOKEN)

  };

  export const refrezcarUsuarioToken = (user: User) => {

    const expiration = moment().add(1, 'month').unix();

    const payload = {
      token_type: "refresh",
      user_id: user._id,
      iat: moment().unix(),
      exp: expiration
    }

    return jwt.sign(payload, Config.SECRET_KEY_TOKEN)

  };

  export interface DecodedToken {
    token_type: 'access' | 'refresh';
    user_id: string;
    iat: number;
    exp: number;
  }
  

  export const decodificarUsuarioToken = (token: string) => {
      
    const decoded = jwt.decode(token);
    return decoded as DecodedToken | null
  };

  export const VerificarExpiracionToken = (token: string) => {

    const tokenDecodificado = decodificarUsuarioToken(token);

    const haExpirado = moment().unix() >= tokenDecodificado.exp;

    return {haExpirado, tokenDecodificado};
  };


    // Asegurarse de que el directorio existe
  export const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
      // Crea el directorio de forma recursiva (creará también directorios padres si no existen)
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Directorio creado: ${directory}`);
    }
  };