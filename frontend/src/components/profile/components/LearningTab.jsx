import React from 'react';

const LearningPlans = () => {
  const handleAddLearningPlan = () => {
    alert('Add Learning Plan clicked!');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Learning Plans</h1>
      <button
        onClick={handleAddLearningPlan}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Add Learning Plan
      </button>
    </div>
  );
};

export default LearningPlans;
