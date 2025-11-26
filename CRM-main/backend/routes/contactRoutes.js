const express = require('express');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactsByCompany,
  importContacts
} = require('../controllers/contactController');

const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getContacts)
  .post(createContact);

router.route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

// Get contacts by company
router.get('/company/:companyId', getContactsByCompany);

// Import contacts
router.post('/import', importContacts);

module.exports = router;