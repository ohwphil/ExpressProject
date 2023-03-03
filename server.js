// 이것은 localhost:8080이다! 나중에 서버 해야할 때
// TODO test를 다른 이름으로 바꾸기, 로그인/회원가입 구현하기
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key"; /* 실무에서는 제대로 해야함 */

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("css"));
app.use(express.static("fonts"));
app.use(express.static("img"));
app.use(express.static("js"));

// app.use('/fonts/', express.static(path.join(__dirname, 'build/fonts')));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
// 예시 : 펫

const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0000",
  database: "book_q",
});

connection.connect();

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.get("/", function (req, res) {
  res.redirect("/home");
});
app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
// 시험할 동안만 열어놓자!
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login-form.html");
});
app.get("/register-form", function (req, res) {
  res.sendFile(__dirname + "/register-form.html");
});
app.get("/forgot-pswd", function (req, res) {
  res.sendFile(__dirname + "/forgot-pswd-form.html");
});
app.get("/board", function (req, res) {
  let board_num = req.query.board_num;
  let page = req.query.page;
  if (isNaN(board_num)) {
    board_num = 1;
  } else {
    try {
      board_num = parseInt(board_num);
    } catch (error) {
      throw error;
    }
  }
  if (isNaN(page)) {
    page = 1;
  } else {
    try {
      page = parseInt(page);
    } catch (error) {
      throw error;
    }
  }
  console.log(page);
  connection.query(
    `SELECT * FROM board${board_num} WHERE id BETWEEN ${page * 10 - 9} AND ${
      page * 10
    }`,
    (error, rows, fields) => {
      if (error) throw error;
      // 이런 식으로 액세스
      // console.log(rows[0].bookname)
      res.render("board", { data: rows });
    }
  );
});
app.post("/login/verify", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  let success = true;

  connection.connect(function (err) {
    if (err) throw err;
    const sql = `SELECT password FROM users WHERE email = '${email}'`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length === 0) {
        success = false;
      } else {
        var saved_hash = result.length[0];
        bcrypt.compare(password, saved_hash, function (err, res) {
          if (err) throw err;
          success = res;
        });
      }
    });
  });
  // 다음 동작
  if (success) {
    const user = { email };
    const token = jwt.sign(user, secretKey);
    res.json({ token });
  } else {
    alert("Failed to login");
    res.redirect("/login");
  }
});
app.post("/login/register-form/verify", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  let success = true;
  // 이메일이 맞는지 검증하는 코드 여러줄 ....
  connection.connect(function (err) {
    if (err) throw err;
    const sql_select = `SELECT '${password}' FROM users WHERE email = '${email}'`;
    connection.query(sql_select, function (err, result) {
      if (err) throw err;
      if (result.length != 0) {
        success = false; // 이미 계정이 존재함
      }
    });
    if (success) {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) throw err;
        const sql_insert = `INSERT INTO users VALUES(email, hashed) ('${email}', '${hash}')`;
        connection.query(sql_insert, function (err, result) {
          if (err) throw err;
          // 다음 동작
        });
      });
    }
  });
});
app.post("/login/forgot-pswd/verify", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  let success = true;
  // 이메일이 맞는지 검증하는 코드 여러줄 ....
  connection.connect(function (err) {
    if (err) throw err;
    const sql_select = `SELECT '${password}' FROM users WHERE email = '${email}'`;
    connection.query(sql_select, function (err, result) {
      if (err) throw err;
      if (result.length != 0) {
        success = false; // 이미 계정이 존재함
      }
    });
    if (success) {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) throw err;
        const sql_insert = `INSERT INTO users VALUES(email, hashed) ('${email}', '${hash}')`;
        connection.query(sql_insert, function (err, result) {
          if (err) throw err;
          // 다음 동작
        });
      });
    }
  });
  // 다음 동작
});

//   INSERT INTO users (email, password)
// VALUES ('example@email.com', 'example_username', 'password123');
/* CODE GRAVEYARD!!!

bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) throw err;
        console.log(hash);
      bcrypt.compare(password, hash, function (err, res) {
        if (err) throw err;
        console.log(res);
      });
    });
      bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) throw err;
    console.log(hash);

    bcrypt.compare(password, hash, function (err, res) {
      if (err) throw err;
      console.log(res);
    });
  });
  */

app.get("/list", function (req, res) {
  var page = req.query.page;
  if (isNaN(page)) {
    page = 1;
  } else {
    try {
      page = parseInt(page);
    } catch (error) {
      throw error;
    }
  }
  console.log(page);
  connection.query(
    "SELECT * FROM books WHERE id BETWEEN " +
      (page * 10 - 9) +
      " AND " +
      page * 10,
    (error, rows, fields) => {
      if (error) throw error;
      // 이런 식으로 액세스
      // console.log(rows[0].bookname)
      res.render("book_board", { data: rows });
    }
  );
});

// connection.end();
// https://velog.io/@dnjswn123/NodeJS-form%EC%97%90-%EC%9E%85%EB%A0%A5%ED%95%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EC%84%9C%EB%B2%84%EC%97%90-%EB%B3%B4%EB%82%B4%EA%B8%B0POST%EC%9A%94%EC%B2%AD
// 포스트

// app.use(bodyParser.json());
app.listen(8080, function () {
  console.log("listening on 8080");
});
