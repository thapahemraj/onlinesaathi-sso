const express = require('express');
const router = express.Router();
const { protect, isSubAdmin, isSuperAdmin, isSupportPlus, requireMinRole } = require('../middleware/authMiddleware');
const { uploadDocument, getMyDocuments, deleteDocument, getDocumentsByUser } = require('../controllers/documentController');

router.use(protect);

router.post('/upload', uploadDocument);
router.get('/', getMyDocuments);
router.delete('/:id', deleteDocument);

// Agent / admin can view any user's documents
const isAgentOrAbove = requireMinRole('agent');
router.get('/user/:userId', isAgentOrAbove, getDocumentsByUser);

module.exports = router;
