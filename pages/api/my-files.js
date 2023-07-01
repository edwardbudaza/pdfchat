import { connectDB, disconnectDB } from '@/src/db'; 
import MyFileModel from '@/src/models/MyFile';

/**
 * Handles the request to fetch files.
 * @param "{Object}" req - The request object.
 * @param "{Object}" res - The response object.
 */
export default async function handler(req, res) {
    try {
        // 1. Connect to the database
        await connectDB();
        // 2. Fetch files from the database
        const files = await MyFileModel.find({});
        
        // 3. Disconnect from the database (optional if connection is not persistent)
        // await disconnectDB() 

        // 4. Return the files in the response
        return res.status(200).json(files); 
    } catch (error) {

        // 5. Handle any errors that occurred during the process
        return res.status(500).json({ message: 'Error fetching files' });        
    }
}
