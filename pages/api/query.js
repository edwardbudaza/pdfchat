import pinecone, { initialize } from '@/src/pinecone';
import { getCompletion, getEmbeddings } from '@/src/openaiServices';
import { connectDB } from '@/src/db';
import MyFileModel from '@/src/models/MyFile';
 
/**
 * Handles the request to answer a question based on a given file's context.
 * @param "{Object}" req - The request object.
 * @param "{Object}" res - The response object.
 */
export default async function handler(req, res) { 
    try {
        // 1. Validate request method
        if (req.method !== 'POST') {
            return res.status(400).json({ message: 'Invalid request' });
        }

        // 2. Extract the id and query from the request body
        const { id, query } = req.body;

        // 3. Connect to MongoDB
        await connectDB();
        
        // 4. Query the file by id
        const myFile = await MyFileModel.findById(id);

        if (!myFile) {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        // 5. Get embeddings for the query
        const questionEmbedding = await getEmbeddings(query);

        // 6. Initialize Pinecone
        await initialize();

        // 7. Connect to the index
        const index = pinecone.Index(myFile.vectorIndex);

        // 8. Query the Pinecone DB
        const queryRequest = {
            vector: questionEmbedding,
            topK: 5,
            includesValues: true,
            includeMetadata: true,
        };

        const result = await index.query({ queryRequest });

        // 9. Get the meta data from the results
        let contexts = result['matches'].map(item => item['metadata'].text);
        contexts = contexts.join('\n\n===\n\n');

        console.log('--contexts--', contexts);

        // 10. Build the prompt
        const promptStart = 'Answer the question based on the context below: \n\n';
        const promptEnd =  `\n\nQuestion: ${query} \n\nAnswer:`;

        const prompt = `${promptStart} ${contexts} ${promptEnd}`;

        console.log('--prompt--', prompt);

        // 11. Get the completion from OpenAI
        const response = await getCompletion(prompt);

        console.log('--completion--', response);

        // 12. Return the response
        res.status(200).json({ response }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
} 