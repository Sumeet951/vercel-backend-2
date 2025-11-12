import mongoose from 'mongoose';
import User from './models/user.model.js';
import Subscription from './models/subscription.model.js';

// Helper function to calculate next billing
const calculateNextBilling = (startDate, billingCycle) => {
  const start = new Date(startDate);
  const next = new Date(start);
  const today = new Date();

  switch (billingCycle) {
    case 'weekly':
      next.setDate(start.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(start.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(start.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(start.getFullYear() + 1);
      break;
  }

  // Keep adding cycles until we get a future date
  while (next < today) {
    switch (billingCycle) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
  }

  return next;
};

const sampleSubscriptions = [
  {
    name: 'Netflix',
    category: 'Entertainment',
    cost: 15.99,
    billingCycle: 'monthly',
    startDate: new Date('2024-01-01'),
    color: 'bg-red-500',
    logo: '🎬',
    description: 'Streaming service for movies and TV shows',
  },
  {
    name: 'Spotify',
    category: 'Music',
    cost: 9.99,
    billingCycle: 'monthly',
    startDate: new Date('2024-02-01'),
    color: 'bg-green-500',
    logo: '🎵',
    description: 'Music streaming service',
  },
  {
    name: 'Adobe Creative Cloud',
    category: 'Software',
    cost: 52.99,
    billingCycle: 'monthly',
    startDate: new Date('2024-01-15'),
    color: 'bg-red-600',
    logo: '🎨',
    description: 'Creative software suite',
  },
  {
    name: 'GitHub Pro',
    category: 'Software',
    cost: 7.00,
    billingCycle: 'monthly',
    startDate: new Date('2024-03-01'),
    color: 'bg-gray-800',
    logo: '💻',
    description: 'Code hosting platform',
  },
  {
    name: 'Disney+',
    category: 'Entertainment',
    cost: 7.99,
    billingCycle: 'monthly',
    startDate: new Date('2024-04-01'),
    color: 'bg-blue-600',
    logo: '🏰',
    description: 'Disney streaming service',
  },
  {
    name: 'Notion',
    category: 'Productivity',
    cost: 10.00,
    billingCycle: 'monthly',
    startDate: new Date('2024-05-01'),
    color: 'bg-gray-900',
    logo: '📝',
    description: 'All-in-one workspace',
  },
  {
    name: 'ChatGPT Plus',
    category: 'Software',
    cost: 20.00,
    billingCycle: 'monthly',
    startDate: new Date('2024-06-01'),
    color: 'bg-emerald-600',
    logo: '🤖',
    description: 'AI assistant',
  },
  {
    name: 'Figma Professional',
    category: 'Software',
    cost: 15.00,
    billingCycle: 'monthly',
    startDate: new Date('2024-07-01'),
    color: 'bg-purple-600',
    logo: '🎨',
    description: 'Design tool',
  },
  {
    name: 'Amazon Prime',
    category: 'Shopping',
    cost: 14.99,
    billingCycle: 'monthly',
    startDate: new Date('2024-08-01'),
    color: 'bg-orange-500',
    logo: '📦',
    description: 'Prime membership',
  },
  {
    name: 'YouTube Premium',
    category: 'Entertainment',
    cost: 11.99,
    billingCycle: 'monthly',
    startDate: new Date('2024-09-01'),
    color: 'bg-red-600',
    logo: '📺',
    description: 'Ad-free YouTube',
  },
  {
    name: 'Dropbox',
    category: 'Cloud Storage',
    cost: 11.99,
    billingCycle: 'monthly',
    startDate: new Date('2024-10-01'),
    color: 'bg-blue-500',
    logo: '☁️',
    description: 'Cloud storage',
  },
  {
    name: 'Grammarly Premium',
    category: 'Productivity',
    cost: 12.00,
    billingCycle: 'monthly',
    startDate: new Date('2024-11-01'),
    color: 'bg-green-600',
    logo: '✍️',
    description: 'Writing assistant',
  },
];

const seedDatabase = async () => {
  try {
    const MONGO_URL = "mongodb://127.0.0.1:27017/SEM5";
    
    console.log('🔗 Connecting to MongoDB...');
    console.log('   URL:', MONGO_URL);
    
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB Connected\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const deletedUsers = await User.deleteMany({});
    const deletedSubs = await Subscription.deleteMany({});
    console.log(`   Deleted ${deletedUsers.deletedCount} users`);
    console.log(`   Deleted ${deletedSubs.deletedCount} subscriptions\n`);

    // Create test user
    console.log('👤 Creating test user...');
    const user = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Test@1234',
    });
    console.log('   Email:', user.email);
    console.log('   ID:', user._id, '\n');

    // Create subscriptions with calculated nextBilling
    console.log('📦 Creating subscriptions...');
    const subscriptionsToCreate = sampleSubscriptions.map(sub => ({
      ...sub,
      user: user._id,
      nextBilling: calculateNextBilling(sub.startDate, sub.billingCycle), // ✅ Auto-calculate
    }));

    const subscriptions = await Subscription.create(subscriptionsToCreate);
    console.log(`   Created ${subscriptions.length} subscriptions\n`);

    // List created subscriptions
    console.log('Created Subscriptions:');
    subscriptions.forEach((sub, index) => {
      const daysUntil = Math.ceil((new Date(sub.nextBilling) - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   ${index + 1}. ${sub.logo} ${sub.name} - $${sub.cost}/${sub.billingCycle}`);
      console.log(`       Next billing: ${sub.nextBilling.toLocaleDateString()} (in ${daysUntil} days)`);
    });

    console.log('\n═══════════════════════════════════════');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: Test@1234\n');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed error:', error.message);
    console.error('Full error:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
};

seedDatabase();