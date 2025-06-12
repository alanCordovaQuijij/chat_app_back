import { ObjectId } from "mongodb";
import { AppDataSourceMongo } from "../../data-source";
import * as boom from "@hapi/boom";
import { io } from "../../utils/socketServer";
import { User } from "../../entity/MongoEntities/Personas";
import { GroupMessage } from "../../entity/MongoEntities/Group_Message";
import { Group } from "../../entity/MongoEntities/Group";

interface bodyCrearMensajeGrupo {
  user_id: string;
  group_id: string;
  message: string;
  url: string | null;
}

export const CrearMensajeGrupo = async (body: bodyCrearMensajeGrupo) => {
  let message = body?.message;
  let type: "TEXT" | "IMAGE" = "TEXT";

  console.log("BODY===>", body);

  if (!body?.group_id || !ObjectId.isValid(body?.group_id)) {
    throw boom.badRequest("Parámetro group_id inválido o ausente");
  }

  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);

  const grupo = await groupRepository.findOne({
    where: {
      _id: new ObjectId(body?.group_id),
      estado: true,
    },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  if (body?.message) {
    if (!body?.message.trim().length) {
      throw boom.badRequest("El campo message no debe estar vacío");
    }
  }

  if (body?.url) {
    message = body.url;
    type = "IMAGE";
  }

  const userFound = await AppDataSourceMongo.manager.findOne(User, {
    where: {
      _id: new ObjectId(body.user_id),
      estado: true,
    },
  });

  if (!userFound) {
    throw boom.notFound("Usuario no encontrado");
  }

  const newMessage = new GroupMessage(
    body.group_id,
    body.user_id,
    message,
    type
  );

  const mensajeGuardado = await AppDataSourceMongo.manager.save(newMessage);

  if (mensajeGuardado) {
    io.sockets
      .in(body.group_id)
      .emit("message", { ...mensajeGuardado, user: userFound });
    io.sockets
      .in(`${body.group_id}_notify`)
      .emit("message_notify", { ...mensajeGuardado, user: userFound });
  }

  return {
    statusCode: 200,
    message: "Mensaje Creado",
    data: { ...mensajeGuardado, user: userFound },
  };
};

export const getAllMessagesGroup = async (group_id: string) => {
  if (!group_id || !ObjectId.isValid(group_id)) {
    throw boom.badRequest("Parámetro group_id inválido o ausente");
  }

  const grupo = await AppDataSourceMongo.manager.findOne(Group, {
    where: { _id: new ObjectId(group_id), estado: true },
  });

  if (!grupo) throw boom.notFound("Chat no encontrado");

  const messages = await AppDataSourceMongo.manager.find(GroupMessage, {
    where: {
      group_id: group_id,
      estado: true,
    },
    order: { createdAt: "DESC" },
  });

  const total = messages.length;
  const idUsuarios = messages.map((item) => new ObjectId(item.user_id));
  const mapaUsuarios = new Map();
  const UserRepository = AppDataSourceMongo.getMongoRepository(User);

  if (!!messages.length && !!idUsuarios.length) {
    const users = await UserRepository.find({
      where: {
        _id: { $in: idUsuarios },
        estado: true,
      },
      select: ["firstname", "avatar", "email", "lastname"],
    });

    users.forEach((item) => {
      mapaUsuarios.set(String(item._id), item);
    });
  }

  const messagesWithUsers = messages.map((item) => ({
    ...item,
    user: mapaUsuarios.get(item.user_id) || null,
  }));

  return {
    statusCode: 200,
    message: "OK",
    data: { messages: messagesWithUsers, total },
  };
};


export const getTotalMessagesGroup = async (group_id: string) => {
  if (!group_id || !ObjectId.isValid(group_id)) {
    throw boom.badRequest("Parámetro group_id inválido o ausente");
  }

  const grupo = await AppDataSourceMongo.manager.findOne(Group, {
    where: { _id: new ObjectId(group_id), estado: true },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  const messages = await AppDataSourceMongo.manager.find(GroupMessage, {
    where: {
      group_id: group_id,
      estado: true,
    },
    order: { createdAt: "DESC" },
  });

  const total = messages.length;

  return { statusCode: 200, message: "OK", data: total };
};


export const getUltimoMessageGroup = async (group_id: string) => {
  if (!group_id || !ObjectId.isValid(group_id)) {
    throw boom.badRequest("Parámetro group_id inválido o ausente");
  }

  const grupo = await AppDataSourceMongo.manager.findOne(Group, {
    where: { _id: new ObjectId(group_id), estado: true },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  const messages = await AppDataSourceMongo.manager.find(GroupMessage, {
    where: {
      group_id: group_id,
      estado: true,
    },
    order: { createdAt: "DESC" },
    take: 1,
  });

  if (!messages.length) {
    throw boom.notFound("No se encontraron mensajes para este grupo");
  }

  const userFound = await AppDataSourceMongo.manager.findOne(User, {
    where: {
      _id: new ObjectId(messages[0].user_id),
    },
    select: ["firstname", "avatar", "email", "lastname"],
  });

  const lastMessage = {
    ...messages[0],
    user: userFound || null,
  };

  //const total = messages.length

  return { statusCode: 200, message: "OK", data: lastMessage || {} };
};