// scripts/seed-categories.js
// Script to seed the database with the required service categories and subcategories

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Service categories and subcategories as defined in the requirements
const serviceCategories = [
  {
    name: 'HOME SERVICES',
    name_fr: 'SERVICES DOMICILE',
    icon: '🏠',
    subcategories: [
      { name: 'Cleaning', name_fr: 'Nettoyage', description: 'House, office, post-construction cleaning services' },
      { name: 'Repairs', name_fr: 'Réparations', description: 'Plumbing, electrical, carpentry, appliance repairs' },
      { name: 'Maintenance', name_fr: 'Entretien', description: 'Garden, pool, AC, security systems maintenance' },
      { name: 'Renovation', name_fr: 'Rénovation', description: 'Painting, tiling, flooring services' }
    ]
  },
  {
    name: 'PROFESSIONAL SERVICES',
    name_fr: 'SERVICES PROFESSIONNELS',
    icon: '💼',
    subcategories: [
      { name: 'Tutoring', name_fr: 'Tutorat', description: 'All subjects, languages, test prep' },
      { name: 'Translation', name_fr: 'Traduction', description: 'French, English, local languages translation' },
      { name: 'Accounting', name_fr: 'Comptabilité', description: 'Accounting & bookkeeping services' },
      { name: 'IT Support', name_fr: 'Support Informatique', description: 'Computer repair, software, networking' },
      { name: 'Legal Consultation', name_fr: 'Consultation Juridique', description: 'Legal advice and services' },
      { name: 'Administrative Assistance', name_fr: 'Assistance Administrative', description: 'Administrative support services' }
    ]
  },
  {
    name: 'TRANSPORT & LOGISTICS',
    name_fr: 'TRANSPORT & LOGISTIQUE',
    icon: '🚚',
    subcategories: [
      { name: 'Moving Services', name_fr: 'Services de Déménagement', description: 'Residential, commercial moving' },
      { name: 'Delivery', name_fr: 'Livraison', description: 'Same-day, scheduled, bulk delivery' },
      { name: 'Airport Transfer', name_fr: 'Transfert Aéroport', description: 'Airport pickup/drop-off services' },
      { name: 'Furniture Assembly', name_fr: 'Montage de Meubles', description: 'Furniture assembly and installation' }
    ]
  },
  {
    name: 'EVENTS & HOSPITALITY',
    name_fr: 'ÉVÉNEMENTS & HOSPITALITÉ',
    icon: '🎉',
    subcategories: [
      { name: 'Catering', name_fr: 'Traiteur', description: 'Traditional, modern, dietary restrictions catering' },
      { name: 'Event Planning', name_fr: 'Planification d\'Événements', description: 'Event planning and coordination' },
      { name: 'Photography', name_fr: 'Photographie', description: 'Photography and videography services' },
      { name: 'Decoration', name_fr: 'Décoration', description: 'Decoration and setup services' },
      { name: 'Entertainment', name_fr: 'Divertissement', description: 'DJ, music, traditional performances' }
    ]
  },
  {
    name: 'PERSONAL CARE',
    name_fr: 'SOINS PERSONNELS',
    icon: '👤',
    subcategories: [
      { name: 'Childcare', name_fr: 'Garde d\'Enfants', description: 'Babysitting and childcare services' },
      { name: 'Elderly Care', name_fr: 'Soins aux Personnes Âgées', description: 'Elderly care and companionship' },
      { name: 'Pet Care', name_fr: 'Soins pour Animaux', description: 'Pet care and walking services' },
      { name: 'Personal Shopping', name_fr: 'Shopping Personnel', description: 'Personal shopping and errands' },
      { name: 'Fitness Training', name_fr: 'Entraînement Physique', description: 'Fitness training and coaching' }
    ]
  },
  {
    name: 'BUSINESS SERVICES',
    name_fr: 'SERVICES AUX ENTREPRISES',
    icon: '🏢',
    subcategories: [
      { name: 'Office Cleaning', name_fr: 'Nettoyage de Bureau', description: 'Office cleaning and maintenance' },
      { name: 'Security Services', name_fr: 'Services de Sécurité', description: 'Security services for businesses' },
      { name: 'Equipment Rental', name_fr: 'Location d\'Équipement', description: 'Equipment rental and setup' },
      { name: 'Business Consulting', name_fr: 'Conseil aux Entreprises', description: 'Business consulting services' },
      { name: 'Marketing', name_fr: 'Marketing', description: 'Marketing and social media management' }
    ]
  }
];

// Function to seed the categories
async function seedCategories() {
  console.log('Starting to seed categories...');
  
  try {
    // First, insert main categories
    for (let i = 0; i < serviceCategories.length; i++) {
      const category = serviceCategories[i];
      
      console.log(`Adding main category: ${category.name}`);
      
      // Insert main category
      const { data: mainCategory, error: mainCategoryError } = await supabase
        .from('categories')
        .upsert({
          name: category.name,
          name_fr: category.name_fr,
          icon: category.icon,
          description: `Main category for ${category.name}`,
          is_active: true,
          sort_order: i + 1,
          parent_id: null
        })
        .select()
        .single();
      
      if (mainCategoryError) {
        console.error(`Error adding main category ${category.name}:`, mainCategoryError);
        continue;
      }
      
      // Insert subcategories
      for (let j = 0; j < category.subcategories.length; j++) {
        const subcategory = category.subcategories[j];
        
        console.log(`  Adding subcategory: ${subcategory.name}`);
        
        const { error: subcategoryError } = await supabase
          .from('categories')
          .upsert({
            name: subcategory.name,
            name_fr: subcategory.name_fr,
            description: subcategory.description,
            parent_id: mainCategory.id,
            is_active: true,
            sort_order: j + 1
          });
        
        if (subcategoryError) {
          console.error(`Error adding subcategory ${subcategory.name}:`, subcategoryError);
        }
      }
    }
    
    console.log('Categories seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}

// Run the seed function
seedCategories()
  .then(() => {
    console.log('Seeding process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });