const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;



// Middleware
app.use(cors());
app.use(express.json());

// const uri = "mongodb+srv://habitTrackerDB:QBV24f2UE6Y1Hymr@cluster0.xligdge.mongodb.net/?appName=Cluster0";
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
        // const myhabitsCollection = db.collection('myhabits');

        // Add habit data to DB
        app.post('/habits', async (req, res) => {
            const newHabit = req.body;
            const result = await habitsCollection.insertOne(newHabit);
            res.send(result);
        })

        // Get recently Added habits
        app.get('/recent-habits', async (req, res) => {
            const cursor = habitsCollection.find().sort({ created_at: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Brows Public Habit API
        app.get('/public-habits', async (req, res) => {
            const cursor = habitsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
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


        
        // Get Single Habit for habit details page data from DB
        // app.get('/habits/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await habitsCollection.findOne(query);
        //     res.send(result);
        // })

        // Delete single habit data from DB using id

        app.delete('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await habitsCollection.deleteOne(query);
            res.send(result);
        })

        // Edit Habit data & update with changed info to DB using id
        app.patch('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEditHabit = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    name: updatedEditHabit.name,
                    category: updatedEditHabit.category,
                    price: updatedEditHabit.price
                }
            }

            const result = await habitsCollection.updateOne(query, update);
            res.send(result);

        })

        // My Habit apis data get
        // app.get('/myhabits', async (req, res) => {

        //     // Specific user habit find/get
        //     const email = req.query.email;
        //     const query = {}
        //     if (email) {
        //         query.user_email = email;
        //     }

        //     const cursor = myhabitsCollection.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })


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

