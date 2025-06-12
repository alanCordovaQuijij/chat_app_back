import { NextFunction, Request, Response } from "express";
import { DecodedToken, manejarError, VerificarExpiracionToken } from "../utils/utils";
import * as boom from "@hapi/boom";
import { Multer } from 'multer';

export interface RequestUsuario extends Request {
    usuario: DecodedToken,
    file?: Express.Multer.File; // ← este es el importante
    files?: Express.Multer.File[];
}

export const asureAuth = (req: RequestUsuario, res: Response, next: NextFunction) => {

    try {
      if(!req.headers?.authorization) throw boom.badRequest("La petición no tiene la cabecera de autenticación");

      const token = req.headers.authorization.replace("Bearer ", "");

      const hasExpired = VerificarExpiracionToken(token);

      if(hasExpired.haExpirado) throw boom.badRequest("El token ha expirado");

      req.usuario = hasExpired.tokenDecodificado;
        
      next();
    } catch (error) {
        manejarError(res, next, error)      
    }

};