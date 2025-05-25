#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const TRANSLATION_DIR = path.join(__dirname, '../translations');
const LANGUAGES = ['en', 'ar', 'fr'];

function loadTranslations(lang) {
  const filePath = path.join(TRANSLATION_DIR, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}

function saveTranslations(lang, translations) {
  const filePath = path.join(TRANSLATION_DIR, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🌍 Translation Key Helper\n');
  
  const key = await question('Enter the translation key (e.g., "products.addProduct"): ');
  if (!key) {
    console.log('❌ Key is required');
    rl.close();
    return;
  }

  // Check if key already exists
  const enTranslations = loadTranslations('en');
  if (getNestedValue(enTranslations, key)) {
    console.log(`⚠️  Key "${key}" already exists with value: "${getNestedValue(enTranslations, key)}"`);
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      rl.close();
      return;
    }
  }

  console.log('\nEnter translations for each language:\n');

  const translations = {};
  
  // Get translations for each language
  for (const lang of LANGUAGES) {
    const langName = {
      en: 'English',
      ar: 'Arabic',
      fr: 'French'
    }[lang];
    
    let value;
    if (lang === 'en') {
      value = await question(`${langName}: `);
      if (!value) {
        console.log('❌ English translation is required');
        rl.close();
        return;
      }
    } else {
      value = await question(`${langName} (optional): `);
      if (!value) {
        value = `[${key.toUpperCase()}_${lang.toUpperCase()}]`; // Placeholder
      }
    }
    
    translations[lang] = value;
  }

  // Update all translation files
  console.log('\n📝 Updating translation files...\n');
  
  for (const lang of LANGUAGES) {
    const existing = loadTranslations(lang);
    setNestedValue(existing, key, translations[lang]);
    saveTranslations(lang, existing);
    console.log(`✅ Updated ${lang}.json`);
  }

  console.log('\n🎉 Translation key added successfully!\n');
  console.log('Usage in components:');
  console.log(`const { t } = useTranslation();`);
  console.log(`const text = t('${key}');`);
  console.log('\nUsage in API routes:');
  console.log(`const message = await translateSuccessMessage('${key}', {}, locale);`);

  rl.close();
}

main().catch(console.error); 