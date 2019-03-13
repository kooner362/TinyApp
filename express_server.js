const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "26bUxy": {
    id: "26bUxy",
    email: "bob@example.com",
    password: "purple"
  },
 "8ByHde": {
    id: "8ByHde",
    email: "kevin@example.com",
    password: "funk"
  }
}

app.get("/register", (req, res) => {
  let user = req.cookies["user_id"];
  if (user !== undefined) {
    let templateVars = {user: user};
    res.render('urls_register', templateVars);
  } else {
    res.render('urls_register', {user: null});
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  let templateVars = { urls: urlDatabase , user: user};
  res.render("urls_index", templateVars);
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (email === '' || password === '' || findIdFromEmail(email)) {
    res.sendStatus(400);
  } else {
    users[id] = {id: id, email: email, password: password};
    res.cookie("user_id", id);
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  let templateVars = {user: user};
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  res.render('urls_login', {user: null});
});

app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  let templateVars = {shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password =  req.body.password;
  let user_id = findIdFromEmail(email);
  if (user_id && users[user_id].password === password) {
    res.cookie("user_id", user_id);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls/');
});

function generateRandomString() {
  let randInt = Math.floor((Math.random() * 99) + 1);
  let shortURL = '';

  for (let i = 0; i < 6; i++) {
    //adds a random lowercase letter
    if (randInt < 30) {
      let randIntLetter = Math.floor(Math.random() * 26);
      let randLetter = String.fromCharCode(97 + randIntLetter);
      shortURL += randLetter;
      randInt = Math.floor((Math.random() * 99) + 1);
    }
    else if (randInt >= 30 && randInt < 60) {
      //adds a number between 0 and 9
      let randNum = Math.floor(Math.random() * 10);
      shortURL += randNum;
      randInt = Math.floor((Math.random() * 99) + 1);

    } else {
      //adds a random uppercase letter
      let randIntLetter = Math.floor(Math.random() * 26);
      let randLetter = String.fromCharCode(97 + randIntLetter);
      shortURL += randLetter.toUpperCase();
      randInt = Math.floor((Math.random() * 99) + 1);
    }
  }
  return shortURL;
}

function findIdFromEmail(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
