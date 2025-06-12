import { ObjectId } from "mongodb";
import { AppDataSourceMongo } from "../../data-source";
import { ChatMessage } from "../../entity/MongoEntities/Chat_Message";
import { User } from "../../entity/MongoEntities/Personas";
import * as boom from "@hapi/boom";
import { io } from "../../utils/socketServer";
import { Chat } from "../../entity/MongoEntities/Chat";
import moment from "moment";

interface bodyCrearMensajeChat {
  user_id: string;
  chat_id: string;
  message: string;
  url: string | null;
}

export const CrearMensaje = async (body: bodyCrearMensajeChat) => {
  let message = body?.message;
  let type: "TEXT" | "IMAGE" = "TEXT";

  console.log("BODY===>", body);

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

  const newMessage = new ChatMessage(body.chat_id, body.user_id, message, type);

  const mensajeGuardado = await AppDataSourceMongo.manager.save(newMessage);

  if (mensajeGuardado) {
    io.sockets
      .in(body.chat_id)
      .emit("message", { ...mensajeGuardado, user: userFound, createdAtFormated: mensajeGuardado.createdAt && moment(mensajeGuardado.createdAt).format('HH:mm'), 
 });
    io.sockets
      .in(`${body.chat_id}_notify`)
      .emit("message_notify", { ...mensajeGuardado, user: userFound, createdAtFormated: mensajeGuardado.createdAt && moment(mensajeGuardado.createdAt).format('HH:mm') });
  }

  return {
    statusCode: 200,
    message: "Mensaje Creado",
    data: { ...mensajeGuardado, user: userFound },
  };
};

export const getAllMessages = async (chat_id: string) => {
  if (!chat_id || !ObjectId.isValid(chat_id)) {
    throw boom.badRequest("Parámetro chat_id inválido o ausente");
  }

  const chat = await AppDataSourceMongo.manager.findOne(Chat, {
    where: { _id: new ObjectId(chat_id), estado: true },
  });

  if (!chat) throw boom.notFound("Chat no encontrado");

  const messages = await AppDataSourceMongo.manager.find(ChatMessage, {
    where: {
      chat_id: chat_id,
      estado: true,
    },
    order: { createdAt: "DESC" },
  });

  //if(!messages.length) throw boom.notFound("No se encontraron mensajes para este chat");

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

export const getTotalMessages = async (chat_id: string) => {
  if (!chat_id || !ObjectId.isValid(chat_id)) {
    throw boom.badRequest("Parámetro chat_id inválido o ausente");
  }

  const chat = await AppDataSourceMongo.manager.findOne(Chat, {
    where: { _id: new ObjectId(chat_id), estado: true },
  });

  if (!chat) throw boom.notFound("Chat no encontrado");

  const messages = await AppDataSourceMongo.manager.find(ChatMessage, {
    where: {
      chat_id: chat_id,
      estado: true,
    },
    order: { createdAt: "DESC" },
  });

  const total = messages.length;

  return { statusCode: 200, message: "OK", data: total };
};

export const getUltimoMessage = async (chat_id: string) => {
  if (!chat_id || !ObjectId.isValid(chat_id)) {
    throw boom.badRequest("Parámetro chat_id inválido o ausente");
  }

  const chat = await AppDataSourceMongo.manager.findOne(Chat, {
    where: { _id: new ObjectId(chat_id), estado: true },
  });

  if (!chat) throw boom.notFound("Chat no encontrado");

  const messages = await AppDataSourceMongo.manager.find(ChatMessage, {
    where: {
      chat_id: chat_id,
      estado: true,
    },
    order: { createdAt: "DESC" },
    take: 1,
  });

  if (!messages.length) {
    throw boom.notFound("No se encontraron mensajes para este chat");
  }

  const userFound = await AppDataSourceMongo.manager.findOne(User, {
    where: {
      _id: new ObjectId(messages[0].user_id),
    },
    select: ["firstname", "avatar", "email", "lastname"],
  });

  const lastMessage = {
    ...messages[0],
    createdAt: messages[0]?.createdAt,
    createdAtFormated: messages[0]?.createdAt && moment(messages[0]?.createdAt).format('HH:mm'), 
    user: userFound || null, 
  };

  //const total = messages.length

  return { statusCode: 200, message: "OK", data: lastMessage || null };
};
