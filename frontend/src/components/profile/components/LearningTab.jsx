import React, { useState, useEffect } from 'react';
import { useToast } from '../../common/Toast';
import { API_BASE_URL } from '../../../config/apiConfig';
import axios from 'axios';
import { FiPlus, FiX, FiEdit, FiTrash, FiArrowLeft } from 'react-icons/fi';
import ConfirmDialog from '../../common/ConfirmDialog';

const LearningTab = () => {
  // State management
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isEditingStep, setIsEditingStep] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', description: '' });
  const [editPlan, setEditPlan] = useState({ id: '', title: '', description: '' });
  const [newStep, setNewStep] = useState({ title: '', content: '' });
  const [editStep, setEditStep] = useState({ id: '', title: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [operationLoading, setOperationLoading] = useState({});
  const [error, setError] = useState(null);
  const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState(false);
  const [showDeleteStepConfirm, setShowDeleteStepConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [stepToDelete, setStepToDelete] = useState(null);
  const { addToast } = useToast();

  // Input validation constraints
  const TITLE_MAX_LENGTH = 100;
  const DESCRIPTION_MAX_LENGTH = 1000;
  const CONTENT_MAX_LENGTH = 1000;

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

  // Fetch steps for a specific plan
  const fetchPlanSteps = async (planId) => {
    setIsLoadingSteps(true);
    try {
      const response = await api.get(`/plans/${planId}/steps`);
      return response.data || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch steps';
      addToast(errorMessage, 'error');
      throw err;
    } finally {
      setIsLoadingSteps(false);
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

  // Handle plan update
  const handleUpdatePlan = async () => {
    if (!editPlan.title.trim()) {
      setError('Plan title is required');
      addToast('Plan title is required', 'error');
      return;
    }
    if (editPlan.title.length > TITLE_MAX_LENGTH) {
      setError(`Plan title cannot exceed ${TITLE_MAX_LENGTH} characters`);
      addToast(`Plan title cannot exceed ${TITLE_MAX_LENGTH} characters`, 'error');
      return;
    }
    if (editPlan.description.length > DESCRIPTION_MAX_LENGTH) {
      setError(`Plan description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);
      addToast(`Plan description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`, 'error');
      return;
    }

    setOperationLoading(prev => ({ ...prev, [editPlan.id]: true }));
    try {
      const response = await api.put(`/plans/${editPlan.id}`, {
        title: editPlan.title,
        description: editPlan.description
      });
      const updatedPlan = response.data;
      const progressResponse = await api.get(`/plans/${editPlan.id}/progress`);
      updatedPlan.progress = progressResponse.data;
      
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setEditPlan({ id: '', title: '', description: '' });
      setIsEditingPlan(false);
      addToast('Learning plan updated successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update plan';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [editPlan.id]: false }));
    }
  };

  // Handle plan deletion
  const handleDeletePlan = async () => {
    setOperationLoading(prev => ({ ...prev, [planToDelete]: true }));
    try {
      await api.delete(`/plans/${planToDelete}`);
      setPlans(plans.filter(p => p.id !== planToDelete));
      if (selectedPlan && selectedPlan.id === planToDelete) {
        setSelectedPlan(null);
      }
      addToast('Learning plan deleted successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete plan';
      addToast(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [planToDelete]: false }));
      setShowDeletePlanConfirm(false);
      setPlanToDelete(null);
    }
  };

  // Handle step addition
  const handleAddStep = async () => {
    if (!newStep.title.trim()) {
      setError('Step title is required');
      addToast('Step title is required', 'error');
      return;
    }
    if (newStep.title.length > TITLE_MAX_LENGTH) {
      setError(`Step title cannot exceed ${TITLE_MAX_LENGTH} characters`);
      addToast(`Step title cannot exceed ${TITLE_MAX_LENGTH} characters`, 'error');
      return;
    }
    if (newStep.content.length > CONTENT_MAX_LENGTH) {
      setError(`Step content cannot exceed ${CONTENT_MAX_LENGTH} characters`);
      addToast(`Step content cannot exceed ${CONTENT_MAX_LENGTH} characters`, 'error');
      return;
    }

    setOperationLoading(prev => ({ ...prev, [selectedPlan.id]: true }));
    try {
      const response = await api.post(`/plans/${selectedPlan.id}/steps`, newStep);
      const updatedPlan = {
        ...selectedPlan,
        steps: [...(selectedPlan.steps || []), response.data]
      };
      
      const progressResponse = await api.get(`/plans/${selectedPlan.id}/progress`);
      updatedPlan.progress = progressResponse.data;
      
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setNewStep({ title: '', content: '' });
      setIsAddingStep(false);
      addToast('Step added successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add step';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [selectedPlan.id]: false }));
    }
  };

  // Handle step update
  const handleUpdateStep = async () => {
    if (!editStep.title.trim()) {
      setError('Step title is required');
      addToast('Step title is required', 'error');
      return;
    }
    if (editStep.title.length > TITLE_MAX_LENGTH) {
      setError(`Step title cannot exceed ${TITLE_MAX_LENGTH} characters`);
      addToast(`Step title cannot exceed ${TITLE_MAX_LENGTH} characters`, 'error');
      return;
    }
    if (editStep.content.length > CONTENT_MAX_LENGTH) {
      setError(`Step content cannot exceed ${CONTENT_MAX_LENGTH} characters`);
      addToast(`Step content cannot exceed ${CONTENT_MAX_LENGTH} characters`, 'error');
      return;
    }

    setOperationLoading(prev => ({ ...prev, [editStep.id]: true }));
    try {
      const response = await api.put(`/plans/steps/${editStep.id}`, {
        title: editStep.title,
        content: editStep.content
      });
      const updatedStep = response.data;
      const updatedSteps = selectedPlan.steps.map(step => 
        step.id === updatedStep.id ? updatedStep : step
      );
      const updatedPlan = { ...selectedPlan, steps: updatedSteps };
      
      const progressResponse = await api.get(`/plans/${selectedPlan.id}/progress`);
      updatedPlan.progress = progressResponse.data;
      
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setEditStep({ id: '', title: '', content: '' });
      setIsEditingStep(false);
      addToast('Step updated successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update step';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [editStep.id]: false }));
    }
  };

  // Handle step deletion
  const handleDeleteStep = async () => {
    setOperationLoading(prev => ({ ...prev, [stepToDelete]: true }));
    try {
      await api.delete(`/plans/steps/${stepToDelete}`);
      const updatedSteps = selectedPlan.steps.filter(step => step.id !== stepToDelete);
      const updatedPlan = { ...selectedPlan, steps: updatedSteps };
      
      const progressResponse = await api.get(`/plans/${selectedPlan.id}/progress`);
      updatedPlan.progress = progressResponse.data;
      
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      addToast('Step deleted successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete step';
      addToast(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [stepToDelete]: false }));
      setShowDeleteStepConfirm(false);
      setStepToDelete(null);
    }
  };

  // Handle plan selection
  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    try {
      const steps = await fetchPlanSteps(plan.id);
      setSelectedPlan(prev => ({ ...prev, steps }));
    } catch (err) {
      // Error already handled in fetchPlanSteps
    }
  };

  // Start editing plan
  const handleStartEditPlan = (plan) => {
    setEditPlan({
      id: plan.id,
      title: plan.title,
      description: plan.description || ''
    });
    setIsEditingPlan(true);
  };

  // Start editing step
  const handleStartEditStep = (step) => {
    setEditStep({
      id: step.id,
      title: step.title,
      content: step.content || ''
    });
    setIsEditingStep(true);
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

      {/* Edit Plan Form */}
      {isEditingPlan && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Plan</h2>
            <button 
              onClick={() => setIsEditingPlan(false)}
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
                value={editPlan.title}
                onChange={(e) => setEditPlan({...editPlan, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={operationLoading[editPlan.id]}
                maxLength={TITLE_MAX_LENGTH}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter plan description"
                value={editPlan.description}
                onChange={(e) => setEditPlan({...editPlan, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={operationLoading[editPlan.id]}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditingPlan(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={operationLoading[editPlan.id]}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!editPlan.title.trim() || operationLoading[editPlan.id]}
              >
                {operationLoading[editPlan.id] ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      {!isCreatingPlan && !isEditingPlan && !selectedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleSelectPlan(plan)}
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
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleStartEditPlan(plan)}
                  className="text-gray-500 hover:text-blue-600"
                  disabled={operationLoading[plan.id]}
                  title="Edit plan"
                >
                  <FiEdit size={16} />
                </button>
                <button
                  onClick={() => {
                    setPlanToDelete(plan.id);
                    setShowDeletePlanConfirm(true);
                  }}
                  className="text-gray-500 hover:text-red-600"
                  disabled={operationLoading[plan.id]}
                  title="Delete plan"
                >
                  <FiTrash size={16} />
                </button>
              </div>
              {operationLoading[plan.id] && (
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plan Detail View */}
      {selectedPlan && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setSelectedPlan(null)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="mr-1" />
              Back to plans
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStartEditPlan(selectedPlan)}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-7
```