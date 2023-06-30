import { PineconeClient } from "@pinecone-database/pinecone";

// Create a new instance of PinconeClient
const pinecone = new PineconeClient();


/**
 * Initialize Pinecone Client
 *
 * This function initializes the Pinecone Client by providing the environment and API key.
 * It should be called before using any other Pinecone operations.
 *
 * @throws  Error  If there is an error initializing the Pinecone Client
 */
export const initialize = async () => {
    try {
        // Initialize Pinecone Client with environment and API key
        await pinecone.init({
            environment: process.env.PDB_ENV,
            apiKey: process.env.PDB_KEY,
        });

        console.log('Pinecone initialized')
    } catch (error) {
        // Handle initialization error
        console.error('Error initializing Pinecone:', error.message); 
        process.exit(1);
        
    }
}

export default pinecone;