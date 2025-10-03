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
      "appName": "KBO 홀로그래픽 카드 커뮤니티",
      "appUrl": "http://localhost:5173",
      "hideControls": false,
      "senderName": "KBO Cards",
      "senderAddress": "noreply@kbo-cards.com",
      "verificationTemplate": {
        "subject": "KBO 카드 커뮤니티 이메일 인증",
        "body": "<p>안녕하세요!</p><p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p><p><a href='{APP_URL}/_/#/auth/confirm-verification/{TOKEN}'>이메일 인증하기</a></p><p>감사합니다.<br/>KBO 홀로그래픽 카드 커뮤니티</p>"
      },
      "resetPasswordTemplate": {
        "subject": "KBO 카드 커뮤니티 비밀번호 재설정",
        "body": "<p>안녕하세요!</p><p>아래 링크를 클릭하여 비밀번호를 재설정해주세요:</p><p><a href='{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}'>비밀번호 재설정하기</a></p><p>감사합니다.<br/>KBO 홀로그래픽 카드 커뮤니티</p>"
      }
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