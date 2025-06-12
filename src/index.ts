
import app from "./app";
import http from 'http';
import { AppDataSourcePostgress, AppDataSourceMongo } from "./data-source";
import { initSocketServer } from "./utils/socketServer";
import { Config } from "./utils/keys";

async function main() {
  try {
    await AppDataSourceMongo.initialize();
    console.log("DATABASE MONGO CONECTADA")

    await AppDataSourcePostgress.initialize();
    console.log("DATABASE POSTGRES CONECTADA")

    const server = http.createServer(app);
    const io = initSocketServer(server);

    const PORT = Config.PORT;

    server.listen(PORT, () => {
      console.log("SERVER CORRIENDO EN PUERTO :", PORT);

      io.on("connection", (socket) => {
        console.log("💬 Nuevo cliente conectado:", socket.id);
      
        // socket.on("mensaje", (data) => {
        //   console.log("Mensaje recibido:", data);
        //   // retransmitir a todos:
        //   io.emit("mensaje", data);
        // });

        socket.on("subscribe", (room) => {
          socket.join(room);
          console.log(`${socket.id} se unió a la sala ${room}`);
        });
      
        socket.on("unsubscribe", (room) => {
          socket.leave(room);
          console.log(`${socket.id} salió de la sala ${room}`);
        });
              
        socket.on("disconnect", () => {
          console.log("🚪 Cliente desconectado:", socket.id);
        });

      });
    });
  } catch (error) {
    console.log(error);
  }
}

main();
