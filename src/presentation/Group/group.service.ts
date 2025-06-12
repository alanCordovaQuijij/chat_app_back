import { ObjectId } from "mongodb";
import { AppDataSourceMongo, AppDataSourcePostgress } from "../../data-source";
import { Group } from "../../entity/MongoEntities/Group";
import { ParticipantGroup } from "../../entity/MongoEntities/ParticipantesGrupo";
import { User } from "../../entity/MongoEntities/Personas";
import * as boom from "@hapi/boom";
import { GroupMessage } from "../../entity/MongoEntities/Group_Message";

interface bodyCrearGrupo {
  name: string;
  participants: string;
  user_id: string;
  url: string;
}

export const crearGrupo = async (body: bodyCrearGrupo) => {
  //console.log("BODY===>", body);

  let participants: any[] = JSON.parse(body?.participants) || [];
  participants.push(body.user_id);

  let participantsGroup: ParticipantGroup[] = [];

  if (participants.length) {
    participants.forEach((item) => {
      const newParticipant = new ParticipantGroup(item);

      participantsGroup.push(newParticipant);
    });
  }

  const newGroup = new Group(
    body.name,
    body.url,
    body.user_id,
    participantsGroup
  );

  const grupoGuardado = await AppDataSourceMongo.manager.save(newGroup);

  return { statusCode: 200, message: "Grupo Creado", data: grupoGuardado };
};

export const obtenerGrupos = async (user_id: string) => {
  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);
  const GroupMessageRepository = AppDataSourceMongo.getMongoRepository(GroupMessage);
  const mapaUltimosMessage = new Map();

  const setIdUsuarios = new Set();
  let arraysIdsUsuarios = [];
  let arraysIdsGrupos = [];

  const mapaUsuarios = new Map();
  const UserRepository = AppDataSourceMongo.getMongoRepository(User);

  const grupos = await groupRepository.find({
    where: {
      participants: {
        $elemMatch: {
          user_id: user_id,
          estado: true,
        },
      },
      estado: true,
    },
  });

  if (grupos.length) {
    grupos.forEach((item) => {
      setIdUsuarios.add(new ObjectId(item.creator));
      item.participants.forEach((item2) => {
        setIdUsuarios.add(new ObjectId(item2.user_id));
      });

      arraysIdsGrupos.push(String(item._id));
    });

    arraysIdsUsuarios = Array.from(setIdUsuarios);
  }

  //return grupos;

  if (!!arraysIdsUsuarios.length) {
    const users = await UserRepository.find({
      where: {
        _id: { $in: arraysIdsUsuarios },
        estado: true,
      },
      select: ["firstname", "avatar", "email", "lastname"],
    });

    users.forEach((item) => {
      mapaUsuarios.set(String(item._id), item);
    });
  }

  if (arraysIdsGrupos.length) {
    const ultimosMensajes = await GroupMessageRepository.aggregate([
      { $match: { group_id: { $in: arraysIdsGrupos } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$group_id",
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
      ultimosMensajes.forEach(msgGroup => { mapaUltimosMessage.set(msgGroup.group_id, msgGroup.createdAt) });
    }

  }


  const groupsWithUsers = grupos.map((item) => {
    return {
      ...item,
      creator: mapaUsuarios.get(item?.creator) || null,
      participants: item.participants.map((part) => ({
        ...part,
        user: mapaUsuarios.get(part?.user_id) || null,
      })),
      last_message_date: mapaUltimosMessage.get(String(item._id)) || null
    };
  });

  return { statusCode: 200, message: "OK", data: groupsWithUsers };
};

export const obtenerGrupoById = async (grupo_id: string) => {
  if (!grupo_id || !ObjectId.isValid(grupo_id)) {
    throw boom.badRequest("Parámetro grupo_id inválido o ausente");
  }

  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);
  const setIdUsuarios = new Set();
  let arraysIdsUsuarios = [];

  const mapaUsuarios = new Map();
  const UserRepository = AppDataSourceMongo.getMongoRepository(User);

  const grupo = await groupRepository.findOne({
    where: {
      _id: new ObjectId(grupo_id),
      estado: true,
      participants: {
        $elemMatch: {
          estado: true,
        },
      },
    },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  if (grupo) {
    setIdUsuarios.add(new ObjectId(grupo.creator));
    grupo.participants.forEach((item2) => {
      setIdUsuarios.add(new ObjectId(item2.user_id));
    });

    arraysIdsUsuarios = Array.from(setIdUsuarios);
  }

  //return grupos;

  if (!!arraysIdsUsuarios.length) {
    const users = await UserRepository.find({
      where: {
        _id: { $in: arraysIdsUsuarios },
        estado: true,
      },
      select: ["firstname", "avatar", "email", "lastname"],
    });

    users.forEach((item) => {
      mapaUsuarios.set(String(item._id), item);
    });
  }

  const groupWithUser = {
    ...grupo,
    participants: grupo.participants
      .map((part) => ({
        ...part,
        user: mapaUsuarios.get(part?.user_id) || null,
      }))
      .filter((item) => item.estado === true),
  };

  return { statusCode: 200, message: "OK", data: groupWithUser };
};

export const actualizarGrupo = async (body) => {
  //console.log("BODY====>", body);

  if (!body?.grupo_id || !ObjectId.isValid(body?.grupo_id)) {
    throw boom.badRequest("Parámetro grupo_id inválido o ausente");
  }

  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);

  const grupo = await groupRepository.findOne({
    where: {
      _id: new ObjectId(body.grupo_id),
      estado: true,
    },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  if (body?.name && body?.name.length) grupo.name = body.name;
  if (body.url) grupo.image = body.url;

  const grupoActualizado = await AppDataSourceMongo.manager.save(grupo);

  return {
    statusCode: 200,
    message: "Grupo Actualizado",
    data: grupoActualizado,
  };
};

export const salirGrupoById = async (grupo_id: string, user_id: string) => {
  if (!grupo_id || !ObjectId.isValid(grupo_id)) {
    throw boom.badRequest("Parámetro grupo_id inválido o ausente");
  }

  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);

  const grupo = await groupRepository.findOne({
    where: {
      _id: new ObjectId(grupo_id),
      estado: true,
    },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  const participante = grupo.participants.find(
    (item) => item.user_id === user_id
  );
  participante.estado = false;

  const actualizado = await AppDataSourceMongo.manager.save(grupo);

  return { statusCode: 200, message: "Salida exitosa", data: actualizado };
};

export const addParticipants = async (
  grupo_id: string,
  users_id: string[] = []
) => {
  let usuariosFiltrados = [];

  if (!grupo_id || !ObjectId.isValid(grupo_id)) {
    throw boom.badRequest("Parámetro grupo_id inválido o ausente");
  }

  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);

  const grupo = await groupRepository.findOne({
    where: {
      _id: new ObjectId(grupo_id),
      estado: true,
    },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  const participantesActivos = new Set(
    grupo.participants.filter((p) => p.estado === true).map((p) => p.user_id)
  );

  usuariosFiltrados = users_id.filter((id) => !participantesActivos.has(id));

  for (const item of usuariosFiltrados) {
    const newParticipant = new ParticipantGroup(item);
    grupo.participants.push(newParticipant);
  }

  const grupoActualizado = await AppDataSourceMongo.manager.save(grupo);

  return {
    statusCode: 200,
    message: "Participante añadido",
    data: grupoActualizado,
  };
};

export const deleteParticipants = async (
  grupo_id: string,
  id_usuario: string
) => {
  let usuariosFiltrados = [];

  if (!grupo_id || !ObjectId.isValid(grupo_id)) {
    throw boom.badRequest("Parámetro grupo_id inválido o ausente");
  }

  const groupRepository = AppDataSourceMongo.getMongoRepository(Group);

  const grupo = await groupRepository.findOne({
    where: {
      _id: new ObjectId(grupo_id),
      estado: true,
    },
  });

  if (!grupo) throw boom.notFound("Grupo no encontrado");

  const userToBan = grupo.participants.find(
    (item) => item.user_id === id_usuario && item.estado === true
  );

  if (!userToBan) throw boom.notFound("Participante no encontrado");

  userToBan.estado = false;

  const grupoActualizado = await AppDataSourceMongo.manager.save(grupo);

  return {
    statusCode: 200,
    message: "Participante eliminado",
    data: grupoActualizado,
  };
};



