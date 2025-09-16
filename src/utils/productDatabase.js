// src/utils/productDatabase.js

export const productDatabase = {
  // Use a real EAN-13 or UPC barcode number for testing
  "978020137962": { // A common barcode for a book
    name: "Chicken (1kg)",
    category: "food",
    type: "chicken",
    amount: 1000,
    footprint: 6.9, // kg CO2e
  },
  "4002000000001": { // A mock barcode
    name: "Smartphone",
    category: "shopping",
    type: "electronics",
    amount: 500, // as USD
    footprint: 3, // kg CO2e
  },
  "1234567890128": { // Another mock barcode
    name: "Organic Veggies (500g)",
    category: "food",
    type: "vegetables",
    amount: 500, // as grams
    footprint: 1, // kg CO2e
  },
  "0888880000185": { // A mock barcode for a t-shirt
    name: "T-shirt",
    category: "shopping",
    type: "clothing",
    amount: 20,
    footprint: 1.5
  },
};