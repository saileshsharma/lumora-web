/**
 * Style Squad API Service
 * Handles all squad-related API calls
 */

import { API_BASE_URL } from '../constants';
import type {
  Squad,
  SquadOutfit,
  CreateSquadRequest,
  JoinSquadRequest,
  ShareOutfitRequest,
  VoteOnOutfitRequest,
  SendMessageRequest,
} from '../types';

class SquadApiService {
  /**
   * Create a new squad
   */
  async createSquad(data: CreateSquadRequest): Promise<Squad> {
    const response = await fetch(`${API_BASE_URL}/squad/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create squad');
    }

    return response.json();
  }

  /**
   * Join a squad using invite code
   */
  async joinSquad(data: JoinSquadRequest): Promise<Squad> {
    const response = await fetch(`${API_BASE_URL}/squad/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join squad');
    }

    return response.json();
  }

  /**
   * Get squad details by ID
   */
  async getSquad(squadId: string): Promise<Squad> {
    const response = await fetch(`${API_BASE_URL}/squad/${squadId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get squad');
    }

    return response.json();
  }

  /**
   * Get all squads for a user
   */
  async getUserSquads(userId: string): Promise<Squad[]> {
    const response = await fetch(`${API_BASE_URL}/squad/user/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get squads');
    }

    return response.json();
  }

  /**
   * Leave a squad
   */
  async leaveSquad(squadId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/squad/${squadId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave squad');
    }
  }

  /**
   * Delete a squad (creator only)
   */
  async deleteSquad(squadId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/squad/${squadId}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete squad');
    }
  }

  /**
   * Share an outfit to squad
   */
  async shareOutfit(data: ShareOutfitRequest): Promise<SquadOutfit> {
    const response = await fetch(`${API_BASE_URL}/squad/${data.squadId}/outfit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to share outfit');
    }

    return response.json();
  }

  /**
   * Get outfits from a squad
   */
  async getSquadOutfits(squadId: string, limit: number = 20): Promise<SquadOutfit[]> {
    const response = await fetch(`${API_BASE_URL}/squad/${squadId}/outfits?limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get outfits');
    }

    return response.json();
  }

  /**
   * Vote on an outfit
   */
  async voteOnOutfit(data: VoteOnOutfitRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/squad/outfit/${data.outfitId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to vote');
    }
  }

  /**
   * Send a chat message on an outfit
   */
  async sendMessage(data: SendMessageRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/squad/outfit/${data.outfitId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }
  }
}

export const squadApi = new SquadApiService();
