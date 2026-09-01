// js/app.js
import { subscribeToPatients, savePatientRecord, deletePatientRecord, exportDatabase } from './storage.js';
import { renderList } from './ui.js';
import { promptPwaInstall } from './pwa-register.js';

document.addEventListener('DOMContentLoaded', () => {
  const patientListContainer = document.getElementById('patientList');
  const searchInput = document.getElementById('searchInput');
  const patientModal = document.getElementById('patientModal');
  const patientForm = document.getElementById('patientForm');

  let currentPatientsList = [];

  function refreshView() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = currentPatientsList.filter(p => 
      p.name?.toLowerCase().includes(query) || (p.phone && p.phone.includes(query))
    );
    renderList(filtered, patientListContainer, handleDelete);
    document.getElementById('patientCount').innerText = `إجمالي المريضات: ${filtered.length}`;
  }

  // 1. Subscribe to Live Firestore Sync (Phone & Laptop update instantly!)
  subscribeToPatients((patients) => {
    currentPatientsList = patients;
    refreshView();
  });

  async function handleDelete(id) {
    if (confirm('هل أنتِ متأكدة من حذف هذا الملف نهائياً؟')) {
      await deletePatientRecord(id);
    }
  }

  // Form Submit
  patientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newRecord = {
      name: document.getElementById('pName').value,
      phone: document.getElementById('pPhone').value,
      age: document.getElementById('pAge').value,
      blood: document.getElementById('pBlood').value,
      g: document.getElementById('pG').value,
      vd: document.getElementById('pVD').value,
      cs: document.getElementById('pCS').value,
      a: document.getElementById('pA').value,
      obsNotes: document.getElementById('pObsNotes').value,
      lmp: document.getElementById('pLMP').value,
      medHistory: document.getElementById('pMedicalHistory').value,
      allergies: document.getElementById('pAllergies').value,
      bp: document.getElementById('pBP').value,
      weight: document.getElementById('pWeight').value,
      ultrasound: document.getElementById('pUltrasound').value,
      rx: document.getElementById('pRx').value
    };

    await savePatientRecord(newRecord);
    patientForm.reset();
    patientModal.classList.add('hidden');
  });

  // Event Listeners
  searchInput.addEventListener('input', refreshView);
  document.getElementById('openModalBtn').addEventListener('click', () => patientModal.classList.remove('hidden'));
  document.getElementById('closeModalBtn').addEventListener('click', () => patientModal.classList.add('hidden'));
  document.getElementById('exportBtn').addEventListener('click', () => exportDatabase(currentPatientsList));
  
  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.addEventListener('click', promptPwaInstall);
});
