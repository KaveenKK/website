import React from 'react';
import GroupChat from './GroupChat';

function App() {
  // Mock props for testing
  const mockUser = { username: 'TestUser', avatar: '', discord_id: '123', _id: '123' };
  return (
    <GroupChat houseId="test-house" user={mockUser} houseName="Test House" />
  );
}

export default App;
