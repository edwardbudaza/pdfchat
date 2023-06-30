import AWS from 'aws-sdk';
import fs from 'fs';

// Create a new instance of AWS S3 client
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION,

});


/**
 * S3 Upload
 *
 * Uploads a file to an S3 bucket.
 *
 * @param "string" bucket - The name of the S3 bucket.
 * @param "object" file - The file to upload, including properties like 'name' and 'path'.
 * @returns "Promise<object>" - A promise that resolves to the S3 upload response.
 * @throws Error If there is an error during the upload process.
 */
export const s3Upload = async (bucket, file) => {
    try {
        // Set the parameters for the S3 upload
        const params = { 
            Bucket: bucket,
            Key: file.name,
            Body: fs.createReadStream(file.path),
      };

      // Upload the file to s3 and return the upload response
      return await s3.upload(params).promise();
         
    } catch (error) {
        // Handle upload error
        console.error('Error uploading file to S3:', error.message);
        throw error;       
    }
};