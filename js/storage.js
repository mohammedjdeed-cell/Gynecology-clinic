// js/storage.js
import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const LOCAL_KEY = 'syria_obgyn_local_patients';
const COLLECTION_NAME = 'patients';

// 1. جلب البيانات المحلية فوراً
export function getLocalPatients() {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// 2. حفظ محلي
function saveLocalPatients(list) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

// 3. الاستماع للسحابة إن توفرت
export function subscribeToPatients(onDataReceived) {
  // أرسل البيانات المحلية أولاً فوراً لتعمل الشاشة
  onDataReceived(getLocalPatients());

  if (!db) return;

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
      const remotePatients = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      if (remotePatients.length > 0) {
        saveLocalPatients(remotePatients);
        onDataReceived(remotePatients);
      }
    }, (err) => {
      console.warn("Firebase offline or restricted, using local storage:", err);
    });
  } catch (err) {
    console.warn("Failed to subscribe to Firebase:", err);
  }
}

// 4. حفظ مريضة جديدة
export async function savePatientRecord(patientData) {
  patientData.timestamp = Date.now();
  patientData.createdAt = new Date().toLocaleDateString('ar-SY');

  // حفظ محلي فوري
  const localList = getLocalPatients();
  const tempId = 'local_' + Date.now();
  const recordWithId = { id: tempId, ...patientData };
  localList.unshift(recordWithId);
  saveLocalPatients(localList);

  // مزامنة مع Firebase في الخلفية
  if (db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), patientData);
      recordWithId.id = docRef.id;
      saveLocalPatients(localList);
    } catch (e) {
      console.warn("Saved locally, pending cloud sync:", e);
    }
  }

  return localList;
}

// 5. حذف مريضة
export async function deletePatientRecord(patientId) {
  let localList = getLocalPatients();
  localList = localList.filter(p => p.id !== patientId);
  saveLocalPatients(localList);

  if (db && !patientId.startsWith('local_')) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, patientId));
    } catch (e) {
      console.warn("Could not delete from cloud:", e);
    }
  }

  return localList;
}

// 6. نسخ احتياطي
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
