
import React from 'react';
import { Button } from './ui/button';

interface UserTypeSelectorProps {
  onSelectUserType: (type: 'user' | 'influencer') => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onSelectUserType }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 animation-fade-in">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-12">
        Find Your <span className="bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-transparent">Perfect Path</span>
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div 
          className="main-card group cursor-pointer hover:border-brand-purple/30 hover:translate-y-[-4px]"
          onClick={() => onSelectUserType('user')}
        >
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 mb-6 animate-float">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjEyIiBjeT0iOSIgcj0iMyIgc3Ryb2tlPSIjM0E4NkZGIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xNy43OTcgMTcuNzk3QzE2LjUzMiAxNi41MzIgMTQuMzIyIDE2IDEyIDE2QzkuNjc4IDE2IDcuNDY3IDE2LjUzMiA2LjIwMyAxNy43OTciIHN0cm9rZT0iIzNBODZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9IiMzQTg2RkYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+" 
                alt="User Icon" 
                className="w-full h-full"
              />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-4">I'm Looking for Guidance</h3>
            <p className="text-center text-muted-foreground mb-6">
              Get personalized coaching, discover new routines, and track your progress on your self-improvement journey.
            </p>
            <Button className="w-full button-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Select
            </Button>
          </div>
        </div>

        <div 
          className="main-card group cursor-pointer hover:border-brand-teal/30 hover:translate-y-[-4px]"
          onClick={() => onSelectUserType('influencer')}
        >
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 mb-6 animate-float">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04IDEzVjE3TTEyIDEwVjE3TTE2IDdWMTciIHN0cm9rZT0iIzRDQzlGMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjgiIGN5PSI3IiByPSIyIiBzdHJva2U9IiM0Q0M5RjAiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBjeD0iMTYiIGN5PSIzIiByPSIyIiBzdHJva2U9IiM0Q0M5RjAiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSI2IiByPSIyIiBzdHJva2U9IiM0Q0M5RjAiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTIwIDE5QzIwIDIwLjEwNDYgMTkuMTA0NiAyMSAxMyAyMUM2Ljg5NTQzIDIxIDYgMjAuMTA0NiA2IDE5QzYgMTcuODk1NCA2Ljg5NTQzIDE3IDEzIDE3QzE5LjEwNDYgMTcgMjAgMTcuODk1NCAyMCAxOVoiIHN0cm9rZT0iIzRDQzlGMCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L3N2Zz4K" 
                alt="Coach Icon" 
                className="w-full h-full"
              />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-4">I'm an Influencer/Coach</h3>
            <p className="text-center text-muted-foreground mb-6">
              Share your expertise, build your client base, and grow your online presence with our coaching platform.
            </p>
            <Button className="w-full button-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;
