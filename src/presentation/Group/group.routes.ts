import { NextFunction, Response, Router } from "express";
import { asureAuth, RequestUsuario } from "../../middlewares/authenticated";
import { ensureDirectoryExists, manejarError } from "../../utils/utils";
import multer from "multer";
import path from "path";
import * as boom from "@hapi/boom";
import {
  actualizarGrupo,
  addParticipants,
  crearGrupo,
  deleteParticipants,
  obtenerGrupoById,
  obtenerGrupos,
  salirGrupoById,
} from "./group.service";

const groupDirectory = "./uploads/group";

export class GroupRoutes {
  static get router(): Router {
    const router = Router();

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        ensureDirectoryExists(groupDirectory);

        cb(null, groupDirectory); // Carpeta donde se guardarán los archivos
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
      },
    });

    // Configuración de multer
    const upload = multer({ storage: storage });

    router.post(
      "/",
      asureAuth,
      upload.single("image"),
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { user_id } = req.usuario;

          let url = null;
          let body = null;

          if (req?.file) {
            url = `files/group/${req.file.filename}`;
          }

          body = {
            ...req.body,
            user_id,
            url,
          };

          const resp = await crearGrupo(body);
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
          const resp = await obtenerGrupos(req.usuario.user_id);

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
          const { id } = req.params;

          if (!id) throw boom.badRequest("Falata el parámetro id");

          const resp = await obtenerGrupoById(id);

          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.patch(
      "/exit/:id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { id } = req.params;
          const { user_id } = req.usuario;

          if (!id) throw boom.badRequest("Falata el parámetro id");

          const resp = await salirGrupoById(id, user_id);

          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.patch(
      "/add_participants/:id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { id } = req.params;
          const { users_id } = req.body;

          if (!id) throw boom.badRequest("Falata el parámetro id");

          const resp = await addParticipants(id, users_id);

          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.patch(
      "/ban",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { user_id, grupo_id } = req.body;

          if (!grupo_id) throw boom.badRequest("Falata el parámetro grupo_id");
          if (!user_id) throw boom.badRequest("Falata el parámetro users_id");

          const resp = await deleteParticipants(grupo_id, user_id);

          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.patch(
      "/:id",
      asureAuth,
      upload.single("image"),
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { id } = req.params;
          const { user_id } = req.usuario;

          if (!id) throw boom.badRequest("Falata el parámetro id");

          let url = null;
          let body = null;

          if (req?.file) {
            url = `files/group/${req.file.filename}`;
          }

          body = {
            ...req.body,
            grupo_id: id,
            user_id,
            url,
          };

          const resp = await actualizarGrupo(body);

          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    return router;
  }
}
