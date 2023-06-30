import mongoose from 'mongoose';

const { Schema } = mongoose;

const MyFileSchema = new Schema({
    fileName: {
        type: String,
        required: [true, 'Filename is a required field.'],
        trim: true,
        maxLength: 100,
        unique: true,
    },
    fileUrl: {
        type: String,
        required: [true, 'File Url is a required field.'],
        trim: true,
        maxLength: 100,
        unique: true,
    },
    isProcessed: {
        type: Boolean,
        default: false,
    },
    vectorIndex: {
        type: String,
        maxLength: 100,
        unique: true,
        required: false,
    },
}, {
    timestamps: true,
});


// Create the MyFile model if it doesn't exist
const MyFileModel = mongoose.models.myFile || mongoose.model('myFile', MyFileSchema);

export default MyFileModel;