import { Request, Response } from "express";
import { Employees } from "../../entity/entities/Employees";
import { AppDataSourcePostgress } from "../../data-source";


export const getEmployees = async (req: Request, res: Response) => {
  // const employees = await Employees.find();
  //const employees = await Employees.findOneBy({employeeId: 204});

  const employees = await Employees.createQueryBuilder("employees")
    .innerJoinAndSelect("employees.job", "jobs")
    .select([
      "employees.employeeId",
      "employees.firstName",
      "jobs.jobId",
      "jobs.jobTitle",
    ])
    .getMany();

  return res.json(employees);
};

export const createEmployees = async (req: Request, res: Response) => {
  console.log("DATA BODY", JSON.stringify(req.body));

  const {
    first_name,
    last_name,
    email,
    phone_number,
    hire_date,
    job_id,
    salary,
    manager_id,
    department_id,
  } = req.body; // Suponiendo que los datos del nuevo empleado vienen en el body de la solicitud

  try {
    const newEmployee = new Employees();
    newEmployee.firstName = first_name;
    newEmployee.lastName = last_name;
    newEmployee.email = email;
    newEmployee.phoneNumber = phone_number;
    newEmployee.hireDate = hire_date;
    newEmployee.job = job_id;
    newEmployee.salary = salary;
    newEmployee.manager = manager_id;
    newEmployee.department = department_id;

    const EmployeeRepositorio = AppDataSourcePostgress.getRepository(Employees);

    await EmployeeRepositorio.save(newEmployee);

    return res
      .status(201)
      .json({ message: "Empleado creado successfully", employee: newEmployee });
  } catch (error) {
    console.error("Error creating employee:", error);
    return res
      .status(500)
      .json({ message: "Failed to create employee", error: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
    console.log("ENTRA EN UPDATE")
    console.log("ID EMPLEADO", req.params);

    const { id } = req.params; // Suponiendo que el ID del empleado que deseas actualizar está en los parámetros de la solicitud
    const { first_name, last_name, email, phone_number, hire_date, job_id, salary, manager_id, department_id } = req.body; // Suponiendo que los datos actualizados del empleado vienen en el body de la solicitud
    
    try {
      const employeeRepository =  AppDataSourcePostgress.getRepository(Employees);

  
      // Buscar el empleado por su ID
      const employeeToUpdate = await employeeRepository.findOneBy({employeeId: Number(id)});
  
      if (!employeeToUpdate) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      // Actualizar las propiedades del empleado con los nuevos valores
      employeeToUpdate.firstName = first_name;
      employeeToUpdate.lastName = last_name;
      employeeToUpdate.email = email;
      employeeToUpdate.phoneNumber = phone_number;
      employeeToUpdate.hireDate = hire_date;
      employeeToUpdate.job = job_id;
      employeeToUpdate.salary = salary;
      employeeToUpdate.manager = manager_id;
      employeeToUpdate.department = department_id;
  
      // Guardar los cambios en la base de datos
      await employeeRepository.save(employeeToUpdate);
  
      return res.status(200).json({ message: 'Employee updated successfully', employee: employeeToUpdate });
    } catch (error) {
      console.error('Error updating employee:', error);
      return res.status(500).json({ message: 'Failed to update employee', error: error.message });
    }
  };


