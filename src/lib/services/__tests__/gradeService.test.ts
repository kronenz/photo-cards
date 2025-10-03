// Grade Service Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gradeService } from '../gradeService';
import { USER_GRADES } from '$lib/types/auth';
import type { UserStats } from '$lib/types/auth';

// Mock PocketBase
const mockPb = {
	collection: vi.fn(() => ({
		getOne: vi.fn(),
		update: vi.fn(),
		getList: vi.fn(),
		getFullList: vi.fn()
	}))
};

vi.mock('$lib/pocketbase', () => ({
	pb: mockPb
}));

describe('GradeService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Grade Calculation', () => {
		it('should calculate rookie grade for new user', () => {
			const stats: UserStats = {
				cardsCreated: 0,
				totalLikes: 0,
				totalViews: 0,
				followers: 0,
				following: 0,
				gradePoints: 0,
				commentsReceived: 0,
				featuredCards: 0,
				monthlyActive: true,
				joinDate: new Date().toISOString(),
				lastActive: new Date().toISOString()
			};

			const result = gradeService.calculateGrade(stats);

			expect(result.currentGrade.level).toBe('rookie');
			expect(result.currentGrade.koreanName).toBe('야구 입문자');
			expect(result.nextGrade?.level).toBe('fan');
			expect(result.pointsToNext).toBeGreaterThan(0);
		});

		it('should calculate fan grade for active user', () => {
			const stats: UserStats = {
				cardsCreated: 10,
				totalLikes: 50,
				totalViews: 500,
				followers: 5,
				following: 10,
				gradePoints: 0,
				commentsReceived: 20,
				featuredCards: 0,
				monthlyActive: true,
				joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
				lastActive: new Date().toISOString()
			};

			const result = gradeService.calculateGrade(stats);

			expect(result.currentGrade.level).toBe('fan');
			expect(result.currentGrade.koreanName).toBe('외야석 팬');
			expect(result.currentGrade.points).toBeGreaterThan(100);
		});

		it('should calculate supporter grade for engaged user', () => {
			const stats: UserStats = {
				cardsCreated: 50,
				totalLikes: 500,
				totalViews: 5000,
				followers: 20,
				following: 30,
				gradePoints: 0,
				commentsReceived: 100,
				featuredCards: 2,
				monthlyActive: true,
				joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
				lastActive: new Date().toISOString()
			};

			const result = gradeService.calculateGrade(stats);

			expect(result.currentGrade.level).toBe('supporter');
			expect(result.currentGrade.koreanName).toBe('응원단 멤버');
			expect(result.currentGrade.points).toBeGreaterThan(500);
		});

		it('should calculate expert grade for power user', () => {
			const stats: UserStats = {
				cardsCreated: 150,
				totalLikes: 2000,
				totalViews: 20000,
				followers: 100,
				following: 80,
				gradePoints: 0,
				commentsReceived: 500,
				featuredCards: 10,
				monthlyActive: true,
				joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
				lastActive: new Date().toISOString()
			};

			const result = gradeService.calculateGrade(stats);

			expect(result.currentGrade.level).toBe('expert');
			expect(result.currentGrade.koreanName).toBe('시즌권 홀더');
			expect(result.currentGrade.points).toBeGreaterThan(1500);
		});

		it('should calculate legend grade for top user', () => {
			const stats: UserStats = {
				cardsCreated: 500,
				totalLikes: 10000,
				totalViews: 100000,
				followers: 500,
				following: 200,
				gradePoints: 0,
				commentsReceived: 2000,
				featuredCards: 50,
				monthlyActive: true,
				joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
				lastActive: new Date().toISOString()
			};

			const result = gradeService.calculateGrade(stats);

			expect(result.currentGrade.level).toBe('legend');
			expect(result.currentGrade.koreanName).toBe('구단 레전드');
			expect(result.currentGrade.points).toBeGreaterThan(5000);
			expect(result.nextGrade).toBeNull(); // Max grade
		});
	});

	describe('Points Calculation', () => {
		it('should award correct points for different activities', () => {
			const gradeServiceInstance = gradeService as any;
			
			const stats: UserStats = {
				cardsCreated: 10,      // 10 * 10 = 100 points
				totalLikes: 50,        // 50 * 2 = 100 points
				totalViews: 1000,      // 1000 * 0.1 = 100 points
				followers: 20,         // 20 * 5 = 100 points
				following: 15,
				gradePoints: 0,
				commentsReceived: 30,  // 30 * 3 = 90 points
				featuredCards: 2,      // 2 * 50 = 100 points
				monthlyActive: true,   // +20 points
				joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago (+10 points)
				lastActive: new Date().toISOString()
			};

			const totalPoints = gradeServiceInstance.calculateTotalPoints(stats);

			// Base points: 100 + 100 + 100 + 100 + 90 + 100 + 20 + 10 = 620
			// Plus community contribution bonus
			expect(totalPoints).toBeGreaterThan(600);
		});

		it('should apply quality bonus for high engagement', () => {
			const gradeServiceInstance = gradeService as any;
			
			const stats: UserStats = {
				cardsCreated: 10,
				totalLikes: 150, // 15 likes per card (>10 threshold)
				totalViews: 1000,
				followers: 0,
				following: 0,
				gradePoints: 0,
				commentsReceived: 0,
				featuredCards: 0,
				monthlyActive: false,
				joinDate: new Date().toISOString(),
				lastActive: new Date().toISOString()
			};

			const totalPoints = gradeServiceInstance.calculateTotalPoints(stats);

			// Should include quality bonus: 10 cards * 5 bonus = 50 extra points
			const expectedBase = (10 * 10) + (150 * 2) + (1000 * 0.1); // 500
			expect(totalPoints).toBeGreaterThan(expectedBase);
		});

		it('should apply monthly active bonus', () => {
			const gradeServiceInstance = gradeService as any;
			
			const statsActive: UserStats = {
				cardsCreated: 5,
				totalLikes: 10,
				totalViews: 100,
				followers: 0,
				following: 0,
				gradePoints: 0,
				commentsReceived: 0,
				featuredCards: 0,
				monthlyActive: true,
				joinDate: new Date().toISOString(),
				lastActive: new Date().toISOString()
			};

			const statsInactive: UserStats = {
				...statsActive,
				monthlyActive: false
			};

			const activePoints = gradeServiceInstance.calculateTotalPoints(statsActive);
			const inactivePoints = gradeServiceInstance.calculateTotalPoints(statsInactive);

			expect(activePoints).toBeGreaterThan(inactivePoints);
			expect(activePoints - inactivePoints).toBeGreaterThanOrEqual(20);
		});
	});

	describe('Grade Benefits', () => {
		it('should return correct benefits for rookie grade', () => {
			const rookieGrade = USER_GRADES.rookie;
			const benefits = gradeService.getGradeBenefits(rookieGrade);

			expect(benefits).toHaveLength(2);
			expect(benefits.some(b => b.name === '기본 카드 제작')).toBe(true);
			expect(benefits.some(b => b.name === '커뮤니티 참여')).toBe(true);
			expect(benefits.every(b => b.unlocked)).toBe(true);
		});

		it('should return cumulative benefits for higher grades', () => {
			const supporterGrade = USER_GRADES.supporter;
			const benefits = gradeService.getGradeBenefits(supporterGrade);

			// Should include benefits from rookie, fan, and supporter
			expect(benefits.length).toBeGreaterThan(4);
			expect(benefits.some(b => b.name === '기본 카드 제작')).toBe(true); // rookie
			expect(benefits.some(b => b.name === '응원가 BGM')).toBe(true); // fan
			expect(benefits.some(b => b.name === '프리미엄 편집 도구')).toBe(true); // supporter
		});

		it('should return all benefits for legend grade', () => {
			const legendGrade = USER_GRADES.legend;
			const benefits = gradeService.getGradeBenefits(legendGrade);

			// Should include all benefits from all grades
			expect(benefits.length).toBeGreaterThan(10);
			expect(benefits.some(b => b.name === '명예의 전당')).toBe(true);
			expect(benefits.some(b => b.name === '모든 기능')).toBe(true);
		});
	});

	describe('Database Operations', () => {
		it('should update user grade in database', async () => {
			const mockUser = {
				id: 'user123',
				stats: {
					cardsCreated: 10,
					totalLikes: 50,
					totalViews: 500,
					followers: 5,
					following: 10,
					gradePoints: 0,
					commentsReceived: 20,
					featuredCards: 1,
					monthlyActive: true,
					joinDate: new Date().toISOString(),
					lastActive: new Date().toISOString()
				}
			};

			const mockCollection = {
				getOne: vi.fn().mockResolvedValue(mockUser),
				update: vi.fn().mockResolvedValue(mockUser)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await gradeService.updateUserGrade('user123');

			expect(mockCollection.getOne).toHaveBeenCalledWith('user123');
			expect(mockCollection.update).toHaveBeenCalledWith('user123', expect.objectContaining({
				grade: expect.any(String),
				'stats.gradePoints': expect.any(Number)
			}));

			expect(result.currentGrade).toBeDefined();
			expect(result.currentGrade.points).toBeGreaterThan(0);
		});

		it('should award points for specific activity', async () => {
			const mockUser = {
				id: 'user123',
				stats: {
					cardsCreated: 5,
					totalLikes: 20,
					totalViews: 200,
					followers: 2,
					following: 5,
					gradePoints: 100,
					commentsReceived: 10,
					featuredCards: 0,
					monthlyActive: true,
					joinDate: new Date().toISOString(),
					lastActive: new Date().toISOString()
				}
			};

			const mockCollection = {
				getOne: vi.fn().mockResolvedValue(mockUser),
				update: vi.fn().mockResolvedValue({
					...mockUser,
					stats: {
						...mockUser.stats,
						cardsCreated: 6,
						lastActive: new Date().toISOString()
					}
				})
			};
			mockPb.collection.mockReturnValue(mockCollection);

			await gradeService.awardPoints('user123', {
				type: 'card_created',
				points: 10,
				description: '홀로그래픽 카드 제작',
				timestamp: new Date()
			});

			expect(mockCollection.getOne).toHaveBeenCalledWith('user123');
			expect(mockCollection.update).toHaveBeenCalledWith('user123', expect.objectContaining({
				stats: expect.objectContaining({
					cardsCreated: 6,
					lastActive: expect.any(String)
				})
			}));
		});

		it('should get grade leaderboard', async () => {
			const mockUsers = {
				items: [
					{
						id: 'user1',
						displayName: 'Top User',
						stats: { gradePoints: 5000 }
					},
					{
						id: 'user2',
						displayName: 'Second User',
						stats: { gradePoints: 3000 }
					}
				]
			};

			const mockCollection = {
				getList: vi.fn().mockResolvedValue(mockUsers)
			};
			mockPb.collection.mockReturnValue(mockCollection);

			const result = await gradeService.getGradeLeaderboard(10);

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 10, {
				sort: '-stats.gradePoints',
				filter: 'stats.gradePoints > 0'
			});

			expect(result).toHaveLength(2);
			expect(result[0].user.displayName).toBe('Top User');
			expect(result[0].grade.level).toBe('legend');
			expect(result[1].grade.level).toBe('expert');
		});
	});

	describe('Recent Activities', () => {
		it('should generate recent activities based on stats', () => {
			const gradeServiceInstance = gradeService as any;
			
			const stats: UserStats = {
				cardsCreated: 5,
				totalLikes: 20,
				totalViews: 200,
				followers: 3,
				following: 8,
				gradePoints: 150,
				commentsReceived: 10,
				featuredCards: 1,
				monthlyActive: true,
				joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				lastActive: new Date().toISOString()
			};

			const activities = gradeServiceInstance.getRecentActivities(stats);

			expect(activities).toBeInstanceOf(Array);
			expect(activities.length).toBeGreaterThan(0);
			expect(activities.length).toBeLessThanOrEqual(5);

			// Check activity structure
			activities.forEach((activity: any) => {
				expect(activity).toHaveProperty('type');
				expect(activity).toHaveProperty('points');
				expect(activity).toHaveProperty('description');
				expect(activity).toHaveProperty('timestamp');
				expect(activity.timestamp).toBeInstanceOf(Date);
			});

			// Should include featured card activity if user has featured cards
			if (stats.featuredCards > 0) {
				expect(activities.some((a: any) => a.type === 'featured')).toBe(true);
			}
		});
	});
});