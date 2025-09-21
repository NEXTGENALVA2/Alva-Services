// User Status Utility Functions
// This file provides utilities for checking and updating user status across components

import axios from 'axios';

export interface UserStatus {
  isActive: boolean;
  subscriptionType: string;
  hasValidSubscription: boolean;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
}

// Check current user status
export const checkUserStatus = async (): Promise<UserStatus | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const [profileResponse, subscriptionResponse] = await Promise.all([
      axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('http://localhost:5000/api/subscription/current', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    return {
      isActive: profileResponse.data.isActive,
      subscriptionType: subscriptionResponse.data.subscriptionType || 'none',
      hasValidSubscription: subscriptionResponse.data.hasValidSubscription || false,
      trialEndsAt: subscriptionResponse.data.trialEndsAt,
      subscriptionEndsAt: subscriptionResponse.data.subscriptionEndsAt
    };
  } catch (error) {
    console.error('Error checking user status:', error);
    return null;
  }
};

// Trigger user status update event
export const triggerUserStatusUpdate = (userId?: string, isActive?: boolean) => {
  window.dispatchEvent(new CustomEvent('userStatusUpdated', { 
    detail: { userId, isActive } 
  }));
};

// Add event listener for user status updates
export const onUserStatusUpdate = (callback: () => void) => {
  window.addEventListener('userStatusUpdated', callback);
  return () => window.removeEventListener('userStatusUpdated', callback);
};

// Force refresh user status across all components
export const refreshUserStatus = () => {
  triggerUserStatusUpdate();
};