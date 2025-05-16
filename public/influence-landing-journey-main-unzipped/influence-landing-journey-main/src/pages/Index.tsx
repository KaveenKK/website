
import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import UserTypeSelector from '../components/UserTypeSelector';
import InfluencerQuestion from '../components/InfluencerQuestion';
import UserMessage from '../components/UserMessage';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'select-type' | 'influencer-question' | 'user-message'>('select-type');
  const [userType, setUserType] = useState<'user' | 'influencer' | null>(null);
  const [hasEnoughFollowers, setHasEnoughFollowers] = useState<boolean | null>(null);

  const handleSelectUserType = (type: 'user' | 'influencer') => {
    setUserType(type);
    
    if (type === 'user') {
      setCurrentStep('user-message');
    } else {
      setCurrentStep('influencer-question');
    }
  };

  const handleSelectFollowerCount = (hasEnough: boolean) => {
    setHasEnoughFollowers(hasEnough);
    setCurrentStep('user-message');
  };

  const handleBack = () => {
    console.log('Back button clicked - current step:', currentStep, 'userType:', userType);
    
    if (currentStep === 'influencer-question') {
      setCurrentStep('select-type');
      setUserType(null);
    } else if (currentStep === 'user-message') {
      if (userType === 'influencer') {
        setCurrentStep('influencer-question');
        setHasEnoughFollowers(null);
      } else {
        setCurrentStep('select-type');
        setUserType(null);
      }
    }
  };

  const handleInstallApp = () => {
    // This would trigger PWA install prompt in a real app
    console.log('Install app clicked');
  };

  const handleContinue = () => {
    // This would navigate to dashboard in a real app
    console.log('Continue clicked - would redirect to dashboard');
  };

  const handleSignup = () => {
    // This would navigate to signup in a real app
    console.log('Signup clicked - would redirect to signup');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select-type':
        return <UserTypeSelector onSelectUserType={handleSelectUserType} />;
      
      case 'influencer-question':
        return <InfluencerQuestion onSelectFollowerCount={handleSelectFollowerCount} onBack={handleBack} />;
      
      case 'user-message':
        if (userType === 'user') {
          return (
            <UserMessage 
              type="user" 
              onInstall={handleInstallApp}
              onContinue={handleContinue}
              onBack={handleBack}
            />
          );
        } else if (userType === 'influencer') {
          return (
            <UserMessage 
              type={hasEnoughFollowers ? 'influencer-success' : 'influencer-insufficient'}
              onBack={handleBack}
              onContinue={handleContinue}
              onSignup={handleSignup}
            />
          );
        }
        return null;
      
      default:
        return null;
    }
  };

  return (
    <div className="illustrated-bg relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center z-[-1] opacity-40"></div>
      <NavBar />
      
      <main className="pt-24 pb-16 min-h-screen flex items-center">
        {renderCurrentStep()}
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 CoachConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
