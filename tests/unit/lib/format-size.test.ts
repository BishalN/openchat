import { describe, it, expect } from 'vitest';
import { formatSize } from '@/lib/utils';

describe('formatSize', () => {
  describe('bytes (less than 1 KB)', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatSize(0)).toBe('0 B');
    });

    it('should format 1 byte correctly', () => {
      expect(formatSize(1)).toBe('1 B');
    });

    it('should format 512 bytes correctly', () => {
      expect(formatSize(512)).toBe('512 B');
    });

    it('should format 1023 bytes correctly', () => {
      expect(formatSize(1023)).toBe('1023 B');
    });
  });

  describe('kilobytes (1 KB to 1 MB)', () => {
    it('should format exactly 1 KB correctly', () => {
      expect(formatSize(1024)).toBe('1.0 KB');
    });

    it('should format 1.5 KB correctly', () => {
      expect(formatSize(1536)).toBe('1.5 KB');
    });

    it('should format 2.7 KB correctly', () => {
      expect(formatSize(2764)).toBe('2.7 KB');
    });

    it('should format 10 KB correctly', () => {
      expect(formatSize(10240)).toBe('10.0 KB');
    });

    it('should format 999.9 KB correctly', () => {
      expect(formatSize(1024 * 999.9)).toBe('999.9 KB');
    });

  });

  describe('megabytes (1 MB and above)', () => {
    it('should format exactly 1 MB correctly', () => {
      expect(formatSize(1024 * 1024)).toBe('1.0 MB');
    });

    it('should format 1.5 MB correctly', () => {
      expect(formatSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });

    it('should format 2.7 MB correctly', () => {
      expect(formatSize(1024 * 1024 * 2.7)).toBe('2.7 MB');
    });

    it('should format 10 MB correctly', () => {
      expect(formatSize(1024 * 1024 * 10)).toBe('10.0 MB');
    });

    it('should format 100 MB correctly', () => {
      expect(formatSize(1024 * 1024 * 100)).toBe('100.0 MB');
    });

    it('should format 1 GB correctly', () => {
      expect(formatSize(1024 * 1024 * 1024)).toBe('1024.0 MB');
    });
  });


  describe('real-world examples', () => {
    it('should format typical file sizes', () => {
      // Small text file
      expect(formatSize(2048)).toBe('2.0 KB');
      
      // Medium image
      expect(formatSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
      
      // Large video file
      expect(formatSize(1024 * 1024 * 1024 * 1.5)).toBe('1536.0 MB');
    });

    it('should format common document sizes', () => {
      // Word document
      expect(formatSize(45000)).toBe('43.9 KB');
      
      // PDF document
      expect(formatSize(1024 * 1024 * 3.2)).toBe('3.2 MB');
      
      // Excel spreadsheet
      expect(formatSize(150000)).toBe('146.5 KB');
    });
  });

  describe('precision and rounding', () => {
    it('should round to one decimal place', () => {
      expect(formatSize(1024 * 1.234)).toBe('1.2 KB');
      expect(formatSize(1024 * 1.567)).toBe('1.6 KB');
      expect(formatSize(1024 * 1.999)).toBe('2.0 KB');
    });

    it('should handle exact decimal values', () => {
      expect(formatSize(1024 * 1.0)).toBe('1.0 KB');
      expect(formatSize(1024 * 2.0)).toBe('2.0 KB');
      expect(formatSize(1024 * 10.0)).toBe('10.0 KB');
    });
  });
});

