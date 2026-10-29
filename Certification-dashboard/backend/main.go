package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
)

// ============================================================================
// MODELS & DOMAIN ENTITIES
// ============================================================================

type Milestone struct {
	Step  int    `json:"step"`
	Title string `json:"title"`
	Desc  string `json:"desc"`
	Done  bool   `json:"done"`
}

type AuditItem struct {
	Key   string `json:"key"`
	Pilar string `json:"pilar"`
	Label string `json:"label"`
	Desc  string `json:"desc"`
}

type PendingItem struct {
	Key    string `json:"key"`
	Pilar  string `json:"pilar"`
	Label  string `json:"label"`
	Action string `json:"action"`
}

type Member struct {
	ID       string `json:"id"`
	Nama     string `json:"nama"`
	Usaha    string `json:"usaha"`
	Kategori string `json:"kategori"`
	Kontak   string `json:"kontak"`
	Alamat   string `json:"alamat"`
	NIB      string `json:"nib"`

	// Pilar 1: Legalitas Usaha
	KtpPemilik bool `json:"ktp_pemilik"`
	KBLI       bool `json:"kbli"`
	Sihalal    bool `json:"sihalal"`
	Permohonan bool `json:"permohonan"`

	// Pilar 2: Bahan Baku & Bumbu
	DaftarBahan      bool `json:"daftar_bahan"`
	BahanNonKritis   bool `json:"bahan_nonkritis"`
	BahanKritisHalal bool `json:"bahan_kritis_halal"`
	AirBersih        bool `json:"air_bersih"`

	// Pilar 3: Alur Proses Halal (PPH)
	DapurBersih     bool `json:"dapur_bersih"`
	AlatKhusus      bool `json:"alat_khusus"`
	ManualSJPH      bool `json:"manual_sjph"`
	KemasanHigienis bool `json:"kemasan_higienis"`

	// Pilar 4: SDM & Komitmen Halal
	PenyeliaNama  string `json:"penyelia_nama"`
	PenyeliaKtp   bool   `json:"penyelia_ktp"`
	SuratPenyelia bool   `json:"surat_penyelia"`
	IkrarMaterai  bool   `json:"ikrar_materai"`
	NamaLayak     bool   `json:"nama_layak"`

	// Computed Fields
	Skor              int           `json:"skor"`
	Status            string        `json:"status"`
	Hambatan          []string      `json:"hambatan"`
	FormattedPhone    string        `json:"formatted_phone"`
	CleanPhoneWA      string        `json:"clean_phone_wa"`
	HasValidNIB       bool          `json:"has_valid_nib"`
	JourneyMilestones []Milestone   `json:"journey_milestones"`
	CompletedItems    []AuditItem   `json:"completed_items"`
	PendingItems      []PendingItem `json:"pending_items"`
}

type Stats struct {
	Total           int `json:"total"`
	SiapDaftar      int `json:"siap_daftar"`
	Pendampingan    int `json:"pendampingan"`
	BelumSiap       int `json:"belum_siap"`
	SiapDaftarPct   int `json:"siap_daftar_pct"`
	PendampinganPct int `json:"pendampingan_pct"`
	BelumSiapPct    int `json:"belum_siap_pct"`
}

type Bottleneck struct {
	Label   string `json:"label"`
	Percent int    `json:"percent"`
	Count   int    `json:"count"`
	Color   string `json:"color"`
	Dot     string `json:"dot"`
	Note    string `json:"note"`
}

type CategoryDistribution struct {
	Labels      []string `json:"labels"`
	Data        []int    `json:"data"`
	Percentages []int    `json:"percentages"`
	Colors      []string `json:"colors"`
}

// ============================================================================
// CALCULATION LOGIC (BPJPH SELF-DECLARE RULES)
// ============================================================================

func cleanPhone(phone string) string {
	reg := regexp.MustCompile(`[^0-9]`)
	clean := reg.ReplaceAllString(phone, "")
	if strings.HasPrefix(clean, "0") {
		return "62" + clean[1:]
	}
	if strings.HasPrefix(clean, "62") {
		return clean
	}
	return "62" + clean
}

func formatPhone(phone string) string {
	reg := regexp.MustCompile(`[^0-9]`)
	clean := reg.ReplaceAllString(phone, "")
	if len(clean) == 12 {
		return fmt.Sprintf("%s-%s-%s", clean[:4], clean[4:8], clean[8:])
	}
	return phone
}

func hasValidNIB(nib string) bool {
	trim := strings.TrimSpace(nib)
	return trim != "" && trim != "-" && len(trim) >= 9
}

func RecalculateMember(m *Member) {
	m.KtpPemilik = true // KTP-el pemohon terverifikasi
	m.HasValidNIB = hasValidNIB(m.NIB)
	m.FormattedPhone = formatPhone(m.Kontak)
	m.CleanPhoneWA = cleanPhone(m.Kontak)

	if m.PenyeliaNama == "" {
		m.PenyeliaNama = m.Nama
	}

	// 1. Pilar 1 (25%): 5 item x 5%
	p1Count := 0
	if m.KtpPemilik {
		p1Count++
	}
	if m.HasValidNIB {
		p1Count++
	}
	if m.KBLI {
		p1Count++
	}
	if m.Sihalal {
		p1Count++
	}
	if m.Permohonan {
		p1Count++
	}
	p1Score := float64(p1Count) * 5.0

	// 2. Pilar 2 (35%): 4 item x 8.75%
	p2Count := 0
	if m.DaftarBahan {
		p2Count++
	}
	if m.BahanNonKritis {
		p2Count++
	}
	if m.BahanKritisHalal {
		p2Count++
	}
	if m.AirBersih {
		p2Count++
	}
	p2Score := float64(p2Count) * 8.75

	// 3. Pilar 3 (25%): 4 item x 6.25%
	p3Count := 0
	if m.DapurBersih {
		p3Count++
	}
	if m.AlatKhusus {
		p3Count++
	}
	if m.ManualSJPH {
		p3Count++
	}
	if m.KemasanHigienis {
		p3Count++
	}
	p3Score := float64(p3Count) * 6.25

	// 4. Pilar 4 (15%): 5 item x 3%
	p4Count := 0
	if m.PenyeliaNama != "" {
		p4Count++
	}
	if m.PenyeliaKtp {
		p4Count++
	}
	if m.SuratPenyelia {
		p4Count++
	}
	if m.IkrarMaterai {
		p4Count++
	}
	if m.NamaLayak {
		p4Count++
	}
	p4Score := float64(p4Count) * 3.0

	rawTotal := int(math.Round(p1Score + p2Score + p3Score + p4Score))

	// Pre-requisite Rule: Without valid NIB, score cannot exceed 45% (Belum Siap)
	if !m.HasValidNIB && rawTotal > 45 {
		rawTotal = 45
	}

	if rawTotal < 0 {
		rawTotal = 0
	} else if rawTotal > 100 {
		rawTotal = 100
	}
	m.Skor = rawTotal

	// Status BPJPH
	if m.Skor >= 80 {
		m.Status = "Siap Daftar"
	} else if m.Skor >= 50 {
		m.Status = "Perlu Pendampingan"
	} else {
		m.Status = "Belum Siap"
	}

	// Build Hambatan & Recommendations
	hambatan := make([]string, 0)
	if !m.HasValidNIB {
		hambatan = append(hambatan, "Segera buat NIB (Nomor Induk Berusaha) berbasis OSS-RBA melalui oss.go.id")
	}
	if !m.KBLI {
		hambatan = append(hambatan, "Sesuaikan kode KBLI izin usaha ke bidang olahan pangan/kudapan")
	}
	if !m.Sihalal {
		hambatan = append(hambatan, "Buat & aktivasi akun SIHALAL di portal ptsp.halal.go.id menggunakan NIB pemohon")
	}
	if !m.Permohonan {
		hambatan = append(hambatan, "Lengkapi draf Surat Permohonan Sertifikasi Halal jalur self-declare")
	}
	if !m.DaftarBahan {
		hambatan = append(hambatan, "Tuliskan seluruh komposisi bahan dan bumbu dalam Formulir Rincian Bahan")
	}
	if !m.BahanNonKritis {
		hambatan = append(hambatan, "Verifikasi bahan non-kritis masuk dalam Positive List Kemenag")
	}
	if !m.BahanKritisHalal {
		hambatan = append(hambatan, "Kumpulkan foto label/nomor sertifikat halal kemasan bumbu olahan pabrikan")
	}
	if !m.AirBersih {
		hambatan = append(hambatan, "Pastikan sanitasi dan sumber air bersih memenuhi standar pangan")
	}
	if !m.DapurBersih {
		hambatan = append(hambatan, "Bersihkan area dapur produksi agar terhindar dari najis & hewan peliharaan")
	}
	if !m.AlatKhusus {
		hambatan = append(hambatan, "Pisahkan wadah dan alat masak khusus hanya untuk produksi halal")
	}
	if !m.ManualSJPH {
		hambatan = append(hambatan, "Susun formulir Manual SJPH (SOP Komitmen Halal) standar Fatayat NU")
	}
	if !m.KemasanHigienis {
		hambatan = append(hambatan, "Gunakan kemasan tertutup rapat untuk mencegah kontaminasi produk")
	}
	if m.PenyeliaNama == "" {
		hambatan = append(hambatan, "Tunjuk penyelia halal muslim yang bertanggung jawab atas proses produksi")
	}
	if !m.PenyeliaKtp {
		hambatan = append(hambatan, "Lampirkan salinan fotokopi KTP penyelia halal yang ditunjuk")
	}
	if !m.SuratPenyelia {
		hambatan = append(hambatan, "Tandatangani Surat Keputusan (SK) Penetapan Penyelia Halal")
	}
	if !m.IkrarMaterai {
		hambatan = append(hambatan, "Tandatangani Surat Pernyataan Ikrar Halal bermaterai Rp10.000")
	}
	if !m.NamaLayak {
		hambatan = append(hambatan, "Sesuaikan nama merek agar bebas dari konotasi yang diharamkan syariat")
	}
	m.Hambatan = hambatan

	// Milestones (5 Steps)
	s1 := m.KtpPemilik && m.HasValidNIB && m.KBLI
	s2 := m.DaftarBahan && m.BahanNonKritis && m.BahanKritisHalal && m.AirBersih
	s3 := m.DapurBersih && m.AlatKhusus && m.ManualSJPH && m.KemasanHigienis
	s4 := (m.PenyeliaNama != "") && m.SuratPenyelia && m.IkrarMaterai && m.NamaLayak
	s5 := m.Sihalal && m.Permohonan && m.Skor >= 80

	m.JourneyMilestones = []Milestone{
		{Step: 1, Title: "Legalitas Usaha & KBLI", Desc: "KTP, NIB OSS, KBLI Pangan", Done: s1},
		{Step: 2, Title: "Bahan Baku & Bumbu", Desc: "Positive List & Sertifikat Halal", Done: s2},
		{Step: 3, Title: "Alur Proses & Dapur", Desc: "Sanitasi, Pemisahan Alat & SJPH", Done: s3},
		{Step: 4, Title: "Penyelia & Ikrar Materai", Desc: "SDM Muslim & Komitmen Halal", Done: s4},
		{Step: 5, Title: "Pengajuan Akun SIHALAL", Desc: "ptsp.halal.go.id & Submit BPJPH", Done: s5},
	}

	// Completed Items [V]
	completed := make([]AuditItem, 0)
	if m.KtpPemilik {
		completed = append(completed, AuditItem{Key: "ktp_pemilik", Pilar: "Pilar 1: Legalitas", Label: "KTP Pemilik Usaha", Desc: "KTP-el pemohon terlampir dan aktif."})
	}
	if m.HasValidNIB {
		completed = append(completed, AuditItem{Key: "nib", Pilar: "Pilar 1: Legalitas", Label: "NIB OSS-RBA", Desc: fmt.Sprintf("Nomor NIB: %s terdaftar resmi.", m.NIB)})
	}
	if m.KBLI {
		completed = append(completed, AuditItem{Key: "kbli", Pilar: "Pilar 1: Legalitas", Label: "KBLI Pangan Olahan", Desc: "Kode KBLI sesuai bidang pangan olahan."})
	}
	if m.Sihalal {
		completed = append(completed, AuditItem{Key: "sihalal", Pilar: "Pilar 1: Legalitas", Label: "Akun SIHALAL", Desc: "Akun BPJPH aktif di ptsp.halal.go.id."})
	}
	if m.Permohonan {
		completed = append(completed, AuditItem{Key: "permohonan", Pilar: "Pilar 1: Legalitas", Label: "Surat Permohonan", Desc: "Draf surat permohonan sertifikasi siap."})
	}

	if m.DaftarBahan {
		completed = append(completed, AuditItem{Key: "daftar_bahan", Pilar: "Pilar 2: Bahan Baku", Label: "Rincian Bahan Baku", Desc: "Formula semua bahan telah didata lengkap."})
	}
	if m.BahanNonKritis {
		completed = append(completed, AuditItem{Key: "bahan_nonkritis", Pilar: "Pilar 2: Bahan Baku", Label: "Bahan Non-Kritis", Desc: "Komposisi nabati positive list verified."})
	}
	if m.BahanKritisHalal {
		completed = append(completed, AuditItem{Key: "bahan_kritis_halal", Pilar: "Pilar 2: Bahan Baku", Label: "Sertifikat Halal Bumbu", Desc: "Bukti sertifikat halal pabrikan telah disetor."})
	}
	if m.AirBersih {
		completed = append(completed, AuditItem{Key: "air_bersih", Pilar: "Pilar 2: Bahan Baku", Label: "Air Bersih Higienis", Desc: "Sumber air bersih memenuhi standar pangan."})
	}

	if m.DapurBersih {
		completed = append(completed, AuditItem{Key: "dapur_bersih", Pilar: "Pilar 3: Proses PPH", Label: "Sanitasi Dapur Produksi", Desc: "Area dapur bersih dan bebas najis/hewan."})
	}
	if m.AlatKhusus {
		completed = append(completed, AuditItem{Key: "alat_khusus", Pilar: "Pilar 3: Proses PPH", Label: "Pemisahan Alat Masak", Desc: "Wajan & alat khusus pengolahan halal."})
	}
	if m.ManualSJPH {
		completed = append(completed, AuditItem{Key: "manual_sjph", Pilar: "Pilar 3: Proses PPH", Label: "Manual SJPH Tertulis", Desc: "SOP komitmen halal sederhana tersusun."})
	}
	if m.KemasanHigienis {
		completed = append(completed, AuditItem{Key: "kemasan_higienis", Pilar: "Pilar 3: Proses PPH", Label: "Kemasan Rapat Higienis", Desc: "Kemasan tertutup rapat bebas kontaminasi."})
	}

	if m.PenyeliaNama != "" {
		completed = append(completed, AuditItem{Key: "penyelia_nama", Pilar: "Pilar 4: Komitmen", Label: "Penyelia Halal Muslim", Desc: fmt.Sprintf("Penyelia ditunjuk: %s.", m.PenyeliaNama)})
	}
	if m.PenyeliaKtp {
		completed = append(completed, AuditItem{Key: "penyelia_ktp", Pilar: "Pilar 4: Komitmen", Label: "Salinan KTP Penyelia", Desc: "KTP penyelia telah diarsipkan pendamping."})
	}
	if m.SuratPenyelia {
		completed = append(completed, AuditItem{Key: "surat_penyelia", Pilar: "Pilar 4: Komitmen", Label: "SK Penetapan Penyelia", Desc: "Surat penetapan resmi telah ditandatangani."})
	}
	if m.IkrarMaterai {
		completed = append(completed, AuditItem{Key: "ikrar_materai", Pilar: "Pilar 4: Komitmen", Label: "Ikrar Halal Bermaterai", Desc: "Surat ikrar bermaterai Rp10.000 sah."})
	}
	if m.NamaLayak {
		completed = append(completed, AuditItem{Key: "nama_layak", Pilar: "Pilar 4: Komitmen", Label: "Nama Merek Halal", Desc: "Bebas dari konotasi haram/syaitan."})
	}
	m.CompletedItems = completed

	// Pending Items [X]
	pending := make([]PendingItem, 0)
	if !m.HasValidNIB {
		pending = append(pending, PendingItem{Key: "nib", Pilar: "Pilar 1: Legalitas", Label: "Belum Ada NIB OSS-RBA", Action: "Segera daftar NIB di portal oss.go.id dengan dibantu pendamping."})
	}
	if !m.KBLI {
		pending = append(pending, PendingItem{Key: "kbli", Pilar: "Pilar 1: Legalitas", Label: "KBLI Belum Sesuai", Action: "Ubah kode izin usaha ke KBLI pangan olahan/kudapan."})
	}
	if !m.Sihalal {
		pending = append(pending, PendingItem{Key: "sihalal", Pilar: "Pilar 1: Legalitas", Label: "Akun SIHALAL Belum Aktif", Action: "Buat akun di ptsp.halal.go.id menggunakan NIB pemilik."})
	}
	if !m.Permohonan {
		pending = append(pending, PendingItem{Key: "permohonan", Pilar: "Pilar 1: Legalitas", Label: "Surat Permohonan Belum Dibuat", Action: "Cetak formulir surat permohonan sertifikasi self-declare."})
	}

	if !m.DaftarBahan {
		pending = append(pending, PendingItem{Key: "daftar_bahan", Pilar: "Pilar 2: Bahan Baku", Label: "Rincian Bahan Belum Ditulis", Action: "Tuliskan seluruh komposisi bahan dan bumbu dalam formulir."})
	}
	if !m.BahanNonKritis {
		pending = append(pending, PendingItem{Key: "bahan_nonkritis", Pilar: "Pilar 2: Bahan Baku", Label: "Bahan Belum Terverifikasi", Action: "Pastikan bahan nabati masuk daftar positive list Kemenag."})
	}
	if !m.BahanKritisHalal {
		pending = append(pending, PendingItem{Key: "bahan_kritis_halal", Pilar: "Pilar 2: Bahan Baku", Label: "Bukti Halal Bumbu Kurang", Action: "Kumpulkan foto kemasan/sertifikat halal bumbu olahan pabrik."})
	}
	if !m.AirBersih {
		pending = append(pending, PendingItem{Key: "air_bersih", Pilar: "Pilar 2: Bahan Baku", Label: "Sumber Air Perlu Dicek", Action: "Pastikan air bebas bau dan layak standar higiene pangan."})
	}

	if !m.DapurBersih {
		pending = append(pending, PendingItem{Key: "dapur_bersih", Pilar: "Pilar 3: Proses PPH", Label: "Sanitasi Dapur Perlu Dibenahi", Action: "Bersihkan area dapur produksi agar terhindar dari najis/hewan."})
	}
	if !m.AlatKhusus {
		pending = append(pending, PendingItem{Key: "alat_khusus", Pilar: "Pilar 3: Proses PPH", Label: "Alat Masak Belum Terpisah", Action: "Sediakan wajan & pisau khusus hanya untuk produk halal."})
	}
	if !m.ManualSJPH {
		pending = append(pending, PendingItem{Key: "manual_sjph", Pilar: "Pilar 3: Proses PPH", Label: "Manual SJPH Belum Disusun", Action: "Isi formulir Manual SJPH sederhana panduan Fatayat NU."})
	}
	if !m.KemasanHigienis {
		pending = append(pending, PendingItem{Key: "kemasan_higienis", Pilar: "Pilar 3: Proses PPH", Label: "Kemasan Belum Tertutup Rapat", Action: "Gunakan kemasan tertutup rapat untuk mencegah kontaminasi."})
	}

	if m.PenyeliaNama == "" {
		pending = append(pending, PendingItem{Key: "penyelia_nama", Pilar: "Pilar 4: Komitmen", Label: "Penyelia Belum Ditunjuk", Action: "Tunjuk salah satu pekerja/keluarga muslim sebagai penyelia."})
	}
	if !m.PenyeliaKtp {
		pending = append(pending, PendingItem{Key: "penyelia_ktp", Pilar: "Pilar 4: Komitmen", Label: "Salinan KTP Penyelia Kurang", Action: "Lampirkan fotokopi KTP penyelia halal."})
	}
	if !m.SuratPenyelia {
		pending = append(pending, PendingItem{Key: "surat_penyelia", Pilar: "Pilar 4: Komitmen", Label: "Surat Penetapan Belum Ada", Action: "Tandatangani SK Penetapan Penyelia Halal internal usaha."})
	}
	if !m.IkrarMaterai {
		pending = append(pending, PendingItem{Key: "ikrar_materai", Pilar: "Pilar 4: Komitmen", Label: "Ikrar Halal Belum Bermaterai", Action: "Bubuhkan materai Rp10.000 pada Surat Pernyataan Ikrar Halal."})
	}
	if !m.NamaLayak {
		pending = append(pending, PendingItem{Key: "nama_layak", Pilar: "Pilar 4: Komitmen", Label: "Nama Merek Mengandung Konotasi Dilarang", Action: "Sesuaikan nama merek agar bebas dari istilah yang dilarang."})
	}
	m.PendingItems = pending
}

// ============================================================================
// DATA STORE
// ============================================================================

type Store struct {
	sync.RWMutex
	filePath string
	members  []Member
}

func NewStore(filePath string) (*Store, error) {
	s := &Store{filePath: filePath}
	err := s.Load()
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Store) Load() error {
	s.Lock()
	defer s.Unlock()

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return err
	}

	var members []Member
	if err := json.Unmarshal(data, &members); err != nil {
		return err
	}

	for i := range members {
		RecalculateMember(&members[i])
	}
	s.members = members
	return nil
}

func (s *Store) Save() error {
	data, err := json.MarshalIndent(s.members, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath, data, 0644)
}

func (s *Store) GetAll(category, status, search string) []Member {
	s.RLock()
	defer s.RUnlock()

	search = strings.ToLower(strings.TrimSpace(search))
	result := make([]Member, 0)

	for _, m := range s.members {
		if category != "" && category != "ALL" && m.Kategori != category {
			continue
		}
		if status != "" && status != "ALL" && m.Status != status {
			continue
		}
		if search != "" {
			nameMatch := strings.Contains(strings.ToLower(m.Nama), search)
			usahaMatch := strings.Contains(strings.ToLower(m.Usaha), search)
			idMatch := strings.Contains(strings.ToLower(m.ID), search)
			nibMatch := strings.Contains(strings.ToLower(m.NIB), search)
			if !nameMatch && !usahaMatch && !idMatch && !nibMatch {
				continue
			}
		}
		result = append(result, m)
	}
	return result
}

func (s *Store) GetByID(id string) (*Member, bool) {
	s.RLock()
	defer s.RUnlock()

	for _, m := range s.members {
		if strings.EqualFold(m.ID, id) {
			res := m
			return &res, true
		}
	}
	return nil, false
}

func (s *Store) ToggleCriterion(id string, fieldKey string) (*Member, error) {
	s.Lock()
	defer s.Unlock()

	var target *Member
	for i := range s.members {
		if strings.EqualFold(s.members[i].ID, id) {
			target = &s.members[i]
			break
		}
	}
	if target == nil {
		return nil, fmt.Errorf("member with ID %s not found", id)
	}

	switch fieldKey {
	case "nib":
		if hasValidNIB(target.NIB) {
			target.NIB = "-"
		} else {
			target.NIB = "820349281999"
		}
	case "kbli":
		target.KBLI = !target.KBLI
	case "sihalal":
		target.Sihalal = !target.Sihalal
	case "permohonan":
		target.Permohonan = !target.Permohonan
	case "daftar_bahan":
		target.DaftarBahan = !target.DaftarBahan
	case "bahan_nonkritis":
		target.BahanNonKritis = !target.BahanNonKritis
	case "bahan_kritis_halal":
		target.BahanKritisHalal = !target.BahanKritisHalal
	case "air_bersih":
		target.AirBersih = !target.AirBersih
	case "dapur_bersih":
		target.DapurBersih = !target.DapurBersih
	case "alat_khusus":
		target.AlatKhusus = !target.AlatKhusus
	case "manual_sjph":
		target.ManualSJPH = !target.ManualSJPH
	case "kemasan_higienis":
		target.KemasanHigienis = !target.KemasanHigienis
	case "penyelia_ktp":
		target.PenyeliaKtp = !target.PenyeliaKtp
	case "surat_penyelia":
		target.SuratPenyelia = !target.SuratPenyelia
	case "ikrar_materai":
		target.IkrarMaterai = !target.IkrarMaterai
	case "nama_layak":
		target.NamaLayak = !target.NamaLayak
	default:
		return nil, fmt.Errorf("unknown criterion field: %s", fieldKey)
	}

	RecalculateMember(target)
	_ = s.Save()

	res := *target
	return &res, nil
}

func (s *Store) Update(id string, updated Member) (*Member, error) {
	s.Lock()
	defer s.Unlock()

	for i := range s.members {
		if strings.EqualFold(s.members[i].ID, id) {
			// Update mutable fields while keeping ID
			m := &s.members[i]
			m.Nama = updated.Nama
			m.Usaha = updated.Usaha
			m.Kategori = updated.Kategori
			m.Kontak = updated.Kontak
			m.Alamat = updated.Alamat
			m.NIB = updated.NIB
			m.KBLI = updated.KBLI
			m.Sihalal = updated.Sihalal
			m.Permohonan = updated.Permohonan
			m.DaftarBahan = updated.DaftarBahan
			m.BahanNonKritis = updated.BahanNonKritis
			m.BahanKritisHalal = updated.BahanKritisHalal
			m.AirBersih = updated.AirBersih
			m.DapurBersih = updated.DapurBersih
			m.AlatKhusus = updated.AlatKhusus
			m.ManualSJPH = updated.ManualSJPH
			m.KemasanHigienis = updated.KemasanHigienis
			m.PenyeliaNama = updated.PenyeliaNama
			m.PenyeliaKtp = updated.PenyeliaKtp
			m.SuratPenyelia = updated.SuratPenyelia
			m.IkrarMaterai = updated.IkrarMaterai
			m.NamaLayak = updated.NamaLayak

			RecalculateMember(m)
			_ = s.Save()

			res := *m
			return &res, nil
		}
	}
	return nil, fmt.Errorf("member with ID %s not found", id)
}

func (s *Store) GetStats() Stats {
	s.RLock()
	defer s.RUnlock()

	total := len(s.members)
	if total == 0 {
		return Stats{}
	}

	siap := 0
	pendampingan := 0
	belum := 0

	for _, m := range s.members {
		if m.Skor >= 80 {
			siap++
		} else if m.Skor >= 50 {
			pendampingan++
		} else {
			belum++
		}
	}

	return Stats{
		Total:           total,
		SiapDaftar:      siap,
		Pendampingan:    pendampingan,
		BelumSiap:       belum,
		SiapDaftarPct:   int(math.Round(float64(siap) * 100.0 / float64(total))),
		PendampinganPct: int(math.Round(float64(pendampingan) * 100.0 / float64(total))),
		BelumSiapPct:    int(math.Round(float64(belum) * 100.0 / float64(total))),
	}
}

func (s *Store) GetBottlenecks() []Bottleneck {
	s.RLock()
	defer s.RUnlock()

	total := len(s.members)
	if total == 0 {
		return []Bottleneck{}
	}

	nibCount := 0
	bumbuCount := 0
	sjphCount := 0
	sihalalCount := 0
	ikrarCount := 0

	for _, m := range s.members {
		if !m.HasValidNIB {
			nibCount++
		}
		if !m.BahanKritisHalal {
			bumbuCount++
		}
		if !m.ManualSJPH {
			sjphCount++
		}
		if !m.Sihalal {
			sihalalCount++
		}
		if !m.IkrarMaterai {
			ikrarCount++
		}
	}

	calcPct := func(count int) int {
		return int(math.Round(float64(count) * 100.0 / float64(total)))
	}

	return []Bottleneck{
		{
			Label:   "NIB Belum Ada / Belum OSS-RBA",
			Percent: calcPct(nibCount),
			Count:   nibCount,
			Color:   "from-red-500 to-rose-600",
			Dot:     "bg-red-500",
			Note:    "Perlu fasilitasi pendampingan pembuatan akun OSS di balai desa.",
		},
		{
			Label:   "Bukti Halal Bumbu Olahan Belum Lengkap",
			Percent: calcPct(bumbuCount),
			Count:   bumbuCount,
			Color:   "from-amber-500 to-orange-500",
			Dot:     "bg-amber-500",
			Note:    "Pengumpulan foto kemasan / nomor sertifikat halal bahan pabrikan.",
		},
		{
			Label:   "Belum Ada Manual SJPH Tertulis (SOP PPH)",
			Percent: calcPct(sjphCount),
			Count:   sjphCount,
			Color:   "from-yellow-400 to-amber-500",
			Dot:     "bg-yellow-500",
			Note:    "Dibantu dengan formulir template SJPH standar Fatayat NU.",
		},
		{
			Label:   "Akun SIHALAL Belum Aktif (ptsp.halal.go.id)",
			Percent: calcPct(sihalalCount),
			Count:   sihalalCount,
			Color:   "from-blue-500 to-indigo-600",
			Dot:     "bg-blue-500",
			Note:    "Registrasi email pemilik usaha dan sinkronisasi data NIB.",
		},
		{
			Label:   "Belum Tanda Tangan Surat Ikrar Halal Bermaterai",
			Percent: calcPct(ikrarCount),
			Count:   ikrarCount,
			Color:   "from-emerald-500 to-green-700",
			Dot:     "bg-emerald-500",
			Note:    "Pemberian materai Rp10.000 dan penandatanganan kolektif ranting.",
		},
	}
}

func (s *Store) GetCategories() CategoryDistribution {
	s.RLock()
	defer s.RUnlock()

	total := len(s.members)
	if total == 0 {
		return CategoryDistribution{}
	}

	kudapan := 0
	basah := 0
	minuman := 0

	for _, m := range s.members {
		switch m.Kategori {
		case "Kudapan Kering":
			kudapan++
		case "Makanan Basah":
			basah++
		case "Minuman":
			minuman++
		}
	}

	calcPct := func(count int) int {
		return int(math.Round(float64(count) * 100.0 / float64(total)))
	}

	return CategoryDistribution{
		Labels:      []string{"Kudapan Kering", "Makanan Basah", "Minuman"},
		Data:        []int{kudapan, basah, minuman},
		Percentages: []int{calcPct(kudapan), calcPct(basah), calcPct(minuman)},
		Colors:      []string{"#1E4D2B", "#D97706", "#3B82F6"},
	}
}

// ============================================================================
// HTTP HANDLERS & MIDDLEWARE
// ============================================================================

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func sendJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func sendError(w http.ResponseWriter, status int, message string) {
	sendJSON(w, status, map[string]string{"error": message})
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dataPath := filepath.Join("data", "members.json")
	if _, err := os.Stat(dataPath); os.IsNotExist(err) {
		// Fallback path check
		altPath := filepath.Join("Certification-dashboard", "backend", "data", "members.json")
		if _, err := os.Stat(altPath); err == nil {
			dataPath = altPath
		}
	}

	store, err := NewStore(dataPath)
	if err != nil {
		log.Fatalf("Error loading store from %s: %v", dataPath, err)
	}

	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, http.StatusOK, map[string]interface{}{
			"status":  "ok",
			"app":     "SIM-HALAL Fatayat NU Mersi API (Golang)",
			"version": "2.0.0",
			"members": len(store.members),
		})
	})

	// Get Stats KPI
	mux.HandleFunc("GET /api/stats", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, http.StatusOK, store.GetStats())
	})

	// Get Bottlenecks
	mux.HandleFunc("GET /api/bottlenecks", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, http.StatusOK, store.GetBottlenecks())
	})

	// Get Category Distribution
	mux.HandleFunc("GET /api/categories", func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, http.StatusOK, store.GetCategories())
	})

	// Reset Data
	mux.HandleFunc("POST /api/reset", func(w http.ResponseWriter, r *http.Request) {
		if err := store.Load(); err != nil {
			sendError(w, http.StatusInternalServerError, "Gagal mereset data: "+err.Error())
			return
		}
		sendJSON(w, http.StatusOK, map[string]interface{}{
			"message": "Dataset master 45 UMKM berhasil di-reset",
			"stats":   store.GetStats(),
		})
	})

	// List Members
	mux.HandleFunc("GET /api/members", func(w http.ResponseWriter, r *http.Request) {
		category := r.URL.Query().Get("category")
		status := r.URL.Query().Get("status")
		search := r.URL.Query().Get("search")
		members := store.GetAll(category, status, search)
		sendJSON(w, http.StatusOK, members)
	})

	// Get Member by ID
	mux.HandleFunc("GET /api/members/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		member, found := store.GetByID(id)
		if !found {
			sendError(w, http.StatusNotFound, fmt.Sprintf("Anggota dengan ID %s tidak ditemukan", id))
			return
		}
		sendJSON(w, http.StatusOK, member)
	})

	// Toggle Criterion
	mux.HandleFunc("POST /api/members/{id}/toggle", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		var body struct {
			Field string `json:"field"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Field == "" {
			sendError(w, http.StatusBadRequest, "Field 'field' wajib dikirim")
			return
		}

		updated, err := store.ToggleCriterion(id, body.Field)
		if err != nil {
			sendError(w, http.StatusBadRequest, err.Error())
			return
		}
		sendJSON(w, http.StatusOK, updated)
	})

	// Update Member
	mux.HandleFunc("PUT /api/members/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		var updated Member
		if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
			sendError(w, http.StatusBadRequest, "Format JSON data anggota tidak valid")
			return
		}

		res, err := store.Update(id, updated)
		if err != nil {
			sendError(w, http.StatusNotFound, err.Error())
			return
		}
		sendJSON(w, http.StatusOK, res)
	})

	handler := corsMiddleware(mux)

	fmt.Println("============================================================")
	fmt.Printf("🚀 SIM-HALAL Golang Backend aktif di http://localhost:%s\n", port)
	fmt.Println("   API Docs: GET /api/health, GET /api/members, GET /api/stats")
	fmt.Println("============================================================")

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
