// src/pages/Achievements.js
import React, { useState, useEffect, useContext } from 'react';
import BadgeCard from '../components/BadgeCard';
import ChallengeCard from '../components/ChallengeCard';
import Toast from '../components/Toast';
import { BADGES, CHALLENGES } from '../utils/achievementsData';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function Achievements() {
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!uid) return;
    const badgesRef = collection(db, 'users', uid, 'badges');
    const unsub = onSnapshot(badgesRef, snap => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setEarnedBadges(arr.map(a => a.id));
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const challengesRef = collection(db, 'users', uid, 'challenges');
    const unsub = onSnapshot(challengesRef, snap => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setJoinedChallenges(arr);
    });
    return unsub;
  }, [uid]);

  const join = async (challenge) => {
    if (!uid) return setToast('Please log in');
    const ref = doc(db, 'users', uid, 'challenges', challenge.id);
    await setDoc(ref, { challengeId: challenge.id, joinedAt: Date.now(), progress: 0, status: 'active' });
    setToast('Joined challenge: ' + challenge.title);
    setTimeout(() => setToast(''), 3000);
  };

  const claimBadge = async (badgeId) => {
    if (!uid) return setToast('Please log in');
    const ref = doc(db, 'users', uid, 'badges', badgeId);
    await setDoc(ref, { claimedAt: Date.now(), claimedBy: uid });
    setToast('Badge claimed');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="p-6">
      <Toast message={toast} />
      <h1 className="text-2xl font-bold mb-4">Achievements & Challenges</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BADGES.map(b => (
            <div key={b.id}>
              <BadgeCard badge={b} earned={earnedBadges.includes(b.id)} />
              {earnedBadges.includes(b.id) ? (
                <button onClick={() => claimBadge(b.id)} className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded">Claim</button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Available Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHALLENGES.map(c => (
            <ChallengeCard key={c.id} challenge={c} onJoin={join} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Achievements;
