const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// A simple array to act as a database of users
// In a real application, you would use a proper database
let users = [
  { "username": "jane_doe", "password": "password123" },
  { "username": "john_smith", "password": "securepassword" }
];

// A dummy secret key for JWT signing. In a production environment, this should be stored securely.
const JWT_SECRET = 'your_jwt_secret_key';

/**
 * Checks if a username is valid.
 * A username is considered valid if it is not empty and does not already exist.
 * @param {string} username - The username to validate.
 * @returns {boolean} - True if the username is valid, false otherwise.
 */
const isValid = (username) => {
  if (!username || username.trim() === "") {
    return false; // Username is empty
  }
  const userExists = users.some(user => user.username === username);
  return !userExists; // Returns true if the username does not exist
};

/**
 * Checks if a username and password match a user in the records.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {boolean} - True if the username and password match, false otherwise.
 */
const authenticatedUser = (username, password) => {
  const matchingUser = users.find(user => user.username === username && user.password === password);
  return !!matchingUser; // Returns true if a matching user is found
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password were provided
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in: Username and password are required." });
  }

  // Authenticate the user
  if (authenticatedUser(username, password)) {
    // If the user is authenticated, create a JWT token
    let accessToken = jwt.sign({
      data: password
    }, JWT_SECRET, { expiresIn: 60 * 60 });

    // Store the token and username in the session (or a dedicated variable)
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).send({ message: "User successfully logged in", token: accessToken });
  } else {
    // Authentication failed
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
// This route assumes a JWT authentication middleware is in place
// and adds the user's information to the request object (e.g., req.user.username)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username; // Assuming username is stored in session after login

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if a review was provided
  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty." });
  }

  // Initialize the reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Check if the user already has a review for this book
  if (books[isbn].reviews[username]) {
    // If a review exists, update it
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: `Review for ISBN ${isbn} updated successfully.` });
  } else {
    // If no review exists, add a new one
    books[isbn].reviews[username] = review;
    return res.status(201).json({ message: `Review for ISBN ${isbn} added successfully.` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    // Check if the user has a review for this book
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // Delete the review
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} deleted successfully.` });
    } else {
      // Review does not exist for this user on this book
      return res.status(404).json({ message: `No review found for user ${username} on ISBN ${isbn}.` });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

// Example of how the booksdb.js file might look like with a dummy book
// module.exports = {
//   "1": {
//     "author": "Chinua Achebe",
//     "title": "Things Fall Apart",
//     "reviews": {}
//   }
// };
