
import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Index;
