const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { beforeUserCreated, beforeUserSignedIn, HttpsError } = require('firebase-functions/v2/identity');
const { onCall } = require('firebase-functions/v2/https');

initializeApp();
const ALLOWED_DOMAIN = 'hbplus.fit';

function assertOrgUser(user) {
  const email = (user.email || '').toLowerCase();
  // Verification is NOT checked here: password sign-ups are unverified at creation. Firestore rules require email_verified for all data.
  if (!email.endsWith('@' + ALLOWED_DOMAIN)) {
    throw new HttpsError('permission-denied', 'Access restricted. Please login using your official domain email.');
  }
}

// Runs on Google's servers BEFORE the account is created: non-org accounts never exist.
exports.validateOnCreate = beforeUserCreated((event) => {
  assertOrgUser(event.data);
  return { customClaims: { role: 'user' } };
});

// Runs on every sign-in: also blocks pre-existing or later-changed accounts.
exports.validateOnSignIn = beforeUserSignedIn((event) => {
  assertOrgUser(event.data);
});

// Admin-only role management. Clients can never set roles directly.
exports.setUserRole = onCall(async (req) => {
  if (!req.auth || req.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admins only.');
  const { uid, role } = req.data || {};
  if (typeof uid !== 'string' || !['admin', 'user'].includes(role)) throw new HttpsError('invalid-argument', 'Bad input.');
  await getAuth().setCustomUserClaims(uid, { role });
  await getFirestore().doc(`users/${uid}`).update({ role });
  return { ok: true };
});
