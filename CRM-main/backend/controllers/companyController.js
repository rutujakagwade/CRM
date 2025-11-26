const Company = require('../models/Company');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
const getCompanies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, industry, status } = req.query;

  let query = { createdBy: req.user.id };

  // Add search functionality
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { industry: new RegExp(search, 'i') },
      { sector: new RegExp(search, 'i') }
    ];
  }

  // Filter by industry
  if (industry) {
    query.industry = new RegExp(industry, 'i');
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  const companies = await Company.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Company.countDocuments(query);

  res.status(200).json({
    success: true,
    data: companies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({
    _id: req.params.id,
    createdBy: req.user.id
  });

  if (!company) {
    return res.status(404).json({
      success: false,
      error: 'Company not found'
    });
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Create company
// @route   POST /api/companies
// @access  Private
const createCompany = asyncHandler(async (req, res) => {
  const companyData = {
    ...req.body,
    createdBy: req.user.id
  };

  const company = await Company.create(companyData);

  res.status(201).json({
    success: true,
    data: company
  });
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!company) {
    return res.status(404).json({
      success: false,
      error: 'Company not found'
    });
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({
    _id: req.params.id,
    createdBy: req.user.id
  });

  if (!company) {
    return res.status(404).json({
      success: false,
      error: 'Company not found'
    });
  }

  await company.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get company statistics
// @route   GET /api/companies/stats
// @access  Private
const getCompanyStats = asyncHandler(async (req, res) => {
  const stats = await Company.getStatistics();

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats
};