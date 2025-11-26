const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a competitor name'],
    trim: true,
    maxlength: [100, 'Competitor name cannot be more than 100 characters']
  },
  status: {
    type: String,
    enum: ['Equal', 'Superior', 'Inferior'],
    default: 'Equal'
  },
  marketShare: {
    type: String,
    trim: true,
    maxlength: [200, 'Market share description cannot be more than 200 characters']
  },
  strength: {
    type: String,
    trim: true,
    maxlength: [500, 'Strength cannot be more than 500 characters']
  },
  weakness: {
    type: String,
    trim: true,
    maxlength: [500, 'Weakness cannot be more than 500 characters']
  },
  positionVsYou: {
    type: String,
    enum: ['Leader', 'Challenger', 'Follower', 'Niche Player'],
    default: 'Challenger'
  },
  pricingModel: {
    type: String,
    trim: true,
    maxlength: [200, 'Pricing model cannot be more than 200 characters']
  },
  keyFeatures: {
    type: String,
    trim: true,
    maxlength: [300, 'Key features cannot be more than 300 characters']
  },
  customerBase: {
    type: String,
    trim: true,
    maxlength: [500, 'Customer base description cannot be more than 500 characters']
  },
  recentDevelopment: {
    type: String,
    trim: true,
    maxlength: [500, 'Recent development cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
competitorSchema.index({ name: 1 });
competitorSchema.index({ status: 1 });
competitorSchema.index({ createdBy: 1 });
competitorSchema.index({ createdAt: -1 });

// Static method to find active competitors
competitorSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to search competitors
competitorSchema.statics.searchCompetitors = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { name: regex },
      { marketShare: regex },
      { customerBase: regex }
    ]
  });
};

module.exports = mongoose.model('Competitor', competitorSchema);