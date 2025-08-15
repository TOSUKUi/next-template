import { GET } from '@/app/api/health/route';
import prisma from '@/lib/prisma';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  $queryRaw: jest.fn(),
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return ok status when database is connected', async () => {
    mockedPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.database).toBe('connected');
    expect(data.environment).toBe('test');
    expect(data.timestamp).toBeDefined();
  });

  it('should return error status when database is disconnected', async () => {
    mockedPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
    expect(data.database).toBe('disconnected');
    expect(data.error).toBe('Database connection failed');
  });
});