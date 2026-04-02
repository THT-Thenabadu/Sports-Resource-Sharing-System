const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%';
  let password = '';
  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, chars.length);
    password += chars[index];
  }
  return password;
}

async function generateUniqueSecurityUsername(baseName) {
  const cleanBase = String(baseName || 'owner')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10) || 'owner';

  let attempts = 0;
  while (attempts < 20) {
    const suffix = crypto.randomInt(1000, 9999);
    const candidate = `sec_${cleanBase}${suffix}`;
    const exists = await User.exists({ securityUsername: candidate });
    if (!exists) return candidate;
    attempts += 1;
  }

  return `sec_owner${Date.now().toString().slice(-6)}`;
}

async function ensureOwnerSecurityCredentials(userDoc) {
  if (!userDoc) return null;
  if (userDoc.role !== 'owner') return userDoc;
  if (userDoc.securityUsername && userDoc.securityPasswordHash && userDoc.securityPasswordPlain) {
    return userDoc;
  }

  const username = userDoc.securityUsername || await generateUniqueSecurityUsername(userDoc.name);
  const plainPassword = generatePassword(10);
  const hash = await bcrypt.hash(plainPassword, 10);

  userDoc.securityUsername = username;
  userDoc.securityPasswordHash = hash;
  userDoc.securityPasswordPlain = plainPassword;
  userDoc.securityCredentialsCreatedAt = new Date();
  await userDoc.save();

  return userDoc;
}

module.exports = {
  ensureOwnerSecurityCredentials,
};
