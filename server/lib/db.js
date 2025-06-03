import mongoose from "mongoose";


// function to connect the mongodb

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('DataBase is connected'))
        await mongoose.connectDB(`${process.env.MONGODB_URI / chatapp}`);

    } catch (error) {

        console.log(error)

    } 
}