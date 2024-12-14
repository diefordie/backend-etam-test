import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Soal-soal dan opsi untuk kategori CPNS
  const cpnsQuestions = [
    {
      question: "Siapa Presiden Indonesia pertama?",
      options: [
        { description: "Soekarno", isCorrect: true },
        { description: "Soeharto", isCorrect: false },
        { description: "BJ Habibie", isCorrect: false },
        { description: "Megawati", isCorrect: false },
      ],
    },
    {
      question: "Apa ibu kota dari provinsi Jawa Tengah?",
      options: [
        { description: "Semarang", isCorrect: true },
        { description: "Surabaya", isCorrect: false },
        { description: "Solo", isCorrect: false },
        { description: "Magelang", isCorrect: false },
      ],
    },
    {
      question: "Apa semboyan negara Indonesia?",
      options: [
        { description: "Bhinneka Tunggal Ika", isCorrect: true },
        { description: "Pancasila", isCorrect: false },
        { description: "Sumpah Pemuda", isCorrect: false },
        { description: "Garuda Pancasila", isCorrect: false },
      ],
    },
    {
      question: "Kapan Indonesia merdeka?",
      options: [
        { description: "17 Agustus 1945", isCorrect: true },
        { description: "1 Juni 1945", isCorrect: false },
        { description: "20 Mei 1945", isCorrect: false },
        { description: "21 April 1945", isCorrect: false },
      ],
    },
    {
      question: "Siapa yang dikenal sebagai Bapak Koperasi Indonesia?",
      options: [
        { description: "Mohammad Hatta", isCorrect: true },
        { description: "Soekarno", isCorrect: false },
        { description: "Soeharto", isCorrect: false },
        { description: "Jenderal Sudirman", isCorrect: false },
      ],
    },
    {
      question: "Dimana letak Candi Borobudur?",
      options: [
        { description: "Magelang", isCorrect: true },
        { description: "Yogyakarta", isCorrect: false },
        { description: "Surakarta", isCorrect: false },
        { description: "Semarang", isCorrect: false },
      ],
    },
    {
      question: "Apa nama lagu kebangsaan Indonesia?",
      options: [
        { description: "Indonesia Raya", isCorrect: true },
        { description: "Garuda Pancasila", isCorrect: false },
        { description: "Bagimu Negeri", isCorrect: false },
        { description: "Indonesia Pusaka", isCorrect: false },
      ],
    },
    {
      question: "Siapakah penulis naskah proklamasi Indonesia?",
      options: [
        { description: "Soekarno dan Hatta", isCorrect: true },
        { description: "Soeharto", isCorrect: false },
        { description: "Sutan Syahrir", isCorrect: false },
        { description: "Ahmad Yani", isCorrect: false },
      ],
    },
    {
      question: "Apa arti semboyan Bhinneka Tunggal Ika?",
      options: [
        { description: "Berbeda-beda tetapi tetap satu", isCorrect: true },
        { description: "Bersatu kita teguh", isCorrect: false },
        { description: "Tanah Airku Indonesia", isCorrect: false },
        { description: "Satu nusa satu bangsa", isCorrect: false },
      ],
    },
    {
      question: "Siapa pendiri Nahdlatul Ulama (NU)?",
      options: [
        { description: "KH Hasyim Asy'ari", isCorrect: true },
        { description: "KH Ahmad Dahlan", isCorrect: false },
        { description: "Soekarno", isCorrect: false },
        { description: "Mohammad Hatta", isCorrect: false },
      ],
    },
  ];

  // Soal-soal dan opsi untuk kategori UTBK
  const utbkQuestions = [
    {
      question: "Berapakah hasil dari 12 + 15?",
      options: [
        { description: "27", isCorrect: true },
        { description: "25", isCorrect: false },
        { description: "30", isCorrect: false },
        { description: "20", isCorrect: false },
      ],
    },
    {
      question: "Siapakah penemu lampu pijar?",
      options: [
        { description: "Thomas Edison", isCorrect: true },
        { description: "Nikola Tesla", isCorrect: false },
        { description: "Alexander Graham Bell", isCorrect: false },
        { description: "Albert Einstein", isCorrect: false },
      ],
    },
    {
      question: "Berapakah hasil dari 24 x 3?",
      options: [
        { description: "72", isCorrect: true },
        { description: "68", isCorrect: false },
        { description: "64", isCorrect: false },
        { description: "80", isCorrect: false },
      ],
    },
    {
      question: "Apa unsur kimia dengan simbol H?",
      options: [
        { description: "Hidrogen", isCorrect: true },
        { description: "Helium", isCorrect: false },
        { description: "Nitrogen", isCorrect: false },
        { description: "Oksigen", isCorrect: false },
      ],
    },
    {
      question: "Siapa yang menulis novel 'Laskar Pelangi'?",
      options: [
        { description: "Andrea Hirata", isCorrect: true },
        { description: "Tere Liye", isCorrect: false },
        { description: "Habiburrahman El Shirazy", isCorrect: false },
        { description: "Dee Lestari", isCorrect: false },
      ],
    },
    {
      question: "Siapa pelukis terkenal dari zaman Renaissance?",
      options: [
        { description: "Leonardo da Vinci", isCorrect: true },
        { description: "Pablo Picasso", isCorrect: false },
        { description: "Vincent van Gogh", isCorrect: false },
        { description: "Salvador Dali", isCorrect: false },
      ],
    },
    {
      question: "Berapakah nilai dari π (pi)?",
      options: [
        { description: "3.14159", isCorrect: true },
        { description: "3.12159", isCorrect: false },
        { description: "2.71828", isCorrect: false },
        { description: "1.61803", isCorrect: false },
      ],
    },
    {
      question: "Siapa ilmuwan yang mengemukakan teori relativitas?",
      options: [
        { description: "Albert Einstein", isCorrect: true },
        { description: "Isaac Newton", isCorrect: false },
        { description: "Galileo Galilei", isCorrect: false },
        { description: "Marie Curie", isCorrect: false },
      ],
    },
    {
      question: "Apa nama ibu kota dari Australia?",
      options: [
        { description: "Canberra", isCorrect: true },
        { description: "Sydney", isCorrect: false },
        { description: "Melbourne", isCorrect: false },
        { description: "Brisbane", isCorrect: false },
      ],
    },
    {
      question: "Apa unsur kimia dengan simbol O?",
      options: [
        { description: "Oksigen", isCorrect: true },
        { description: "Oganesson", isCorrect: false },
        { description: "Osmium", isCorrect: false },
        { description: "Oro", isCorrect: false },
      ],
    },
  ];

  // Soal-soal dan opsi untuk kategori Pemrograman
  const programmingQuestions = [
    {
      question: "Apa itu variable di dalam pemrograman?",
      options: [
        { description: "Tempat untuk menyimpan data", isCorrect: true },
        { description: "Fungsi untuk menampilkan data", isCorrect: false },
        { description: "Struktur untuk menyimpan logika", isCorrect: false },
        { description: "Metode untuk mengulang proses", isCorrect: false },
      ],
    },
    {
      question: "Bahasa pemrograman apa yang biasanya digunakan untuk pengembangan aplikasi web?",
      options: [
        { description: "JavaScript", isCorrect: true },
        { description: "Python", isCorrect: false },
        { description: "C++", isCorrect: false },
        { description: "Java", isCorrect: false },
      ],
    },
    {
      question: "Apa fungsi dari 'for loop' dalam pemrograman?",
      options: [
        { description: "Mengulang eksekusi kode", isCorrect: true },
        { description: "Menghentikan program", isCorrect: false },
        { description: "Menyimpan data", isCorrect: false },
        { description: "Menampilkan data", isCorrect: false },
      ],
    },
    {
      question: "Bahasa pemrograman apa yang paling populer digunakan untuk pengembangan Android?",
      options: [
        { description: "Java", isCorrect: true },
        { description: "Python", isCorrect: false },
        { description: "Ruby", isCorrect: false },
        { description: "PHP", isCorrect: false },
      ],
    },
    {
      question: "Apa perbedaan antara var, let, dan const di JavaScript?",
      options: [
        { description: "Cara variabel diinisialisasi dan ruang lingkupnya", isCorrect: true },
        { description: "Fungsi yang bisa dijalankan", isCorrect: false },
        { description: "Metode looping", isCorrect: false },
        { description: "Mendefinisikan kelas", isCorrect: false },
      ],
    },
    {
      question: "Apa itu 'function' dalam pemrograman?",
      options: [
        { description: "Blok kode yang bisa dijalankan", isCorrect: true },
        { description: "Tempat untuk menyimpan data", isCorrect: false },
        { description: "Metode untuk mengulang proses", isCorrect: false },
        { description: "Deklarasi variabel", isCorrect: false },
      ],
    },
    {
      question: "Apa itu 'object' dalam JavaScript?",
      options: [
        { description: "Kumpulan properti dan nilai", isCorrect: true },
        { description: "Fungsi yang bisa dijalankan", isCorrect: false },
        { description: "Struktur untuk menyimpan data", isCorrect: false },
        { description: "Tipe data dasar", isCorrect: false },
      ],
    },
    {
      question: "Apa yang dimaksud dengan 'recursion' dalam pemrograman?",
      options: [
        { description: "Fungsi yang memanggil dirinya sendiri", isCorrect: true },
        { description: "Metode untuk mengulang proses", isCorrect: false },
        { description: "Struktur data yang dinamis", isCorrect: false },
        { description: "Sistem kontrol alur", isCorrect: false },
      ],
    },
    {
      question: "Apa itu 'API' dalam pengembangan aplikasi?",
      options: [
        { description: "Antarmuka yang memungkinkan interaksi antara sistem", isCorrect: true },
        { description: "Database untuk menyimpan data", isCorrect: false },
        { description: "Sistem operasi aplikasi", isCorrect: false },
        { description: "Bahasa pemrograman", isCorrect: false },
      ],
    },
    {
      question: "Bahasa pemrograman mana yang paling sering digunakan untuk pengembangan server-side?",
      options: [
        { description: "Node.js", isCorrect: true },
        { description: "Ruby", isCorrect: false },
        { description: "C#", isCorrect: false },
        { description: "Go", isCorrect: false },
      ],
    },
  ];

  // Soal-soal dan opsi untuk kategori Psikotes
  const psikotesQuestions = [
    {
      question: "Jika Andi lebih tinggi dari Budi, dan Budi lebih tinggi dari Caca, siapakah yang paling pendek?",
      options: [
        { description: "Caca", isCorrect: true },
        { description: "Budi", isCorrect: false },
        { description: "Andi", isCorrect: false },
        { description: "Tidak dapat dipastikan", isCorrect: false },
      ],
    },
    {
      question: "Jika setiap Senin, Rina selalu datang terlambat, dan hari ini adalah Senin, apa yang bisa kita simpulkan?",
      options: [
        { description: "Rina mungkin akan terlambat", isCorrect: true },
        { description: "Rina pasti tidak terlambat", isCorrect: false },
        { description: "Rina sudah datang tepat waktu", isCorrect: false },
        { description: "Rina selalu datang tepat waktu", isCorrect: false },
      ],
    },
    {
      question: "Jika Toni selalu datang ke sekolah tepat waktu, tetapi hari ini dia tidak masuk, apa yang bisa kita simpulkan?",
      options: [
        { description: "Toni mungkin sakit", isCorrect: true },
        { description: "Toni malas ke sekolah", isCorrect: false },
        { description: "Toni tidak punya uang", isCorrect: false },
        { description: "Tidak ada kesimpulan", isCorrect: false },
      ],
    },
    {
      question: "Apa yang bisa Anda simpulkan jika seorang siswa selalu mendapat nilai tertinggi dalam setiap ujian?",
      options: [
        { description: "Siswa tersebut sangat pintar", isCorrect: true },
        { description: "Siswa tersebut malas", isCorrect: false },
        { description: "Siswa tersebut curang", isCorrect: false },
        { description: "Siswa tersebut tidak pandai", isCorrect: false },
      ],
    },
    {
      question: "Jika dalam suatu pertandingan sepak bola tim A mengalahkan tim B, dan tim B mengalahkan tim C, apakah tim A lebih kuat dari tim C?",
      options: [
        { description: "Mungkin iya", isCorrect: true },
        { description: "Tidak mungkin", isCorrect: false },
        { description: "Pasti tidak", isCorrect: false },
        { description: "Tidak dapat dipastikan", isCorrect: false },
      ],
    },
    {
      question: "Jika seseorang rajin bekerja dan selalu menyelesaikan tugas tepat waktu, apa yang bisa kita simpulkan?",
      options: [
        { description: "Orang tersebut disiplin", isCorrect: true },
        { description: "Orang tersebut malas", isCorrect: false },
        { description: "Orang tersebut sering terlambat", isCorrect: false },
        { description: "Orang tersebut tidak bertanggung jawab", isCorrect: false },
      ],
    },
    {
      question: "Jika Nina selalu belajar setiap malam dan mendapatkan nilai tinggi di ujian, apa yang bisa kita simpulkan?",
      options: [
        { description: "Nina rajin belajar", isCorrect: true },
        { description: "Nina malas", isCorrect: false },
        { description: "Nina tidak pandai", isCorrect: false },
        { description: "Nina curang", isCorrect: false },
      ],
    },
    {
      question: "Apa yang bisa Anda simpulkan jika seseorang selalu datang terlambat ke kantor?",
      options: [
        { description: "Orang tersebut tidak disiplin", isCorrect: true },
        { description: "Orang tersebut rajin", isCorrect: false },
        { description: "Orang tersebut teliti", isCorrect: false },
        { description: "Orang tersebut sangat sibuk", isCorrect: false },
      ],
    },
    {
      question: "Jika Lisa selalu menyelesaikan tugas lebih cepat dari jadwal, apa yang bisa kita simpulkan?",
      options: [
        { description: "Lisa sangat efisien", isCorrect: true },
        { description: "Lisa malas", isCorrect: false },
        { description: "Lisa ceroboh", isCorrect: false },
        { description: "Lisa lambat", isCorrect: false },
      ],
    },
    {
      question: "Apa yang bisa kita simpulkan jika seseorang selalu memberikan ide kreatif di dalam tim?",
      options: [
        { description: "Orang tersebut kreatif", isCorrect: true },
        { description: "Orang tersebut malas", isCorrect: false },
        { description: "Orang tersebut tidak bisa bekerja sama", isCorrect: false },
        { description: "Orang tersebut tidak suka bekerja", isCorrect: false },
      ],
    },
  ];

  const categories = ['CPNS', 'UTBK', 'Pemrograman', 'Psikotes'];
  const questionBank = {
    CPNS: cpnsQuestions,
    UTBK: utbkQuestions,
    Pemrograman: programmingQuestions,
    Psikotes: psikotesQuestions,
  };

  // Loop untuk setiap kategori
  for (const category of categories) {
    // Membuat 3 tes untuk setiap kategori
    for (let i = 1; i <= 3; i++) {
      const test = await prisma.test.create({
        data: {
          authorId: 'cm2bwha730001l6s3ocd5c4nb', // Ganti dengan authorId yang sesuai
          category: category,
          title: `${category} Test ${i}`,
          testDescription: `Ini adalah deskripsi untuk ${category} Test ${i}`,
          price: 0,
          similarity: 90,
          worktime: 120,
          review: `Review untuk ${category} Test ${i}`,
        },
      });

      // Pilih 20 soal acak dari bank soal kategori yang sesuai
      const selectedQuestions = questionBank[category].slice(0, 20);

      // Membuat multiple choice untuk setiap tes
      for (let j = 0; j < selectedQuestions.length; j++) {
        const questionData = selectedQuestions[j];

        const multiplechoice = await prisma.multiplechoice.create({
          data: {
            testId: test.id,
            question: questionData.question,
            number: j + 1,
            questionPhoto: '',
            weight: 10,
            discussion: `Pembahasan untuk pertanyaan nomor ${j + 1}`,
            option: {
              create: questionData.options.map((opt) => ({
                optionDescription: opt.description,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        });
      }
    }
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
