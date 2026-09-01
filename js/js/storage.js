const DB_KEY = 'syria_obgyn_pwa_db';

export function getPatients() {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePatientRecord(patientData) {
  const patients = getPatients();
  
  if (patientData.id) {
    // Update existing
    const index = patients.findIndex(p => p.id === patientData.id);
    if (index !== -1) patients[index] = patientData;
  } else {
    // Insert new
    patientData.id = 'p_' + Date.now();
    patientData.createdAt = new Date().toLocaleDateString('ar-SY');
    patientData.visits = patientData.visits || [];
    patients.unshift(patientData);
  }

  localStorage.setItem(DB_KEY, JSON.stringify(patients));
  return patients;
}

export function deletePatientRecord(patientId) {
  let patients = getPatients();
  patients = patients.filter(p => p.id !== patientId);
  localStorage.setItem(DB_KEY, JSON.stringify(patients));
  return patients;
}

export function exportDatabase() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem(DB_KEY) || '[]');
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `نسخة_عيادة_النسائية_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDatabase(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data)) {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      return true;
    }
  } catch (e) {
    console.error('Invalid JSON', e);
  }
  return false;
}
