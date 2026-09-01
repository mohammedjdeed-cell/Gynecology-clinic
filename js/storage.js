// js/storage.js
import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  onSnapshot, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const COLLECTION_NAME = 'patients';

/**
 * Real-time listener: Triggers callback whenever data changes on Phone or Laptop
 */
export function subscribeToPatients(callback) {
  const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(patients);
  }, (error) => {
    console.error("Firestore sync error:", error);
  });
}

/**
 * Save new patient to Firestore Cloud
 */
export async function savePatientRecord(patientData) {
  try {
    patientData.timestamp = Date.now();
    patientData.createdAt = new Date().toLocaleDateString('ar-SY');
    await addDoc(collection(db, COLLECTION_NAME), patientData);
  } catch (error) {
    console.error("Error adding patient: ", error);
  }
}

/**
 * Delete patient by Firestore Document ID
 */
export async function deletePatientRecord(patientId) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, patientId));
  } catch (error) {
    console.error("Error deleting patient: ", error);
  }
}

/**
 * Export current data to JSON file
 */
export function exportDatabase(patientsArray) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patientsArray));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `نسخة_عيادة_النسائية_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
