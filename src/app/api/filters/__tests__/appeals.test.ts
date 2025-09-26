/**
 * Tests for appeals filter API endpoint
 */

import { GET, HEAD } from '../appeals/route';
import { NextRequest } from 'next/server';
import { CampaignModel } from '@/lib/database/models/Campaign';

// Mock the database model
jest.mock('@/lib/database/models/Campaign');
jest.mock('@/lib/database/errorHandler');

const mockCampaignModel = CampaignModel as jest.Mocked<typeof CampaignModel>;

describe('/api/filters/appeals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return list of active appeals by default', async () => {
      const mockAppeals = [
        {
          id: '1',
          appealName: 'Spring Campaign',
          isActive: true,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31')
        },
        {
          id: '2',
          appealName: 'Holiday Appeal',
          isActive: true,
          startDate: new Date('2023-11-01'),
          endDate: null
        }
      ];

      mockCampaignModel.findAll.mockResolvedValue(mockAppeals as any);

      const request = new NextRequest('http://localhost:3000/api/filters/appeals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0]).toEqual({
        id: '1',
        appeal_name: 'Spring Campaign',
        status: 'active',
        start_date: '2023-01-01T00:00:00.000Z',
        end_date: '2023-12-31T00:00:00.000Z'
      });

      expect(mockCampaignModel.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        order: [['isActive', 'DESC'], ['appealName', 'ASC']],
        attributes: ['id', 'appealName', 'isActive', 'startDate', 'endDate']
      });
    });

    it('should include inactive appeals when requested', async () => {
      const mockAppeals = [
        {
          id: '1',
          appealName: 'Active Campaign',
          isActive: true,
          startDate: null,
          endDate: null
        },
        {
          id: '2',
          appealName: 'Inactive Campaign',
          isActive: false,
          startDate: null,
          endDate: null
        }
      ];

      mockCampaignModel.findAll.mockResolvedValue(mockAppeals as any);

      const request = new NextRequest('http://localhost:3000/api/filters/appeals?include_inactive=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[1].status).toBe('inactive');

      expect(mockCampaignModel.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['isActive', 'DESC'], ['appealName', 'ASC']],
        attributes: ['id', 'appealName', 'isActive', 'startDate', 'endDate']
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      mockCampaignModel.findAll.mockRejectedValue(mockError);

      const request = new NextRequest('http://localhost:3000/api/filters/appeals');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should set appropriate cache headers', async () => {
      mockCampaignModel.findAll.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/filters/appeals');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=3600, stale-while-revalidate=600'
      );
    });

    it('should handle null date fields', async () => {
      const mockAppeals = [
        {
          id: '1',
          appealName: 'Campaign with null dates',
          isActive: true,
          startDate: null,
          endDate: null
        }
      ];

      mockCampaignModel.findAll.mockResolvedValue(mockAppeals as any);

      const request = new NextRequest('http://localhost:3000/api/filters/appeals');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data[0].start_date).toBeNull();
      expect(data.data[0].end_date).toBeNull();
    });
  });

  describe('HEAD', () => {
    it('should return appeal count in headers', async () => {
      mockCampaignModel.count.mockResolvedValue(5);

      const response = await HEAD();

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Total-Appeals')).toBe('5');
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
    });

    it('should return 503 on database error', async () => {
      mockCampaignModel.count.mockRejectedValue(new Error('Database error'));

      const response = await HEAD();

      expect(response.status).toBe(503);
    });
  });
});