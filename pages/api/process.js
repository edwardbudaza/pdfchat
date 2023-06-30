import * as PDFJS from 'pdfjs-dist/legacy/build/pdf';
import MyFileModel from '@/src/models/MyFile';
import { connectDB, disconnectDB } from '@/src/db'; 
import { getEmbeddings } from '@/src/openaiServices';
import pinecone, { Initialize } from '@/src/pinecone';
import { initialize } from 'next/dist/server/lib/render-server';

/**
 * Process the PDF file and update the embeddings in the Pinecone index.
 * @param "Object" req - The HTTP request object.
 * @param "Object" res - The HTTP response object.
 * @returns "Object" - The HTTP response with the result.
 */
export default async function handler(req, res) { 
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(400).json({ message: "HTTP method not allowed" });
    }

    // Connect MongoDB
    await connectDB();

    // Retrieve file ID from the request body
    const [id] = req.body;

    // Retrieve the file from MongoDB
    const myFile = await MyFileModel.findById(id);
    if(!myFile) {
      return res.status(400).json({ message: "File not found" });
    }

    // Check if the file is already processed
    if(myFile.isProcessed) {
      return res.status(400).json({ message: "File is already processed" });
    }

    // Read the PDF file from the S3 URL and extract from each page
    const vectors = await extractTextAndEmbeddings(myFile.fileUrl);

    // Initialize Pinecone
    await initialize();

    // Connect to the index
    const index = pinecone.Index(myFile.vectorIndex);

    // Upsert the vectors in the index
    await upsertVectors(index, vectors);

    // Update the file's processed status
    myFile.isProcessed = true;
    await myFile.save();
    
    // Return the response
    return res.status(200).json({ message: "File processed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message }); 
  } finally {
    // Disconnect from the database
    await disconnectDB();
  }
};

/**
 * Extracts text and embeddings from a PDF file.
 * @param "string" fileUrl - The URL of the PDF file.
 * @returns "Array" - Array of page vectors.
 */
async function extractTextAndEmbeddings(fileUrl) { 
  const vectors = []

  const fileData = await fetch(fileUrl);
  if (!fileData.ok) {
    throw new Error("Error getting file contents");
  }

  const pdfDoc = await PDFJS.getDocument(await fileData.arrayBuffer()).promise;
  const numPages = pdfDoc.numPages;

  for (let i = 0; i < numPages; i++) {
    const page = await pdfDoc.getPage(i + 1);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join('');

    const embedding = await getEmbeddings(text);

    vectors.push({
      id: `page${i + 1}`,
      values: embedding,
      metadata: {
        pageNum: i + 1,
        text,
      },
    });
  }

  return vectors;
};

/**
 * Upserts the vectors in the specified Pinecone index.
 * @param "Object" index - The Pinecone index.
 * @param "Array" vectors - The vectors to upsert.
 */
async function upsertVectors(index, vectors) {
  await index.upsert({ 
    upsertRequest: {
      vectors,
    },
  });
} 