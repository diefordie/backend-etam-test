import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios"; // Import axios untuk mengambil gambar
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import sanitizeHtml from "sanitize-html";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk membersihkan HTML dengan sanitize-html
function cleanHTML(text) {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

// Fungsi untuk mengonversi gambar menjadi base64
async function getImageBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBase64 = Buffer.from(response.data, "binary").toString("base64");
    return `data:image/png;base64,${imageBase64}`;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Could not fetch image");
  }
}

export const getDiscussionsByResultId = async (resultId) => {
  try {
    const discussions = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        test: true,
        detail_result: {
          include: {
            option: {
              include: {
                multiplechoice: {
                  select: {
                    discussion: true,
                    question: true,
                    pageName: true,
                    questionPhoto: true, // Menambahkan questionPhoto
                    option: {
                      select: {
                        isCorrect: true,
                        optionDescription: true,
                        optionPhoto: true, // Menambahkan optionPhoto
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!discussions) {
      throw new Error("Result not found");
    }

    const formattedDiscussions = discussions.detail_result.map((detail) => ({
      pageName: detail.option.multiplechoice.pageName,
      question: detail.option.multiplechoice.question,
      discussion: detail.option.multiplechoice.discussion,
      questionPhoto: detail.option.multiplechoice.questionPhoto, // Mengambil questionPhoto
      userAnswer: detail.userAnswer,
      correctOption: detail.option.multiplechoice.option
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.optionDescription),
      allOptions: detail.option.multiplechoice.option.map(
        (opt) => opt.optionDescription
      ),
      optionPhotos: detail.option.multiplechoice.option.map(
        (opt) => opt.optionPhoto
      ), // Mengambil optionPhoto untuk setiap opsi
    }));

    return {
      test: discussions.test,
      discussions: formattedDiscussions,
    };
  } catch (error) {
    console.error("Error fetching discussions:", error);
    throw error;
  }
};

export const generateDiscussionPDF = async (resultId) => {
    try {
      const { test, discussions } = await getDiscussionsByResultId(resultId);
  
      const content = [];
  
      const logoPath = path.join(__dirname, "../../src/public/logofix.png");
      const logoBase64 = fs.readFileSync(logoPath).toString("base64");
      const logoImage = `data:image/png;base64,${logoBase64}`;
  
      content.push({
        columns: [
          {
            image: logoImage,
            width: 120,
            margin: [0, 0, 0, 0],
          },
          {
            text: [
              { text: `Latihan Tes ${test.category}\n`, style: "headerCategory" },
              { text: `${test.title}`, style: "headerTitle" },
            ],
            alignment: "left",
            margin: [5, 0, 0, 0],
          },
        ],
        margin: [0, 0, 0, 5],
        columnGap: 5,
      });
  
      const downloadDate = new Date().toLocaleString();
      content.push({
        text: `Diunduh pada: ${downloadDate}`,
        style: "subheader",
        alignment: "right",
        margin: [0, 0, 0, 5],
      });
  
      const groupedDiscussions = discussions.reduce((acc, curr) => {
        if (!acc[curr.pageName]) acc[curr.pageName] = [];
        acc[curr.pageName].push(curr);
        return acc;
      }, {});
  
      // Menambahkan diskusi per halaman
      for (const pageName of Object.keys(groupedDiscussions)) {
        content.push({
          text: `${pageName}`,
          style: "sectionHeader",
        });
  
        const tableData = await Promise.all(
          groupedDiscussions[pageName].map(async (item, index) => {
            // Membersihkan teks dari tag HTML
            const cleanedQuestion = cleanHTML(item.question);
            const cleanedDiscussion = cleanHTML(item.discussion);
  
            // Gambar pertanyaan (Firebase URL)
            const questionImageURL = item.questionPhoto;
  
            // Mendapatkan gambar soal dalam base64
            const questionImageBase64 = questionImageURL
              ? await getImageBase64(questionImageURL)
              : null;
  
            // Mendapatkan gambar untuk setiap opsi dalam base64
            const optionImagesBase64 = await Promise.all(
              item.optionPhotos.map(async (optPhoto) => {
                return optPhoto ? await getImageBase64(optPhoto) : null;
              })
            );
  
            // Menyusun tableData dengan gambar soal dan opsi dalam cell yang sama
            return [
              { text: `${index + 1}`, alignment: "center", margin: [5, 5] },
              {
                stack: [
                  { text: cleanedQuestion, style: "question" },
                  questionImageBase64
                    ? {
                        image: questionImageBase64,
                        width: 100,
                        margin: [0, 5],
                        alignment: "center",
                      }
                    : null,
                  // Menampilkan opsi dan gambar di bawah masing-masing opsi
                  ...item.allOptions.map((opt, idx) => {
                    return [
                      { text: `${String.fromCharCode(65 + idx)}. ${opt}`, style: "optionText" },
                      optionImagesBase64[idx]
                        ? {
                            image: optionImagesBase64[idx],
                            width: 100,
                            margin: [0, 5],
                            alignment: "center",
                          }
                        : null,
                    ];
                  }).flat(),
                ],
                alignment: "left",
                margin: [5, 5],
              },
              {
                text: `Jawaban Anda: ${item.userAnswer}\n\nPembahasan:\n${cleanedDiscussion}`,
                alignment: "left",
                margin: [5, 5],
                fontSize: 12,
              },
            ];
          })
        );
  
        content.push({
          style: "table",
          table: {
            headerRows: 1,
            widths: ["10%", "50%", "40%"],
            body: [
              [
                { text: "No", style: "tableHeader" },
                { text: "Soal dan Opsi", style: "tableHeader" },
                { text: "Jawaban dan Pembahasan", style: "tableHeader" },
              ],
              ...tableData,
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex % 2 === 0 ? "#F3F3F3" : null),
          },
        });
      }
  
      const docDefinition = {
        content,
        styles: {
          headerCategory: {
            fontSize: 18,
            bold: true,
          },
          headerTitle: {
            fontSize: 22,
            bold: true,
          },
          subheader: {
            fontSize: 10,
            italics: true,
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            margin: [0, 20, 0, 10],
          },
          table: {
            margin: [0, 5, 0, 15],
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: "white",
            fillColor: "#06549D",
            alignment: "center",
          },
          question: {
            fontSize: 12,
            bold: true,
          },
          optionText: {
            fontSize: 12,
          },
        },
        footer: (currentPage, pageCount) => {
          return {
            columns: [
              {
                text: "Etam Test - Informatika ITK'22",
                alignment: "left",
                fontSize: 8,
              },
              {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: "right",
                fontSize: 8,
              },
            ],
            margin: [10, 0],
          };
        },
        defaultStyle: {
          font: "Roboto",
        },
      };
  
      const pdfDoc = pdfMake.createPdf(docDefinition);
  
      pdfDoc.getBuffer((buffer) => {
        fs.writeFileSync(path.join(__dirname, "discussion.pdf"), buffer);
      });
  
      return pdfDoc;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  };
  