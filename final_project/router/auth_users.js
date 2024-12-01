const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  const filtered = users.filter((user) => user.username === username);
  return filtered.length === 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const registeredUser = users.filter((user) => user.username === username)
  if (registeredUser.length > 0) {
    return registeredUser[0].password === password;
  } else  {
    return false
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign({
        data: username
      }, 'access', { expiresIn: 60 * 60});

      req.session.authorization = {
        accessToken, username
      };
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(404).send("User not registered / incorrect password, please check inputs")
    }
  } else {
    return res.status(404).json({message: "Please check inputs, missing username / password"})
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.data;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Requested ISBN could not be found"});
  };

  if (!review || !username) {
    return res.status(404).json({ message: "No username or review to include, please verify inputs"})
  }

  if (book && review && username) {
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review added", "All reviews for this book": book.reviews}) 
  }
  
});


//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Requested ISBN could not be found"});
  };

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review successfully deleted", "All remaining reviews for this book": book.reviews})
  } else {
    return res.status(404).json({ message: "Operation unsuccessful, could not find user review to delete"})
  };
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
