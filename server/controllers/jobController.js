const Job = require('../models/Job');
const { logAction } = require('./auditController');

// @desc    Create a job listing
// @route   POST /api/jobs
// @access  Private (subAdmin, superAdmin)
const createJob = async (req, res) => {
    try {
        const job = await Job.create({ ...req.body, createdBy: req.user._id });
        await logAction(req, 'Create Job', 'Job', job._id, { title: job.title }, 'Success');
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a job listing
// @route   PUT /api/jobs/:id
// @access  Private (subAdmin, superAdmin)
const updateJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!job) return res.status(404).json({ message: 'Job not found.' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a job listing
// @route   DELETE /api/jobs/:id
// @access  Private (superAdmin only)
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found.' });
        res.json({ message: 'Job deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all active jobs (paginated)
// @route   GET /api/jobs
// @access  Private (all authenticated users)
const getAllJobs = async (req, res) => {
    try {
        const { category, jobType, page = 1, limit = 20, search } = req.query;
        const filter = { isActive: true };
        if (category && category !== 'all') filter.category = category;
        if (jobType && jobType !== 'all') filter.jobType = jobType;
        if (search) filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } }
        ];

        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Job.countDocuments(filter);

        res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single job  
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found.' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Admin: get all jobs (including inactive)
// @route   GET /api/jobs/admin/all
// @access  Private (subAdmin, superAdmin)
const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find({}).sort({ createdAt: -1 });
        res.json({ jobs, total: jobs.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createJob, updateJob, deleteJob, getAllJobs, getJobById, getAllJobsAdmin };
