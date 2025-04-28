import React, { useState, useEffect } from 'react';
import { useToast } from '../../common/Toast';
import { API_BASE_URL } from '../../../config/apiConfig';
import axios from 'axios';
import { FiPlus, FiX } from 'react-icons/fi';

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

  // Configure axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Add auth token to requests
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch all plans with progress
  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/plans/my-plans');
      const plansWithProgress = await Promise.all(
        response.data.map(async plan => {
          try {
            const progressResponse = await api.get(`/plans/${plan.id}/progress`);
            return { ...plan, progress: progressResponse.data };
          } catch (error) {
            console.error(`Failed to fetch progress for plan ${plan.id}:`, error);
            return { ...plan, progress: 0 };
          }
        })
      );
      setPlans(plansWithProgress);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch learning plans';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle plan creation
  const handleCreatePlan = async () => {
    if (!newPlan.title.trim()) {
      setError('Plan title is required');
      addToast('Plan title is required', 'error');
      return;
    }
    if (newPlan.title.length > TITLE_MAX_LENGTH) {
      setError(`Plan title cannot exceed ${TITLE_MAX_LENGTH} characters`);
      addToast(`Plan title cannot exceed ${TITLE_MAX_LENGTH} characters`, 'error');
      return;
    }
    if (newPlan.description.length > DESCRIPTION_MAX_LENGTH) {
      setError(`Plan description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);
      addToast(`Plan description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/plans', newPlan);
      const progressResponse = await api.get(`/plans/${response.data.id}/progress`);
      const newPlanData = { 
        ...response.data, 
        progress: progressResponse.data,
        steps: []
      };
      setPlans(prev => [...prev, newPlanData]);
      setNewPlan({ title: '', description: '' });
      setIsCreatingPlan(false);
      addToast('Learning plan created successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create plan';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPlans();
  }, []);

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
            <button 
              onClick={() => setIsCreatingPlan(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
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
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreatingPlan(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!newPlan.title.trim() || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      {!isCreatingPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold">{plan.title}</h3>
              <p className="text-gray-600 mt-1 text-sm line-clamp-2">{plan.description}</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningTab;