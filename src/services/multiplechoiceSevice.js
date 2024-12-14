import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createMultipleChoiceService = async (testId, questions) => {
    // Untuk setiap soal (question) yang dikirim, kita buat Multiplechoice beserta Option-nya
    const multipleChoices = await Promise.all(
        questions.map(async (question) => {
            const multiplechoice = await prisma.multiplechoice.create({
                data: {
                    testId: testId,
                    question: question.question,
                    number: question.number,
                    questionPhoto: question.questionPhoto || null,  // Bisa opsional
                    weight: question.weight,
                    discussion: question.discussion || "",  // Bisa opsional
                    option: {
                        create: question.options.map((option) => ({
                            optionDescription: option.optionDescription,
                            isCorrect: option.isCorrect,
                        })),
                    },
                },
                include: {
                    option: true, // Include related options in the result
                },
            });
            return multiplechoice;
        })
    );

    return multipleChoices;
};

const getMultipleChoiceService = async (testId) => {
    return await prisma.multiplechoice.findMany({
        where: {
            testId: testId,
        },
        include: {
            option: true,
        },
    });
}

export { createMultipleChoiceService, getMultipleChoiceService }; // Menggunakan named export



// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// const createMultipleChoiceService = async (testId, questions) => {
//     // Untuk setiap soal (question) yang dikirim, kita buat Multiplechoice beserta Option-nya
//     const multipleChoices = await Promise.all(
//         questions.map(async (question) => {
//             const multiplechoice = await prisma.multiplechoice.create({
//                 data: {
//                     testId: testId,
//                     question: question.question,
//                     number: question.number,
//                     questionPhoto: question.questionPhoto || null,  // Bisa opsional
//                     weight: question.weight,
//                     discussion: question.discussion || "",  // Bisa opsional
//                     option: {
//                         create: question.options.map((option) => ({
//                             optionDescription: option.optionDescription,
//                             isCorrect: option.isCorrect
//                         })),
//                     },
//                 },
//                 include: {
//                     option: true, // Include related options in the result
//                 },
//             });
//             return multiplechoice;
//         })
//     );

//     return multipleChoices;
// };

// module.exports = { createMultipleChoiceService };
