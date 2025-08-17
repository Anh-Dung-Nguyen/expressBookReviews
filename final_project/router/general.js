const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Handles user registration.
 * Expects 'username' and 'password' in the request body.
 * Adds a new user to the 'users' array if the username is valid and not already taken.
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password were provided
  if (!username || !password) {
    return res.status(404).json({ message: "Username and password are required for registration." });
  }

  // Use the isValid function to check if the username is available
  if (isValid(username)) {
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. You can now log in." });
  } else {
    // Return an error if the username is already taken or invalid
    return res.status(404).json({ message: "Username already exists or is invalid. Please choose another one." });
  }
});

// Task 10: Get the book list available in the shop using async-await with Promises
public_users.get('/', async function (req, res) {
  // Simulate an asynchronous operation to fetch books
  const getBooks = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(books);
      }, 1000); // Simulate a network delay of 1 second
    });
  };

  try {
    const bookList = await getBooks();
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while retrieving the book list." });
  }
});

// Task 11: Get book details based on ISBN using async-await with Promises
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  // Simulate an asynchronous operation to find a book by ISBN
  const getBookByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject("Book not found.");
        }
      }, 1000); // Simulate a network delay
    });
  };

  try {
    const book = await getBookByIsbn(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 12: Get book details based on author using async-await with Promises
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  // Simulate an asynchronous operation to find books by author
  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject("No books found for this author.");
        }
      }, 1000); // Simulate a network delay
    });
  };

  try {
    const booksFound = await getBooksByAuthor(author);
    return res.status(200).json({ booksbyauthor: booksFound });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 13: Get all books based on title using async-await with Promises
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  // Simulate an asynchronous operation to find books by title
  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject("No books found with this title.");
        }
      }, 1000); // Simulate a network delay
    });
  };

  try {
    const booksFound = await getBooksByTitle(title);
    return res.status(200).json({ booksbytitle: booksFound });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  // Check if the book exists and has reviews
  if (book && book.reviews) {
    return res.status(200).json({ reviews: book.reviews });
  } else if (book) {
    // If the book exists but has no reviews
    return res.status(200).json({ reviews: {} });
  } else {
    // Book was not found
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.general = public_users;
