import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaLeaf, FaRecycle, FaMoneyBillWave, FaBookOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const tips = [
  { title: 'Pilih Wadah yang Tepat', content: 'Gunakan ember berlubang atau komposter Takakura untuk sirkulasi udara yang baik.', icon: <FaRecycle /> },
  { title: 'Potong Bahan Kecil', content: 'Sampah organik yang dipotong kecil akan lebih cepat terurai.', icon: <FaLeaf /> },
  { title: 'Aduk Rutin', content: 'Balik kompos setiap 3–7 hari untuk mempercepat proses penguraian.', icon: <FaBookOpen /> },
  { title: 'Gunakan Aktivator', content: 'Tambahkan EM4 atau air bekas cucian beras untuk mempercepat fermentasi.', icon: <FaMoneyBillWave /> },
];

const Blog = () => {
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-teal-100 to-blue-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.95 }}
            className="mr-4"
          >
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-3 bg-white/30 backdrop-blur-md rounded-xl border border-white/20 text-gray-800 font-semibold hover:bg-gradient-to-r hover:from-indigo-600 hover:to-teal-600 hover:text-white transition-all duration-300 shadow-md"
              aria-label="Kembali ke Beranda"
            >
              <FaArrowLeft className="text-xl animate-pulse" />
              <span>Kembali</span>
            </Link>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Edukasi Pengolahan Kompos
          </h1>
        </div>

        {/* Blog Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 space-y-8"
        >
          {/* Section 1: What is Compost? */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaLeaf className="text-green-500" /> Apa itu Kompos & Manfaatnya?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Kompos adalah <b>pupuk organik</b> yang dihasilkan dari pelapukan bahan organik seperti sisa sayuran, kulit buah, daun kering, dan kotoran hewan dengan bantuan mikroba. Kompos membantu menyuburkan tanah, mengurangi sampah organik, dan mengurangi ketergantungan pada pupuk kimia.
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>Mengembalikan unsur hara ke tanah.</li>
              <li>Meningkatkan struktur fisik dan biologis tanah.</li>
              <li>Mengurangi emisi gas rumah kaca dari sampah organik.</li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-gray-500 italic">Sumber: Jurnal Fakultas Pertanian Unila, Cipta Media Harmoni</p>
            </div>
          </section>

          {/* Section 2: Education & Composting Programs */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBookOpen className="text-teal-500" /> Edukasi & Program Pembuatan Kompos
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Program edukasi kompos di Indonesia telah menunjukkan hasil positif melalui pendekatan interaktif seperti ceramah, diskusi, dan praktik langsung. Berikut beberapa contoh:
            </p>
            <div className="grid gap-4 mt-4">
              <div className="p-4 bg-white/20 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800">SD di Desa Kanaungan, Makassar</h3>
                <p className="text-gray-600 text-sm">
                  Murid diajarkan membuat kompos dari sampah rumah tangga, tanah gambut, dan air bekas cucian beras. Pengetahuan meningkat hingga <b>25%</b> berdasarkan evaluasi pre-test dan post-test.
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800">Desa Poncokusumo, Malang</h3>
                <p className="text-gray-600 text-sm">
                  Warga belajar memilah sampah dan membuat kompos sederhana, dengan antusiasme tinggi untuk menerapkannya di rumah.
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800">Desa Kedungsuren, Kendal</h3>
                <p className="text-gray-600 text-sm">
                  85% kader PKK memahami pembuatan kompos melalui demo dan penyuluhan, berencana mempraktikkannya di rumah.
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800">Desa Burai, Sumatera Selatan</h3>
                <p className="text-gray-600 text-sm">
                  Menggunakan metode kompos padat, cair, dan padat-cair, menghasilkan kompos dari ~8 kg sampah dalam 20–40 hari, dengan potensi pendapatan dari penjualan.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 italic">Sumber: Bima Berilmu, Prasetya UB, Aspirasi Journal, Sriwijaya University</p>
            </div>
          </section>

          {/* Section 3: Practical Steps */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaRecycle className="text-indigo-500" /> Langkah Praktis Membuat Kompos
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Membuat kompos di rumah atau sekolah mudah dilakukan dengan langkah-langkah berikut:
            </p>
            <ol className="list-decimal pl-6 mt-2 text-gray-600 space-y-2">
              <li>Siapkan <b>wadah berlubang</b> seperti ember, drum, atau komposter Takakura.</li>
              <li>Lapisi dasar wadah dengan tanah gambut atau lindi.</li>
              <li>Tambahkan <b>sampah organik</b> (daun, kulit buah, sayuran) yang sudah dipotong kecil.</li>
              <li>Susun secara selang-seling dengan lapisan tanah.</li>
              <li>Tambahkan air atau aktivator seperti EM4 untuk mempercepat fermentasi.</li>
              <li>Tutup wadah dan <b>aduk setiap 3–7 hari</b>.</li>
              <li>Kompos akan matang dalam <b>3–6 minggu</b>, tergantung metode.</li>
            </ol>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Progres Pembuatan Kompos</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Hari 1–7: Persiapan & Fermentasi Awal</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-teal-500" style={{ width: '20%' }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hari 8–21: Proses Penguraian</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-yellow-500" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hari 22–42: Kompos Matang</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-green-500" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 italic">Sumber: Jurnal Bima Berilmu, Cipta Media Harmoni, IGES</p>
            </div>
          </section>

          {/* Section 4: Interactive Tips */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBookOpen className="text-green-500" /> Tips Cepat Membuat Kompos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                  className="p-4 bg-white/20 rounded-xl flex items-start gap-3 cursor-pointer"
                >
                  <div className="text-2xl text-teal-500">{tip.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 5: Benefits & Conclusion */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-yellow-500" /> Manfaat & Kesimpulan
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Edukasi kompos meningkatkan pengetahuan, keterampilan, dan kesadaran lingkungan. Program di berbagai daerah menunjukkan peningkatan pemahaman hingga 25% dan potensi ekonomi dari penjualan kompos.
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Manfaat Utama:</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li><b>Pengetahuan & Keterampilan:</b> Meningkat hingga 25% (Jurnal Bima Berilmu).</li>
                <li><b>Ekonomi:</b> Penjualan kompos menambah pendapatan masyarakat.</li>
                <li><b>Lingkungan:</b> Mengurangi sampah organik dan emisi gas rumah kaca.</li>
              </ul>
            </div>
            <div className="mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 backdrop-blur-sm">
                    <th className="p-3 border-b text-sm font-semibold text-gray-800">Aspek</th>
                    <th className="p-3 border-b text-sm font-semibold text-gray-800">Ringkasan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/20">
                    <td className="p-3 border-b text-sm text-gray-700">Definisi</td>
                    <td className="p-3 border-b text-sm text-gray-700">Pupuk organik dari sampah rumah tangga, diproses oleh mikroba.</td>
                  </tr>
                  <tr className="hover:bg-white/20">
                    <td className="p-3 border-b text-sm text-gray-700">Metode Edukasi</td>
                    <td className="p-3 border-b text-sm text-gray-700">Ceramah, diskusi, praktik langsung, evaluasi.</td>
                  </tr>
                  <tr className="hover:bg-white/20">
                    <td className="p-3 border-b text-sm text-gray-700">Metode Komposting</td>
                    <td className="p-3 border-b text-sm text-gray-700">Komposter drum, Takakura, kompos padat/cair.</td>
                  </tr>
                  <tr className="hover:bg-white/20">
                    <td className="p-3 border-b text-sm text-gray-700">Durasi</td>
                    <td className="p-3 border-b text-sm text-gray-700">3–6 minggu, aduk tiap 3–7 hari.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 italic">Sumber: Prasetya UB, Jurnal Bima Berilmu</p>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mulai Sekarang!</h2>
            <p className="text-gray-600 mb-6">
              Jadilah bagian dari solusi lingkungan dengan membuat kompos di rumah. Kurangi sampah, suburkan tanah, dan ciptakan masa depan yang lebih hijau!
            </p>
            <motion.a
              href="https://www.iges.or.jp/en/publication_documents/pub/training/id/10749/Bandung_compost_manual_bahasa.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              <FaLeaf /> Unduh Panduan Kompos
            </motion.a>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Blog;