import config from "config";

const PORT = process.env.PORT || config.get("port");

const STATIC_FOLDER = process.env.STATIC_FOLDER || config.get("staticFolder");
const IMAGE_FOLDER = process.env.IMAGE_FOLDER || config.get("imageFolder");

const MYSQL_USER = process.env.MYSQL_USER || config.get("mysql.user");
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || config.get("mysql.password");
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || config.get("mysql.database");
const MYSQL_HOST = process.env.MYSQL_HOST || config.get("mysql.host");

export {
  PORT,
  STATIC_FOLDER,
  IMAGE_FOLDER,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_HOST
};