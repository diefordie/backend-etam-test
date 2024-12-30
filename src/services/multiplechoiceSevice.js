import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMultipleChoiceService = async (testId, questions) => {
    console.log("testId:", testId);
    console.log("questions:", questions);
    
    const multipleChoices = await Promise.all(
        questions.map(async (question) => {
            // if (!/^\d+(\.\d+)?$/.test(question.weight)) {
            //     throw new Error(`Invalid weight value for question number ${question.number}. Weight must be a positive number without any signs, and can contain at most one decimal point.`);
            // }

            if (question.options.length > 5) {
                throw new Error("Each question can have a maximum of 5 options.");
            }

            const multiplechoice = await prisma.multiplechoice.create({
                data: {
                    pageName: question.pageName,
                    question: question.question,
                    number: question.number,
                    questionPhoto: question.questionPhoto || null, 
                    weight: question.isWeighted ? null : parseFloat(question.weight),
                    discussion: question.discussion || "",
                    isWeighted: question.isWeighted || false,  
                    test: {
                        connect: { id: testId },
                    },
                    option: {
                        create: question.options.map((option) => ({
                            optionDescription: option.optionDescription,
                            optionPhoto: option.optionPhoto || null,
                            isCorrect: question.isWeighted ? null : option.isCorrect, 
                            points: question.isWeighted ? option.points : null, 
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



export const updateMultipleChoiceService = async (multiplechoiceId, updatedData) => {
    const { 
        pageName, 
        question, 
        number, 
        questionPhoto, 
        weight, 
        discussion, 
        options,
        isWeighted
    } = updatedData;

    const weightValue = isWeighted ? 0 : parseFloat(weight);

    const updateMultipleChoice = await prisma.multiplechoice.update({
        where: {id: multiplechoiceId},
        data: {
            pageName,
            question,
            number,
            questionPhoto,
            weight: weightValue,
            discussion,
            isWeighted, 
        },
    });

    if (options && options.length > 0) {
        const existingOptions = await prisma.option.findMany({
            where: { multiplechoiceId },
        });

        await Promise.all(
            options.map(async (option) => {
                const optionData = {
                    optionDescription: option.optionDescription,
                    optionPhoto: option.optionPhoto || null,
                    isCorrect: isWeighted ? null : option.isCorrect,
                    points: isWeighted ? option.points : null,
                };

                if (option.id) {
                    await prisma.option.update({
                        where: { id: option.id },
                        data: optionData,
                    });
                } else {
                    await prisma.option.create({
                        data: {
                            multiplechoiceId,
                            ...optionData,
                        },
                    });
                }
            })
        );
        const optionIdsInRequest = options.map((option) => option.id).filter(Boolean);
        const optionIdsToDelete = existingOptions
            .filter((option) => !optionIdsInRequest.includes(option.id))
            .map((option) => option.id);

        if (optionIdsToDelete.length > 0) {
            await prisma.option.deleteMany({
                where: { id: { in: optionIdsToDelete } },
            });
        }
    }
    return updateMultipleChoice;
};



export const getMultipleChoiceByIdService = async (id) => {
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

export const deleteQuestionAndReorderNumbers = async (multiplechoiceId) => {
  return await prisma.$transaction(async (tx) => {
    const questionToDelete = await tx.multiplechoice.findUnique({
      where: { id: multiplechoiceId },
      select: { id: true, number: true, testId: true },
    });

    if (!questionToDelete) {
      throw new Error('Soal tidak ditemukan');
    }

    console.log('Deleting question:', { id: multiplechoiceId, number: questionToDelete.number });

    // Hapus opsi-opsi terkait terlebih dahulu
    await tx.option.deleteMany({
      where: { multiplechoiceId: multiplechoiceId },
    });

    // Hapus soal yang ditargetkan
    await tx.multiplechoice.delete({
      where: { id: multiplechoiceId },
    });

    // Ambil soal yang perlu diperbarui
    const questionsToUpdate = await tx.multiplechoice.findMany({
      where: {
        testId: questionToDelete.testId,
        number: { gt: questionToDelete.number },
      },
      orderBy: { number: 'asc' },
      select: { id: true, number: true },
    });

    console.log('Questions to update:', questionsToUpdate);

    // Perbarui nomor setiap soal
    const updates = [];
    for (const question of questionsToUpdate) {
      const newNumber = question.number - 1;
      const result = await tx.multiplechoice.update({
        where: { id: question.id },
        data: { number: newNumber },
      });

      console.log(`Updated: ${question.id} from ${question.number} to ${newNumber}`);
      updates.push(result);
    }

    return updates;
  });
};

export const updateQuestionNumber = async (testId, oldNumber, newNumber) => {
    try {
      const existingQuestion = await prisma.multiplechoice.findFirst({
        where: {
          testId: testId,
          number: oldNumber
        }
      });
  
      if (!existingQuestion) {
        throw new Error(`Question with number ${oldNumber} not found in test ${testId}`);
      }
 
      const updatedQuestion = await prisma.multiplechoice.update({
        where: {
          id: existingQuestion.id
        },
        data: {
          number: newNumber,
          updatedAt: new Date()
        }
      });
  
      return updatedQuestion;
    } catch (error) {
      console.error('Error in updateQuestionNumber service:', error);
      throw error;
    }
};

export const updateQuestionNumberService = async (testId, oldNumber, newNumber) => {
    try {
        console.log("data: ", testId, oldNumber, newNumber);
        const updatedQuestion = await prisma.multiplechoice.updateMany({
            where: {
                testId: testId,
                number: oldNumber
            },
            data: {
                number: newNumber
            }
        });

        console.log("update: ", updatedQuestion)
        if (updatedQuestion.count === 0) {
            throw new Error('Soal tidak ditemukan');
        }
        return updatedQuestion;
        
    } catch (error) {
        throw error;
    }
};

export const updatePageNameForQuestion = async (questionNumber, pageName) => {
    try {
        const result = await prisma.multiplechoice.updateMany({
        where: { 
            number: questionNumber 
        }, 
        data: { pageName }, 
      });
  
      return result; // Return the database operation result
    } catch (error) {
      throw new Error('Failed to update question pageName: ' + error.message);
    } finally {
      await prisma.$disconnect(); // Ensure the Prisma client disconnects
    }
  };

export const fetchMultipleChoiceByNumberAndTestId = async (testId, number, pageName) => {
    if (!testId || number === undefined) {
        throw new Error('TestId and number are required');
    }
    
    const query = {
        where: {
            testId: testId,
            number: number,
        },
    };

    if (pageName) {
        query.where.pageName = pageName;
    }

    return await prisma.multiplechoice.findFirst(query);
};


export const updateMultipleChoicePageNameService = async (testId, currentPageName, newPageName) => {
    try {
      if (!prisma || !prisma.multiplechoice) {
        throw new Error('Prisma client not initialized properly');
      }
  
      console.log('Updating with params:', {
        testId,
        currentPageName,
        newPageName
      });
  
      const result = await prisma.multiplechoice.updateMany({
        where: {
          testId: testId,
          pageName: currentPageName, 
        },
        data: {
          pageName: newPageName, 
        },
      });
  
      console.log('Update result:', result);
      return result;
  
    } catch (error) {
      console.error('Error in updateMultipleChoicePageNameService:', error);
      throw error;
    }
};
  


export const getPagesByTestIdService = async (testId) => {
  try {
      // Simple query to check if we can fetch any data
      const anyMultiplechoice = await prisma.multiplechoice.findFirst();
      

      // Original query
      const pages = await prisma.multiplechoice.findMany({
          where: { testId: testId },
          select: {
              pageName: true,
          },
          distinct: ['pageName'],
          orderBy: {
              number: 'asc',
          },
      });

      return pages.map(page => page.pageName);
  } catch (error) {
      console.error('Error in getPagesByTestIdService:', error);
      throw error;
  }
};
  
export const getQuestionNumbersServices = async (testId, category) => {
    const result = await prisma.multiplechoice.findMany({
      where: {
        testId: testId,
        category: category,
      },
      select: {
        number: true,
      },
    });

    return result.map((item) => item.number);
  };

  export const updateQuestionNumberServices = async (testId, oldNumber, newNumber) => {
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

  export const deletePageService = async (testId, pageName) => {
    try {
        return await prisma.$transaction(async (tx) => {
            // Get all questions for this page
            const questionsToDelete = await tx.multiplechoice.findMany({
                where: {
                    testId: testId,
                    pageName: pageName
                }
            });

            // Delete options for all questions
            await tx.option.deleteMany({
                where: {
                    multiplechoiceId: {
                        in: questionsToDelete.map(q => q.id)
                    }
                }
            });

            // Delete all questions for this page
            await tx.multiplechoice.deleteMany({
                where: {
                    testId: testId,
                    pageName: pageName
                }
            });

            return { success: true };
        });
    } catch (error) {
        console.error('Error in deletePageService:', error);
        throw error;
    }
};

export const updateNumberServices = async (testId, oldNumber, newNumber) => {
    await prisma.multiplechoice.update({
      where: {
        testId_number: {
          testId: testId,
          number: oldNumber
        }
      },
      data: {
        number: newNumber
      }
    });
  
    console.log('Question number updated successfully');
};

export const findPreviousQuestion = async (testId, number) => {
  return await prisma.$transaction(async (tx) => {
    const previousQuestion = await tx.multiplechoice.findFirst({
      where: {
        testId: testId,
        number: { lt: parseInt(number, 10) },
      },
      orderBy: { number: 'desc' },
    });
    if (!previousQuestion) {
      throw new Error('Tidak ditemukan soal dengan nomor lebih kecil.');
    }
    const questionsToUpdate = await tx.multiplechoice.findMany({
      where: {
        testId: testId,
        number: { gt: previousQuestion.number },
      },
      orderBy: { number: 'asc' },
    });
    const updates = [];
    for (const question of questionsToUpdate) {
      const newNumber = question.number - 1;
      const updatedQuestion = await tx.multiplechoice.update({
        where: { id: question.id },
        data: { number: newNumber },
      });
      updates.push(updatedQuestion);
    }
    return {
      multiplechoiceId: previousQuestion.id,
      updatedQuestions: updates,
    };
  });
};

export const deleteOptionAndReorder = async (optionId) => {
  return await prisma.$transaction(async (tx) => {
    const optionToDelete = await tx.option.findUnique({
      where: { id: optionId },
      include: {
        multiplechoice: true
      }
    });

    if (!optionToDelete) {
      throw new Error('Option not found');
    }

    await tx.option.delete({
      where: { id: optionId }
    });

    const remainingOptions = await tx.option.findMany({
      where: {
        multiplechoiceId: optionToDelete.multiplechoiceId
      },
      orderBy: {
        id: 'asc'
      }
    });

    const hasCorrectOption = remainingOptions.some(option => option.isCorrect);
    if (!hasCorrectOption && optionToDelete.isCorrect && remainingOptions.length > 0) {
      await tx.option.update({
        where: { id: remainingOptions[0].id },
        data: { isCorrect: true }
      });
    }

    return {
      deletedOption: optionToDelete,
      remainingCount: remainingOptions.length
    };
  });
};