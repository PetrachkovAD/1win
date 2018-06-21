import dateFormat from "dateformat";
import SqlString from "sqlstring";

const crud = {
  getList: async function({db, page, pageSize, search, sort}) {
    let sqlString = "SELECT * from books",
      sqlTotalCount = "SELECT COUNT(1) FROM books";

    function getSearchSql(search) {
      let searchSql = "";

      if(search.string) {
        searchSql = ` WHERE (title like '%'"${search.string}"'%' OR autor like '%'"${search.string}"'%' OR description like '%'"${search.string}"'%')`;
      }

      if(search.date) {
        search.date = dateFormat((new Date(search.date)), "isoDate");
        if (!searchSql) searchSql = ` WHERE date='${search.date}'`;
        else searchSql += ` AND date='${search.date}'`;
      }

      return searchSql;
    }

    function getSortSql(sort) {
      let sortSql = "";

      for (let column in sort) {
        if(sort[column]) {
          if(!sortSql) sortSql = ` ORDER BY ${column} ${sort[column] == "down" ? "ASC" : "DESC"}`;
          else sortSql += `, ${column} ${sort[column] == "up" ? "ASC" : "DESC"}`;
        }
      }

      return sortSql;
    }

    let searchSql = getSearchSql(search);

    sqlString += searchSql;
    sqlString += getSortSql(sort);
    sqlString += " LIMIT ? OFFSET ?";

    sqlTotalCount += searchSql;

    let tCount = await db.query(sqlTotalCount),
      books = await db.query(sqlString, [pageSize, (page - 1) * pageSize]);

    return {
      books: books,
      tCount: tCount
    };
  },
  getBook: async function(db, id) {
    return await db.query(
      "SELECT * FROM books WHERE id=?",
      [Number(id)]
    );
  },
  writeBook: async function({db, title, date, autor, description, image}) {
    let book = {
      title: title,
      date: date ? new Date(date) : undefined,
      autor: autor,
      description: description,
    };

    // В базе храним путь до изображений
    if (image && typeof image == "string") book.image = image;

    return await db.query(
      SqlString.format(
        "INSERT INTO books SET ? ON DUPLICATE KEY UPDATE ?",
        [book, book]
      )
    );
  },
  editBook: async function({db, id, title, date, autor, description, image}) {
    let book = {};

    if (title) book.title = title;
    if (date) book.date = new Date(date);
    if (autor) book.autor = autor;
    if (description) book.description = description;

    // В базе храним путь до изображений
    if (image && typeof image == "string") book.image = image;

    return await db.query(
      SqlString.format(
        "UPDATE books SET ? WHERE id=?",
        [book, Number(id)]
      )
    );
  },
  deleteBook: async function(db, id) {
    return await db.query("DELETE FROM books WHERE id=?",[Number(id)]);
  }
};

export default crud;