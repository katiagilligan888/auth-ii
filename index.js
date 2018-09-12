const express = require("express");
const knex = require("knex");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const dbConfig = require("./knexfile");

const server = express();
const db = knex(dbConfig.development);

server.use(express.json());

server.post("/api/register", (req, res) => {
  const creds = req.body;

  //Joi validation of request body
  const schema = {
    username: Joi.string()
      .min(8)
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    department: Joi.string().required()
  };
  const result = Joi.validate(creds, schema);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
  }

  const hash = bcrypt.hashSync(creds.password, 10);
  creds.password = hash;
  db("users")
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => {
      res.status(500).json({ error: "Error updating data in the database" });
    });
});

server.get("/api/users", (req, res) => {
  db("users").then(users => {
      res.status(200).json(users); 
  }).catch(err => {
      res.status(500).json(err); 
  })
});

server.post("/api/login", (req, res) => {
    const creds = req.body; 
    db('users').where({username: creds.username}).first().then(user =>{
        if(user && bcrypt.compareSync(creds.password, user.password)){
            res.status(200).json({message: "Welcome! You are successfully logged in!"}); 
        }else {
            res.status(401).json({message: "Sorry, your credentials are wrong, please try again"})
        }
    }).catch(err => {
        res.status(500).json(err); 
    })
})

server.listen(4400, () => {
  console.log("Server is listening on PORT 4400");
});