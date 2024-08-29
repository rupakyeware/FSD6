const express = require('express')
const axios = require('axios').default

const app = express()
const port = 8000


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://rupakyeware:Password@cluster0.zisbz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function fetchMovie(title) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = client.db("sample_mflix");
    const movies = database.collection("movies");
    const query = { title: title };
    const options = {
      // Sort matched documents in descending order by rating
      sort: { "imdb.rating": -1 },
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0, title: 1, imdb:  1 },
    };

    // Execute query
    const movie = await movies.findOne(query, options);
    // Print the document returned by findOne()
    return movie;

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}



app.get('/movie/:title', async (req, res) => {

  const movieTitle = decodeURI(req.params.title);

  try {
    const movie = await fetchMovie(movieTitle);
    if (movie) {
      res.send(`Movie: ${movie.title}, Rating: ${movie.imdb.rating}`)
    }
    else {
      res.send('Movie not found')
    }
  } catch (error) {
    res.status(500).send('Error retrieving movie');
    console.log(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})