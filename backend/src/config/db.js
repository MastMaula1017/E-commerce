import mongoose from "mongoose";

const db = async() =>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ DB Connected");
    } catch (error) {
        process.exit(1);
    }
}
export default db;