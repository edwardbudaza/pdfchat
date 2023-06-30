import { Configuration, OpenAIApi } from "openai";

// Create a new instance of Configuration with the OpenAI API key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create a new instance of OpenAIApi with the configuration
const openai = new OpenAIApi(configuration);

// Define the models to be used
const OPEN_AI_EMBEDDING_MODEL = "text-embedding-ada-002";
const OPEN_AI_COMPLETION_MODEL = "text-davinci-003";

/**
 * Get Embeddings
 *
 * Retrieves text embeddings for the given input text using the OpenAI Embedding model.
 *
 * @param "string" text - The input text to retrieve embeddings for.
 * @returns "Promise<number[]>" - A promise that resolves to an array of text embeddings.
 * @throws Error If there is an error during the retrieval process.
 */
export const getEmbeddings = async (text) => {
    try {
         // Create an embedding using the OpenAI Embedding model
         const response = await openai.createEmbedding({
            model: OPEN_AI_EMBEDDING_MODEL,
            input: text,
         });
         
         return response.data.data[0].embedding;
    } catch (error) {
        // Handle retrieval error
        console.error('Error retrieving embeddings:', error.message);
        throw error;
        
    }
};

/**
 * Get Completion
 *
 * Generates text completion for the given prompt using the OpenAI Completion model.
 *
 * @param "string" prompt - The prompt to generate text completion for.
 * @returns "Promise<string>" - A promise that resolves to the generated text completion.
 * @throws "Error" If there is an error during the generation process.
 */
export const getCompletion = async (prompt) => {
    try {
        // Generate text completion using the OpenAI Completion model
        const completion = await openai.createCompletion({
            model: OPEN_AI_COMPLETION_MODEL,
            prompt: prompt,
            max_tokens: 500,
            temperature: 0,
        });

        console.log(completion.data.choices);
        
        return completion.data.choices[0].text; 
    } catch (error) {
        // Handle generation error
        console.error('Error generating completion:', error.message);
        throw error;       
    }
};