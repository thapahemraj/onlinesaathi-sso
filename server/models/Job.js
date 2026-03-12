const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
        required: true
    },
    category: {
        type: String,
        enum: ['technology', 'healthcare', 'finance', 'education', 'agriculture', 'retail', 'construction', 'hospitality', 'other'],
        default: 'other'
    },
    salary: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        currency: { type: String, default: 'NPR' },
        isNegotiable: { type: Boolean, default: false }
    },
    requirements: [{ type: String }],
    applicationUrl: { type: String, default: '' },
    applicationDeadline: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
