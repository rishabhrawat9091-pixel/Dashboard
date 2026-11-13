import express from "express"
import cors from "cors";
import dotenv from "dotenv"
import order from "./router/order.router.js"
import mongoconnect from "./Database/Db.js";
const app = express();
dotenv.config();
mongoconnect();
app.use(cors());
app.use(express.json());

app.use("/api/order", order);
app.use("/api/order", order);
const Port = 8080;
app.listen(Port, () => {
    console.log(`server is running at port number ${Port}`)
});


