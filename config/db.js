import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://ozkanoglusude:GQqAtGSID2jEamA3@bitirmedbcluster.bc2nq.mongodb.net/bitirmeDB').then(()=>console.log("DB Connected"));
}