import * as dotenv from 'dotenv';

// Cargar las variables del archivo .env
dotenv.config();

export class Config {
  // Métodos estáticos para acceder a las variables de entorno

  static get PORT(): string {
    return process.env.PORT || '3000';
  }

  static get MONGO_HOST(): string {
    return process.env.MONGO_HOST || 'localhost'; 
  }

  static get MONGO_PORT(): number {
    return Number(process.env.MONGO_PORT) || 0;
  }

  static get MONGO_DATABASE(): string {
    return process.env.MONGO_DATABASE || 'defaultDatabase';
  }

  

  static get POSTGRES_HOST(): string {
    return process.env.POSTGRES_HOST || 'localhost'; 
  }

  static get POSTGRES_PORT(): number {
    return Number(process.env.POSTGRES_PORT) || 0;
  }

  static get POSTGRES_USERNAME(): string {
    return process.env.POSTGRES_USERNAME || ''; 
  }

  static get POSTGRES_PASSWORD(): string {
    return process.env.POSTGRES_PASSWORD || ''; 
  }

  static get POSTGRES_DATABASE(): string {
    return process.env.POSTGRES_DATABASE || '';
  }

  static get SECRET_KEY_TOKEN(): string {
    return process.env.SECRET_KEY_TOKEN || ''; 
  }

}
