var express = require("express");
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = 8080;

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var longURL = req.body.longURL;
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

function generateRandomString() {
  var randInt = Math.floor((Math.random() * 99) + 1);
  var shortURL = '';

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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
