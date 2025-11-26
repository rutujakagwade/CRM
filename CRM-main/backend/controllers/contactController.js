const Contact = require('../models/Contact');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, company, status } = req.query;

  let query = { createdBy: req.user.id };

  // Add search functionality
  if (search) {
    query.$or = [
      { first_name: new RegExp(search, 'i') },
      { last_name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { position: new RegExp(search, 'i') }
    ];
  }

  // Filter by company
  if (company) {
    query.company_id = company;
  }

  // Filter by active status
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const contacts = await Contact.find(query)
    .populate('company_id', 'name industry')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const total = await Contact.countDocuments(query);

  res.status(200).json({
    success: true,
    data: contacts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    createdBy: req.user.id
  }).populate('company_id', 'name industry website phone');

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Create contact
// @route   POST /api/contacts
// @access  Private
const createContact = asyncHandler(async (req, res) => {
  const contactData = {
    ...req.body,
    createdBy: req.user.id
  };

  const contact = await Contact.create(contactData);

  await contact.populate('company_id', 'name industry');

  res.status(201).json({
    success: true,
    data: contact
  });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('company_id', 'name industry');

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    createdBy: req.user.id
  });

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }

  await contact.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get contacts by company
// @route   GET /api/contacts/company/:companyId
// @access  Private
const getContactsByCompany = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({
    company_id: req.params.companyId,
    createdBy: req.user.id,
    isActive: true
  }).populate('company_id', 'name industry').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: contacts
  });
});

// @desc    Bulk import contacts
// @route   POST /api/contacts/import
// @access  Private
const importContacts = asyncHandler(async (req, res) => {
  const { contacts } = req.body;

  if (!Array.isArray(contacts)) {
    return res.status(400).json({
      success: false,
      error: 'Contacts must be an array'
    });
  }

  const contactsToCreate = contacts.map(contact => ({
    ...contact,
    createdBy: req.user.id
  }));

  const createdContacts = await Contact.insertMany(contactsToCreate);

  res.status(201).json({
    success: true,
    data: createdContacts,
    count: createdContacts.length
  });
});

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactsByCompany,
  importContacts
};