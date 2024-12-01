const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password})
      return res.status(200).send("User registered successfully")
    } else {
      return res.status(400).send("Username already taken, please try a different one")
    }
  } else {
    return res.status(400).send("Incorrect format, please check username and password are provided")
  }

});

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< EXAMPLE WITHOUT ASYNC AWAIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});
*/

async function getAllBooks() {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books)
    } else {
      reject(new Error("There has been an error retrieving books, try again later"))
    }
  })
}

public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
});

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< EXAMPLE WITHOUT ASYNC AWAIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Requested ISBN could not be found"});
  }
  
 });
 */
 
async function getBookByIsbn(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book)
    } else {
      reject(new Error("Requested ISBN could not be found"))
    }
  });
}

 // Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByIsbn(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: "Error during operation", error: error.message});
  }
 });


const processReqParam = (reqParam) => {
  const input = reqParam;
  const splitInput = input.split('-');
  const withUpperCase = splitInput.map((word) => word[0].toUpperCase() + word.slice(1));
  const searchInput = withUpperCase.join(" ");

  return searchInput
};

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< EXAMPLE WITHOUT ASYNC AWAIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Get requrest parameter and process string
  const searchName = processAuthorName(req.params.author);

  //Get books array and filter
  const bookValues = Object.values(books);
  const filteredBook = bookValues.filter((book) => book.author === searchName);

  if (filteredBook.length > 0) {
    res.status(200).json(filteredBook);
  } else {
    res.status(404).json({ message: "No books by requested author could be found"})
  };

});
*/

async function getBookByAuthor(author) {
  return new Promise((resolve, reject) => {
    const searchName = processReqParam(author);
    //Get books array and filter
    const bookValues = Object.values(books);
    const filteredBook = bookValues.filter((book) => book.author === searchName);
    if (filteredBook.length > 0) {
      resolve(filteredBook)
    } else {
      reject(new Error("No books by requested author could be found"))
    }
  });
}


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Get requrest parameter and process string
  try {
    const book = await getBookByAuthor(req.params.author);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: "Error locating book", error: error.message})
  }
});

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< EXAMPLE WITHOUT ASYNC AWAIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
   //Get requrest parameter and process string
   const searchName = processReqParam(req.params.title);
 
   //Get books array and filter
   const bookValues = Object.values(books);
   const filteredBook = bookValues.filter((book) => book.title === searchName);
 
   if (filteredBook.length > 0) {
     res.status(200).json(filteredBook);
   } else {
     res.status(404).json({ message: "No books by requested title could be found"})
   };
});
*/

async function getBookByTitle(title) {
  return new Promise((resolve, reject) => {
    const searchName = processReqParam(title);
    //Get books array and filter
    const bookValues = Object.values(books);
    const filteredBook = bookValues.filter((book) => book.title === searchName);
    if (filteredBook.length > 0) {
      resolve(filteredBook)
    } else {
      reject(new Error("No books with requested title could be found"))
    }
  });
}

public_users.get('/title/:title', async function (req, res) {
  //Get requrest parameter and process string
  try {
    const book = await getBookByTitle(req.params.title);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: "Error locating book" , error: error.message})
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Requested ISBN could not be found"});
  }
  
});

module.exports.general = public_users;
