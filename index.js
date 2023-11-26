const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


// MongoDB Connected

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wlyyget.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        const featuredCollection = client.db('assignment-12').collection('featuredSurvey');

        app.get('/featuredSurvey', async (req, res) => {
            const fedSurvey = featuredCollection.find();
            const jobResult = await fedSurvey.toArray();
            res.send(jobResult);
        });

























        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




















app.get('/', (req, res) => {
    res.send('Assignment 12 Server is Running');
});

app.listen(port, () => {
    console.log(`Example Server 12 is Running on Port ${port}`);
});