const Routers = require("./Routes");
const {server, app, express, io} = require("./server");
const { SENDGRID } = require("./Utilities/Sendgrid");

const cors = require('cors');


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(Routers);
app.use(cors())

app.get('/', (req,res)=>{
  console.log("working fine");
  res.status(200).json({success:true});
})


app.post('/blog', (req,res)=>{
  console.log(req.body)
  res.status(200).json({seen:true})
})

app.get("/send-mail", async(req, res)=>{
  try {
    let message={
      to: "abiolaolatunji007@gmail.com",
      from: "beyondbeyond602@gmail.com",
      subject: "Testing email with sendgrid",
      text: "From beyond",
      html: `<html>
        <body>
          <h1>Mr beyond </h1>
          <strong> Viola, email works! </strong>
        </body>
      </html>`
    }

    SENDGRID.send(message)
    .then(()=>{
      console.log("EMail sent");
      res.status(200).json("Sent");
    })
    .catch(e=>{
      console.log(e);
      res.status(500).json(e);
    })

  } catch (e) {
  
  }
})


server.listen(5555, ()=>{
  console.log("served");
})