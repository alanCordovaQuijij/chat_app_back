import { NextFunction, Response, Router } from "express";
import { asureAuth, RequestUsuario } from "../../middlewares/authenticated";
import { ensureDirectoryExists, manejarError } from "../../utils/utils";
import multer from "multer";
import path from "path";
import { crearChat, eliminarChat, obtenerChatById, obtenerChats } from "./chat.services";


export class ChatsRoutes {
  static get router(): Router {
    const router = Router();

  
    router.post(
      "/",
      asureAuth, 
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {

          const resp = await crearChat(req.body);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
        "/",
        asureAuth, 
        async (req: RequestUsuario, res: Response, next: NextFunction) => {
          try {
  
            const resp = await obtenerChats(req.usuario.user_id);
            
            res.json(resp);
          } catch (error) {
            manejarError(res, next, error);
          }
        }
      );

      router.delete(
        "/:id",
        asureAuth, 
        async (req: RequestUsuario, res: Response, next: NextFunction) => {
          try {

            const {id} = req.params
  
            const resp = await eliminarChat(id);
            
            res.json(resp);
          } catch (error) {
            manejarError(res, next, error);
          }
        }
      );

      router.get(
        "/:id",
        asureAuth, 
        async (req: RequestUsuario, res: Response, next: NextFunction) => {
          try {

            const {id} = req.params;
  
            const resp = await obtenerChatById(id);
            
            res.json(resp);
          } catch (error) {
            manejarError(res, next, error);
          }
        }
      );

    return router;
  }
}