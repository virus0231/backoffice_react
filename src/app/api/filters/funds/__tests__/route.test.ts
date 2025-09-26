import { GET } from '../route';
import { Fund } from '@/lib/database/models';
import { NextRequest } from 'next/server';

// Mock the Fund model
jest.mock('@/lib/database/models', () => ({
  Fund: {
    findAll: jest.fn(),
  },
}));

const mockFund = Fund as jest.Mocked<typeof Fund>;

// Mock console.error to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('/api/filters/funds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/filters/funds', () => {
    it('should return all active funds when no appeal_id provided', async () => {
      const mockFunds = [
        {
          id: 1,
          name: 'General Fund',
          description: 'General donations',
          is_active: true,
          toJSON: () => ({
            id: 1,
            name: 'General Fund',
            description: 'General donations',
            is_active: true,
          }),
        },
        {
          id: 2,
          name: 'Emergency Fund',
          description: 'Emergency relief',
          is_active: true,
          toJSON: () => ({
            id: 2,
            name: 'Emergency Fund',
            description: 'Emergency relief',
            is_active: true,
          }),
        },
      ];

      mockFund.findAll.mockResolvedValue(mockFunds as any);

      const request = new NextRequest('http://localhost:3000/api/filters/funds');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: [
          { id: 1, name: 'General Fund', description: 'General donations' },
          { id: 2, name: 'Emergency Fund', description: 'Emergency relief' },
        ],
      });

      expect(mockFund.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'description'],
        where: { is_active: true },
        order: [['name', 'ASC']],
      });
    });

    it('should return funds filtered by appeal_id when provided', async () => {
      const mockFunds = [
        {
          id: 1,
          name: 'Campaign Fund',
          description: 'Specific campaign fund',
          is_active: true,
          toJSON: () => ({
            id: 1,
            name: 'Campaign Fund',
            description: 'Specific campaign fund',
            is_active: true,
          }),
        },
      ];

      mockFund.findAll.mockResolvedValue(mockFunds as any);

      const request = new NextRequest('http://localhost:3000/api/filters/funds?appeal_id=1');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: [
          { id: 1, name: 'Campaign Fund', description: 'Specific campaign fund' },
        ],
      });

      expect(mockFund.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'description'],
        include: [
          {
            association: 'appeals',
            where: { id: 1 },
            attributes: [],
          },
        ],
        where: { is_active: true },
        group: ['Fund.id'],
        order: [['name', 'ASC']],
      });
    });

    it('should include inactive funds when include_inactive=true', async () => {
      const mockFunds = [
        {
          id: 1,
          name: 'Active Fund',
          description: 'Active fund',
          is_active: true,
          toJSON: () => ({ id: 1, name: 'Active Fund', description: 'Active fund', is_active: true }),
        },
        {
          id: 2,
          name: 'Inactive Fund',
          description: 'Inactive fund',
          is_active: false,
          toJSON: () => ({ id: 2, name: 'Inactive Fund', description: 'Inactive fund', is_active: false }),
        },
      ];

      mockFund.findAll.mockResolvedValue(mockFunds as any);

      const request = new NextRequest('http://localhost:3000/api/filters/funds?include_inactive=true');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);

      expect(mockFund.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'description'],
        where: {}, // No is_active filter when including inactive
        order: [['is_active', 'DESC'], ['name', 'ASC']],
      });
    });

    it('should handle invalid appeal_id parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/filters/funds?appeal_id=invalid');
      const response = await GET(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'INVALID_PARAMETER',
        message: 'appeal_id must be a valid number',
      });

      expect(mockFund.findAll).not.toHaveBeenCalled();
    });

    it('should handle negative appeal_id parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/filters/funds?appeal_id=-1');
      const response = await GET(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'INVALID_PARAMETER',
        message: 'appeal_id must be a positive number',
      });
    });

    it('should return empty array when no funds found', async () => {
      mockFund.findAll.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/filters/funds');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: [],
      });
    });

    it('should handle database connection errors', async () => {
      mockFund.findAll.mockRejectedValue(new Error('Connection failed'));

      const request = new NextRequest('http://localhost:3000/api/filters/funds');
      const response = await GET(request);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch funds',
      });
    });

    it('should handle database timeout errors', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'SequelizeConnectionTimedOutError';
      mockFund.findAll.mockRejectedValue(timeoutError);

      const request = new NextRequest('http://localhost:3000/api/filters/funds');
      const response = await GET(request);

      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'DATABASE_TIMEOUT',
        message: 'Database request timed out',
      });
    });

    it('should set proper cache headers for successful responses', async () => {
      mockFund.findAll.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/filters/funds');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, stale-while-revalidate=1800');
    });

    it('should set appeal-specific cache headers when appeal_id provided', async () => {
      mockFund.findAll.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/filters/funds?appeal_id=1');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=1800, stale-while-revalidate=900');
    });

    it('should handle SQL injection attempts in appeal_id', async () => {
      const request = new NextRequest('http://localhost:3000/api/filters/funds?appeal_id=1;DROP TABLE funds;--');
      const response = await GET(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'INVALID_PARAMETER',
        message: 'appeal_id must be a valid number',
      });

      expect(mockFund.findAll).not.toHaveBeenCalled();
    });

    it('should handle special characters in appeal_id', async () => {
      const request = new NextRequest('http://localhost:3000/api/filters/funds?appeal_id=1"OR"1"="1');
      const response = await GET(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('INVALID_PARAMETER');
    });

    it('should return funds with proper data transformation', async () => {
      const mockFunds = [
        {
          id: 1,
          name: 'Test Fund',
          description: 'Test Description',
          is_active: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-02',
          toJSON: () => ({
            id: 1,
            name: 'Test Fund',
            description: 'Test Description',
            is_active: true,
            created_at: '2023-01-01',
            updated_at: '2023-01-02',
          }),
        },
      ];

      mockFund.findAll.mockResolvedValue(mockFunds as any);

      const request = new NextRequest('http://localhost:3000/api/filters/funds');
      const response = await GET(request);

      const data = await response.json();

      // Should only return specific attributes, not all database fields
      expect(data.data[0]).toEqual({
        id: 1,
        name: 'Test Fund',
        description: 'Test Description',
      });

      // Should not include timestamps or is_active in response
      expect(data.data[0]).not.toHaveProperty('created_at');
      expect(data.data[0]).not.toHaveProperty('updated_at');
      expect(data.data[0]).not.toHaveProperty('is_active');
    });
  });
});