import Router from "koa-router";
import SqlString from "sqlstring";
import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import dateFormat from "dateformat";
import {STATIC_FOLDER, IMAGE_FOLDER} from "../config";

const router = new Router({ prefix: "/book" });

router
  .get("/", async (ctx) => {
    let page = Number(ctx.query.page),
      pageSize = Number(ctx.query["page-size"]),
      searchString = ctx.query["search-text"],
      searchDate = ctx.query["search-date"],
      sortAutor = ctx.query["sort-autor"],
      sortTitle = ctx.query["sort-title"],
      sortDate = ctx.query["sort-date"],
      sortDescription = ctx.query["sort-description"],
      sqlString = "SELECT * from books",
      sqlTotalCount = "SELECT COUNT(1) FROM books",
      sqlParam = [],
      sqlSearch = "",
      sqlSort = "";

    function getSortSqlString(sqlSort, sortColumn, sortDirect) {
      if(!sqlSort) sqlSort = ` ORDER BY ${sortColumn} ${sortDirect == "down" ? "ASC" : "DESC"}`;
      else sqlSort += `, ${sortColumn} ${sortDirect == "up" ? "ASC" : "DESC"}`;

      return sqlSort;
    }


    if(searchString) {
      sqlSearch = ` WHERE (title like '%'"${searchString}"'%' OR autor like '%'"${searchString}"'%' OR description like '%'"${searchString}"'%')`;
    }

    if(searchDate) {
      searchDate = dateFormat((new Date(searchDate)), "isoDate");
      if (!sqlSearch) sqlSearch = ` WHERE date='${searchDate}'`;
      else sqlSearch += ` AND date='${searchDate}'`;
    }

    if(sortAutor) {
      sqlSort = getSortSqlString(sqlSort, "autor", sortAutor);
    }

    if(sortTitle) {
      sqlSort = getSortSqlString(sqlSort, "title", sortTitle);
    }

    if(sortDate) {
      sqlSort = getSortSqlString(sqlSort, "date", sortDate);
    }

    if(sortDescription) {
      sqlSort = getSortSqlString(sqlSort, "description", sortDescription);
    }

    sqlString += sqlSearch;
    sqlString += sqlSort;
    sqlTotalCount += sqlSearch;
    sqlString += " LIMIT ? OFFSET ?";
    sqlParam.push(pageSize, (page - 1) * pageSize);

    ctx.type = "json";
    let totalCount = await ctx.myPool().query(sqlTotalCount),
      books = await ctx.myPool().query(sqlString, sqlParam);

    ctx.type = "json";
    ctx.body = {
      "books": books,
      "totalCount": totalCount
    };
  })
  .get("/:id", async (ctx) => {
    let result = await ctx.myPool().query(
      "SELECT * FROM books WHERE id=?",
      [Number(ctx.params.id)]
    );
    if (result) {
      ctx.body = result;
    } else {
      ctx.status = 204;
    }
  })
  .post("/", async (ctx) => {
    ctx.status = 201;

    const image = ctx.request.files.image;
    let params = ctx.request.body,
      book = {
        title: String(params.title),
        date: String(params.date),
        autor: String(params.autor),
        description: String(params.description),
      };
    // Записываем книгу и получаем ее id
    if (params.id > 0) book.id = Number(params.id);
    let result = await ctx.myPool().query(
      SqlString.format(
        "INSERT INTO books SET ? ON DUPLICATE KEY UPDATE ?",
        [book, book]
      )
    );
    // Создаем папку для картинки книги
    let dir = path.join(IMAGE_FOLDER, String(result.insertId));
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    // Записываем файл
    const reader = fs.createReadStream(image.path);
    const stream = fs.createWriteStream(path.join(dir, "image"));
    reader.pipe(stream);
    // Обновляем записанную книгу
    await ctx.myPool().query(
      SqlString.format(
        "UPDATE books SET ? WHERE id=?",
        [
          {
            "image": path.relative(
              STATIC_FOLDER,
              path.join(dir, "image")
            )
          },
          result.insertId
        ]
      )
    );
  })
  .put("/:id", async (ctx) => {
    ctx.status = 204;
    let id = ctx.params.id,
      book = ctx.request.body;

    if (typeof book === "object") {
      let uBook = {};
      const image = ctx.request.files.image;
      if (book.hasOwnProperty("title")) uBook.title = String(book.title);
      if (book.hasOwnProperty("date")) uBook.date = (new Date(String(book.date)));
      if (book.hasOwnProperty("autor")) uBook.autor = String(book.autor);
      if (book.hasOwnProperty("description")) uBook.description = String(book.description);

      if(image && image.size) {
        // Создаем папку для картинки книги
        let dir = path.join(IMAGE_FOLDER, String(id));
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        // Записываем файл
        const reader = fs.createReadStream(image.path);
        const stream = fs.createWriteStream(path.join(dir, "image"));
        reader.pipe(stream);
        uBook.image = path.relative(STATIC_FOLDER, path.join(dir, "image"));
      }

      await ctx.myPool().query(
        SqlString.format(
          "UPDATE books SET ? WHERE id=?",
          [uBook, Number(id)]
        )
      );
    }
  })
  .delete("/:id", async (ctx) => {
    ctx.status = 202;
    let id = ctx.params.id,
      dir = path.join(IMAGE_FOLDER, String(id));
    if (fs.existsSync(dir)){
      rimraf(dir, function(e) {
        if(e) console.error(e);
      });
    }

    await ctx.myPool().query("DELETE FROM books WHERE id=?",[Number(ctx.params.id)]);
  });

export function routes () { return router.routes(); }