/* ================================================================
   OPTIMA LABS — Cloud Functions v2
   Mirrors the setAdminClaim pattern from the Gym/APEXFIT project.
   ================================================================ */
'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

// Set once via: firebase functions:secrets:set ADMIN_SECRET
const ADMIN_SECRET = defineSecret('ADMIN_SECRET');

// ══════════════════════════════════════════════════════════════════════════════
// setAdminClaim — HTTP callable, guarded by x-admin-secret header.
// Grants the Firestore/Storage-rules custom claim { admin: true } to any
// email you pass in. Safe to call repeatedly for multiple admins.
//
//   curl -X POST https://<region>-<project>.cloudfunctions.net/setAdminClaim \
//     -H "Content-Type: application/json" \
//     -H "x-admin-secret: <ADMIN_SECRET>" \
//     -d '{"email":"pankaj.ydv707@gmail.com"}'
// ══════════════════════════════════════════════════════════════════════════════
exports.setAdminClaim = onRequest(
  { secrets: [ADMIN_SECRET], region: 'asia-east1' },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== ADMIN_SECRET.value()) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'email is required' });
      return;
    }

    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`Admin claim granted to: ${email}`);
      res.json({ success: true, message: `Admin claim granted to ${email}` });
    } catch (err) {
      console.error('setAdminClaim error:', err);
      res.status(500).json({ error: err.message });
    }
  }
);
