import React, { useState } from 'react';
import { useToast } from '../../common/Toast';
import { FiPlus } from 'react-icons/fi';

const LearningTab = () => {
  // State management
  const [plans, setPlans] = useState([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  // Input validation constraints
  const TITLE_MAX_LENGTH = 100;
  const DESCRIPTION_MAX_LENGTH = 1000;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Plans</h1>
        <button
          onClick={() => setIsCreatingPlan(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <FiPlus className="mr-2" />
          New Plan
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Create Plan Form */}
      {isCreatingPlan && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Plan</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
              <input
                type="text"
                placeholder="Enter plan title"
                value={newPlan.title}
                onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                maxLength={TITLE_MAX_LENGTH}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter plan description"
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isLoading}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningTab;