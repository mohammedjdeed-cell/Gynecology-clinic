import { getPatients, savePatientRecord, deletePatientRecord, exportDatabase, importDatabase } from './storage.js';
import { renderList } from './ui.js';
import { promptPwaInstall } from './pwa-register.js';

document.addEventListener('DOMContentLoaded', () => {
  const patientListContainer = document.getElementById('patientList');
  const searchInput = document.getElementById('searchInput');
  const patientModal = document.getElementById('patientModal');
  const patientForm = document.getElementById('patientForm');

  function refreshUI() {
    const query = searchInput.value.trim().toLowerCase();
    const all = getPatients();
    const filtered = all.filter(p => 
      p.name.toLowerCase().includes(query) || (p.phone && p.phone.includes(query))
    );
    renderList(filtered, patientListContainer, handleDelete);
    document.getElementById('patientCount').innerText = `إجمالي المريضات: ${filtered.length}`;
  }

  function handleDelete(id) {
    if (confirm('هل أنتِ متأكدة من حذف هذا الملف نهائياً؟')) {
      deletePatientRecord(id);
      refreshUI();
    }
  }

  // Form Submit
  patientForm.addEventListener('submit', (e) => {
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

    savePatientRecord(newRecord);
    patientForm.reset();
    patientModal.classList.add('hidden');
    refreshUI();
  });

  // Event Listeners
  searchInput.addEventListener('input', refreshUI);
  document.getElementById('openModalBtn').addEventListener('click', () => patientModal.classList.remove('hidden'));
  document.getElementById('closeModalBtn').addEventListener('click', () => patientModal.classList.add('hidden'));
  document.getElementById('exportBtn').addEventListener('click', exportDatabase);
  
  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.addEventListener('click', promptPwaInstall);

  // Initial Load
  refreshUI();
});
