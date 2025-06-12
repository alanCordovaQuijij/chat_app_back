import { NextFunction, Response, Router } from "express";
import { asureAuth, RequestUsuario } from "../../middlewares/authenticated";
import { ensureDirectoryExists, manejarError } from "../../utils/utils";
import multer from "multer";
import path from "path";
import * as boom from "@hapi/boom";
import { CrearMensajeGrupo, getAllMessagesGroup, getTotalMessagesGroup, getUltimoMessageGroup } from "./groupMessage.service";

const imagesDirectory = "./uploads/images";

export class GroupMessageRoutes {
  static get router(): Router {
    const router = Router();

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        ensureDirectoryExists(imagesDirectory);

        cb(null, imagesDirectory); // Carpeta donde se guardarán los archivos
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
            url = `files/images/${req.file.filename}`;
          }

          body = {
            ...req.body,
            user_id,
            url,
          };

          const resp = await CrearMensajeGrupo(body);
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
          res.status(400).json({
            message: "Falta el parámetro group_id en la URL",
          });
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
      "/:group_id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { group_id } = req.params;

          if (!group_id) throw boom.badRequest("Falata el parámetro group_id");

          const resp = await getAllMessagesGroup(group_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
      "/total/:group_id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { group_id } = req.params;
          if (!group_id) throw boom.badRequest("Falata el parámetro group_id");

          const resp = await getTotalMessagesGroup(group_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
      "/last/:group_id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { group_id } = req.params;
          if (!group_id) throw boom.badRequest("Falta el parámetro group_id");

          const resp = await getUltimoMessageGroup(group_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    return router;
  }
}
