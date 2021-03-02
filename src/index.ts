import express from 'express';
const cors = require('cors');
require("./db/mongoose"); // to create the connection
const userRouter = require("./routers/user");
const commentRouter = require("./routers/comment");

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  // TODO: shouldn't be open to all
  origin: '*', //'http://localhost:3001',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(userRouter);
app.use(commentRouter);
// collection and exhibit endpoints?
// create graphQL endpoint?

app.listen(port, () => {
  console.log("server is up on port " + port);
});
