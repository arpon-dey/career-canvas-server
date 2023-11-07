const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bpsqjlp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const jobCollection = client.db("jobsDB").collection("jobs");
    const bidsCollection = client.db("jobsDB").collection("myBids");

    // app.get('/jobs', async (req, res) => {
    //     const result = await jobCollection.find().toArray();
    //     res.send(result);
    //   });

    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email: email };
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });


    app.get("/myBids", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email: email };
      }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });


    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });



    app.get('/jobs/update/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await jobCollection.findOne(query)
        res.send(result);
    });



    app.post("/jobs", async (req, res) => {
      const job = req.body;
      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    app.post("/myBids", async (req, res) => {
      const myBidJob = req.body;
      const result = await bidsCollection.insertOne(myBidJob);
      res.send(result);
    });

    app.get("/myBids/reject/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bidsCollection.findOne(query);
        res.send(result);
    });




    app.put("/myBids/reject/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updatedJob = {
            $set: { status: "Rejected" },
        };
        const result = await bidsCollection.updateOne(query, updatedJob);
        res.send(result);
    });


    app.put('/jobs/update/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const options = { upsert: true };
        const updatedJob = req.body;

        const job = {
            $set: {
                jobTitle: updatedJob.jobTitle,
                deadline: updatedJob.deadline,
                maxPrice: updatedJob.maxPrice,
                minPrice: updatedJob.minPrice,
                description: updatedJob.description
            }
        }

        const result = await jobCollection.updateOne(filter, job, options);
        res.send(result);
    })



    app.delete('/jobs/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await jobCollection.deleteOne(query);
        res.send(result);
    })



    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`server started on ${port}`);
});
