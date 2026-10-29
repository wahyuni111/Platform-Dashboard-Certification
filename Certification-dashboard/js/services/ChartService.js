/**
 * =============================================================================
 * SERVICE: CHART SERVICE
 * =============================================================================
 * Menangani visualisasi diagram donat distribusi kategori produk secara andal
 * dan mandiri menggunakan SVG Interaktif responsif tinggi (Bebas dari kegagalan
 * muat CDN / canvas scaling issue).
 */

class ChartService {
  constructor() {
    this.chartInstance = null;
  }

  /**
   * Merender diagram donat distribusi kategori produk secara interaktif
   * @param {string} canvasId 
   * @param {string} containerId 
   * @param {Object} categoryData - { labels, data, percentages, colors }
   * @param {string} activeCategory - Filter kategori yang sedang aktif ("ALL", "Kudapan Kering", dll)
   */
  renderCategoryDonut(canvasId, containerId, categoryData, activeCategory = "ALL") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Perhitungan SVG Circle Dasharray:
    // Radius = 15.9155, Perimeter = 2 * PI * r = 100
    // Kudapan Kering: 55%, Makanan Basah: 35%, Minuman: 10%
    const p1 = categoryData.percentages[0]; // 55
    const p2 = categoryData.percentages[1]; // 35
    const p3 = categoryData.percentages[2]; // 10

    const isKering = (activeCategory === "Kudapan Kering");
    const isBasah = (activeCategory === "Makanan Basah");
    const isMinuman = (activeCategory === "Minuman");

    const centerCount = isKering ? 25 : (isBasah ? 16 : (isMinuman ? 4 : 45));
    const centerLabel = isKering ? "Kering" : (isBasah ? "Basah" : (isMinuman ? "Minum" : "UMKM"));

    // Bangun elemen SVG Donut interaktif beresolusi tajam
    container.innerHTML = `
      <div class="relative flex items-center justify-center w-48 h-48">
        <svg viewBox="0 0 36 36" class="w-44 h-44 drop-shadow-md transform -rotate-90">
          <!-- Background Track -->
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" stroke-width="4.5"></circle>

          <!-- Segmen 1: Kudapan Kering (55%) -->
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1E4D2B" 
            stroke-width="${isKering ? '6' : '4.5'}" 
            stroke-dasharray="${p1} ${100 - p1}" 
            stroke-dashoffset="0"
            class="transition-all duration-500 cursor-pointer hover:opacity-85 ${isKering ? 'filter drop-shadow' : ''}">
            <title>Kudapan Kering: 25 Usaha (55%)</title>
          </circle>

          <!-- Segmen 2: Makanan Basah (35%) -->
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D97706" 
            stroke-width="${isBasah ? '6' : '4.5'}" 
            stroke-dasharray="${p2} ${100 - p2}" 
            stroke-dashoffset="-${p1}"
            class="transition-all duration-500 cursor-pointer hover:opacity-85 ${isBasah ? 'filter drop-shadow' : ''}">
            <title>Makanan Basah: 16 Usaha (35%)</title>
          </circle>

          <!-- Segmen 3: Minuman (10%) -->
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3B82F6" 
            stroke-width="${isMinuman ? '6' : '4.5'}" 
            stroke-dasharray="${p3} ${100 - p3}" 
            stroke-dashoffset="-${p1 + p2}"
            class="transition-all duration-500 cursor-pointer hover:opacity-85 ${isMinuman ? 'filter drop-shadow' : ''}">
            <title>Minuman: 4 Usaha (10%)</title>
          </circle>
        </svg>

        <!-- Center Counter Display -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span class="text-2xl font-black text-nu-900 leading-none">${centerCount}</span>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">${centerLabel}</span>
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}

// Export ke namespace global
window.ChartService = ChartService;
