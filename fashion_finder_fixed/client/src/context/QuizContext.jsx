import { createContext, useState, useContext, useEffect } from 'react';
import { getQuizResponses } from '../services/api';

const QuizContext = createContext();

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [quizResponses, setQuizResponses] = useState([]);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  // We'll handle user check later
  const user = null;

  useEffect(() => {
    const fetchQuizResponses = async () => {
      if (user) {
        try {
          setLoading(true);
          const responses = await getQuizResponses();
          setQuizResponses(responses);
          setHasCompletedQuiz(responses.length > 0);
        } catch (error) {
          console.error('Error fetching quiz responses:', error);
          setQuizResponses([]);
          setHasCompletedQuiz(false);
        } finally {
          setLoading(false);
        }
      } else {
        setQuizResponses([]);
        setHasCompletedQuiz(false);
        setLoading(false);
      }
    };

    fetchQuizResponses();
  }, [user]);

  const saveQuizResponses = (responses) => {
    setQuizResponses(responses);
    setHasCompletedQuiz(true);
  };

  const clearQuizResponses = () => {
    setQuizResponses([]);
    setHasCompletedQuiz(false);
  };

  const value = {
    quizResponses,
    hasCompletedQuiz,
    loading,
    saveQuizResponses,
    clearQuizResponses
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
