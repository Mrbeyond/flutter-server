const Routers = require("./Routes");
const {server, app, express, io} = require("./server");


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(Routers);




app.get('/', (req,res)=>{
  console.log("working fine");
  res.status(200).json({success:true});
})


server.listen(5555, ()=>{
  console.log("served");
})