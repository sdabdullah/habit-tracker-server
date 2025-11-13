const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://habitTrackerDB:QBV24f2UE6Y1Hymr@cluster0.xligdge.mongodb.net/?appName=Cluster0";

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

        app.post('/habits', async (req, res) => {
            const newHabit = req.body;
            const result = await habitsCollection.insertOne(newHabit);
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

