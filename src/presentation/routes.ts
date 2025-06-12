import { Router } from "express";
import { EmployeesRoutes } from "./employees/employees.routes";
import { PersonasRoutes } from "./personasMongo/personas.routes";
import { UsuariosRoutes } from "./usuarios/usuarios.routes";
import { ChatsRoutes } from "./chat/chat.routes";
import { ChatMessageRoutes } from "./chatMessage/chatMessage.routes";
import { GroupRoutes } from "./Group/group.routes";
import { GroupMessageRoutes } from "./groupMessage/groupMessage.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/employees", EmployeesRoutes.router);
    router.use("/auth", PersonasRoutes.router);
    router.use("/user", UsuariosRoutes.router);
    
    router.use("/chat/message", ChatMessageRoutes.router);
    router.use("/chat", ChatsRoutes.router);

    router.use("/group/message", GroupMessageRoutes.router);
    router.use("/group", GroupRoutes.router);


    

    return router;
  }
}
