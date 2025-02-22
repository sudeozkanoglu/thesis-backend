import Question from "../models/questionModel.js";
import Exam from "../models/examsModel.js";

export const addQuestions = async (req, res) => {
  try {
    const { exam, questions } = req.body;

    // Zorunlu alanların kontrolü
    if (!exam || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields or questions array is empty" });
    }

    // Her bir soru için gerekli alanların kontrolünü yapıp, yeni soru nesnelerini hazırla
    const questionDocs = questions.map(q => {
      const { questionText, correctAnswer, explanation } = q;
      if (!questionText || !correctAnswer) {
        throw new Error("Missing required fields in one of the questions");
      }
      return {
        questionText,
        correctAnswer,
        explanation: explanation || "",
        exam,
      };
    });

    // Soruları topluca ekle
    const createdQuestions = await Question.insertMany(questionDocs);

    // Oluşturulan soruların _id'lerini al
    const questionIds = createdQuestions.map(q => q._id);

    // İlgili sınavın questions dizisine yeni soru referanslarını ekle
    const updatedExam = await Exam.findByIdAndUpdate(
      exam,
      { $push: { questions: { $each: questionIds } } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Questions added successfully and exam updated",
      questions: createdQuestions,
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Error adding questions:", error);
    res.status(500).json({
      success: false,
      message: "Error adding questions",
      error: error.message,
    });
  }
};

export const updateQuestions = async (req, res) => {
  try {
    const { updates } = req.body; // updates: [{ id, update }, ...]
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "No updates provided" });
    }

    // Bulk update işlemi için bulkWrite kullanıyoruz
    const bulkOps = updates.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: item.update }
      }
    }));

    const bulkResult = await Question.bulkWrite(bulkOps);

    res.status(200).json({ 
      success: true, 
      message: "Questions updated successfully", 
      result: bulkResult 
    });
  } catch (error) {
    console.error("Error updating questions:", error);
    res.status(500).json({
      success: false,
      message: "Error updating questions",
      error: error.message,
    });
  }
};

export const deleteQuestions = async (req, res) => {
  try {
    const { ids } = req.body; // ids: [questionId1, questionId2, ...]
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No question IDs provided" });
    }

    // Silinecek soruları buluyoruz (her birinin exam bilgisini almak için)
    const questionsToDelete = await Question.find({ _id: { $in: ids } });
    if (!questionsToDelete || questionsToDelete.length === 0) {
      return res.status(404).json({ success: false, message: "No questions found to delete" });
    }

    // Soruları topluca siliyoruz
    const deleteResult = await Question.deleteMany({ _id: { $in: ids } });

    // Her sorunun ait olduğu exam'den bu soru id'lerini çıkartmak için, önce exam'lere göre gruplayalım
    const examUpdates = {};
    questionsToDelete.forEach(q => {
      const examId = q.exam.toString();
      if (!examUpdates[examId]) {
        examUpdates[examId] = [];
      }
      examUpdates[examId].push(q._id);
    });

    // Her exam için questions dizisinden ilgili id'leri çıkartıyoruz
    const examUpdatePromises = Object.keys(examUpdates).map(examId => {
      return Exam.findByIdAndUpdate(
        examId,
        { $pull: { questions: { $in: examUpdates[examId] } } }
      );
    });
    await Promise.all(examUpdatePromises);

    res.status(200).json({ 
      success: true, 
      message: "Questions deleted successfully and exams updated", 
      deleteResult 
    });
  } catch (error) {
    console.error("Error deleting questions:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting questions",
      error: error.message,
    });
  }
};
