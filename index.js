const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');


const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 