const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "26bUxy" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "8ByHde" }
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
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user_urls = urlsForUser(user_id);

  if (isLoggedIn(user_id)) {
    let user = users[user_id];
    let thisUserDataBase = {};
    if (user_urls.length > 0) {
      for (let url of user_urls) {
        thisUserDataBase[url] = urlDatabase[url];
      }
    }
    let templateVars = { urls: thisUserDataBase, user: user};
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { message: "Please Login or Register!" , user: null};
    res.render('urls_login', templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  if (isLoggedIn(user_id)) {
    let user = users[user_id];
    let templateVars = {user: user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/login", (req, res) => {
  res.render('urls_login', {message: null, user: null});
});

app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user_urls = urlsForUser(user_id);
  let shortURL = req.params.shortURL;

  if (isLoggedIn(user_id) && user_urls.indexOf(shortURL) !== -1) {
    let user = users[user_id];
    let templateVars = {message: null, shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user: user};
    res.render("urls_show", templateVars);
  }
  else if (isLoggedIn(user_id)) {
    let user = users[user_id];
    let templateVars = {message:"This shortURL doesn't belong to you!", shortURL: shortURL,longURL: urlDatabase[shortURL].longURL, user: user};
    res.render("urls_show", templateVars);
  } else {
    res.render('urls_login', {message: "Please Login or Register!", user: null});
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.shortURL;
  let user_id = req.cookies["user_id"];
  let urls = urlsForUser(user_id);
  if (urls.indexOf(shortURL) !== -1) {
    urlDatabase[shortURL] = {'longURL': longURL, userID: user_id};
    res.redirect('/urls/' + shortURL);
  } else {
    res.redirect('/urls/' + shortURL);
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password =  req.body.password;
  let user_id = findIdFromEmail(email);
  let pass_verified = bcrypt.compareSync(password, users[user_id].password);
  if (user_id && pass_verified) {
    res.cookie("user_id", user_id);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login/');
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (email === '' || password === '' || findIdFromEmail(email)) {
    res.sendStatus(400);
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {id: id, email: email, password: hashedPassword};
    res.cookie("user_id", id);
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let user_id = req.cookies["user_id"];
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {'longURL': longURL, 'userID': user_id};
  res.redirect('/urls/' + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  let user_id = req.cookies["user_id"];
  let urls = urlsForUser(user_id);
  if (urls.indexOf(shortURL) !== -1) {
    delete urlDatabase[shortURL];
    res.redirect('/urls/');
  } else {
    res.redirect('/urls/');
  }
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

function isLoggedIn (user_id) {
  if (users[user_id] === undefined) {
    return false;
  }
  return true;
}

function urlsForUser(id) {
  let user_urls = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      user_urls.push(key);
    }
  }
  return user_urls;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
