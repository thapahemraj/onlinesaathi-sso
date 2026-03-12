const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Document = require('../models/Document');
const { logAction } = require('./auditController');

// Multer config for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads', 'documents');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const randomHex = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${req.user._id}-${randomHex}${ext}`);
    }
});

const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf/;
        const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = /jpeg|jpg|png|gif|webp|pdf/.test(file.mimetype);
        if (extOk && mimeOk) cb(null, true);
        else cb(new Error('Only image and PDF files are allowed.'));
    }
}).single('document');

// @desc    Upload a new document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

        try {
            const { documentType, documentName, expiryDate } = req.body;
            if (!documentType || !documentName) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'documentType and documentName are required.' });
            }

            const fileUrl = `/uploads/documents/${req.file.filename}`;
            const doc = await Document.create({
                user: req.user._id,
                documentType,
                documentName,
                fileUrl,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                expiryDate: expiryDate || null
            });

            await logAction(req, 'Upload Document', 'Document', doc._id, { documentType }, 'Success');
            res.status(201).json({ message: 'Document uploaded.', document: doc });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
};

// @desc    Get current user's documents
// @route   GET /api/documents
// @access  Private
const getMyDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a document (owner only)
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found.' });
        if (doc.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorised to delete this document.' });
        }
        // Remove file from disk
        const filePath = path.join(__dirname, '..', doc.fileUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await doc.deleteOne();
        res.json({ message: 'Document deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Agent/Admin views documents for a specific user
// @route   GET /api/documents/user/:userId
// @access  Private (agent, subAdmin, superAdmin, supportTeam)
const getDocumentsByUser = async (req, res) => {
    try {
        const docs = await Document.find({ user: req.params.userId })
            .populate('verifiedBy', 'username firstName lastName')
            .sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { uploadDocument, getMyDocuments, deleteDocument, getDocumentsByUser };
