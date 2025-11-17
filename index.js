const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;



// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xligdge.mongodb.net/?appName=Cluster0`;

// MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Habit server is running')
})


async function run() {
    try {
        await client.connect();

        const db = client.db('habit_db');
        const habitsCollection = db.collection('habits');

        // Add habit data to DB
        app.post('/habits', async (req, res) => {
            const newHabit = req.body;
            const result = await habitsCollection.insertOne(newHabit);
            res.send(result);
        })


        // Get Single habit with id
        app.get('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await habitsCollection.findOne(query);
            res.send(result);
        })


        // Edit & update single Habit data
        app.put('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEditedHabit = req.body;
            // console.log(id);
            // console.log(updatedEditedHabit);

            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedEditedHabit

            }
            const result = await habitsCollection.updateOne(query, update)
            res.send({
                success: true,
                result
            });
        })


        // Get habit by email from DB
        app.get('/habits', async (req, res) => {

            // get find habit under Specific Email
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }

            const cursor = habitsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })


        // Get Recently Added habits for feathured habit
        app.get('/recent-habits', async (req, res) => {
            const cursor = habitsCollection.find().sort({ created_at: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Get Recent habit with id for habit details page
        app.get('/recent-habits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await habitsCollection.findOne(query);
            res.send(result);
        })

        // Brows Public Habit API
        app.get('/public-habits', async (req, res) => {
            const cursor = habitsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Get Public habit with id for public habit details page
        app.get('/public-habits/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await habitsCollection.findOne(query);
            res.send(result);
        })

        // app.get('/search', async (req, res) => {
        //     const searchBy_text = req.query.search;
        //     const result = habitsCollection.find({ name: searchBy_text });
        //     res.send(result);
        // })

        // Delete single habit data from DB using id
        app.delete('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await habitsCollection.deleteOne(query);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Habit server is running on port, ${port}`);

})

