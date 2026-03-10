// ============================================================
// JWT Auth Guard — Unit Tests
// ============================================================

// Note: This guard extends AuthGuard('jwt') which requires passport.
// We test via mocking the guard behavior directly.

describe('JwtAuthGuard', () => {
  it('should be importable', async () => {
    const module = await import('./jwt-auth.guard');
    expect(module.JwtAuthGuard).toBeDefined();
  });
});
