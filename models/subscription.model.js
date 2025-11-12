import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Subscription name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Entertainment',
      'Software',
      'News',
      'Fitness',
      'Music',
      'Cloud Storage',
      'Gaming',
      'Education',
      'Productivity',
      'Shopping',
      'Other',
    ],
    default: 'Other',
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost must be positive'],
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'weekly', 'quarterly'],
    default: 'monthly',
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  nextBilling: {
    type: Date,
    // required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'canceled'],
    default: 'active',
  },
  paymentMethod: {
    type: String,
    default: 'Credit Card',
  },
  notes: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'bg-primary-600',
  },
  logo: {
    type: String,
    default: '📦',
  },
  reminderDays: {
    type: Number,
    default: 7,
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// ✅ AUTO-CALCULATE nextBilling before saving
subscriptionSchema.pre('save', function (next) {
  // Only calculate if startDate or billingCycle is modified, or document is new
  if (this.isModified('startDate') || this.isModified('billingCycle') || this.isNew) {
    const start = new Date(this.startDate);
    const nextBilling = new Date(start);

    switch (this.billingCycle) {
      case 'weekly':
        nextBilling.setDate(start.getDate() + 7);
        break;
      case 'monthly':
        nextBilling.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        nextBilling.setMonth(start.getMonth() + 3);
        break;
      case 'yearly':
        nextBilling.setFullYear(start.getFullYear() + 1);
        break;
    }

    // If nextBilling is in the past, keep adding cycles until it's in the future
    const today = new Date();
    while (nextBilling < today) {
      switch (this.billingCycle) {
        case 'weekly':
          nextBilling.setDate(nextBilling.getDate() + 7);
          break;
        case 'monthly':
          nextBilling.setMonth(nextBilling.getMonth() + 1);
          break;
        case 'quarterly':
          nextBilling.setMonth(nextBilling.getMonth() + 3);
          break;
        case 'yearly':
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
          break;
      }
    }

    this.nextBilling = nextBilling;
  }
  next();
});

export default mongoose.model('Subscription', subscriptionSchema);