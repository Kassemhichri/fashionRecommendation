import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { submitQuizResponses } from '../services/api';
import { useToast } from '@/hooks/use-toast';

// Quiz questions
const quizQuestions = [
  {
    id: 'style_preference',
    question: "What's your preferred style?",
    options: [
      { id: 'minimalist', label: 'Minimalist', imgUrl: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'casual', label: 'Casual', imgUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'formal', label: 'Formal', imgUrl: 'https://images.unsplash.com/photo-1521341057461-6eb5f40b07ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' }
    ]
  },
  {
    id: 'color_preference',
    question: 'Which colors do you prefer?',
    options: [
      { id: 'neutral', label: 'Neutral Colors', imgUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'vibrant', label: 'Vibrant Colors', imgUrl: 'https://images.unsplash.com/photo-1549989476-69a92fa57c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'pastel', label: 'Pastel Colors', imgUrl: 'https://images.unsplash.com/photo-1556909114-44e3665e0ec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' }
    ]
  },
  {
    id: 'occasion',
    question: 'What occasions do you typically dress for?',
    options: [
      { id: 'everyday', label: 'Everyday Casual', imgUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'work', label: 'Work/Office', imgUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'special', label: 'Special Events', imgUrl: 'https://images.unsplash.com/photo-1553267751-1c148a7280a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' }
    ]
  },
  {
    id: 'price_range',
    question: 'What is your preferred price range?',
    options: [
      { id: 'budget', label: 'Budget Friendly', imgUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'mid_range', label: 'Mid-Range', imgUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'premium', label: 'Premium Quality', imgUrl: 'https://images.unsplash.com/photo-1508162245510-bf3f9e2f125d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' }
    ]
  },
  {
    id: 'brand_preference',
    question: 'Do you prefer certain brands?',
    options: [
      { id: 'no_preference', label: 'No Brand Preference', imgUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'mainstream', label: 'Popular Mainstream Brands', imgUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' },
      { id: 'luxury', label: 'Luxury Brands', imgUrl: 'https://images.unsplash.com/photo-1554342872-034a06541bad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80' }
    ]
  }
];

const StyleQuiz = () => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveQuizResponses } = useQuiz();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleOptionSelect = (questionId, optionId) => {
    setResponses({
      ...responses,
      [questionId]: optionId
    });
  };

  const handlePreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleNextStep = () => {
    if (step < quizQuestions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save your quiz results",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Format responses for API
      const formattedResponses = Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        response
      }));

      // Save to context
      saveQuizResponses(formattedResponses);
      
      // Submit to API
      await submitQuizResponses(formattedResponses);
      
      toast({
        title: "Quiz Completed!",
        description: "Your preferences have been saved. Redirecting to recommendations..."
      });
      
      // Redirect to recommendations
      setTimeout(() => {
        setLocation('/recommendations');
      }, 1500);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to save your quiz responses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = quizQuestions[step];
  const progress = ((step + 1) / quizQuestions.length) * 100;

  return (
    <section id="quiz" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">Personalize Your Fashion Experience</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answer a few questions about your style preferences to get personalized recommendations tailored just for you.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-neutral-100 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Style Quiz</h3>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  Step <span className="text-primary">{step + 1}</span> of {quizQuestions.length}
                </span>
                <div className="ml-3 bg-neutral-200 w-24 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xl font-medium mb-6">{currentQuestion.question}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentQuestion.options.map(option => (
                  <div 
                    key={option.id}
                    className={`quiz-option ${responses[currentQuestion.id] === option.id ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                  >
                    <div className="aspect-w-1 aspect-h-1 mb-4">
                      <img 
                        src={option.imgUrl} 
                        alt={option.label} 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                    <h5 className="font-medium text-center">{option.label}</h5>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                className="text-gray-500 font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
                onClick={handlePreviousStep}
                disabled={step === 0}
              >
                Previous
              </button>
              <button 
                className="bg-primary text-white font-medium py-2 px-6 rounded-lg hover:bg-opacity-90 transition disabled:opacity-70"
                onClick={handleNextStep}
                disabled={!responses[currentQuestion.id] || isSubmitting}
              >
                {step < quizQuestions.length - 1 ? 'Next' : 'Finish Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StyleQuiz;
