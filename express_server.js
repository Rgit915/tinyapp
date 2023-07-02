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

//function that filters the URLs in the urlDatabase based on logged userID
const urlsForUser = (id) => {
  const filteredUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredUrls[url] = urlDatabase[url];
    }
  }
  return filteredUrls;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  if (req.user) {
    res.redirect('/urls');
  } else {
    res.render("login");
  }
});

app.get("/register", (req, res) => {
  if (req.user) {
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
  const user = users[req.cookies.user_id];// Retrieve the user object using user_id cookie value

  if (!user) {
    res.send('<h1>Please log in or register to view URLs</h1><a class="nav-item nav-link" href="/login">Login</a>');
  } else {
    const filteredUrls = urlsForUser(user.id);
    const templateVars = {
      urls: filteredUrls,
      user: user
    };
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
  const user = users[req.cookies.user_id];
  if (!user) {
    res.status(403).send('You need to be logged in to shorten URLs.<a class="nav-item nav-link" href="/login">Login</a>');
  } else {
    const { longURL } = req.body;
    const shortURL = generateRandomString();

    //Associate the userID with the created URL in urlDatabase
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: user.id
    };

    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const url = urlDatabase[req.params.id];

  if (!url) {
    res.status(404).send('<h1>URL not found</h1>');
  } else if (!user) {
    res.status(401).send('<h1>Please log in or register to view this URL</h1><a href="/login">Login</a><br/><br/><a href="/register">Register</a><br/>');
  } else if (!url || url.userID !== user.id) {
    res.status(403).send('<h1>You do not have permission to access this URL</h1>');
  } else {
    const templateVars = {
      id: req.params.id,
      longURL: url.longURL,
      user: user
    };
    res.render("urls_show", templateVars);
  }
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
  const user = users[req.cookies.user_id];
  const url = urlDatabase[req.params.id];

  if (!url) {
    res.status(404).send('<h1>URL not found</h1>');
  } else if (!user) {
    res.status(401).send('<h1>Please log in or register to delete URLs</h1>');
  } else if (url.userID !== user.id) {
    res.status(403).send('<h1>You do not have permission to delete this URL</h1>');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
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