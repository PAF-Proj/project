import React, { useState, useEffect } from 'react';
import { useToast } from '../../common/Toast';
import { API_BASE_URL } from '../../../config/apiConfig';
import axios from 'axios';
import { FiPlus, FiArrowLeft, FiCheck, FiLoader, FiX, FiEdit, FiTrash } from 'react-icons/fi';
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

  // Fetch all plans with progress and steps
  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/plans/my-plans');
      const plansWithProgressAndSteps = await Promise.all(
        response.data.map(async plan => {
          try {
            const progressResponse = await api.get(`/plans/${plan.id}/progress`);
            const stepsResponse = await api.get(`/plans/${plan.id}/steps`);
            return { 
              ...plan, 
              progress: progressResponse.data, 
              steps: stepsResponse.data || [] 
            };
          } catch (error) {
            console.error(`Failed to fetch data for plan ${plan.id}:`, error);
            return { ...plan, progress: 0, steps: [] };
          }
        })
      );
      setPlans(plansWithProgressAndSteps);
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
      console.log(`Fetched steps for plan ${planId}:`, response.data);
      return response.data || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch steps';
      addToast(errorMessage, 'error');
      throw err;
    } finally {
      setIsLoadingSteps(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPlans();
  }, []);

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
      const stepsResponse = await api.get(`/plans/${editPlan.id}/steps`);
      updatedPlan.progress = progressResponse.data;
      updatedPlan.steps = stepsResponse.data || [];
      
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      if (selectedPlan && selectedPlan.id === updatedPlan.id) {
        setSelectedPlan(updatedPlan);
      }
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

  // Handle step status toggle
  const handleToggleStep = async (stepId, isCompleted) => {
    setOperationLoading(prev => ({ ...prev, [stepId]: true }));
    try {
      await api.patch(`/plans/steps/${stepId}`, { completed: isCompleted });
      
      const updatedSteps = selectedPlan.steps.map(step => 
        step.id === stepId ? { ...step, completed: isCompleted } : step
      );
      const updatedPlan = { ...selectedPlan, steps: updatedSteps };
      
      const progressResponse = await api.get(`/plans/${selectedPlan.id}/progress`);
      updatedPlan.progress = progressResponse.data;
      
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update step';
      addToast(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [stepId]: false }));
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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Learning Plans</h1>
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
          <FiLoader className="animate-spin text-2xl text-blue-600" />
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
                disabled={operationLoading [editPlan.id]}
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
      {!isCreatingPlan && !isEditingPlan && !selectedPlan && !isLoading && (
        <div className="mt-4">
          {plans.length === 0 ? (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
              <p className="text-lg">No learning plans yet.</p>
              <p className="mt-2">Create your first plan to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(plan => (
                <div 
                  key={plan.id} 
                  className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <h3 className="text-lg font-semibold truncate mb-1">{plan.title}</h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {plan.steps.length} steps
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{plan.description}</p>
                    
                    <div className="mt-2">
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
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditPlan(plan);
                      }}
                      className="text-gray-500 hover:text-blue-600"
                      disabled={operationLoading[plan.id]}
                      title="Edit plan"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                    <FiLoader className="animate-spin text-blue-600 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
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
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                disabled={operationLoading[selectedPlan.id]}
              >
                <FiEdit className="mr-1" />
                Edit Plan
              </button>
              <button
                onClick={() => {
                  setPlanToDelete(selectedPlan.id);
                  setShowDeletePlanConfirm(true);
                }}
                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                disabled={operationLoading[selectedPlan.id]}
              >
                <FiTrash className="mr-1" />
                Delete Plan
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold">{selectedPlan.title}</h2>
            <p className="text-gray-600 mt-1">{selectedPlan.description}</p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Progress</span>
                <span>{selectedPlan.progress}% completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${selectedPlan.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Add Step Form */}
          {isAddingStep && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Add New Step</h3>
                <button 
                  onClick={() => setIsAddingStep(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title*</label>
                  <input
                    type="text"
                    placeholder="Step title"
                    value={newStep.title}
                    onChange={(e) => setNewStep({...newStep, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={operationLoading[selectedPlan.id]}
                    maxLength={TITLE_MAX_LENGTH}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Content</label>
                  <textarea
                    placeholder="Step details"
                    value={newStep.content}
                    onChange={(e) => setNewStep({...newStep, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    disabled={operationLoading[selectedPlan.id]}
                    maxLength={CONTENT_MAX_LENGTH}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsAddingStep(false)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                    disabled={operationLoading[selectedPlan.id]}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStep}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
                    disabled={!newStep.title.trim() || operationLoading[selectedPlan.id]}
                  >
                    {operationLoading[selectedPlan.id] ? 'Adding...' : 'Add Step'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Step Form */}
          {isEditingStep && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Edit Step</h3>
                <button 
                  onClick={() => setIsEditingStep(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title*</label>
                  <input
                    type="text"
                    placeholder="Step title"
                    value={editStep.title}
                    onChange={(e) => setEditStep({...editStep, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={operationLoading[editStep.id]}
                    maxLength={TITLE_MAX_LENGTH}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Content</label>
                  <textarea
                    placeholder="Step details"
                    value={editStep.content}
                    onChange={(e) => setEditStep({...editStep, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    disabled={operationLoading[editStep.id]}
                    maxLength={CONTENT_MAX_LENGTH}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditingStep(false)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                    disabled={operationLoading[editStep.id]}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStep}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
                    disabled={!editStep.title.trim() || operationLoading[editStep.id]}
                  >
                    {operationLoading[editStep.id] ? 'Updating...' : 'Update Step'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Steps List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Learning Steps</h3>
              <button
                onClick={() => setIsAddingStep(true)}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                disabled={operationLoading[selectedPlan.id]}
              >
                <FiPlus className="mr-1" />
                Add Step
              </button>
            </div>
            
            {isLoadingSteps ? (
              <div className="flex justify-center items-center p-4">
                <FiLoader className="animate-spin text-blue-600" />
              </div>
            ) : selectedPlan.steps?.length > 0 ? (
              <div className="space-y-2">
                {selectedPlan.steps.map(step => (
                  <div 
                    key={step.id} 
                    className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={(e) => handleToggleStep(step.id, e.target.checked)}
                      className="mt-1 mr-3"
                      disabled={operationLoading[step.id]}
                    />
                    <div className="flex-1">
                      <h4 className={`font-medium ${step.completed ? 'line-through text-gray-500' : ''}`}>
                        {step.title}
                      </h4>
                      {step.content && (
                        <p className={`text-sm ${step.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {step.content}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleStartEditStep(step)}
                        className="text-gray-500 hover:text-blue-600"
                        disabled={operationLoading[step.id]}
                        title="Edit step"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setStepToDelete(step.id);
                          setShowDeleteStepConfirm(true);
                        }}
                        className="text-gray-500 hover:text-red-600"
                        disabled={operationLoading[step.id]}
                        title="Delete step"
                      >
                        <FiTrash size={16} />
                      </button>
                    </div>
                    {operationLoading[step.id] && (
                      <FiLoader className="animate-spin ml-2 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No steps added yet. Add your first step to get started!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Plan Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeletePlanConfirm}
        onClose={() => setShowDeletePlanConfirm(false)}
        onConfirm={handleDeletePlan}
        title="Delete Learning Plan"
        message="Are you sure you want to delete this learning plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Step Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteStepConfirm}
        onClose={() => setShowDeleteStepConfirm(false)}
        onConfirm={handleDeleteStep}
        title="Delete Step"
        message="Are you sure you want to delete this step? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default LearningTab;