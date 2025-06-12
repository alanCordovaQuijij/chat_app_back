import { Router } from "express";
import { createEmployees, getEmployees, updateEmployee } from "./employees.service";

export class EmployeesRoutes {
  static get router(): Router {
    const router = Router();

    router.get("/",  getEmployees);
    router.post("/",  createEmployees);
    router.put("/:id",  updateEmployee);

    return router;
  }
}
