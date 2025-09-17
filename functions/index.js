const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Award "first-log" badge when a user creates their first activity
exports.onActivityCreate = functions.firestore.document('activities/{activityId}').onCreate(async (snap, context) => {
  const activity = snap.data();
  const userId = activity.userId;
  if (!userId) return null;

  const userBadgesRef = db.collection('users').doc(userId).collection('badges');
  const firstLogBadgeRef = userBadgesRef.doc('first-log');
  const firstLogBadge = await firstLogBadgeRef.get();
  if (!firstLogBadge.exists) {
    // Award badge
    await firstLogBadgeRef.set({ earnedAt: admin.firestore.FieldValue.serverTimestamp(), reason: 'First activity logged' });
  }

  // Check for meat-free day: if activity.category === 'food' and activity.type not meat
  try {
    if (activity.category === 'food' && activity.type && !['mutton', 'beef', 'pork', 'chicken'].includes(activity.type)) {
      // This is a simplistic rule: award meat-free-day badge if user logs a non-meat meal
      const meatBadgeRef = userBadgesRef.doc('meat-free-day');
      const meatBadge = await meatBadgeRef.get();
      if (!meatBadge.exists) {
        await meatBadgeRef.set({ earnedAt: admin.firestore.FieldValue.serverTimestamp(), reason: 'Logged meat-free food' });
      }
    }
  } catch (e) {
    console.error('Error evaluating meat-free:', e);
  }

  return null;
});

// Update challenge progress on activity writes (simplified example)
exports.onActivityWrite = functions.firestore.document('activities/{activityId}').onWrite(async (change, context) => {
  const after = change.after.exists ? change.after.data() : null;
  if (!after) return null;
  const userId = after.userId;
  if (!userId) return null;

  // Example: if activity.type === 'bike' and activity.amount is km, increment user's bike-km progress
  if (after.type === 'bike' && after.amount) {
    const userChallengesRef = db.collection('users').doc(userId).collection('challenges');
    const bikeChallengeQuery = await userChallengesRef.where('challengeId', '==', 'bike-50').get();
    bikeChallengeQuery.forEach(async docSnap => {
      const data = docSnap.data();
      const newProgress = (data.progress || 0) + Number(after.amount);
      await docSnap.ref.update({ progress: newProgress });
      if (newProgress >= 50) {
        await docSnap.ref.update({ status: 'completed', completedAt: admin.firestore.FieldValue.serverTimestamp() });
        // Optionally award badge
      }
    });
  }

  return null;
});

// Helper: award badge id for user (idempotent)
async function awardBadgeForUser(userId, badgeId, reason) {
  const userBadgesRef = db.collection('users').doc(userId).collection('badges');
  const badgeRef = userBadgesRef.doc(badgeId);
  const snap = await badgeRef.get();
  if (!snap.exists) {
    await badgeRef.set({ earnedAt: admin.firestore.FieldValue.serverTimestamp(), reason: reason || null });
  }
}

// Add weekly streak and reduction percent evaluation on create
exports.onActivityCreateExtended = functions.firestore.document('activities/{activityId}').onCreate(async (snap, context) => {
  const activity = snap.data();
  const userId = activity.userId;
  if (!userId) return null;

  // Weekly streak: check last 14 days for consecutive days up to 7
  try {
    const now = admin.firestore.Timestamp.now().toDate();
    const startWindow = new Date(now);
    startWindow.setDate(now.getDate() - 13); // look back 14 days
    const activitiesSnap = await db.collection('activities')
      .where('userId', '==', userId)
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startWindow))
      .get();

    const datesSet = new Set();
    activitiesSnap.forEach(d => {
      const ts = d.data().timestamp;
      if (!ts) return;
      const dt = ts.toDate();
      const key = `${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}`;
      datesSet.add(key);
    });

    // check for 7-day streak ending at today
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const check = new Date(now);
      check.setDate(now.getDate() - i);
      const key = `${check.getFullYear()}-${check.getMonth()+1}-${check.getDate()}`;
      if (datesSet.has(key)) streak++; else break;
    }
    if (streak >= 7) {
      await awardBadgeForUser(userId, 'weekly-streak', 'Tracked activities 7 days in a row');
    }
  } catch (e) {
    console.error('weekly-streak evaluation failed', e);
  }

  // Reduction percent: compare last 30 days to previous 30 days
  try {
    const today = admin.firestore.Timestamp.now().toDate();
    const windowEnd = new Date(today);
    const windowStart = new Date(today);
    windowStart.setDate(windowEnd.getDate() - 30);
    const prevStart = new Date(windowStart);
    prevStart.setDate(prevStart.getDate() - 30);
    const prevEnd = new Date(windowStart);

    const currSnap = await db.collection('activities')
      .where('userId', '==', userId)
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(windowStart))
      .where('timestamp', '<=', admin.firestore.Timestamp.fromDate(windowEnd))
      .get();
    const prevSnap = await db.collection('activities')
      .where('userId', '==', userId)
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(prevStart))
      .where('timestamp', '<', admin.firestore.Timestamp.fromDate(prevEnd))
      .get();

    let currTotal = 0;
    currSnap.forEach(d => { const val = parseFloat(d.data().footprint) || 0; currTotal += val; });
    let prevTotal = 0;
    prevSnap.forEach(d => { const val = parseFloat(d.data().footprint) || 0; prevTotal += val; });

    if (prevTotal > 0) {
      const reduction = ((prevTotal - currTotal) / prevTotal) * 100;
      if (reduction >= 25) {
        await awardBadgeForUser(userId, 'reduction-25', `Reduced ${reduction.toFixed(1)}% vs prev 30d`);
      } else if (reduction >= 10) {
        await awardBadgeForUser(userId, 'reduction-10', `Reduced ${reduction.toFixed(1)}% vs prev 30d`);
      }
    }
  } catch (e) {
    console.error('reduction evaluation failed', e);
  }

  return null;
});
