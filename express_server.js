const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; 

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 

app.set("view engine", "ejs"); 

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//function to generate a random short URL ID
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgjiklmnopqrstuvwxyz0123456789';
  randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

//Email lookup helper function
const getUserByEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  if(req.user) {
    res.redirect('/urls');
  } else {
    res.render("login");
  }
});

app.get("/register", (req, res) => {
  if(req.user) {
    res.redirect('/urls');
  } else {
    res.render("register");
  }
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
    user: users[req.cookies.user_id] // Retrieve the user object using user_id cookie value
  };
  if(!templateVars.user) {
    res.send('<h1>Please log in or register to view URLs</h1>');
  } else {
    res.render("urls_index", templateVars);
  }
 
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];

  if (!user) {
    res.redirect('/login');
  } else {
  res.render("urls_new", { user });
  }
});

app.post("/urls", (req, res) => {
  if (!req.user) { 
    res.status(403).send('You need to be logged in to shorten URLs.');
  } else {
  const { longURL } = req.body;
  let randomID = generateRandomString();
  urlDatabase[randomID] = longURL;   //save longURL & randomID(shortURL) to urlDatabase
  res.redirect(`/urls/${randomID}`);  //update the redirection URL
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("<h1> Short URL not found</h1>");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL; 

  //update the stored long URL based on the new value
  urlDatabase[id].longURL = newLongURL;

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res.status(403).send("Invalid Email or Password");
  }

  if (foundUser.password !== password) {
    return res.status(403).send("Invalid Email or Password");
  }

  res.cookie("user_id", foundUser.id); 
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  //check if email or password are empty strings
  if (email === "" || password === "") {
    return res.status(400).send("Email or password cannot be empty");
  }

  //check if email already exists in users object
  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send(`User with email ${email} already exists`);
  }

  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password
  };

  res.cookie('user_id', userId);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});