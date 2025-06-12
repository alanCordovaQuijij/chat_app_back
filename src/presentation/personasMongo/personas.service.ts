import { Request, Response } from "express";
import { Employees } from "../../entity/entities/Employees";
import { User } from "../../entity/MongoEntities/Personas";
import { AppDataSourceMongo } from "../../data-source";
import bscrypt from "bcryptjs"
import * as boom from "@hapi/boom";
import { crearUsaurioToken, decodificarUsuarioToken, refrezcarUsuarioToken, VerificarExpiracionToken } from "../../utils/utils";
import { ObjectId } from "mongodb";

export const getPersonas = async (req: Request, res: Response) => {

    const personas = AppDataSourceMongo.getMongoRepository(User);

    //const AllPersonas = await personas.findOneBy({name: 'John Doe'});  //LISTAR UNO SOLO

    const AllPersonas = await personas.find(); //LISTAR TODOS


    //{ACTUALIZAR UN SOLO CAMPO//
    const UpdatedPersona = await personas.findOneBy({id: 2}); 

    //UpdatedPersona.age = 55;
    await personas.save(UpdatedPersona);
    //ACTUALIZAR UN SOLO CAMPO}//

  return res.json(UpdatedPersona);

};


export const registrarPersona = async (body) => {

  //console.log("BODY===>", req.body);
  const {email, password, firstname, lastname } = body;

  const userExist = await AppDataSourceMongo.manager.findOne(User, {where: {email: email.trim()}})

  if(userExist){
    throw boom.badRequest("Correo ya registrado");
  }

  const salt = bscrypt.genSaltSync(10);
  const hashPassword = bscrypt.hashSync(password, salt);

  const nuevoUsuario = new User(
    firstname,
    lastname,
    hashPassword,
    null,
    email
  );

  const usuarioGuardado = await AppDataSourceMongo.manager.save(nuevoUsuario);

  return{statusCode: 200 , message: "Usuario Creado", data:usuarioGuardado }

};


export const loginUsuario = async (body) => {
  const {email, password} = body;

  const userFound = await AppDataSourceMongo.manager.findOne(User, {where: {email: email.trim()}})

  if(!userFound){
    throw boom.badRequest("Usuario no registrado");
  }

  const isCorrectPassword = await bscrypt.compare(password.trim(), userFound.password);

  if(!isCorrectPassword) throw boom.badRequest("Usuario o contraseña incorrecta");

  const token = crearUsaurioToken(userFound);
  const refreshToken = refrezcarUsuarioToken(userFound);

  return {
    statusCode: 200,
    message: "LOGIN EXITOSO",
    access: token,
    refresh: refreshToken 
  }
};


export const refreshAccesToken = async(token: string) => {

  if(!token) throw boom.badRequest("Token requerido");

  const hasExpired = VerificarExpiracionToken(token);

  if(hasExpired.haExpirado) throw boom.badRequest("Token expirado");

  const userFound = await AppDataSourceMongo.manager.findOne(User, {where: {_id: new ObjectId(hasExpired.tokenDecodificado.user_id)}})

  if(!userFound){
    throw boom.notFound("Usuario no encontrado");
  }

  const nuevoToken = crearUsaurioToken(userFound)

  return {statusCode: 200, message: "OK" , accessToken: nuevoToken  }
}