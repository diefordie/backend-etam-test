import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';

pdfMake.vfs = pdfFonts.pdfMake.vfs; 

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        const formattedDiscussions = discussions.detail_result.map(detail => ({
            pageName: detail.option.multiplechoice.pageName,
            question: detail.option.multiplechoice.question,
            discussion: detail.option.multiplechoice.discussion,
            userAnswer: detail.userAnswer,
            correctOption: detail.option.multiplechoice.option
                .filter(opt => opt.isCorrect)
                .map(opt => opt.optionDescription),
            allOptions: detail.option.multiplechoice.option.map(opt => opt.optionDescription)
        }));

        return {
            test: discussions.test,
            discussions: formattedDiscussions
        };
    } catch (error) {
        console.error('Error fetching discussions:', error);
        throw error;
    }
};

export const generateDiscussionPDF = async (resultId) => {
    try {
        const { test, discussions } = await getDiscussionsByResultId(resultId);

        const content = [];

        const logoPath = path.join(__dirname, '../../src/public/logofix.png');
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoImage = `data:image/png;base64,${logoBase64}`;

        content.push({
            columns: [
                {
                    image: logoImage,
                    width: 120,
                    margin: [0, 0, 0, 0]
                },
                {
                    text: [
                        { text: `Latihan Tes ${test.category}\n`, style: 'headerCategory' },
                        { text: `${test.title}`, style: 'headerTitle' }
                    ],
                    alignment: 'left',
                    margin: [5, 0, 0, 0]
                }
            ],
            margin: [0, 0, 0, 5],
            columnGap: 5,
        });

        const downloadDate = new Date().toLocaleString();
        content.push({
            text: `Diunduh pada: ${downloadDate}`,
            style: 'subheader',
            alignment: 'right',
            margin: [0, 0, 0, 5],
        });

        const groupedDiscussions = discussions.reduce((acc, curr) => {
            if (!acc[curr.pageName]) acc[curr.pageName] = [];
            acc[curr.pageName].push(curr);
            return acc;
        }, {});

        Object.keys(groupedDiscussions).forEach(pageName => {
            content.push({
                text: `${pageName}`,
                style: 'sectionHeader'
            });

            const tableData = groupedDiscussions[pageName].map((item, index) => {
                // Menambahkan abjad atau angka sebagai pengganti bullet
                const optionsList = item.allOptions.map((opt, idx) => {
                    return `${String.fromCharCode(65 + idx)}. ${opt}`; // Menggunakan abjad: A, B, C, ...
                }).join('\n');

                return [
                    { text: `${index + 1}`, alignment: 'center', margin: [5, 5] },
                    {
                        text: [
                            { text: `${item.question}\n`, style: 'question' },
                            {
                                // Menampilkan opsi dengan abjad atau angka
                                text: optionsList,
                                style: 'optionList',
                                margin: [10, 0]  // Mengatur margin untuk tampilan rapi
                            }
                        ],
                        alignment: 'left',
                        margin: [5, 5]
                    },
                    {
                        text: `Jawaban Anda: ${item.userAnswer}\n\nPembahasan:\n${item.discussion}`,
                        alignment: 'left',
                        margin: [5, 5],
                        fontSize: 12, // Pembahasan dengan ukuran lebih besar
                    }
                ];
            });

            content.push({
                style: 'table',
                table: {
                    headerRows: 1,
                    widths: ['10%', '50%', '40%'],
                    body: [
                        [
                            { text: 'No', style: 'tableHeader' },
                            { text: 'Soal dan Opsi', style: 'tableHeader' },
                            { text: 'Jawaban dan Pembahasan', style: 'tableHeader' }
                        ],
                        ...tableData
                    ]
                },
                layout: {
                    fillColor: (rowIndex) => rowIndex % 2 === 0 ? '#F3F3F3' : null
                }
            });
        });

        const docDefinition = {
            content,
            styles: {
                headerCategory: {
                    fontSize: 18,
                    bold: true
                },
                headerTitle: {
                    fontSize: 22,
                    bold: true
                },
                subheader: {
                    fontSize: 10,
                    italics: true
                },
                sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 20, 0, 10]
                },
                table: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'white',
                    fillColor: '#06549D',
                    alignment: 'center'
                },
                question: {
                    fontSize: 12,
                    bold: true
                },
                optionList: {
                    fontSize: 12,
                    margin: [10, 0]  // Menyesuaikan margin untuk opsi
                }
            },
            footer: (currentPage, pageCount) => {
                return {
                    columns: [
                        { text: 'Etam Test - Informatika ITK\'22', alignment: 'left', fontSize: 8 },
                        { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', fontSize: 8 }
                    ],
                    margin: [10, 0]
                };
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        const pdfDoc = pdfMake.createPdf(docDefinition);

        pdfDoc.getBuffer((buffer) => {
            fs.writeFileSync(path.join(__dirname, 'discussion.pdf'), buffer);
        });

        return pdfDoc;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
