const bodyparser=require("body-parser")
const express=require("express")
const app=express()
const cors=require("cors")
const {connect,isDatabaseConnected}=require("./db")
const apiRouter=require("./Routes")
const port =5000

app.use(cors())
app.use(bodyparser.json({limit:"50mb"}))
app.use(bodyparser.urlencoded({extended:true,limit:"50mb"}))
app.use(express.json())

// Ensure database connection is established before serving requests (crucial for Serverless)
app.use(async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (error) {
    console.error("Database connection middleware failed:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get('/',(req,res)=>{
  res.send("hello this is internshala backend")
})

app.get('/health',(req,res)=>{
  res.json({
    server:"running",
    database:isDatabaseConnected() ? "connected" : "not connected"
  })
})

app.use("/api",apiRouter)

app.use((req,res,next)=>{
  req.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Allow-Origin","*")
  next()
})

const startServer = () => {
  if (process.env.NODE_ENV !== 'production') {
    app.listen(port,()=>{
      console.log(`Server is running on the port ${port}`)
    })
  }

  connect().catch((error) => {
    console.error("Database connection failed:", error.message)
  })
}

startServer();

module.exports = app;
