const knex = require('knex')
const app = require('./app')
const { PORT, DATABASE_URL} = require('./config')

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
    ssl: true
  })
// const db = new pg.Client({
//   user: "admin",
//   password: "guest",
//   database: "Employees",
//   port: 5432,
//   host: "localhost",
//   ssl: true
// }); 

  app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})