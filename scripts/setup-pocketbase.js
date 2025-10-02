import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const POCKETBASE_VERSION = '0.22.0';
const PLATFORM = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'darwin' : 'linux';
const ARCH = process.arch === 'x64' ? 'amd64' : 'arm64';
const EXTENSION = process.platform === 'win32' ? '.zip' : '.tar.gz';

const DOWNLOAD_URL = `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_${PLATFORM}_${ARCH}${EXTENSION}`;

console.log('Setting up PocketBase for local development...');

// Create pocketbase directory
const pbDir = join(process.cwd(), 'pocketbase');
if (!existsSync(pbDir)) {
  mkdirSync(pbDir, { recursive: true });
}

// Download and extract PocketBase
try {
  console.log(`Downloading PocketBase from: ${DOWNLOAD_URL}`);
  
  if (process.platform === 'win32') {
    // Windows - download zip and extract
    execSync(`curl -L -o pocketbase/pocketbase.zip "${DOWNLOAD_URL}"`, { stdio: 'inherit' });
    execSync('tar -xf pocketbase/pocketbase.zip -C pocketbase/', { stdio: 'inherit' });
    execSync('del pocketbase\\pocketbase.zip', { stdio: 'inherit' });
  } else {
    // Unix-like systems
    execSync(`curl -L -o pocketbase/pocketbase.tar.gz "${DOWNLOAD_URL}"`, { stdio: 'inherit' });
    execSync('tar -xzf pocketbase/pocketbase.tar.gz -C pocketbase/', { stdio: 'inherit' });
    execSync('rm pocketbase/pocketbase.tar.gz', { stdio: 'inherit' });
    execSync('chmod +x pocketbase/pocketbase', { stdio: 'inherit' });
  }
  
  console.log('✅ PocketBase downloaded successfully');
} catch (error) {
  console.error('❌ Failed to download PocketBase:', error.message);
  process.exit(1);
}

// Create initial PocketBase configuration
const pbConfig = {
  "settings": {
    "meta": {
      "appName": "Holographic Card Community",
      "appUrl": "http://localhost:5173"
    },
    "logs": {
      "maxDays": 7
    },
    "smtp": {
      "enabled": false,
      "host": "",
      "port": 587,
      "username": "",
      "password": "",
      "authMethod": "",
      "tls": true
    },
    "s3": {
      "enabled": false
    },
    "adminAuthToken": {
      "duration": 1209600
    },
    "adminPasswordResetToken": {
      "duration": 1800
    },
    "adminFileToken": {
      "duration": 120
    },
    "recordAuthToken": {
      "duration": 1209600
    },
    "recordPasswordResetToken": {
      "duration": 1800
    },
    "recordEmailChangeToken": {
      "duration": 1800
    },
    "recordVerificationToken": {
      "duration": 604800
    },
    "recordFileToken": {
      "duration": 120
    },
    "emailAuth": {
      "enabled": true,
      "exceptDomains": null,
      "onlyDomains": null,
      "minPasswordLength": 8
    },
    "googleAuth": {
      "enabled": false,
      "clientId": "",
      "clientSecret": ""
    },
    "githubAuth": {
      "enabled": false,
      "clientId": "",
      "clientSecret": ""
    }
  }
};

// Create pb_data directory
const pbDataDir = join(pbDir, 'pb_data');
if (!existsSync(pbDataDir)) {
  mkdirSync(pbDataDir, { recursive: true });
}

writeFileSync(join(pbDataDir, 'settings.json'), JSON.stringify(pbConfig, null, 2));

console.log('✅ PocketBase setup completed');
console.log('📝 To start PocketBase: npm run pocketbase');
console.log('🌐 Admin UI will be available at: http://localhost:8090/_/');