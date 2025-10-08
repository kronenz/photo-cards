#!/usr/bin/env node

/**
 * CSS Optimization Script
 * 
 * Feature: 002-integrated-holographic-platform
 * Task: T050 [US5]
 * 
 * Purpose: Optimize Tailwind CSS bundle and analyze unused styles
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BUILD_DIR = './build';
const CSS_ANALYSIS_DIR = './css-analysis';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

function analyzeCSS() {
  logSection('CSS Bundle Analysis');
  
  try {
    // Find CSS files in build directory
    const cssFiles = findCSSFiles(BUILD_DIR);
    
    if (cssFiles.length === 0) {
      log('No CSS files found in build directory. Run build first.', 'yellow');
      return;
    }
    
    let totalSize = 0;
    let totalGzippedSize = 0;
    
    cssFiles.forEach(file => {
      const stats = fs.statSync(file);
      const size = stats.size;
      const gzippedSize = getGzippedSize(file);
      
      totalSize += size;
      totalGzippedSize += gzippedSize;
      
      log(`File: ${path.relative(process.cwd(), file)}`);
      log(`  Size: ${formatBytes(size)}`);
      log(`  Gzipped: ${formatBytes(gzippedSize)}`);
      log(`  Compression: ${((1 - gzippedSize / size) * 100).toFixed(1)}%`);
    });
    
    log(`\nTotal CSS Size: ${formatBytes(totalSize)}`);
    log(`Total Gzipped: ${formatBytes(totalGzippedSize)}`);
    log(`Overall Compression: ${((1 - totalGzippedSize / totalSize) * 100).toFixed(1)}%`);
    
    // Analyze Tailwind classes usage
    analyzeTailwindUsage();
    
  } catch (error) {
    log(`Error analyzing CSS: ${error.message}`, 'red');
  }
}

function findCSSFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.css')) {
        files.push(fullPath);
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    traverse(dir);
  }
  
  return files;
}

function getGzippedSize(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const { gzipSync } = require('zlib');
    return gzipSync(content).length;
  } catch (error) {
    log(`Warning: Could not calculate gzipped size for ${filePath}`, 'yellow');
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeTailwindUsage() {
  logSection('Tailwind Class Usage Analysis');
  
  try {
    // Read source files to find used classes
    const sourceFiles = findSourceFiles('./src');
    const usedClasses = new Set();
    
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const classes = extractTailwindClasses(content);
      classes.forEach(cls => usedClasses.add(cls));
    });
    
    log(`Found ${usedClasses.size} unique Tailwind classes in use`);
    
    // Analyze class patterns
    const patterns = {
      spacing: 0,
      colors: 0,
      typography: 0,
      layout: 0,
      effects: 0,
      animations: 0,
      responsive: 0,
      hover: 0,
      focus: 0,
      dark: 0,
    };
    
    usedClasses.forEach(cls => {
      if (cls.match(/^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-/)) patterns.spacing++;
      if (cls.match(/^(bg|text|border)-/) && !cls.match(/^(bg|text|border)-kbo-/)) patterns.colors++;
      if (cls.match(/^(text|font|leading|tracking)-/)) patterns.typography++;
      if (cls.match(/^(flex|grid|block|inline|hidden|visible|absolute|relative|fixed|sticky)/)) patterns.layout++;
      if (cls.match(/^(shadow|blur|backdrop|filter|transform|scale|rotate|skew|translate)/)) patterns.effects++;
      if (cls.match(/^(animate|transition|duration|ease|delay)-/)) patterns.animations++;
      if (cls.match(/^(sm|md|lg|xl|2xl):/)) patterns.responsive++;
      if (cls.match(/^hover:/)) patterns.hover++;
      if (cls.match(/^focus:/)) patterns.focus++;
      if (cls.match(/^dark:/)) patterns.dark++;
    });
    
    log('\nClass Usage Patterns:');
    Object.entries(patterns).forEach(([pattern, count]) => {
      log(`  ${pattern}: ${count} classes`);
    });
    
    // Check for potential optimizations
    checkOptimizationOpportunities(usedClasses);
    
  } catch (error) {
    log(`Error analyzing Tailwind usage: ${error.message}`, 'red');
  }
}

function findSourceFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (item.match(/\.(svelte|ts|js|html)$/)) {
        files.push(fullPath);
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    traverse(dir);
  }
  
  return files;
}

function extractTailwindClasses(content) {
  const classes = [];
  
  // Match class="..." and className="..." attributes
  const classRegex = /(?:class|className)=["']([^"']+)["']/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const classString = match[1];
    const individualClasses = classString.split(/\s+/);
    classes.push(...individualClasses);
  }
  
  // Match Tailwind classes in template literals
  const templateRegex = /`([^`]*\$\{[^}]*\}[^`]*)`/g;
  while ((match = templateRegex.exec(content)) !== null) {
    const templateContent = match[1];
    const templateClasses = templateContent.match(/\b[a-z-]+:/g) || [];
    classes.push(...templateClasses.map(cls => cls.slice(0, -1)));
  }
  
  return classes.filter(cls => cls && cls.length > 0);
}

function checkOptimizationOpportunities(usedClasses) {
  logSection('Optimization Opportunities');
  
  const suggestions = [];
  
  // Check for unused responsive variants
  const responsiveClasses = Array.from(usedClasses).filter(cls => cls.match(/^(sm|md|lg|xl|2xl):/));
  if (responsiveClasses.length < usedClasses.size * 0.1) {
    suggestions.push('Consider removing unused responsive breakpoints from Tailwind config');
  }
  
  // Check for color usage
  const colorClasses = Array.from(usedClasses).filter(cls => cls.match(/^(bg|text|border)-/));
  const kboColors = colorClasses.filter(cls => cls.match(/kbo-/));
  if (kboColors.length > colorClasses.length * 0.5) {
    suggestions.push('High usage of KBO team colors - consider optimizing color palette');
  }
  
  // Check for animation usage
  const animationClasses = Array.from(usedClasses).filter(cls => cls.match(/^(animate|transition)/));
  if (animationClasses.length < 10) {
    suggestions.push('Low animation usage - consider removing unused animation keyframes');
  }
  
  // Check for dark mode usage
  const darkClasses = Array.from(usedClasses).filter(cls => cls.match(/^dark:/));
  if (darkClasses.length < 5) {
    suggestions.push('Low dark mode usage - consider removing dark mode variants');
  }
  
  if (suggestions.length === 0) {
    log('No obvious optimization opportunities found. CSS is well optimized!', 'green');
  } else {
    suggestions.forEach(suggestion => {
      log(`• ${suggestion}`, 'yellow');
    });
  }
}

function generateOptimizationReport() {
  logSection('Generating Optimization Report');
  
  try {
    // Create analysis directory
    if (!fs.existsSync(CSS_ANALYSIS_DIR)) {
      fs.mkdirSync(CSS_ANALYSIS_DIR, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      buildSize: getBuildSize(),
      cssFiles: findCSSFiles(BUILD_DIR).map(file => ({
        path: path.relative(process.cwd(), file),
        size: fs.statSync(file).size,
        gzippedSize: getGzippedSize(file)
      })),
      recommendations: [
        'Enable PurgeCSS in production builds',
        'Use CSS custom properties for dynamic values',
        'Consider critical CSS inlining for above-the-fold content',
        'Optimize font loading with font-display: swap',
        'Use CSS containment for better performance'
      ]
    };
    
    const reportPath = path.join(CSS_ANALYSIS_DIR, 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log(`Optimization report saved to: ${reportPath}`, 'green');
    
  } catch (error) {
    log(`Error generating report: ${error.message}`, 'red');
  }
}

function getBuildSize() {
  try {
    const stats = fs.statSync(BUILD_DIR);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Main execution
function main() {
  log(`${colors.bold}${colors.blue}CSS Optimization Analysis${colors.reset}`);
  log('Analyzing Tailwind CSS bundle and usage patterns...\n');
  
  analyzeCSS();
  generateOptimizationReport();
  
  log(`\n${colors.green}Analysis complete!${colors.reset}`);
  log('Run "npm run build:optimized" to create an optimized production build.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeCSS, generateOptimizationReport };
