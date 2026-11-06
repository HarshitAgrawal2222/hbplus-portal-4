// Bootstrap the FIRST admin from your machine (never from the client):
//   export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
//   node functions/make-admin.js you@hbplus.fit
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp();
(async () => {
  const email = process.argv[2];
  if (!email) throw new Error('Usage: node make-admin.js <email>');
  const u = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(u.uid, { role: 'admin' });
  await getFirestore().doc(`users/${u.uid}`).set({ role: 'admin' }, { merge: true });
  console.log('Admin set for', email, '(user must sign out and in again).');
})();
