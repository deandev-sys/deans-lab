
import { Question, UserResponse, QuestionType } from '../types';

/**
 * Simplified IRT Algorithm:
 * - Each question has a weight based on its difficulty (1-5).
 * - Correct answers for harder questions give more points.
 * - Score is normalized to a 0-1000 scale.
 */
export const calculateIRTScore = (questions: Question[], responses: Record<string, UserResponse>) => {
  let totalWeightedPoints = 0;
  let maxPossibleWeightedPoints = 0;

  questions.forEach((q) => {
    const response = responses[q.id];
    const difficultyWeight = q.difficulty * 10;
    maxPossibleWeightedPoints += difficultyWeight;

    if (!response || response.answer === null || response.answer === undefined) return;

    let isCorrect = false;

    if (q.type === QuestionType.MULTIPLE_CHOICE) {
      isCorrect = response.answer === q.correctAnswer;
    } else if (q.type === QuestionType.SHORT_ANSWER) {
      isCorrect = response.answer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
    } else if (q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE) {
      // For complex, must be 100% correct
      const userAnswers = response.answer as boolean[];
      // Fix: Add guard to ensure userAnswers exists before indexing
      isCorrect = q.statements?.every((s, idx) => userAnswers && userAnswers[idx] === s.correctValue) ?? false;
    }

    if (isCorrect) {
      totalWeightedPoints += difficultyWeight;
    }
  });

  if (maxPossibleWeightedPoints === 0) return 0;
  
  // Base normalization (0-1000 range)
  const score = (totalWeightedPoints / maxPossibleWeightedPoints) * 1000;
  return Math.round(score);
};

// Fix return type to match Record<string, number> expected by ExamResult
export const getAnalysisBySubject = (questions: Question[], responses: Record<string, UserResponse>): Record<string, number> => {
  const subjects: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q) => {
    if (!subjects[q.subject]) {
      subjects[q.subject] = { correct: 0, total: 0 };
    }

    subjects[q.subject].total += 1;
    const response = responses[q.id];
    
    if (!response || response.answer === null || response.answer === undefined) return;

    let isCorrect = false;

    if (q.type === QuestionType.MULTIPLE_CHOICE) {
      isCorrect = response.answer === q.correctAnswer;
    } else if (q.type === QuestionType.SHORT_ANSWER) {
      isCorrect = response.answer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
    } else if (q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE) {
      const userAnswers = response.answer as boolean[];
      // Fix: Add guard to ensure userAnswers exists before indexing
      isCorrect = q.statements?.every((s, idx) => userAnswers && userAnswers[idx] === s.correctValue) ?? false;
    }

    if (isCorrect) {
      subjects[q.subject].correct += 1;
    }
  });

  // Calculate percentage scores for each subject and return as simple number record
  const subjectScores: Record<string, number> = {};
  Object.keys(subjects).forEach(key => {
    subjectScores[key] = Math.round((subjects[key].correct / subjects[key].total) * 1000);
  });

  return subjectScores;
};
