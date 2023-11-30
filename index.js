const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const userCollection = client.db('assignment-12').collection('serveUser');
        const latestCollection = client.db('assignment-12').collection('latest');
        const testimonialCollection = client.db('assignment-12').collection('testimonial');


        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        });

        // middlewares
        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(401).send({ message: 'unauthorized access' });
                }
                req.decoded = decoded;
                next();
            });
        };

        // user verify admin after verifyToken
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        // user related api
        app.get('/serveUser', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });


        // admin related
        app.get('/serveUser/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin });
        });

        // 
        app.post('/serveUser', async (req, res) => {
            const user = req.body;

            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        });


        //
        app.patch('/serveUser/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        // get data from database
        app.get('/featuredSurvey', async (req, res) => {
            const fedSurvey = featuredCollection.find();
            const jobResult = await fedSurvey.toArray();
            res.send(jobResult);
        });

        // for latest data get from database to client side
        app.get('/latest', async (req, res) => {
            const latestData = latestCollection.find();
            const result = await latestData.toArray();
            res.send(result);
        });

        app.get('/testimonial', async (req, res) => {
            const testData = testimonialCollection.find();
            const result = await testData.toArray();
            res.send(result);
        });

        // create user data send database
        // app.post('/users', async (req, res) => {
        //     const user = req.body;

        //     const query = { email: user.email }
        //     const existingUser = await userCollection.findOne(query);

        //     if (existingUser) {
        //         return res.send({ message: 'User already exists', insertedId: null })
        //     }

        //     const result = await userCollection.insertOne(user);
        //     res.send(result);
        // });




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