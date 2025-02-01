const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'python', 'java', 'c++', 'c', 'go', 'rust', 'typescript', 'php', 'ruby'] // Add more languages if needed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Code', CodeSchema);
