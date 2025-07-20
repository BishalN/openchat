import { describe, it, expect } from 'vitest';
import { extractQueryParameters, buildUrlWithParams } from '@/lib/utils';

describe('extractQueryParameters', () => {
    describe('valid URLs with query parameters', () => {
      it('should extract single parameter', () => {
        const url = 'https://example.com?name=john';
        const result = extractQueryParameters(url);
        expect(result).toEqual([{ key: 'name', value: 'john' }]);
      });
  
      it('should extract multiple parameters', () => {
        const url = 'https://example.com?name=john&age=25&city=nyc';
        const result = extractQueryParameters(url);
        expect(result).toEqual([
          { key: 'name', value: 'john' },
          { key: 'age', value: '25' },
          { key: 'city', value: 'nyc' }
        ]);
      });
  
  
      it('should handle empty parameter values', () => {
        const url = 'https://example.com?name=&age=25';
        const result = extractQueryParameters(url);
        expect(result).toEqual([
          { key: 'name', value: '' },
          { key: 'age', value: '25' }
        ]);
      });
  
      it('should handle duplicate parameter names', () => {
        const url = 'https://example.com?tag=js&tag=react&tag=typescript';
        const result = extractQueryParameters(url);
        expect(result).toEqual([
          { key: 'tag', value: 'js' },
          { key: 'tag', value: 'react' },
          { key: 'tag', value: 'typescript' }
        ]);
      });
    });
  
    describe('URLs without query parameters', () => {
      it('should return empty array for URL without parameters', () => {
        const url = 'https://example.com';
        const result = extractQueryParameters(url);
        expect(result).toEqual([]);
      });
  
      it('should return empty array for URL with empty query string', () => {
        const url = 'https://example.com?';
        const result = extractQueryParameters(url);
        expect(result).toEqual([]);
      });
  
      it('should return empty array for URL with only question mark', () => {
        const url = 'https://example.com?&';
        const result = extractQueryParameters(url);
        expect(result).toEqual([]);
      });
    });
  
    describe('edge cases and error handling', () => {
      it('should handle invalid URLs gracefully', () => {
        const invalidUrls = [
          'not-a-url',
          'http://',
          'https://',
          '',
          'ftp://invalid',
          '://example.com'
        ];
  
        invalidUrls.forEach(url => {
          const result = extractQueryParameters(url);
          expect(result).toEqual([]);
        });
      });
  
      it('should handle URLs with hash fragments', () => {
        const url = 'https://example.com?name=john#section1';
        const result = extractQueryParameters(url);
        expect(result).toEqual([{ key: 'name', value: 'john' }]);
      });
  
      it('should handle complex URLs with ports and paths', () => {
        const url = 'https://example.com:8080/api/users?name=john&role=admin';
        const result = extractQueryParameters(url);
        expect(result).toEqual([
          { key: 'name', value: 'john' },
          { key: 'role', value: 'admin' }
        ]);
      });
    });
  });
  
  describe('buildUrlWithParams', () => {
    describe('building URLs with parameters', () => {
      it('should build URL with single parameter', () => {
        const baseUrl = 'https://example.com';
        const params = [{ key: 'name', value: 'john' }];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/?name=john');
      });
  
      it('should build URL with multiple parameters', () => {
        const baseUrl = 'https://example.com';
        const params = [
          { key: 'name', value: 'john' },
          { key: 'age', value: '25' },
          { key: 'city', value: 'nyc' }
        ];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/?name=john&age=25&city=nyc');
      });
  
      it('should replace existing query parameters', () => {
        const baseUrl = 'https://example.com?existing=value';
        const params = [{ key: 'name', value: 'john' }];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/?name=john');
      });
  
      it('should handle parameters with special characters', () => {
        const baseUrl = 'https://example.com';
        const params = [
          { key: 'search', value: 'hello world' },
          { key: 'filter', value: 'active' }
        ];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/?search=hello+world&filter=active');
      });
  
    });
  
    describe('edge cases and error handling', () => {
      it('should handle empty parameters array', () => {
        const baseUrl = 'https://example.com';
        const params: Array<{ key: string; value: string }> = [];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/');
      });
  
      it('should filter out parameters with empty keys or values', () => {
        const baseUrl = 'https://example.com';
        const params = [
          { key: '', value: 'john' },
          { key: 'name', value: '' },
          { key: 'age', value: '25' }
        ];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/?age=25');
      });
  
  
      it('should preserve URL structure with paths and ports', () => {
        const baseUrl = 'https://example.com:8080/api/users';
        const params = [{ key: 'name', value: 'john' }];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com:8080/api/users?name=john');
      });
  
      it('should handle URLs with hash fragments', () => {
        const baseUrl = 'https://example.com#section1';
        const params = [{ key: 'name', value: 'john' }];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/?name=john#section1');
      });
    });
  
    describe('real-world examples', () => {
      it('should handle pagination parameters', () => {
        const baseUrl = 'https://api.example.com/users';
        const params = [
          { key: 'page', value: '1' },
          { key: 'limit', value: '10' },
          { key: 'sort', value: 'name' }
        ];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://api.example.com/users?page=1&limit=10&sort=name');
      });
  
      it('should handle search and filter parameters', () => {
        const baseUrl = 'https://example.com/search';
        const params = [
          { key: 'q', value: 'react typescript' },
          { key: 'category', value: 'programming' },
          { key: 'price_min', value: '10' },
          { key: 'price_max', value: '100' }
        ];
        const result = buildUrlWithParams(baseUrl, params);
        expect(result).toBe('https://example.com/search?q=react+typescript&category=programming&price_min=10&price_max=100');
      });
    });
  }); 