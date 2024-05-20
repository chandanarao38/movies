const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
module.exports = app

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const result1Func = item => {
  return {
    movieName: item.movie_name,
  }
}
const result2Func = item => {
  return {
    movieId: item.movie_id,
    directorId: item.director_id,
    movieName: item.movie_name,
    leadActor: item.lead_actor,
  }
}
const result3func = item => {
  return {
    directorId: item.director_id,
    directorName: item.director_name,
  }
}
// API 1
app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
    SELECT movie_name 
    FROM Movie;`
  const moviesArray = await db.all(getMovieQuery)
  console.log(moviesArray.map(item => result1Func(item)))
  response.send(moviesArray.map(item => result1Func(item)))
})

//API 2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
    INSERT INTO Movie (director_id, movie_name, lead_actor)
    VALUEs (${directorId}, '${movieName}', '${leadActor}' );
    `
  const dbResponse = await db.run(addMovieQuery)
  const movieId = dbResponse.lastId
  console.log(dbResponse)
  response.send('Movie Successfully Added')
})

//API 3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovie2Query = `
    SELECT *
    FROM Movie
    WHERE movie_id = ${movieId};`
  const result = await db.get(getMovie2Query)
  console.log(result2Func(result))
  response.send(result2Func(result))
})

//API 4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
  UPDATE Movie
  SET movie_name = '${movieName}', lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId}
  `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM Movie
  WHERE movie_id = ${movieId}`
  await db.run(deleteQuery)
  console.log('Movie Removed')
  response.send('Movie Removed')
})

//API 6
app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
  SELECT *
  FROM Director`
  const result = await db.all(getDirectorQuery)
  console.log(result.map(item => result3func(item)))
  response.send(result.map(item => result3func(item)))
})

//API 7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const {movieName} = request.body
  const getMovieQuery = `
  SELECT movie_name
  FROM Movie
  WHERE director_id = ${directorId}`
  const result = await db.all(getMovieQuery)
  console.log(result.map((item) => result1Func(item)))
  response.send(result.map((item) => result1Func(item)))
})
