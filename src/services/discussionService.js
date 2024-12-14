// backend/src/services/discussionService.js
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const getDiscussionsByResultId = async (resultId) => {
    try {
      const discussions = await prisma.result.findUnique({
        where: { id: resultId },
        include: {
          detail_result: {
            include: {
              option: {
                include: {
                  multiplechoice: {
                    select: {
                      discussion: true,
                      question: true,
                      option: {
                        select: {
                          isCorrect: true,
                          optionDescription: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
  
      if (!discussions) {
        throw new Error('Result not found');
      }
  
      // Map the data to return necessary information
      const formattedDiscussions = discussions.detail_result.map(detail => ({
        question: detail.option.multiplechoice.question,
        discussion: detail.option.multiplechoice.discussion,
        userAnswer: detail.userAnswer,
        correctOption: detail.option.multiplechoice.option
          .filter(opt => opt.isCorrect)
          .map(opt => opt.optionDescription)
      }));
  
      return formattedDiscussions;
    } catch (error) {
      console.error('Error fetching discussions:', error);
      throw error;
    }
  };

  export const generateDiscussionPDF = async (resultId) => {
    try {
      const discussions = await getDiscussionsByResultId(resultId);
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, left: 50, right: 50, bottom: 50 }
      });
  
      // Hapus kode yang berkaitan dengan font Poppins
      // const fontPath = path.resolve('/usr/src/app/src/public/Poppins-Regular.ttf');
      // doc.registerFont('Poppins', fontPath);
  
      // Gunakan font default (Helvetica)
      doc.font('Helvetica');
  
      // Tambahkan header
      doc.fontSize(24).fillColor('#0B61AA').text('Pembahasan Soal', { align: 'center' });
      doc.moveDown();
  
      // Tambahkan logo (jika ada)
      // Pastikan path logo benar dan file ada
      try {
        const logoPath = path.resolve(__dirname, '../../public/image/logofix.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 50 });
        } else {
          console.log('Logo file not found:', logoPath);
        }
      } catch (error) {
        console.error('Error adding logo:', error);
      }
  
      doc.moveDown();
  
    discussions.forEach((item, index) => {
      // Nomor soal dengan latar belakang
      doc.fillColor('#FFFFFF')
         .rect(50, doc.y, 30, 30)
         .fill('#0B61AA')
         .fillColor('#FFFFFF')
         .fontSize(16)
         .text(`${index + 1}`, 50, doc.y - 25, { width: 30, align: 'center' });

      // Pertanyaan
      doc.moveDown(0.5)
         .fontSize(14)
         .fillColor('#000000')
         .text(`Soal: ${item.question}`, { width: 500 });

      // Jawaban pengguna
      doc.moveDown(0.5)
         .fontSize(12)
         .fillColor('#4A4A4A')
         .text(`Jawaban Anda: ${item.userAnswer}`, { width: 500 });

      // Pembahasan
      doc.moveDown(0.5)
         .fontSize(12)
         .fillColor('#0B61AA')
         .text('Pembahasan:', { continued: true })
         .fillColor('#000000')
         .text(` ${item.discussion}`, { width: 500 });

      // Garis pemisah antar soal
      if (index < discussions.length - 1) {
        doc.moveDown()
           .strokeColor('#CCCCCC')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
      }

      doc.moveDown();
    });

    // Tambahkan nomor halaman
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#000000')
         .fontSize(10)
         .text(
           `Halaman ${i + 1} dari ${range.count}`,
           50,
           doc.page.height - 50,
           { align: 'center', width: doc.page.width - 100 }
         );
    }

    // Finalisasi dokumen PDF
    doc.end();

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};