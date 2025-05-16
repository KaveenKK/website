
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface UserMessageProps {
  type: 'user' | 'influencer-insufficient' | 'influencer-success';
  onBack?: () => void;
  onContinue?: () => void;
  onSignup?: () => void;
  onInstall?: () => void;
}

const UserMessage: React.FC<UserMessageProps> = ({ 
  type, 
  onBack,
  onContinue,
  onSignup,
  onInstall
}) => {
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBack) {
      console.log('UserMessage back button clicked');
      onBack();
    }
  };

  const renderContent = () => {
    switch(type) {
      case 'user':
        return (
          <div className="main-card animate-slide-in">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              Welcome to Your Self-Improvement Journey!
            </h2>
            
            <div className="w-32 h-32 mx-auto mb-6 animate-float">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMiAyMlYxOE0xMiAxOEMxMC4zMTMxIDE4IDkgMTYuNjg2OSA5IDE1QzkgMTMuMzEzMSAxMC4zMTMxIDEyIDEyIDEyQzEzLjY4NjkgMTIgMTUgMTMuMzEzMSAxNSAxNUMxNSAxNi42ODY5IDEzLjY4NjkgMTggMTIgMThaTTEyIDhDMTEuNDQ3NyA4IDExIDcuNTUyMjggMTEgN0MxMSA2LjQ0NzcyIDExLjQ0NzcgNiAxMiA2QzEyLjU1MjMgNiAxMyA2LjQ0NzcyIDEzIDdDMTMgNy41NTIyOCAxMi41NTIzIDggMTIgOFpNMTIgOFYxMiIgc3Ryb2tlPSIjM0E4NkZGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzNBODZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L3N2Zz4K" 
                alt="User Journey" 
                className="w-full h-full"
              />
            </div>
            
            <p className="text-center text-muted-foreground mb-8">
              You're in the right place! Our self-improvement platform connects you with expert coaches to help you reach your personal and professional goals.
            </p>
            
            <p className="text-center font-medium mb-8">
              For the best experience, install our app and sign up to get started.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                className="button-primary"
                onClick={onInstall}
              >
                Install App
              </Button>
              
              {onContinue && (
                <Button 
                  variant="outline"
                  className="button-secondary"
                  onClick={onContinue}
                >
                  I'm Already in the App
                </Button>
              )}
            </div>
          </div>
        );
        
      case 'influencer-insufficient':
        return (
          <div className="main-card animate-slide-in">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              Keep Growing Your Audience!
            </h2>
            
            <div className="w-32 h-32 mx-auto mb-6 animate-pulse-soft">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNiAxNkwxMiAyMkw4IDE2IiBzdHJva2U9IiM0Q0M5RjAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTIgMlYxOCIgc3Ryb2tlPSIjNENDOUYwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+Cg==" 
                alt="Growth Icon" 
                className="w-full h-full"
              />
            </div>
            
            <p className="text-center text-muted-foreground mb-8">
              We love your enthusiasm! Our coach platform is currently designed for influencers with established audiences of 5,000+ followers.
            </p>
            
            <p className="text-center font-medium mb-8">
              In the meantime, we encourage you to join as a user and experience the platform from the client side while you grow your following.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                className="button-primary"
                onClick={onSignup}
              >
                Sign Up as User
              </Button>
              
              <Button 
                variant="outline"
                className="button-secondary"
                onClick={onBack}
              >
                Go Back
              </Button>
            </div>
          </div>
        );
        
      case 'influencer-success':
        return (
          <div className="main-card animate-slide-in">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              Perfect! You're Ready to Join as a Coach
            </h2>
            
            <div className="w-32 h-32 mx-auto mb-6 animate-float">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMiAxM1YxNkgxNkMyMCAxNi4wMDAzIDIyIDE0IDIyIDEzWiIgc3Ryb2tlPSIjNENDOUYwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTIyIDhWMTEiIHN0cm9rZT0iIzRDQzlGMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAyQzE2LjQxODMgMiAyMCA1LjU4MTcyIDIwIDEwQzIwIDE0LjQxODMgMTYuNDE4MyAxOCAxMiAxOEM3LjU4MTcyIDE4IDQgMTQuNDE4MyA0IDEwQzQgNS41ODE3MiA3LjU4MTcyIDIgMTIgMloiIHN0cm9rZT0iIzRDQzlGMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPgo=" 
                alt="Coach Success" 
                className="w-full h-full"
              />
            </div>
            
            <p className="text-center text-muted-foreground mb-8">
              With your established audience, you're positioned to make a real impact on our platform. You'll be able to share your expertise, build your client base, and grow your coaching business.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                className="button-primary"
                onClick={onContinue}
              >
                Continue to Coach Dashboard
              </Button>
              
              <Button 
                variant="outline"
                className="button-secondary"
                onClick={onBack}
              >
                Go Back
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {onBack && (
        <button 
          onClick={handleBack} 
          className="flex items-center text-brand-purple mb-8 hover:underline gap-2 transition-transform hover:translate-x-[-4px]"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      )}
      
      {renderContent()}
    </div>
  );
};

export default UserMessage;
