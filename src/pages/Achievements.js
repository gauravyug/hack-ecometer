// src/pages/Achievements.js
import React, { useState, useEffect, useContext, useRef } from 'react';
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

      const challengesRef = useRef(null);

      useEffect(() => {
      if (!uid) return;
      const badgesRef = collection(db, 'users', uid, 'badges');
      const unsub = onSnapshot(badgesRef, snap => {
            const arr = [];
            snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
            setEarnedBadges(arr);
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
      if (joinedChallenges.find(c => c.challengeId === challenge.id)) {
            return setToast('You have already joined this challenge');
      }
      const ref = doc(db, 'users', uid, 'challenges', challenge.id);
      await setDoc(ref, { challengeId: challenge.id, joinedAt: Date.now(), progress: 0, status: 'active' });
      setToast('Joined challenge: ' + challenge.title);
      setTimeout(() => setToast(''), 3000);
      };

      const claimBadge = async (badgeId) => {
      if (!uid) return setToast('Please log in');
      const existingBadge = earnedBadges.find(b => b.id === badgeId);
      if (existingBadge?.claimedAt) {
            return setToast('Badge already claimed');
      }
      const ref = doc(db, 'users', uid, 'badges', badgeId);
      await setDoc(ref, { claimedAt: Date.now(), claimedBy: uid });
      setToast('Badge claimed');
      setTimeout(() => setToast(''), 3000);
      };
      
      const getChallengeProgress = (challengeId) => {
      const joined = joinedChallenges.find(c => c.challengeId === challengeId);
      return joined ? joined.progress : 0;
      };

      const isChallengeJoined = (challengeId) => {
      return joinedChallenges.some(c => c.challengeId === challengeId);
      };

      const isBadgeClaimed = (badgeId) => {
      return earnedBadges.some(b => b.id === badgeId && b.claimedAt);
      };

      const handleBannerClick = () => {
      challengesRef.current?.scrollIntoView({ behavior: 'smooth' });
      };
      
      const hasJoinedChallenges = joinedChallenges.length > 0;

      return (
      <div className="max-w-4xl mx-auto p-4 md:p-6"> {/* Updated for mobile responsiveness */}
            <Toast message={toast} />
            <h1 className="text-2xl font-bold mb-4">Achievements & Challenges</h1>

            <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Badges</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                  {BADGES.map(b => (
                  <div key={b.id} className="flex-shrink-0 w-64">
                        <BadgeCard 
                        badge={b} 
                        earned={earnedBadges.some(eb => eb.id === b.id)} 
                        claimed={isBadgeClaimed(b.id)} 
                        />
                        {earnedBadges.some(eb => eb.id === b.id) && !isBadgeClaimed(b.id) && (
                        <button 
                              onClick={() => claimBadge(b.id)} 
                              className="mt-2 w-full px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                              Claim
                        </button>
                        )}
                  </div>
                  ))}
            </div>
            </section>

            {/*"My Challenges" Banner */}
            {hasJoinedChallenges && (
            <div 
                  onClick={handleBannerClick}
                  className="mb-6 p-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"

            >
                  <h2 className="text-2xl font-bold">My Challenges</h2>
                  <p className="text-sm">Jump to the challenges you're working on!</p>
            </div>
            )}

            <section ref={challengesRef}>
            <h2 className="text-xl font-semibold mb-2">Available Challenges</h2>
            <div className="flex flex-col space-y-4">
                  {CHALLENGES.map(c => (
                  <ChallengeCard 
                        key={c.id} 
                        challenge={c} 
                        onJoin={join} 
                        isJoined={isChallengeJoined(c.id)}
                        progress={getChallengeProgress(c.id)}
                  />
                  ))}
            </div>
            </section>
      </div>
      );
}

export default Achievements;