import { NextFunction, Response, Router } from "express";
import { asureAuth, RequestUsuario } from "../../middlewares/authenticated";
import { ensureDirectoryExists, manejarError } from "../../utils/utils";
import { getMe, getUser, getUsers, obtenerUsuariosDisponiblesGrupo, UpdateMe } from "./usuarios.services";
import multer from "multer";
import path from "path";
import * as boom from "@hapi/boom";

const avatarDirectory = "./uploads/avatar";

export class UsuariosRoutes {
  static get router(): Router {
    const router = Router();

    router.get(
      "/me",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { user_id } = req.usuario;

          const resp = await getMe(user_id);
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
          const { user_id } = req.usuario;

          const resp = await getUsers(user_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );



    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        ensureDirectoryExists(avatarDirectory);

        cb(null, avatarDirectory); // Carpeta donde se guardarán los archivos
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
      },
    });

    // Configuración de multer
    const upload = multer({ storage: storage });

    router.patch(
      "/me",
      asureAuth,
      upload.single("avatar"),
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { user_id } = req.usuario;
          let body = null;
          let url = null;

          console.log("req.body======>", req.body);
          console.log("req.file======>", req.file);

          if (req?.file) {
            url = `files/avatar/${req.file.filename}`;
          }

          body = {
            ...req.body,
            user_id,
            url,
          };

          const resp = await UpdateMe(body);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
      "/users_exept_participants_group/:group_id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { user_id } = req.usuario;
          const {group_id}  = req.params;

          const resp = await obtenerUsuariosDisponiblesGrupo(group_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    return router;
  }
}
