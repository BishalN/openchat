#!/usr/bin/env node

const { execSync } = require('child_process');

const componentName = process.argv[2];

if (!componentName) {
    console.error('Usage: node add-prompt-kit-component.js <ComponentName>');
    process.exit(1);
}

const url = `https://prompt-kit.com/c/${componentName}.json`;

try {
    execSync(`npx shadcn@latest add "${url}"`, { stdio: 'inherit' });
} catch (error) {
    process.exit(error.status || 1);
} 