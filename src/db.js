/**
 * MongoDB Connection Utility
 *
 * This utility module provides functions to connect and disconnect from a MongoDB database using Mongoose.
 * It ensures that only one connection is established and allows for easy maintenance and reusability.
 * The module exports two functions: connectDB() and disconnectDB().
 *
 * Usage:
 * - Import the module: import { connectDB, disconnectDB } from './mongoConnection';
 * - Call connectDB() to establish a connection to the MongoDB database.
 * - Call disconnectDB() to disconnect from the MongoDB database.
 *
 * Note: The connection URI and database name are retrieved from environment variables: DB_USERNAME, DB_PASSWORD, and DB_NAME.
 */

import mongoose from "mongoose";

const MONGO_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.3yyiulz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`


/**
 * Connect to MongoDB
 * If an existing connection is available, it logs a message and returns.
 * Otherwise, it establishes a new connection using the provided URI and Mongoose options.
 *
 * @throws Error If there is an error connecting to MongoDB
 */
async function connectDB() {

    try {
        // Check if an existing connection is available
        if (mongoose.connection.readyState === 1) {
            console.log('Existing connection available');
            return;
        } 
        // Establish a new connection to MongoDB
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useNewUnifiedTopolgy: true,
        });

        console.log('Connected to MongoDB');

    } catch (error) {
        // Handle connection error
        console.error('Errorconnecting to MongoDB:', error.message);
        process.exit(1); 
    }   
} 


/**
 * Disconnect from MongoDB
 * If there is no active connection, it logs a message and returns.
 * Otherwise, it disconnects from the MongoDB database.
 *
 * @throws Error If there is an error disconnecting from MongoDB
 */
async function disconnectDB() {
    try {
        // Check if there is an active connection to disconnect
        if (mongoose.connection.readyState === 0) {
            console,log('No active connection to disconnect');
            return;
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (error) {
        // Handle disconnection error
        console.error('Error disconnecting from MongoDB:', error.message);
        process.exit(1);   
    }
} 

export { connectDB, disconnectDB };