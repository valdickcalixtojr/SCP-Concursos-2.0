import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { useConcursoStore, User, ScoringRule, UserProfileScoring, Concurso } from '../store';

let isSyncingFromFirebase = false;
let unsubscribeFromFirestore: (() => void) | null = null;

export const fetchGlobalConcursos = async () => {
  if (!isFirebaseConfigured) return false;
  try {
    const concursosRef = collection(db, 'concursos');
    const snapshot = await getDocs(concursosRef);
    
    if (snapshot.empty) {
      console.log("No global concursos found in Firebase.");
      return false;
    }

    const globalConcursos = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Concurso;
    });

    const store = useConcursoStore.getState();
    const currentConcursos = store.concursos;

    // Merge global concursos with user's local preferences (interest_status, is_favorite)
    const mergedConcursos = globalConcursos.map(globalC => {
      const localC = currentConcursos.find(c => c.id === globalC.id);
      if (localC) {
        return {
          ...globalC,
          interest_status: localC.interest_status || 'none',
          is_favorite: localC.is_favorite || false,
        };
      }
      return {
        ...globalC,
        interest_status: 'none' as const,
        is_favorite: false,
      };
    });

    store.setConcursos(mergedConcursos);
    return true;
  } catch (error) {
    console.error("Error fetching global concursos from Firebase:", error);
    return false;
  }
};

export const forceSyncToFirebase = async () => {
  if (!isFirebaseConfigured) return false;
  const state = useConcursoStore.getState();
  if (!state.user) return false;

  try {
    const userDocRef = doc(db, 'users', state.user.uid);
    await setDoc(userDocRef, {
      scoringRules: state.scoringRules,
      userProfileScoring: state.userProfileScoring,
      concursos: state.concursos,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error syncing to Firebase:", error);
    return false;
  }
};

export const forceSyncFromFirebase = async () => {
  if (!isFirebaseConfigured) return false;
  const store = useConcursoStore.getState();
  if (!store.user) return;

  try {
    const userDocRef = doc(db, 'users', store.user.uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      isSyncingFromFirebase = true;
      if (data.scoringRules) store.setScoringRules(data.scoringRules);
      if (data.userProfileScoring) store.updateUserProfileScoring(data.userProfileScoring);
      if (data.concursos) store.setConcursos(data.concursos);
      isSyncingFromFirebase = false;
      return true;
    }
  } catch (error) {
    console.error("Error syncing from Firebase:", error);
    isSyncingFromFirebase = false;
  }
  return false;
};

export const initFirebaseSync = () => {
  if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured. Sync disabled.");
    return;
  }
  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useConcursoStore.getState();
    
    // Clean up previous listener if any
    if (unsubscribeFromFirestore) {
      unsubscribeFromFirestore();
      unsubscribeFromFirestore = null;
    }

    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      };
      store.setUser(user);

      // Fetch user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      
      // Initial fetch
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        isSyncingFromFirebase = true;
        if (data.scoringRules) store.setScoringRules(data.scoringRules);
        if (data.userProfileScoring) store.updateUserProfileScoring(data.userProfileScoring);
        if (data.concursos) store.setConcursos(data.concursos);
        isSyncingFromFirebase = false;
      } else {
        // If user document doesn't exist, create it with current local state
        await setDoc(userDocRef, {
          scoringRules: store.scoringRules,
          userProfileScoring: store.userProfileScoring,
          concursos: store.concursos,
          lastUpdated: new Date().toISOString(),
        });
      }

      // Listen for remote changes
      unsubscribeFromFirestore = onSnapshot(userDocRef, (snapshot) => {
        if (isSyncingFromFirebase) return;
        const data = snapshot.data();
        if (data) {
          isSyncingFromFirebase = true;
          if (data.scoringRules) store.setScoringRules(data.scoringRules);
          if (data.userProfileScoring) store.updateUserProfileScoring(data.userProfileScoring);
          if (data.concursos) store.setConcursos(data.concursos);
          isSyncingFromFirebase = false;
        }
      });
    } else {
      store.setUser(null);
    }
  });

  // Subscribe to store changes and sync to Firestore
  let lastState = useConcursoStore.getState();
  useConcursoStore.subscribe((state) => {
    if (isSyncingFromFirebase || !state.user) {
      lastState = state;
      return;
    }

    // Only sync if relevant data changed
    if (
      state.scoringRules !== lastState.scoringRules ||
      state.userProfileScoring !== lastState.userProfileScoring ||
      state.concursos !== lastState.concursos
    ) {
      const userDocRef = doc(db, 'users', state.user.uid);
      setDoc(userDocRef, {
        scoringRules: state.scoringRules,
        userProfileScoring: state.userProfileScoring,
        concursos: state.concursos,
        lastUpdated: new Date().toISOString(),
      }, { merge: true }).catch(console.error);
    }
    lastState = state;
  });
};
