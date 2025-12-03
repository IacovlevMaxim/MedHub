import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock Platform and SecureStore
const mockPlatform = { OS: 'web' as 'web' | 'ios' | 'android' };
const mockSecureStore = {
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
};

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store.hasOwnProperty(key) ? store[key] : null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

// Storage abstraction layer (copy from authSlice.ts)
const createStorage = (Platform: { OS: string }, SecureStore: any) => ({
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
});

describe('Storage Abstraction Layer', () => {
  let storage: ReturnType<typeof createStorage>;

  describe('Web Platform (localStorage)', () => {
    beforeEach(() => {
      mockPlatform.OS = 'web';
      mockLocalStorage.clear();
      jest.clearAllMocks();
      
      // Mock global localStorage
      global.localStorage = mockLocalStorage as any;
      
      storage = createStorage(mockPlatform, mockSecureStore);
    });

    afterEach(() => {
      mockLocalStorage.clear();
    });

    describe('getItem', () => {
      it('should get item from localStorage asynchronously', async () => {
        mockLocalStorage.setItem('testKey', 'testValue');
        
        const result = await storage.getItem('testKey');
        
        expect(result).toBe('testValue');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
        expect(mockSecureStore.getItemAsync).not.toHaveBeenCalled();
      });

      it('should return null when item does not exist', async () => {
        const result = await storage.getItem('nonExistent');
        
        expect(result).toBeNull();
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('nonExistent');
      });

      it('should handle empty string values', async () => {
        mockLocalStorage.setItem('emptyKey', '');
        
        const result = await storage.getItem('emptyKey');
        
        expect(result).toBe('');
      });

      it('should handle special characters in keys', async () => {
        mockLocalStorage.setItem('key-with_special.chars@123', 'value');
        
        const result = await storage.getItem('key-with_special.chars@123');
        
        expect(result).toBe('value');
      });

      it('should be truly asynchronous', async () => {
        mockLocalStorage.setItem('asyncTest', 'value');
        
        const promise = storage.getItem('asyncTest');
        
        expect(promise).toBeInstanceOf(Promise);
        const result = await promise;
        expect(result).toBe('value');
      });
    });

    describe('setItem', () => {
      it('should set item in localStorage asynchronously', async () => {
        await storage.setItem('newKey', 'newValue');
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('newKey', 'newValue');
        expect(mockLocalStorage.getItem('newKey')).toBe('newValue');
        expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
      });

      it('should overwrite existing values', async () => {
        await storage.setItem('key', 'oldValue');
        await storage.setItem('key', 'newValue');
        
        const result = await storage.getItem('key');
        expect(result).toBe('newValue');
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
      });

      it('should handle empty string values', async () => {
        await storage.setItem('emptyValue', '');
        
        const result = await storage.getItem('emptyValue');
        expect(result).toBe('');
      });

      it('should handle long string values', async () => {
        const longValue = 'a'.repeat(10000);
        await storage.setItem('longKey', longValue);
        
        const result = await storage.getItem('longKey');
        expect(result).toBe(longValue);
      });

      it('should handle JSON string values', async () => {
        const jsonValue = JSON.stringify({ token: 'abc123', expires: '2025-12-31' });
        await storage.setItem('jsonKey', jsonValue);
        
        const result = await storage.getItem('jsonKey');
        expect(result).toBe(jsonValue);
        expect(JSON.parse(result!)).toEqual({ token: 'abc123', expires: '2025-12-31' });
      });

      it('should be truly asynchronous', async () => {
        const promise = storage.setItem('asyncSetTest', 'value');
        
        expect(promise).toBeInstanceOf(Promise);
        await promise;
        expect(mockLocalStorage.getItem('asyncSetTest')).toBe('value');
      });
    });

    describe('deleteItem', () => {
      it('should delete item from localStorage asynchronously', async () => {
        mockLocalStorage.setItem('toDelete', 'value');
        
        await storage.deleteItem('toDelete');
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('toDelete');
        expect(mockLocalStorage.getItem('toDelete')).toBeNull();
        expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
      });

      it('should handle deleting non-existent items', async () => {
        await storage.deleteItem('doesNotExist');
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('doesNotExist');
        // Should not throw error
      });

      it('should delete item that was just set', async () => {
        await storage.setItem('tempKey', 'tempValue');
        expect(mockLocalStorage.getItem('tempKey')).toBe('tempValue');
        
        await storage.deleteItem('tempKey');
        expect(mockLocalStorage.getItem('tempKey')).toBeNull();
      });

      it('should be truly asynchronous', async () => {
        mockLocalStorage.setItem('asyncDeleteTest', 'value');
        
        const promise = storage.deleteItem('asyncDeleteTest');
        
        expect(promise).toBeInstanceOf(Promise);
        await promise;
        expect(mockLocalStorage.getItem('asyncDeleteTest')).toBeNull();
      });
    });

    describe('Multiple operations', () => {
      it('should handle sequential get/set/delete operations', async () => {
        await storage.setItem('key1', 'value1');
        const result1 = await storage.getItem('key1');
        expect(result1).toBe('value1');
        
        await storage.setItem('key1', 'value2');
        const result2 = await storage.getItem('key1');
        expect(result2).toBe('value2');
        
        await storage.deleteItem('key1');
        const result3 = await storage.getItem('key1');
        expect(result3).toBeNull();
      });

      it('should handle multiple concurrent operations', async () => {
        const operations = [
          storage.setItem('key1', 'value1'),
          storage.setItem('key2', 'value2'),
          storage.setItem('key3', 'value3'),
        ];
        
        await Promise.all(operations);
        
        const results = await Promise.all([
          storage.getItem('key1'),
          storage.getItem('key2'),
          storage.getItem('key3'),
        ]);
        
        expect(results).toEqual(['value1', 'value2', 'value3']);
      });

      it('should handle mixed concurrent operations', async () => {
        await storage.setItem('existing', 'value');
        
        await Promise.all([
          storage.setItem('new1', 'value1'),
          storage.getItem('existing'),
          storage.setItem('new2', 'value2'),
          storage.deleteItem('existing'),
        ]);
        
        const existingValue = await storage.getItem('existing');
        const new1Value = await storage.getItem('new1');
        const new2Value = await storage.getItem('new2');
        
        expect(existingValue).toBeNull();
        expect(new1Value).toBe('value1');
        expect(new2Value).toBe('value2');
      });
    });
  });

  describe('Mobile Platform (SecureStore)', () => {
    beforeEach(() => {
      mockPlatform.OS = 'ios';
      jest.clearAllMocks();
      
      storage = createStorage(mockPlatform, mockSecureStore);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('getItem', () => {
      it('should get item from SecureStore asynchronously', async () => {
        (mockSecureStore.getItemAsync as any).mockResolvedValue('secureValue');
        
        const result = await storage.getItem('secureKey');
        
        expect(result).toBe('secureValue');
        expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('secureKey');
        expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
      });

      it('should return null when item does not exist', async () => {
        (mockSecureStore.getItemAsync as any).mockResolvedValue(null);
        
        const result = await storage.getItem('nonExistent');
        
        expect(result).toBeNull();
      });

      it('should handle SecureStore errors gracefully', async () => {
        (mockSecureStore.getItemAsync as any).mockRejectedValue(new Error('SecureStore error'));
        
        await expect(storage.getItem('errorKey')).rejects.toThrow('SecureStore error');
      });

      it('should be truly asynchronous with SecureStore', async () => {
        (mockSecureStore.getItemAsync as any).mockResolvedValue('asyncValue');
        
        const promise = storage.getItem('asyncKey');
        
        expect(promise).toBeInstanceOf(Promise);
        const result = await promise;
        expect(result).toBe('asyncValue');
      });

      it('should work on Android platform', async () => {
        mockPlatform.OS = 'android';
        (mockSecureStore.getItemAsync as any).mockResolvedValue('androidValue');
        storage = createStorage(mockPlatform, mockSecureStore);
        
        const result = await storage.getItem('androidKey');
        
        expect(result).toBe('androidValue');
        expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('androidKey');
      });
    });

    describe('setItem', () => {
      it('should set item in SecureStore asynchronously', async () => {
        (mockSecureStore.setItemAsync as any).mockResolvedValue(undefined);
        
        await storage.setItem('secureKey', 'secureValue');
        
        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('secureKey', 'secureValue');
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      });

      it('should handle SecureStore errors during set', async () => {
        (mockSecureStore.setItemAsync as any).mockRejectedValue(new Error('Storage full'));
        
        await expect(storage.setItem('key', 'value')).rejects.toThrow('Storage full');
      });

      it('should be truly asynchronous with SecureStore', async () => {
        (mockSecureStore.setItemAsync as any).mockResolvedValue(undefined);
        
        const promise = storage.setItem('asyncSetKey', 'asyncSetValue');
        
        expect(promise).toBeInstanceOf(Promise);
        await promise;
        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('asyncSetKey', 'asyncSetValue');
      });

      it('should work on Android platform', async () => {
        mockPlatform.OS = 'android';
        (mockSecureStore.setItemAsync as any).mockResolvedValue(undefined);
        storage = createStorage(mockPlatform, mockSecureStore);
        
        await storage.setItem('androidKey', 'androidValue');
        
        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('androidKey', 'androidValue');
      });
    });

    describe('deleteItem', () => {
      it('should delete item from SecureStore asynchronously', async () => {
        (mockSecureStore.deleteItemAsync as any).mockResolvedValue(undefined);
        
        await storage.deleteItem('secureKey');
        
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('secureKey');
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      });

      it('should handle SecureStore errors during delete', async () => {
        (mockSecureStore.deleteItemAsync as any).mockRejectedValue(new Error('Delete failed'));
        
        await expect(storage.deleteItem('key')).rejects.toThrow('Delete failed');
      });

      it('should be truly asynchronous with SecureStore', async () => {
        (mockSecureStore.deleteItemAsync as any).mockResolvedValue(undefined);
        
        const promise = storage.deleteItem('asyncDeleteKey');
        
        expect(promise).toBeInstanceOf(Promise);
        await promise;
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('asyncDeleteKey');
      });

      it('should work on Android platform', async () => {
        mockPlatform.OS = 'android';
        (mockSecureStore.deleteItemAsync as any).mockResolvedValue(undefined);
        storage = createStorage(mockPlatform, mockSecureStore);
        
        await storage.deleteItem('androidKey');
        
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('androidKey');
      });
    });

    describe('Multiple operations with SecureStore', () => {
      it('should handle sequential operations', async () => {
        (mockSecureStore.setItemAsync as any).mockResolvedValue(undefined);
        (mockSecureStore.getItemAsync as any).mockResolvedValue('storedValue');
        (mockSecureStore.deleteItemAsync as any).mockResolvedValue(undefined);
        
        await storage.setItem('key', 'value');
        const result = await storage.getItem('key');
        await storage.deleteItem('key');
        
        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('key', 'value');
        expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('key');
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('key');
        expect(result).toBe('storedValue');
      });

      it('should handle concurrent operations', async () => {
        (mockSecureStore.setItemAsync as any).mockResolvedValue(undefined);
        (mockSecureStore.getItemAsync as any).mockResolvedValue('value');
        
        await Promise.all([
          storage.setItem('key1', 'value1'),
          storage.setItem('key2', 'value2'),
          storage.setItem('key3', 'value3'),
        ]);
        
        expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Platform consistency', () => {
    it('should have same API signature for web and mobile', () => {
      const webStorage = createStorage({ OS: 'web' }, mockSecureStore);
      const mobileStorage = createStorage({ OS: 'ios' }, mockSecureStore);
      
      expect(typeof webStorage.getItem).toBe('function');
      expect(typeof webStorage.setItem).toBe('function');
      expect(typeof webStorage.deleteItem).toBe('function');
      
      expect(typeof mobileStorage.getItem).toBe('function');
      expect(typeof mobileStorage.setItem).toBe('function');
      expect(typeof mobileStorage.deleteItem).toBe('function');
    });

    it('should return promises for all methods on all platforms', () => {
      const webStorage = createStorage({ OS: 'web' }, mockSecureStore);
      const iosStorage = createStorage({ OS: 'ios' }, mockSecureStore);
      
      (mockSecureStore.getItemAsync as any).mockResolvedValue('value');
      (mockSecureStore.setItemAsync as any).mockResolvedValue(undefined);
      (mockSecureStore.deleteItemAsync as any).mockResolvedValue(undefined);
      
      global.localStorage = mockLocalStorage as any;
      
      expect(webStorage.getItem('key')).toBeInstanceOf(Promise);
      expect(webStorage.setItem('key', 'value')).toBeInstanceOf(Promise);
      expect(webStorage.deleteItem('key')).toBeInstanceOf(Promise);
      
      expect(iosStorage.getItem('key')).toBeInstanceOf(Promise);
      expect(iosStorage.setItem('key', 'value')).toBeInstanceOf(Promise);
      expect(iosStorage.deleteItem('key')).toBeInstanceOf(Promise);
    });
  });

  describe('Real-world usage scenarios', () => {
    beforeEach(() => {
      mockPlatform.OS = 'web';
      mockLocalStorage.clear();
      jest.clearAllMocks();
      global.localStorage = mockLocalStorage as any;
      storage = createStorage(mockPlatform, mockSecureStore);
    });

    it('should handle auth token storage and retrieval', async () => {
      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const refreshToken = 'refresh_token_12345...';
      
      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      
      const storedAccessToken = await storage.getItem('accessToken');
      const storedRefreshToken = await storage.getItem('refreshToken');
      
      expect(storedAccessToken).toBe(accessToken);
      expect(storedRefreshToken).toBe(refreshToken);
    });

    it('should handle logout cleanup', async () => {
      await storage.setItem('accessToken', 'token1');
      await storage.setItem('refreshToken', 'token2');
      await storage.setItem('is2FAEnabled', 'true');
      
      await storage.deleteItem('accessToken');
      await storage.deleteItem('refreshToken');
      await storage.deleteItem('is2FAEnabled');
      
      const accessToken = await storage.getItem('accessToken');
      const refreshToken = await storage.getItem('refreshToken');
      const is2FAEnabled = await storage.getItem('is2FAEnabled');
      
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(is2FAEnabled).toBeNull();
    });

    it('should handle boolean string storage for 2FA flag', async () => {
      await storage.setItem('is2FAEnabled', 'true');
      
      const is2FAEnabledStr = await storage.getItem('is2FAEnabled');
      const is2FAEnabled = is2FAEnabledStr === 'true';
      
      expect(is2FAEnabled).toBe(true);
      
      await storage.setItem('is2FAEnabled', 'false');
      const is2FAEnabledStr2 = await storage.getItem('is2FAEnabled');
      expect(is2FAEnabledStr2 === 'true').toBe(false);
    });

    it('should handle initialization from storage', async () => {
      await storage.setItem('accessToken', 'stored_access_token');
      await storage.setItem('refreshToken', 'stored_refresh_token');
      await storage.setItem('is2FAEnabled', 'true');
      
      const accessToken = await storage.getItem('accessToken');
      const refreshToken = await storage.getItem('refreshToken');
      const is2FAEnabledStr = await storage.getItem('is2FAEnabled');
      
      expect(accessToken).toBe('stored_access_token');
      expect(refreshToken).toBe('stored_refresh_token');
      expect(is2FAEnabledStr).toBe('true');
    });
  });
});
