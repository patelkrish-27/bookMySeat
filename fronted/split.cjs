const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appTsxPath = path.join(srcDir, 'App.tsx');
const content = fs.readFileSync(appTsxPath, 'utf-8');

// Ensure directories exist
['types', 'data', 'components', 'pages'].forEach(dir => {
  const p = path.join(srcDir, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p);
});

// Helper to extract sections based on the // ─── comments
function extractSection(name) {
  const regex = new RegExp(`// ─── ${name} ─+([\\s\\S]*?)(?=// ───|$)`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// 1. Types
const typesContent = extractSection('Types');
fs.writeFileSync(path.join(srcDir, 'types', 'index.ts'), `export ${typesContent.replace(/interface /g, 'export interface ').replace(/type /g, 'export type ')}`);

// 2. Data & Helper
const dataContent = extractSection('Data');
const seatsContent = extractSection('Generate seats');
fs.writeFileSync(path.join(srcDir, 'data', 'mockData.ts'), `import { Movie, FoodItem, SeatItem } from '../types';\n\n${dataContent.replace(/const /g, 'export const ')}\n\n${seatsContent.replace(/function /g, 'export function ')}`);

// Helper to generate a component file
function createComponent(folder, name, sectionName, imports) {
  let compContent = extractSection(sectionName);
  if (name === 'App') {
    compContent = extractSection('Root App');
  }
  
  if (!compContent) {
      console.warn(`Could not find section ${sectionName} for ${name}`);
      return;
  }
  
  const fileContent = `${imports}\n\nexport ${compContent.startsWith('export ') ? compContent.substring(7) : compContent}`;
  fs.writeFileSync(path.join(srcDir, folder, `${name}.tsx`), fileContent);
}

const baseImports = `import { useState, useEffect, useRef } from 'react';\nimport { Page, Movie, SeatItem, FoodItem } from '../types';\nimport { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';`;

// 3. Components
createComponent('components', 'Nav', 'Navigation', baseImports);
createComponent('components', 'MovieCard', 'Movie Card', baseImports);

// 4. Pages
const pageImports = `${baseImports}\nimport { Nav } from '../components/Nav';\nimport { MovieCard } from '../components/MovieCard';`;
createComponent('pages', 'HomePage', 'Home Page', pageImports);
createComponent('pages', 'ListingPage', 'Movie Listing Page', pageImports);
createComponent('pages', 'DetailsPage', 'Movie Details Page', pageImports);
createComponent('pages', 'SeatsPage', 'Seat Selection', pageImports);
createComponent('pages', 'FoodPage', 'Food Page', pageImports);
createComponent('pages', 'CheckoutPage', 'Checkout', pageImports);
createComponent('pages', 'ConfirmationPage', 'Confirmation', pageImports);
createComponent('pages', 'ProfilePage', 'Profile Page', pageImports);
createComponent('pages', 'HistoryPage', 'History Page', pageImports);

// 5. New App.tsx
const newAppContent = `import { useState, useEffect } from 'react';
import { Page, Movie } from './types';
import { DEMO_MOVIES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP } from './data/mockData';
import { Nav } from './components/Nav';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { DetailsPage } from './pages/DetailsPage';
import { SeatsPage } from './pages/SeatsPage';
import { FoodPage } from './pages/FoodPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';

// ─── Root App ─────────────────────────────────────────────────────────────────
${extractSection('Root App')}
`;
fs.writeFileSync(path.join(srcDir, 'App.tsx'), newAppContent);

console.log('Successfully split App.tsx');
