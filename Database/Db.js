import mongoose from "mongoose";

const mongoconnect = async () => {
    try {
        await mongoose.connect(process.env.MongoUri);
        console.log("mongo db is connected");
    } catch (error) {
        console.log("the error comes in", error);
    }
}

export default mongoconnect;