const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port 8080

//set ejs as view engine
app.set("view engine", "ejs");

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//function to generate a random short URL ID
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgjiklmnopqrstuvwxyz0123456789';
  randomString ='';
  for(let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

//Middlware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
          urls: urlDatabase,
          username: req.cookies["username"]
        };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  console.log(req.body); // Log the POST request body to the console
  let randomID = generateRandomString();
  urlDatabase[randomID] = longURL;   //save longURL & randomID(shortURL) to urlDatabase
  res.redirect(`/urls/${randomID}`);  //update the redirection URL
});

app.get("/urls/:id", (req, res) =>{
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.post("/urls/:id/delete",(req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) =>{
  const id = req.params.id;
  const newLongURL = req.body.longURL; //retrieve the new long URL value from req.body.longURL
  
  //update the stored long URL based on the new value
    urlDatabase[id] = newLongURL;
  
  res.redirect("/urls");
});

app.post("/login",(req, res) => {
  const { username } = req.body;
  console.log(req.body); // Log the POST request body to the console
  
  res.cookie("username", username); // Set the cookie named "username" with the submitted value
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});