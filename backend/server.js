const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());


//routes
app.get('/', (req, res) => {
    res.json({message: 'API is running!'});
});


//Connection to MONGODB and start server

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('MongoDB Connected');
        app.listen(5000, () => console.log('Server running on port 5000'));
    })
    .catch(err => console.error(err));