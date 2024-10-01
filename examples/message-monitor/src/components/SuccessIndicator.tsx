import React, { useEffect, useState } from 'react';

interface SuccessIndicatorProps {
  success: boolean | null;
}

const SuccessIndicator: React.FC<SuccessIndicatorProps> = ({ success }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (success !== null) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg ${success ? 'bg-green-500' : 'bg-red-500'} text-white shadow-lg transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {success ? (
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Message sent successfully</span>
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Failed to send message</span>
        </div>
      )}
    </div>
  );
};

export default SuccessIndicator;
