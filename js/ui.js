import { calculatePregnancy, formatGPA } from './obstetric.js';

export function renderList(patients, container, onDeleteClick) {
  container.innerHTML = '';

  if (patients.length === 0) {
    container.innerHTML = `<div class="text-center py-16 text-slate-400 font-semibold">لا يوجد سجلات مريضات حتى الآن</div>`;
    return;
  }

  patients.forEach((p) => {
    const preg = calculatePregnancy(p.lmp);
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3";

    card.innerHTML = `
      <div class="flex justify-between items-start border-b pb-2">
        <div>
          <h3 class="text-lg font-bold text-slate-900">${p.name}</h3>
          <p class="text-xs text-slate-500">📞 ${p.phone || 'بدون هاتف'} | العمر: ${p.age || '-'} | زمرة: <span class="font-bold text-red-600">${p.blood}</span></p>
        </div>
        <div class="text-left">
          <span class="bg-teal-100 text-teal-900 text-xs px-2.5 py-1 rounded-full font-bold">
            ${formatGPA(p.g, p.vd, p.cs, p.a)}
          </span>
          <p class="text-[10px] text-gray-400 mt-1">${p.createdAt}</p>
        </div>
      </div>

      <!-- السوابق التوليدية -->
      <div class="bg-rose-50/60 p-2.5 rounded-xl text-xs text-rose-950 border border-rose-100 flex flex-wrap gap-x-4 gap-y-1">
        <span><strong>ولادة طبيعية:</strong> ${p.vd || 0}</span>
        <span><strong>قيصريات:</strong> ${p.cs || 0}</span>
        <span><strong>إجهاضات:</strong> ${p.a || 0}</span>
        ${p.obsNotes ? `<span class="w-full text-slate-600 mt-1">📝 ${p.obsNotes}</span>` : ''}
      </div>

      <!-- الحمل الحالي إن وجد -->
      ${preg && preg.isValid ? `
        <div class="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-900 flex justify-between items-center font-semibold">
          <span>🤰 عمر الحمل: <strong>${preg.summary}</strong></span>
          <span>الولادة المتوقعة: <strong>${preg.eddFormatted}</strong></span>
        </div>
      ` : ''}

      <!-- السوابق المرضية -->
      ${(p.medHistory || p.allergies) ? `
        <div class="text-xs text-slate-600 flex gap-2 flex-wrap">
          ${p.medHistory ? `<span class="bg-gray-100 px-2 py-1 rounded">⚠️ سوابق: ${p.medHistory}</span>` : ''}
          ${p.allergies ? `<span class="bg-red-50 text-red-700 px-2 py-1 rounded font-bold">⛔ تحسس: ${p.allergies}</span>` : ''}
        </div>
      ` : ''}

      <!-- الفحص والعلاج -->
      <div class="bg-slate-50 p-2.5 rounded-xl text-xs border space-y-1">
        <div class="flex gap-4 text-slate-500 font-semibold">
          <span>الضغط: ${p.bp || '-'}</span>
          <span>الوزن: ${p.weight ? p.weight + ' كغ' : '-'}</span>
        </div>
        <p><strong>الإيكو:</strong> ${p.ultrasound || 'لا يوجد تقرير'}</p>
        ${p.rx ? `<p class="text-teal-800 font-semibold"><strong>الوصفة:</strong> ${p.rx}</p>` : ''}
      </div>

      <div class="flex justify-end pt-1">
        <button class="delete-btn text-xs text-red-400 hover:text-red-700 font-semibold" data-id="${p.id}">حذف الملف</button>
      </div>
    `;

    card.querySelector('.delete-btn').addEventListener('click', () => onDeleteClick(p.id));
    container.appendChild(card);
  });
}
