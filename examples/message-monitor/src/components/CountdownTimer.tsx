import React from 'react';

interface CountdownTimerProps {
  countdown: number | null;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ countdown }) => {
  if (countdown === null) return null;

  return (
    <div className="text-center text-gray-600 mt-4">
      <p>Next message in: {countdown} seconds</p>
    </div>
  );
};

export default CountdownTimer;
