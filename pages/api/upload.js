import formidable from 'formidable-serverless';
import slugify from 'slugify';

import { connectDB } from "@/src/db";
import { s3Upload } from '@/src/s3services';
import pinecone, { initialize } from '@/src/pinecone';

export const config = {
	api: {
		bodyParser: false,
	},
};

/**
 * Creates a Pinecone index if it doesn't already exist.
 * @param "string" indexName - The name of the index to be created.
 * @throws Error If the index with the specified name already exists.
 */
const createIndex = async (indexName) => {
    const indexes = await pinecone.listIndexes();
    if(!indexes.includes(indexName)) {
        await pinecone.createIndex({
            createRequest: {
                name: indexName,
                dimension: 1536, //fixed for OPENAI embeddings            
            },
        });
        console.log('Index created')
    } else {
        throw new Error(`Index with name ${indexName} already exists`)
    }
};

/**
 * Handles the POST request for uploading a file, creating a Pinecone index, and saving file details in MongoDB.
 * @param "Object" req - The request object.
 * @param "Object" res - The response object.
 */
export default async function handler(req, res) {
    try {
        // 1. Only allow POST methods
        if(req.method !== 'POST') {
            return res.status(400).json({ message: 'Method not allowed' })
        }

        // 2. Connect to MongoDB
        await connectDB()

        // 3. Parse the incomming form data
        let form = new formidable.IncomingForm();
        form.parse(req, async(error, fields, files) => {
            if(error) {
                console.error('Failed to parse form data:', error);
                return res.status(500).json({ error: 'Failed to parse form data' });
            }

            const file = files.file;
            
            // Check if the file object exists    
            if(!file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            
            // 4. Upload the file to AWS S3
            let data = await s3Upload(process.env.S3_BUCKET, file)

            // 5. Initialise Pinecone
            const filenameWithoutExt = file.newFilename.split(".")[0]
            const filenameSlug = slugify(filenameWithoutExt, {
                lower: true, strict: true
            });

            await initialize()  // initialize pinecone

            // 6. Create a Pinecone Index
            await createIndex(filenameSlug) // create index

            // 7. Save the file details in MongoDB
            const myFile = new MyFileModel({
                fileName: file.name,
                fileUrl: data.Location,
                vectorIndex: filenameSlug,
            });
            await myFile.save();
            
            // 8. Return the response
            return res.status(200).json({ message: 'File uploaded to S3 and index created' })
        });
    } catch (error) {
        console.log("--error--", error);
        return res.status(500).send({ message: error.message });
        
    }
}