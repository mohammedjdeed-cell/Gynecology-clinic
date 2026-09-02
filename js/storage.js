// js/storage.js
import { db } from './firebase-config.js';

const LOCAL_KEY = 'syria_obgyn_local_patients';
const COLLECTION_NAME = 'patients';

export function getLocalPatients() {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalPatients(list) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

export function subscribeToPatients(onDataReceived) {
  // 1. Immediately emit local data (0ms latency, always works)
  onDataReceived(getLocalPatients());

  // 2. Real-time Firebase sync if online
  if (db) {
    try {
      db.collection(COLLECTION_NAME)
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          const cloudPatients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          if (cloudPatients.length > 0) {
            saveLocalPatients(cloudPatients);
            onDataReceived(cloudPatients);
          }
        }, (err) => {
          console.warn("Firestore sync warning (using local):", err);
        });
    } catch (e) {
      console.warn("Cloud sync error:", e);
    }
  }
}

export async function savePatientRecord(patientData) {
  patientData.timestamp = Date.now();
  patientData.createdAt = new Date().toLocaleDateString('ar-SY');

  // Save locally first
  const localList = getLocalPatients();
  const tempId = 'local_' + Date.now();
  const recordWithId = { id: tempId, ...patientData };
  localList.unshift(recordWithId);
  saveLocalPatients(localList);

  // Sync to Firestore in background
  if (db) {
    try {
      const docRef = await db.collection(COLLECTION_NAME).add(patientData);
      recordWithId.id = docRef.id;
      saveLocalPatients(localList);
    } catch (e) {
      console.warn("Saved to local storage, pending cloud sync:", e);
    }
  }

  return localList;
}

export async function deletePatientRecord(patientId) {
  let localList = getLocalPatients();
  localList = localList.filter(p => p.id !== patientId);
  saveLocalPatients(localList);

  if (db && !patientId.startsWith('local_')) {
    try {
      await db.collection(COLLECTION_NAME).doc(patientId).delete();
    } catch (e) {
      console.warn("Cloud delete warning:", e);
    }
  }

  return localList;
}

export function exportDatabase(patientsArray) {
  const data = patientsArray || getLocalPatients();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `نسخة_عيادة_النسائية_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
