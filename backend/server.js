require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")

connectDB()

const app = express()
app.use(cors()) 

app.use(express.json())

app.get("/", (req, res) => {
  res.send("API is running...")
})

app.use("/api/auth", authRoutes)
app.use("/api/admin", require("./routes/adminRoutes"))
app.use("/api/domain", require("./routes/domainRoutes"))


const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server running on port ${PORT}`))