import { PrismaClient } from '@prisma/client';
import { Category, Type } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const author = await prisma.author.findFirst();
  if (!author) {
    throw new Error('No author found. Please create an author first.');
  }

  const test = await prisma.test.create({
    data: {
      authorId: author.id,
      category: Category.CPNS,
      type: Type.PilihanGanda,
      title: 'Paket Tes CPNS 2023 (Testing)',
      testDescription: 'Paket latihan tes CPNS untuk testing, mencakup TKP dan Non-TKP',
      price: 50000,
      worktime: 30, // 30 menit
      isPublished: true,
      multiplechoice: {
        create: [
          // TKP Questions (isWeighted: true)
          ...Array(5).fill(null).map((_, index) => ({
            pageName: 'TKP',
            question: `Pertanyaan TKP ${index + 1}: Dalam situasi kerja yang menuntut kecepatan, Anda akan...`,
            number: index + 1,
            isWeighted: true,
            discussion: `Pembahasan untuk pertanyaan TKP ${index + 1}: Pilihan yang menunjukkan keseimbangan antara kecepatan dan ketelitian adalah yang terbaik.`,
            option: {
              create: [
                { optionDescription: 'Mengabaikan detail demi kecepatan', points: 1, isCorrect: false },
                { optionDescription: 'Bekerja sesuai prosedur meski lambat', points: 3, isCorrect: false },
                { optionDescription: 'Menyeimbangkan kecepatan dan ketelitian', points: 5, isCorrect: false },
                { optionDescription: 'Meminta bantuan rekan kerja', points: 2, isCorrect: false },
                { optionDescription: 'Menolak tugas tersebut', points: 1, isCorrect: false },
              ]
            }
          })),

          // Non-TKP Questions (isWeighted: false)
          ...Array(5).fill(null).map((_, index) => ({
            pageName: 'Non-TKP',
            question: `Pertanyaan Non-TKP ${index + 1}: Berapa hasil dari 15 x 7?`,
            number: index + 1,
            isWeighted: false,
            weight: 1,
            discussion: `Pembahasan untuk pertanyaan Non-TKP ${index + 1}: 15 x 7 = 105`,
            option: {
              create: [
                { optionDescription: '95', isCorrect: false },
                { optionDescription: '100', isCorrect: false },
                { optionDescription: '105', isCorrect: true },
                { optionDescription: '110', isCorrect: false },
                { optionDescription: '115', isCorrect: false },
              ]
            }
          })),
        ]
      }
    }
  });

  console.log(`Created test with id: ${test.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });