const express = require("express");
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdmdnc2.mongodb.net/?appName=Cluster0`;

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
        await client.connect();

        //jobs collection
        const jobsCollection = client.db("HireSphere").collection("jobs");

        //applications collection
        const applicationsCollection = client.db("HireSphere").collection("applications");

        // Jobs APIs
        // API to get all jobs
        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // API to get a single job by ID
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        });

        //Applications APIs
        //Api to get all applications
        app.get('/applications', async (req, res) => {
            const applicant_email = req.query.email;
            const query = {
                applicantEmail: applicant_email
            }
            const result =await applicationsCollection.find(query).toArray();

            // Not good practice 
            for (const application of result) {
                const jobId = application.jobId
                const jobQuery = {_id: new ObjectId(jobId)} 
                const job = await jobsCollection.findOne(jobQuery)
                application.company = job.company
                application.title = job.title
                application.company_logo = job.company_logo
                application.location = job.location
            }
           res.send(result);
        })

        // API to post a application
        app.post('/applications', async (req, res) => {
            const application = req.body;
            const result = await applicationsCollection.insertOne(application);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Welcome to Hire sphere server")
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})


