import { test, expect,} from '@jest/globals';
import { useAuthStore, loginAPI } from '../store/authentication';

test('authentication store is defined', () => {
  expect(useAuthStore).toBeDefined();
});

// smoke test for the login function
test('login function is defined', () => {
  const { login } = useAuthStore.getState();
  expect(login).toBeDefined();
});

// Behavior test for the login function
// describe('loginAPI', () => {
//   let mockFetch: ReturnType<typeof jest.fn>;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockFetch = jest.fn();
//     (globalThis as typeof globalThis & { fetch: typeof mockFetch }).fetch = mockFetch;
//   });

//   it('returns login response on success', async () => {
//     mockFetch.mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({
//         message: 'Login successful',
//         requiresOTP: false,
//         email: 'test@example.com',
//         nextStep: 'dashboard',
//       }),
//     });

//     const credentials = {
//       email: 'test@example.com',
//       password: 'password123',
//     };

//     const result = await loginAPI(credentials);

    
//     expect(fetch).toHaveBeenCalledWith(
//       expect.any(String),
//       expect.objectContaining({
//         method: 'POST',
//         headers: expect.objectContaining({
//           'Content-Type': 'application/json',
//         }),
//         body: JSON.stringify(credentials),
//       })
//     );

//     // Assert the expected response
//     expect(result).toEqual({
//       message: 'Login successful',
//       requiresOTP: false,
//       email: 'test@example.com',
//       nextStep: 'dashboard',
//     });
//   });
// });


