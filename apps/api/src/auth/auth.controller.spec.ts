import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
  getProfile: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@example.com', password: 'Password123' };
      const expected = { user: {}, tokens: {} };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'Password123',
        displayName: 'New User',
        tenantId: 'tenant1',
      };
      const expected = { user: {}, tokens: {} };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken', async () => {
      const dto = { refreshToken: 'some-token' };
      const expected = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      mockAuthService.refreshToken.mockResolvedValue(expected);

      const result = await controller.refresh(dto);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile with user sub', async () => {
      const user = { sub: 'user1', email: 'test@example.com', role: 'VIEWER', tenantId: 'tenant1' };
      const expected = { id: 'user1', email: 'test@example.com' };
      mockAuthService.getProfile.mockResolvedValue(expected);

      const result = await controller.getProfile(user);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user1');
      expect(result).toEqual(expected);
    });
  });
});
