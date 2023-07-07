const express = require("express");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
} = require('./helpers');

const app = express();
const PORT = 8080;  //default port

app.use(morgan("dev"));
app.use(cookieSession({
  name: "session",
  keys: ["supersecretKey", "anotherSuperSecretKet","df1718d9-9064-436d-bf71-f52fc9b7ee48"],
  maxAge: 60 * 60 * 1000 //Cookie will expire in 1hr
}));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");


// Example defined users and urlDatabase
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
  myTestID: {
    id: "myTestID",
    email: "myTestEmail@myTinyApp.ca",
    password: "tiny-app",
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

// GET /
app.get('/', (req, res) => {
  const user = users[req.session.userId];

  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//GET /urls
app.get("/urls", (req, res) => {
  const user = users[req.session.userId];// Retrieve the user object using userId cookie value

  if (!user) {
    res.render("home", { user });
  } else {
    const filteredUrls = urlsForUser(user.id, urlDatabase);
    const templateVars = {
      urls: filteredUrls,
      user: user
    };
    res.render("urls_index", templateVars);
  }

});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userId];

  if (!user) {
    res.redirect('/login');
  } else {
    res.render("urls_new", { user });
  }
});

// GET /urls/:id
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.userId];
  const url = urlDatabase[req.params.id];

  if (!url) {
    res.status(404).send('<h1>URL not found</h1>');
  } else if (!user) {
    res.status(401).send('<h1>Please log in or register to view this URL</h1><a href="/login">Login</a><br/><br/><a href="/register">Register</a><br/>');
  } else if (url.userID !== user.id) {
    res.status(403).send('<h1>You do not have permission to access this URL</h1>');
  } else {
    res.render("urls_show", {user, shortURL: req.params.id, longURL: url.longURL });
  }
});

// GET /u/:id
app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("<h1> Short URL not found</h1>");
  }
});

// POST /urls
app.post("/urls", (req, res) => {
  const user = users[req.session.userId];
  if (!user) {
    res.status(403).send('<h1> You need to be logged in to shorten URLs.</h1><a href="/login">Login</a>');
  } else {
    const longURL  = req.body.longURL;
    const shortURL = generateRandomString();

    //Associate the userID with the created URL in urlDatabase
    urlDatabase[shortURL] = {
      longURL,
      userID: user.id
    };

    res.redirect(`/urls/${shortURL}`);
  }
});

// POST /urls/:id
app.post("/urls/:id", (req, res) => {
  const user = users[req.session.userId];
  const url = urlDatabase[req.params.id];

  if (!user) {
    res.status(401).send('<h1>You must be logged in to update a URL.</h1> <a href="/login">Login</a>');
  } else if (!url || url.userID !== user.id) {
    res.status(403).send('<h1>You do not have permission to update this URL</h1>');
  } else {
    url.longURL = req.body.longURL;
    res.redirect('/urls');
  }
});


// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.userId];
  const url = urlDatabase[req.params.id];

  if (!url) {
    res.status(404).send('<h1>URL not found</h1>');
  } else if (!user) {
    res.status(401).send('<h1>Please log in or register to delete URLs</h1><a href="/login">Login</a><br/><br/><a href="/register">Register</a><br/>');
  } else if (url.userID !== user.id) {
    res.status(403).send('<h1>You do not have permission to delete this URL</h1>');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

// GET /login
app.get("/login", (req, res) => {
  const user = users[req.session.userId];
  if (user) {
    res.redirect('/urls');
  } else {
    res.render("login", {user: req.session.user});
  }
});

// GET /register
app.get("/register", (req, res) => {
  const user = users[req.session.userId];
  if (user) {
    res.redirect('/urls');
  } else {
    res.render("register", {user: req.session.user});
  }
});

// POST /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res.status(403).send("<h3>Invalid Email or Password</h3>");
  }
 
  const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(403).send("<h3>Invalid Email or Password</h3>");
  }

  req.session.userId = foundUser.id;
  res.redirect('/urls');
});

// POST /register
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  //check if email or password are empty strings
  if (!email || !password) {
    return res.status(400).send("<h3>Email or password cannot be empty</h3>");
  }

  //check if email already exists in users object
  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send("<h3>Email already exists</h3>");
  }

  //hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);

  // create a new user object with the hashed password
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };

  req.session.userId = userId;
  res.redirect('/urls');
});

// POST /logout
app.post("/logout", (req, res) => {
  req.session = null; // Clear the userId in the session
  res.redirect("/login");
});

//urls in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});