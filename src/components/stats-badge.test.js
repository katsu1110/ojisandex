import { describe, it, expect } from 'vitest';
import { renderStars } from './stats-badge.js';

describe('renderStars', () => {
    it('should render correct number of filled and empty stars for a typical rating', () => {
        const result = renderStars(3);
        expect(result).toBe(
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>'
        );
    });

    it('should handle minimum rating (0)', () => {
        const result = renderStars(0);
        expect(result).toBe(
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>'
        );
    });

    it('should handle maximum rating (5)', () => {
        const result = renderStars(5);
        expect(result).toBe(
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star">★</span>'
        );
    });

    it('should support custom maximum stars', () => {
        const result = renderStars(2, 3);
        expect(result).toBe(
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star empty">★</span>'
        );
    });

    it('should handle rating exceeding maxStars gracefully (all filled)', () => {
        const result = renderStars(6, 5);
        expect(result).toBe(
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star">★</span>' +
            '<span class="star">★</span>'
        );
    });

    it('should handle negative ratings as 0', () => {
        const result = renderStars(-1);
        expect(result).toBe(
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>' +
            '<span class="star empty">★</span>'
        );
    });
});
