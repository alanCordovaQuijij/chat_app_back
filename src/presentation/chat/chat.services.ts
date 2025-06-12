import { ObjectId } from "mongodb";
import { AppDataSourceMongo } from "../../data-source";
import { Chat } from "../../entity/MongoEntities/Chat";
import * as boom from "@hapi/boom";
import { ChatMessage } from "../../entity/MongoEntities/Chat_Message";
import moment from "moment";

interface bodyCrearChat {
  participant_id_one: string,
  participant_id_two: string
}


export const crearChat = async (body: bodyCrearChat) => {

  if (!body?.participant_id_one || !body?.participant_id_one.length) {
    throw boom.badRequest("Falta el parámetro participant_id_one");
  }

  if (!body?.participant_id_two || !body?.participant_id_two.length) {
    throw boom.badRequest("Falta el parámetro participant_id_two");
  }

  const foundOne = await AppDataSourceMongo.manager.findOne(Chat, {
    where: { participant_one: body.participant_id_one, participant_two: body.participant_id_two, estado: true }
  });

  const foundTwo = await AppDataSourceMongo.manager.findOne(Chat, {
    where: { participant_one: body.participant_id_two, participant_two: body.participant_id_one, estado: true }
  });

  //if (foundTwo || foundOne) return { statusCode: 200, message: "Ya existe chat" };
  if (foundTwo || foundOne) {
    throw boom.conflict("Ya existe chat")
  }

  const newChat = new Chat(
    body.participant_id_one,
    body.participant_id_two
  );

  const chatSaved = await AppDataSourceMongo.manager.save(newChat);

  return { statusCode: 200, message: "Chat Creado!", data: chatSaved }

};




export const obtenerChats = async (idUsuario: string) => {

  const chatRepository = AppDataSourceMongo.getMongoRepository(Chat);
  const ChatMessageRepository = AppDataSourceMongo.getMongoRepository(ChatMessage);
  const mapaUltimosMessage = new Map();
  let chatIds = [];

  const chatsWithUsers = await chatRepository.aggregate([
    {
      $match: {
        estado: true,
        $or: [
          { participant_one: idUsuario },
          { participant_two: idUsuario }
        ]
      }
    },
    {
      $addFields: {
        participant_one_objId: { $toObjectId: "$participant_one" },
        participant_two_objId: { $toObjectId: "$participant_two" }
      }
    },
    {
      $lookup: {
        from: "personas",
        localField: "participant_one_objId",
        foreignField: "_id",
        as: "participant_one"
      }
    },
    {
      $unwind: {
        path: "$participant_one",
        preserveNullAndEmptyArrays: true // por si el usuario no se encuentra
      }
    },
    {
      $lookup: {
        from: "personas",
        localField: "participant_two_objId",
        foreignField: "_id",
        as: "participant_two"
      }
    },
    {
      $unwind: {
        path: "$participant_two",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        estado: 0,
        participant_one_objId: 0,
        participant_two_objId: 0
      }
    }
  ]).toArray();

  if (chatsWithUsers.length) { chatsWithUsers.forEach(chat => { chatIds.push(String(chat._id)) }) }

  //return chatIds

  if (chatIds.length) {
    const ultimosMensajes = await ChatMessageRepository.aggregate([
      { $match: { chat_id: { $in: chatIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$chat_id",
          latestMessage: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: {
          newRoot: "$latestMessage"
        }
      }
    ]).toArray();

    if (ultimosMensajes.length) {
      ultimosMensajes.forEach(chat => { 
        //mapaUltimosMessage.set(chat.chat_id, moment(chat.createdAt).format("HH:mm")) 
         mapaUltimosMessage.set(chat.chat_id,chat.createdAt) 

      });

    }

  }

  //const chatsWithLastMessageDate = chatsWithUsers.map(item => ({ ...item, last_message_date: mapaUltimosMessage.get(String(item._id)) || null }))

  const chatsWithLastMessageDate = chatsWithUsers.map((item) => {
    const lastDate = mapaUltimosMessage.get(String(item._id)) || null;
    return {
      ...item,
      last_message_date: lastDate,
      last_message_date_formated: lastDate && moment(lastDate).format("HH:mm"),
    };
  })
    .sort((a, b) =>
    b.last_message_date && a.last_message_date
      ? moment(b.last_message_date).diff(moment(a.last_message_date))
      : b.last_message_date ? -1 : a.last_message_date ? 1 : 0
  );;


  //return ultimosMensajes

  return { statusCode: 200, message: "OK", data: chatsWithLastMessageDate }

};

export const eliminarChat = async (idChat: string) => {

  const chat = await AppDataSourceMongo.manager.findOne(Chat, {
    where: { _id: new ObjectId(idChat), estado: true }
  });

  if (!chat) throw boom.notFound("Chat no encontrado");

  chat.estado = false;
  await AppDataSourceMongo.manager.save(chat);

  return { statusCode: 200, message: "Chat eliminado" }

};

export const obtenerChatById = async (idChat: string) => {

  const chatRepository = AppDataSourceMongo.getMongoRepository(Chat)

  const chatFound = await chatRepository.aggregate([
    {
      $match: {
        estado: true,
        _id: new ObjectId(idChat)
      }
    },
    {
      $addFields: {
        participant_one_objId: { $toObjectId: "$participant_one" },
        participant_two_objId: { $toObjectId: "$participant_two" }
      }
    },
    {
      $lookup: {
        from: "personas",
        localField: "participant_one_objId",
        foreignField: "_id",
        as: "participant_one"
      }
    },
    {
      $unwind: {
        path: "$participant_one",
        preserveNullAndEmptyArrays: true // por si el usuario no se encuentra
      }
    },
    {
      $lookup: {
        from: "personas",
        localField: "participant_two_objId",
        foreignField: "_id",
        as: "participant_two"
      }
    },
    {
      $unwind: {
        path: "$participant_two",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        estado: 0,
        participant_one_objId: 0,
        participant_two_objId: 0
      }
    }
  ]).toArray();

  if (!chatFound || !chatFound.length) {
    throw boom.notFound("Chat no encontrado", { data: null })
  }

  return { statusCode: 200, message: "OK", data: chatFound[0] }

};