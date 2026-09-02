// js/app.js
import { subscribeToPatients, savePatientRecord, deletePatientRecord, exportDatabase, getLocalPatients } from './storage.js';
import { renderList } from './ui.js';
import { promptPwaInstall } from './pwa-register.js';

let currentPatientsList = getLocalPatients();

function initApp() {
  const patientListContainer = document.getElementById('patientList');
  const searchInput = document.getElementById('searchInput');
  const patientModal = document.getElementById('patientModal');
  const patientForm = document.getElementById('patientForm');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const exportBtn = document.getElementById('exportBtn');
  const installBtn = document.getElementById('installBtn');

  function refreshView() {
    if (!patientListContainer) return;
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const filtered = currentPatientsList.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) || 
      (p.phone && p.phone.includes(query))
    );
    renderList(filtered, patientListContainer, handleDelete);
    const countEl = document.getElementById('patientCount');
    if (countEl) countEl.innerText = `إجمالي المريضات: ${filtered.length}`;
  }

  async function handleDelete(id) {
    if (confirm('هل أنتِ متأكدة من حذف هذا الملف نهائياً؟')) {
      currentPatientsList = await deletePatientRecord(id);
      refreshView();
    }
  }

  // أزرار المودال
  if (openModalBtn && patientModal) {
    openModalBtn.onclick = () => patientModal.classList.remove('hidden');
  }

  if (closeModalBtn && patientModal) {
    closeModalBtn.onclick = () => patientModal.classList.add('hidden');
  }

  if (exportBtn) {
    exportBtn.onclick = () => exportDatabase(currentPatientsList);
  }

  if (installBtn) {
    installBtn.onclick = promptPwaInstall;
  }

  if (searchInput) {
    searchInput.oninput = refreshView;
  }

  // حفظ المريضة
  if (patientForm) {
    patientForm.onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = patientForm.querySelector('button[type="submit"]');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = 'جاري الحفظ...';
      }

      const newRecord = {
        name: document.getElementById('pName')?.value || '',
        phone: document.getElementById('pPhone')?.value || '',
        age: document.getElementById('pAge')?.value || '',
        blood: document.getElementById('pBlood')?.value || 'غير محدد',
        g: document.getElementById('pG')?.value || '0',
        vd: document.getElementById('pVD')?.value || '0',
        cs: document.getElementById('pCS')?.value || '0',
        a: document.getElementById('pA')?.value || '0',
        obsNotes: document.getElementById('pObsNotes')?.value || '',
        lmp: document.getElementById('pLMP')?.value || '',
        medHistory: document.getElementById('pMedicalHistory')?.value || '',
        allergies: document.getElementById('pAllergies')?.value || '',
        bp: document.getElementById('pBP')?.value || '',
        weight: document.getElementById('pWeight')?.value || '',
        ultrasound: document.getElementById('pUltrasound')?.value || '',
        rx: document.getElementById('pRx')?.value || ''
      };

      currentPatientsList = await savePatientRecord(newRecord);
      patientForm.reset();
      if (patientModal) patientModal.classList.add('hidden');
      refreshView();

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = 'حفظ الملف';
      }
    };
  }

  // أول عرض مباشر
  refreshView();

  // استماع للتحديثات
  subscribeToPatients((updatedList) => {
    currentPatientsList = updatedList;
    refreshView();
  });
}

// تشغيل فوري
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
