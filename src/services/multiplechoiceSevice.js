import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createMultipleChoiceService = async (testId, questions) => {
    console.log("testId:", testId);
    console.log("questions:", questions);
    
    const multipleChoices = await Promise.all(
        questions.map(async (question) => {

            if (!/^\d+(\.\d+)?$/.test(question.weight)) {
                throw new Error(`Invalid weight value for question number ${question.number}. Weight must be a positive number without any signs, and can contain at most one decimal point.`);
            }

            const multiplechoice = await prisma.multiplechoice.create({
                data: {
                    testId: testId,
                    pageName: question.pageName,
                    question: question.question,
                    number: question.number,
                    questionPhoto: question.questionPhoto || null, 
                    weight: parseFloat(question.weight),
                    discussion: question.discussion || "",  
                    option: {
                        create: question.options.map((option) => ({
                            optionDescription: option.optionDescription,
                            isCorrect: option.isCorrect,
                        })),
                    },
                },
                include: {
                    option: true, 
                },
            });
            return multiplechoice;
        })
    );

    return multipleChoices;
};

export { createMultipleChoiceService }; 

const updateMultipleChoiceService = async (multiplechoiceId, updatedData) => {
    const { pageName, question, number, questionPhoto, weight, discussion, options } = updatedData;

    const updateMultipleChoice = await prisma.multiplechoice.update({
        where: {id: multiplechoiceId},
        data: {
            pageName,
            question,
            number,
            questionPhoto,
            weight,
            discussion,
        },
    });

    if (options && options.length > 0) {
        await Promise.all(
            options.map(async (option) => {
                if (option.id) {
                    await prisma.option.update({
                        where: { id: option.id },
                        data: {
                            optionDescription: option.optionDescription,
                            isCorrect: option.isCorrect,
                        },
                    });
                } else {
                    await prisma.option.create({
                        data: {
                            multiplechoiceId,
                            optionDescription: option.optionDescription,
                            isCorrect: option.isCorrect,
                        },
                    });
                }
            })
        );
    }

    return updateMultipleChoice;
};

export { updateMultipleChoiceService };

const getMultipleChoiceService = async (testId) => {
    const multipleChoices = await prisma.multiplechoice.findMany({
        where: {
            testId: testId,
            pageName: pageName || undefined,
        },
        include: {
            option: true, 
        },
    });
    
    return multipleChoices;
};

export { getMultipleChoiceService };

const getMultipleChoiceByIdService = async (id) => {
    try {
    const multipleChoice = await prisma.multiplechoice.findUnique({
        where: { id: id },
        include: {
            option: true, 
        },
    });
    if (!multipleChoice) {
        throw new Error('Multiple choice not found');
    }
    return multipleChoice;
    } catch (error) {
        throw error;
    }
};

export { getMultipleChoiceByIdService };

const deleteMultipleChoiceService = async (multiplechoiceId) => {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Get the question and its test ID before deletion
            const questionToDelete = await tx.multiplechoice.findUnique({
                where: { id: multiplechoiceId },
                select: {
                    number: true,
                    testId: true
                }
            });

            if (!questionToDelete) {
                throw new Error('Multiple choice question not found');
            }

            // 2. Delete all related options first
            await tx.option.deleteMany({
                where: {
                    multiplechoiceId: multiplechoiceId
                }
            });

            // 3. Delete the question itself
            await tx.multiplechoice.delete({
                where: {
                    id: multiplechoiceId
                }
            });

            // 4. Update the numbers of remaining questions
            await tx.multiplechoice.updateMany({
                where: {
                    testId: questionToDelete.testId,
                    number: {
                        gt: questionToDelete.number
                    }
                },
                data: {
                    number: {
                        decrement: 1
                    }
                }
            });

            // 5. Get updated questions for verification
            const updatedQuestions = await tx.multiplechoice.findMany({
                where: { testId: questionToDelete.testId },
                orderBy: { number: 'asc' },
                include: {
                    option: true
                }
            });

            return {
                success: true,
                deletedQuestionNumber: questionToDelete.number,
                remainingQuestions: updatedQuestions
            };
        });
    } catch (error) {
        console.error('Error in deleteMultipleChoiceService:', error);
        throw error;
    }
};

export { deleteMultipleChoiceService };

const getQuestionsByTestId = async (testId) => {
  try {
      const questions = await prisma.question.findMany({
          where: {
              testId: testId, 
            },
        });
        return questions; 
    } catch (error) {
        throw new Error('Error fetching questions: ' + error.message);
    }
};

export { getQuestionsByTestId };

const fetchMultipleChoiceByNumberAndTestId = async (testId, number, pageName) => {
    return await prisma.multiplechoice.findFirst({
        where: {
            testId: testId,
            number: number,
            pageName: pageName,
        },
    });
};

export {fetchMultipleChoiceByNumberAndTestId};

const updateMultipleChoicePageNameService = async (testId, number, newPageName) => {
    return await prisma.multiplechoice.updateMany({
        where: {
            testId: testId,
            number: number,
        },
        data: {
            pageName: newPageName,
        },
    });
};

export {updateMultipleChoicePageNameService};

const getPagesByTestIdService = async (testId) => {
    return await prisma.multiplechoice.findMany({
      where: { testId: testId },
      select: {
        number: true,
        pageName: true,
      },
    });
  };
  
  export { getPagesByTestIdService };
  
const getQuestionNumbersServices = async (testId) => {
    const result = await prisma.multiplechoice.findMany({
      where: {
        testId: testId,
      },
      select: {
        number: true,
      },
    });
  
    return result.map((item) => item.number);
  };
  
  const updateQuestionNumberServices = async (testId, oldNumber, newNumber) => {
    console.log('Updating question numbers in database:');
    console.log(`testId: ${testId}, oldNumber: ${oldNumber}, newNumber: ${newNumber}`);
  
    await prisma.multiplechoice.updateMany({
      where: {
        testId: testId,
        number: {
          gte: oldNumber,
        },
      },
      data: {
        number: {
          increment: 1,
        },
      },
    });
  
    console.log('Question numbers updated successfully');
  };
  
  export{
    getQuestionNumbersServices,
    updateQuestionNumberServices,
  };