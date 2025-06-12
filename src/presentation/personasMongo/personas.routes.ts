import { NextFunction, Request, Response, Router } from "express";
import { getPersonas, loginUsuario, refreshAccesToken, registrarPersona } from "./personas.service";
import { manejarError} from "../../utils/utils";
import { asureAuth, RequestUsuario } from "../../middlewares/authenticated";

export class PersonasRoutes {
  static get router(): Router {
    const router = Router();

    router.get("/", getPersonas  );

    //router.post("/register", registrarPersona);

    router.post("/register", 
      async (req: Request, res: Response, next: NextFunction) => {
        try {

          const resp = await registrarPersona(req.body);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.post("/login", 
      async (req: Request, res: Response, next: NextFunction) => {
        try {

          const resp = await loginUsuario(req.body);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );

    router.post(
      "/refresh_access_token",
      //asureAuth, 
      async (req: RequestUsuario, res: Response, next: NextFunction) => {
        try {
          const {refreshToken} = req.body

          //console.log("USUARIO===>", req.usuario)

          const resp = await refreshAccesToken(refreshToken);
          res.json(resp);
        } catch (error) {
          manejarError(res, next, error);
        }
      }
    );



    return router;
  }
}
