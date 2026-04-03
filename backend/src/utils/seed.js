const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Charity = require('../models/Charity');

const charities = [
  {
    name: 'Clean Water Foundation',
    slug: 'clean-water-foundation',
    description: 'We work to provide clean, safe drinking water to communities in Sub-Saharan Africa and South Asia. Since 2010, we have helped over 2 million people gain access to reliable water sources through well-drilling programs, rainwater harvesting, and community education.',
    shortDescription: 'Providing clean water to 2M+ people across Africa and Asia.',
    category: 'health',
    country: 'Global',
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
    coverImage: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=1200',
    website: 'https://cleanwaterfoundation.org',
    contactEmail: 'info@cleanwaterfoundation.org',
  },
  {
    name: 'Children\'s Education Alliance',
    slug: 'childrens-education-alliance',
    description: 'Every child deserves quality education. Our programs build schools, train teachers, and provide scholarships in rural communities across Southeast Asia and East Africa. We have helped over 50,000 children stay in school.',
    shortDescription: 'Building schools and funding scholarships for 50,000+ children.',
    category: 'children',
    country: 'Global',
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
    coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200',
    website: 'https://childrenedalliance.org',
    contactEmail: 'hello@childrenedalliance.org',
  },
  {
    name: 'Hunger Relief Network',
    slug: 'hunger-relief-network',
    description: 'Food insecurity affects 800 million people globally. We operate food banks, community kitchens, and sustainable farming initiatives that help families break the cycle of poverty and hunger.',
    shortDescription: 'Fighting food insecurity through food banks and sustainable farming.',
    category: 'poverty',
    country: 'Global',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
    coverImage: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200',
    website: 'https://hungerrelief.org',
    contactEmail: 'contact@hungerrelief.org',
  },
  {
    name: 'Ocean Conservation Trust',
    slug: 'ocean-conservation-trust',
    description: 'Our oceans are in crisis. We lead beach clean-ups, fund marine research, and advocate for plastic pollution legislation. Our 10,000-strong volunteer network has removed over 500 tonnes of plastic from oceans worldwide.',
    shortDescription: 'Removing 500+ tonnes of plastic from oceans with 10,000 volunteers.',
    category: 'environment',
    country: 'Global',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600',
    coverImage: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=1200',
    website: 'https://oceanconservation.org',
    contactEmail: 'info@oceanconservation.org',
  },
  {
    name: 'Mental Health Matters',
    slug: 'mental-health-matters',
    description: 'Mental health is just as important as physical health. We provide free counselling services, crisis hotlines, and community support programs to individuals who cannot afford private care.',
    shortDescription: 'Free counselling and crisis support for those who need it most.',
    category: 'health',
    country: 'United Kingdom',
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600',
    coverImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200',
    website: 'https://mentalhealthmatters.org.uk',
    contactEmail: 'support@mentalhealthmatters.org.uk',
  },
  {
    name: 'Shelter & Hope',
    slug: 'shelter-and-hope',
    description: 'No one should sleep on the streets. We operate emergency shelters, transitional housing programs, and job training initiatives to help homeless individuals rebuild their lives with dignity.',
    shortDescription: 'Emergency shelters and job training for homeless individuals.',
    category: 'poverty',
    country: 'United Kingdom',
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
    website: 'https://shelterandhope.org',
    contactEmail: 'help@shelterandhope.org',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Charity.deleteMany({});
    await User.deleteMany({ role: 'admin' });

    // Seed charities
    await Charity.insertMany(charities);
    console.log(`✅ Seeded ${charities.length} charities`);

    // Seed admin user
    await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@golfcharity.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isVerified: true,
    });
    console.log(`✅ Admin user created: ${process.env.ADMIN_EMAIL}`);

    console.log('🌱 Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
