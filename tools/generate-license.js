const crypto = require('crypto');

// This script is meant to be run by the developer via Node.js
// Usage: node tools/generate-license.js --machine-id abc123 --shop-name "Test Shop" --days 365

// REPLACE THIS WITH YOUR OWN SECRET KEY BEFORE SHIPPING (min 32 chars recommended)
// MUST MATCH THE KEY IN main.js!
const SECRET_KEY = 'REPLACE_WITH_YOUR_SECRET_KEY_MIN_32_CHARS';

function printUsage() {
  console.log(`
Usage: node generate-license.js [options]

Options:
  --machine-id <hash>    (Required) The 64-char fingerprint of the target machine.
  --shop-name "<name>"   (Required) The name of the shop for this license.
  --days <number>        Number of days until expiry (default: no expiry).
  --no-expiry            Explicitly set no expiry.
  `);
  process.exit(1);
}

const args = process.argv.slice(2);
const options = {
  machineId: null,
  shopName: null,
  days: null,
  noExpiry: false,
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--machine-id') options.machineId = args[++i];
  else if (args[i] === '--shop-name') options.shopName = args[++i];
  else if (args[i] === '--days') options.days = parseInt(args[++i], 10);
  else if (args[i] === '--no-expiry') options.noExpiry = true;
  else if (args[i] === '--help') printUsage();
}

if (!options.machineId || !options.shopName) {
  console.error("Error: --machine-id and --shop-name are required.\n");
  printUsage();
}

const issued_at = new Date().toISOString();
let expires_at = null;

if (!options.noExpiry && options.days) {
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + options.days);
  expires_at = expDate.toISOString();
}

const payload = {
  machine_id: options.machineId,
  issued_at,
  expires_at,
  shop_name: options.shopName,
};

// Compute HMAC-SHA256 signature
const dataToSign = JSON.stringify(payload);
const sig = crypto.createHmac('sha256', SECRET_KEY).update(dataToSign).digest('hex');

const licenseObj = {
  ...payload,
  sig
};

console.log('\n--- LICENSE JSON ---');
console.log(JSON.stringify(licenseObj, null, 2));
console.log('--------------------\n');
console.log('Copy the JSON above and paste it into the application to activate.');
