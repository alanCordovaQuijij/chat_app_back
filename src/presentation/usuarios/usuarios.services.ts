import { ObjectId } from "mongodb";
import { AppDataSourceMongo } from "../../data-source";
import { User } from "../../entity/MongoEntities/Personas";
import * as boom from "@hapi/boom";
import { Group } from "../../entity/MongoEntities/Group";
import * as _ from "lodash";

export const getMe = async (idUsuario: string) => {
  const userFound = await AppDataSourceMongo.manager.findOne(User, {
    where: {
      _id: new ObjectId(idUsuario),
      estado: true,
    },
  });

  if (!userFound) {
    throw boom.notFound("Usuario no encontrado");
  }

  const { _id, email, firstname, lastname, avatar } = userFound;

  return { _id, email, firstname: _.capitalize(firstname), lastname: _.capitalize(lastname), avatar };
};

export const getUsers = async (idUsuario: string) => {
  const usersFound = await AppDataSourceMongo.getMongoRepository(User).find({
    where: {
      estado: true,
      _id: { $ne: new ObjectId(idUsuario) },
    },
  });

  if (!usersFound.length) {
    throw boom.notFound("Usuarios no encontrados");
  }

  return usersFound.map((item) => ({ _id: item._id, email: item.email, avatar: item.avatar, firstname: item.firstname, lastname: item.lastname}));
};

export const getUser = async (idUsuario: string) => {
  console.log("Entra aqui")
  if (!idUsuario) throw boom.badRequest("Falta el prametro idUsuario");

  const userFound = await AppDataSourceMongo.manager.findOne(User, {
    where: {
      _id: new ObjectId(idUsuario),
      estado: true,
    },
  });

  if (!userFound) {
    throw boom.notFound("Usuario no encontrado");
  }

  const { _id, email, avatar, firstname, lastname } = userFound;

  return { _id, email, avatar, firstname, lastname };
};

export const UpdateMe = async (body) => {
  console.log("BODY=====>", body);

  const userFound = await AppDataSourceMongo.manager.findOne(User, {
    where: {
      _id: new ObjectId(body.user_id),
      estado: true,
    },
  });

  if (!userFound) {
    throw boom.notFound("Usuario no encontrado");
  }

  if(body?.firstname) userFound.firstname = body.firstname;
  if(body?.lastname) userFound.lastname = body.lastname;
  if(body?.url) userFound.avatar = body.url;
  const userUpdataed = await AppDataSourceMongo.manager.save(userFound);

  return {
    statusCode: 200,
    message: "Usuario actualizado",
    data: {
      firstname: _.capitalize(userUpdataed.firstname),
      lastname: _.capitalize(userUpdataed.lastname),
      avatar: userUpdataed.avatar,
    },
  };
};

export const obtenerUsuariosDisponiblesGrupo = async (grupo_id: string) => {
  if (!grupo_id || !ObjectId.isValid(grupo_id)) {
    throw boom.badRequest("Parámetro grupo_id inválido o ausente");
  }

  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);
  const UserRepository = AppDataSourceMongo.getMongoRepository(User);

  let usuariosFiltrados = [];

  const grupo = await groupRepository.findOne({
    where: {
      _id: new ObjectId(grupo_id),
      estado: true,
    },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  usuariosFiltrados = grupo.participants
    .filter((item) => item.estado === true)
    .map((item2) => new ObjectId(item2.user_id));

  const users = await UserRepository.find({
    where: {
      _id: { $nin: usuariosFiltrados },
      estado: true,
    },
    select: ["firstname", "avatar", "email", "lastname"],
  });

  return { statusCode: 200, message: "OK", data: users };
};
