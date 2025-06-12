import { NextFunction, Response, Router } from "express";
import { asureAuth, RequestUsuario } from "../../middlewares/authenticated";
import { ensureDirectoryExists, manejarError } from "../../utils/utils";
import multer from "multer";
import path from "path";
import {
  CrearMensaje,
  getAllMessages,
  getTotalMessages,
  getUltimoMessage,
} from "./chatMessage.service";
import * as boom from "@hapi/boom";

const imagesDirectory = "./uploads/images";

export class ChatMessageRoutes {
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

          const resp = await CrearMensaje(body);
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
            message: "Falta el parámetro chat_id en la URL",
          });
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
      "/:chat_id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { chat_id } = req.params;

          if (!chat_id) throw boom.badRequest("Falta el parámetro chat_id");

          const resp = await getAllMessages(chat_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
      "/total/:chat_id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { chat_id } = req.params;
          if (chat_id === undefined)
            throw boom.badRequest("Falta el parámetro chat_id");

          const resp = await getTotalMessages(chat_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.get(
      "/last/:chat_id",
      asureAuth,
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const { chat_id } = req.params;
          if (!chat_id) throw boom.badRequest("Falata el parámetro chat_id");

          const resp = await getUltimoMessage(chat_id);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    return router;
  }
}
