// Firebase API Client for NexusMind
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';

// ==================== USER API ====================

export const userApi = {
  getProfile: async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('User not found');
  },
  
  updateProfile: async (userId: string, data: any) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  getAllUsers: async (queryStr?: string) => {
    let q = query(collection(db, 'users'));
    if (queryStr) {
      q = query(collection(db, 'users'), where('username', '>=', queryStr), where('username', '<=', queryStr + '\uf8ff'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getSavedItems: async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.savedItems || [];
    }
    return [];
  },
  
  saveItem: async (userId: string, item: any) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      savedItems: arrayUnion(item)
    });
    return { success: true };
  },
  
  removeSavedItem: async (userId: string, itemId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const savedItems = (data.savedItems || []).filter((item: any) => item.id !== itemId);
      await updateDoc(docRef, { savedItems });
    }
    return { success: true };
  },
  
  getActivityLog: async (userId: string) => {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

// ==================== POSTS API ====================

export const postsApi = {
  getAllPosts: async (params?: { userId?: string; category?: string; sortBy?: string }) => {
    let q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    
    if (params?.userId) {
      q = query(collection(db, 'posts'), where('userId', '==', params.userId), orderBy('timestamp', 'desc'));
    }
    if (params?.category) {
      q = query(collection(db, 'posts'), where('category', '==', params.category), orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getPost: async (postId: string) => {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Post not found');
  },
  
  createPost: async (data: any) => {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...data,
      timestamp: new Date(),
      votes: 0,
      isSolved: false,
      solutions: [],
      comments: []
    });
    return { id: docRef.id, ...data };
  },
  
  updatePost: async (postId: string, data: any) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, data);
    return { success: true };
  },
  
  deletePost: async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
    return { success: true };
  },
  
  votePost: async (postId: string, delta: number, userId: string, userAvatar: string) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      votes: increment(delta)
    });
    return { success: true };
  },
  
  addSolution: async (postId: string, data: any) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      solutions: arrayUnion({
        ...data,
        timestamp: new Date(),
        upvotes: 0,
        helpful: 0,
        replies: []
      })
    });
    return { success: true };
  },
  
  voteSolution: async (postId: string, solutionId: string, delta: number) => {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const solutions = data.solutions.map((sol: any) => {
        if (sol.id === solutionId) {
          return { ...sol, upvotes: (sol.upvotes || 0) + delta };
        }
        return sol;
      });
      await updateDoc(docRef, { solutions });
    }
    return { success: true };
  },
  
  markSolutionHelpful: async (postId: string, solutionId: string) => {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const solutions = data.solutions.map((sol: any) => {
        if (sol.id === solutionId) {
          return { ...sol, helpful: (sol.helpful || 0) + 1 };
        }
        return sol;
      });
      await updateDoc(docRef, { solutions });
    }
    return { success: true };
  },
  
  addComment: async (postId: string, data: any) => {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      comments: arrayUnion({
        ...data,
        timestamp: new Date()
      })
    });
    return { success: true };
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsApi = {
  getNotifications: async (userId: string) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  markAsRead: async (notificationId: string) => {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
    return { success: true };
  },
  
  markAllAsRead: async (userId: string) => {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach(async (doc) => {
      await updateDoc(doc.ref, { read: true });
    });
    return { success: true };
  },
  
  deleteNotification: async (notificationId: string) => {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true };
  },
};

// ==================== GROUPS API ====================

export const groupsApi = {
  getAllGroups: async (params?: { query?: string; category?: string }) => {
    let q = query(collection(db, 'groups'));
    if (params?.category) {
      q = query(collection(db, 'groups'), where('category', '==', params.category));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  getGroup: async (groupId: string) => {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Group not found');
  },
  
  createGroup: async (data: any) => {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...data,
      timestamp: new Date(),
      members: [data.creatorId],
      memberCount: 1
    });
    return { id: docRef.id, ...data };
  },
  
  joinGroup: async (groupId: string, userId: string) => {
    const docRef = doc(db, 'groups', groupId);
    await updateDoc(docRef, {
      members: arrayUnion(userId),
      memberCount: increment(1)
    });
    return { success: true };
  },
};

// ==================== SEARCH API ====================

export const searchApi = {
  globalSearch: async (query: string, type?: string) => {
    const results: any = { users: [], posts: [], groups: [] };
    
    if (!type || type === 'all' || type === 'users') {
      const userQ = query(collection(db, 'users'), where('username', '>=', query), where('username', '<=', query + '\uf8ff'), limit(10));
      const userSnapshot = await getDocs(userQ);
      results.users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (!type || type === 'all' || type === 'posts') {
      const postQ = query(collection(db, 'posts'), where('content', '>=', query), where('content', '<=', query + '\uf8ff'), limit(10));
      const postSnapshot = await getDocs(postQ);
      results.posts = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (!type || type === 'all' || type === 'groups') {
      const groupQ = query(collection(db, 'groups'), where('name', '>=', query), where('name', '<=', query + '\uf8ff'), limit(10));
      const groupSnapshot = await getDocs(groupQ);
      results.groups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    return results;
  },
};

export default { userApi, postsApi, notificationsApi, groupsApi, searchApi };
