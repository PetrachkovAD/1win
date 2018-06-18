import Koa from "koa";
import mysql from "koa2-mysql-wrapper";
import koaBody from "koa-body";
import cors from "koa2-cors";
import {STATIC_FOLDER, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_HOST} from "./config";
import {routes} from "./handlers/routes";

const app = new Koa();
// Отлавливаем ошибки
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message
    };
  }
});
// Отдаем статику
app.use(require("koa-static")(STATIC_FOLDER));

app.use(koaBody({ multipart: true }));
// Подлкючаем БД
app.use(
  mysql({
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    host: MYSQL_HOST
  })
);
// Разрешаем кросс запросы
app.use(cors({
  origin: "*"
}));
app.use(routes());

export default app;