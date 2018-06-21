import Router from "koa-router";
import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import {STATIC_FOLDER, IMAGE_FOLDER} from "../config";
import book from "../models/book";

const router = new Router({ prefix: "/book" });

router
  .get("/", async (ctx) => {
    /*  Возвращаем список книг
      //  Используется пагинация параметры (page-size и page)
      //  Есть возможность фильтрации (search-text и search-date)
      //  А так же сортировки результатов (sort-autor, sort-title, sort-date, sort-description)
      //  Порядок сортировки следующий autor, title, date, description 
    */
    let params = {
      db: ctx.myPool(),
      page: Number(ctx.query.page),
      pageSize: Number(ctx.query["page-size"]),
      search: {
        string: ctx.query["search-text"],
        date: ctx.query["search-date"]
      },
      sort: {
        autor: ctx.query["sort-autor"],
        title: ctx.query["sort-title"],
        date: ctx.query["sort-date"],
        description: ctx.query["sort-description"]
      }
    };

    let result = await book.getList(params);

    ctx.body = result;
  })
  .get("/:id", async (ctx) => {
    // Возращаем книгу по id
    let result = await book.getBook(ctx.myPool(), ctx.params.id);

    if (result) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 204;
    }
  })
  .post("/", async (ctx) => {
    // Добавляем книгу в БД
    ctx.status = 201;

    let params = ctx.request.body;

    params.db = ctx.myPool();
    let result = await book.writeBook(params);

    // Создаем папку для картинки книги
    let dir = path.join(IMAGE_FOLDER, String(result.insertId));
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    // Записываем файл
    const image = ctx.request.files.image;
    const reader = fs.createReadStream(image.path);
    const stream = fs.createWriteStream(path.join(dir, "image"));
    reader.pipe(stream);
    // Обновляем записанную книгу
    await book.editBook({
      db: ctx.myPool(),
      id: result.insertId,
      image: path.relative(STATIC_FOLDER, path.join(dir, "image"))
    });
  })
  .put("/:id", async (ctx) => {
    // Перезаписываем книгу по id
    ctx.status = 204;

    let id = ctx.params.id;
    let params = ctx.request.body;
    const image = ctx.request.files.image;

    if(image && image.size) {
      // Записываем файл
      const dir = path.join(IMAGE_FOLDER, String(id));
      const reader = fs.createReadStream(image.path);
      const stream = fs.createWriteStream(path.join(dir, "image"));
      reader.pipe(stream);
      params.image = path.relative(STATIC_FOLDER, path.join(dir, "image"));
    }

    params.db = ctx.myPool();
    params.id = id;

    await book.editBook(params);
  })
  .delete("/:id", async (ctx) => {
    // Удаляем книгу по id
    ctx.status = 202;
    let id = ctx.params.id,
      dir = path.join(IMAGE_FOLDER, String(id));
    if (fs.existsSync(dir)){
      rimraf(dir, function(e) {
        if(e) console.error(e);
      });
    }

    await book.deleteBook(ctx.myPool(), id);
  });

export function routes () { return router.routes(); }