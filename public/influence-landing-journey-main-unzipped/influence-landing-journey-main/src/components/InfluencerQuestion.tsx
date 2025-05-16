
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface InfluencerQuestionProps {
  onSelectFollowerCount: (hasEnoughFollowers: boolean) => void;
  onBack: () => void;
}

const InfluencerQuestion: React.FC<InfluencerQuestionProps> = ({ 
  onSelectFollowerCount,
  onBack
}) => {
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('InfluencerQuestion back button clicked');
    onBack();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-slide-in">
      <button 
        onClick={handleBack} 
        className="flex items-center text-brand-purple mb-8 hover:underline gap-2 transition-transform hover:translate-x-[-4px]"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      
      <div className="main-card">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Do you have more than 5,000 followers on any social media platform?
        </h2>
        
        <div className="w-32 h-32 mx-auto mb-8 animate-float">
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNyA5TDEwIDE2TDcgMTMiIHN0cm9rZT0iIzNBODZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAyMkM2LjQ3NzE1IDIyIDIgMTcuNTIyOCAyIDEyQzIgNi40NzcxNSA2LjQ3NzE1IDIgMTIgMkMxNy41MjI4IDIgMjIgNi40NzcxNSAyMiAxMkMyMiAxNy41MjI4IDE3LjUyMjggMjIgMTIgMjJaIiBzdHJva2U9IiMzQTg2RkYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+Cg==" 
            alt="Followers Count" 
            className="w-full h-full"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button 
            className="button-primary"
            onClick={() => onSelectFollowerCount(true)}
          >
            Yes, I have 5,000+ followers
          </Button>
          
          <Button
            variant="outline"
            className="button-secondary"
            onClick={() => onSelectFollowerCount(false)}
          >
            Not yet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerQuestion;
