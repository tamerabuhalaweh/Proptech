import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status', () => {
    const result = controller.check();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('uptime');
  });

  describe('deepCheck', () => {
    it('should return ok when database is healthy', async () => {
      // $queryRaw is used as a tagged template literal, mock it as a function
      mockPrisma.$queryRaw.mockReturnValue(Promise.resolve([{ 1: 1 }]));

      const result = await controller.deepCheck();

      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.memory.status).toBeDefined();
    });

    it('should return degraded when database is down', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.deepCheck();

      expect(result.status).toBe('degraded');
      expect(result.checks.database.status).toBe('error');
      expect(result.checks.database.error).toBe('Connection refused');
    });
  });
});
