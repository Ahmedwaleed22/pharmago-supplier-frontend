#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LANGUAGES = ['en', 'ar', 'fr'];
const TRANSLATIONS_DIR = path.join(__dirname, '../translations');

// Load translation files
function loadTranslations(lang) {
  const filePath = path.join(TRANSLATIONS_DIR, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }
  return {};
}

// Get all translation keys from a nested object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Check for missing translations
function checkMissingTranslations() {
  console.log('🔍 Checking for missing translations...\n');
  
  const allTranslations = {};
  const allKeys = new Set();
  
  // Load all translations and collect all possible keys
  for (const lang of LANGUAGES) {
    allTranslations[lang] = loadTranslations(lang);
    const keys = getAllKeys(allTranslations[lang]);
    keys.forEach(key => allKeys.add(key));
  }
  
  let hasMissing = false;
  
  // Check each language for missing keys
  for (const lang of LANGUAGES) {
    const langKeys = new Set(getAllKeys(allTranslations[lang]));
    const missingKeys = [...allKeys].filter(key => !langKeys.has(key));
    
    if (missingKeys.length > 0) {
      hasMissing = true;
      console.log(`❌ Missing translations in ${lang}.json:`);
      missingKeys.forEach(key => {
        console.log(`   - ${key}`);
      });
      console.log('');
    } else {
      console.log(`✅ ${lang}.json has all translations`);
    }
  }
  
  if (!hasMissing) {
    console.log('\n🎉 All translation files are complete!');
  }
  
  return !hasMissing;
}

// Check for unused translation keys in the codebase
function checkUnusedTranslations() {
  console.log('\n🔍 Checking for unused translation keys...\n');
  
  const enTranslations = loadTranslations('en');
  const allKeys = getAllKeys(enTranslations);
  
  // Simple pattern to find t('key') or t("key") usage
  const usagePattern = /t\(['"`]([^'"`]+)['"`]\)/g;
  
  // Search in common directories
  const searchDirs = [
    path.join(__dirname, '../app'),
    path.join(__dirname, '../components'),
    path.join(__dirname, '../lib'),
    path.join(__dirname, '../hooks'),
  ];
  
  const usedKeys = new Set();
  
  function searchInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    
    while ((match = usagePattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  }
  
  function searchInDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        searchInDirectory(itemPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js') || item.endsWith('.jsx')) {
        searchInFile(itemPath);
      }
    }
  }
  
  // Search for key usage
  searchDirs.forEach(searchInDirectory);
  
  // Find unused keys
  const unusedKeys = allKeys.filter(key => !usedKeys.has(key));
  
  if (unusedKeys.length > 0) {
    console.log('⚠️  Potentially unused translation keys:');
    unusedKeys.forEach(key => {
      console.log(`   - ${key}`);
    });
    console.log(`\n${unusedKeys.length} potentially unused keys found.`);
  } else {
    console.log('✅ All translation keys appear to be in use');
  }
  
  console.log(`\n📊 Translation Statistics:`);
  console.log(`   Total translation keys: ${allKeys.length}`);
  console.log(`   Used keys: ${usedKeys.size}`);
  console.log(`   Potentially unused: ${unusedKeys.length}`);
}

// Check for placeholder translations
function checkPlaceholders() {
  console.log('\n🔍 Checking for placeholder translations...\n');
  
  let hasPlaceholders = false;
  
  for (const lang of LANGUAGES) {
    if (lang === 'en') continue; // Skip English as it's the source
    
    const translations = loadTranslations(lang);
    const allKeys = getAllKeys(translations);
    
    const placeholders = allKeys.filter(key => {
      const value = getNestedValue(translations, key);
      return value && value.startsWith('[') && value.endsWith(']');
    });
    
    if (placeholders.length > 0) {
      hasPlaceholders = true;
      console.log(`🔸 Placeholder translations in ${lang}.json:`);
      placeholders.forEach(key => {
        const value = getNestedValue(translations, key);
        console.log(`   - ${key}: ${value}`);
      });
      console.log('');
    }
  }
  
  if (!hasPlaceholders) {
    console.log('✅ No placeholder translations found');
  }
}

// Helper function to get nested value
function getNestedValue(obj, key) {
  return key.split('.').reduce((current, part) => current && current[part], obj);
}

// Main function
function main() {
  console.log('🌍 Translation Test Suite\n');
  console.log('=' .repeat(50));
  
  try {
    checkMissingTranslations();
    checkPlaceholders();
    checkUnusedTranslations();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Translation test completed!');
  } catch (error) {
    console.error('❌ Error running translation tests:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkMissingTranslations,
  checkUnusedTranslations,
  checkPlaceholders
}; 