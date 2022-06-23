import express from 'express'

const app = express()

app.get("/", () => {
  console.log("Alo Você")
})

app.listen(3333)