// KBO Fan Grade System Service

import { pb } from '$lib/pocketbase';
import { USER_GRADES, type UserGrade, type UserStats } from '$lib/types/auth';

export interface GradeCalculation {
	currentGrade: UserGrade;
	nextGrade: UserGrade | null;
	progress: number;
	pointsToNext: number;
	recentActivities: ActivityPoint[];
}

export interface ActivityPoint {
	type: 'card_created' | 'like_received' | 'comment_received' | 'featured' | 'monthly_active' | 'membership_bonus';
	points: number;
	description: string;
	timestamp: Date;
}

export interface GradeBenefit {
	type: 'feature' | 'effect' | 'privilege' | 'reward';
	name: string;
	description: string;
	icon: string;
	unlocked: boolean;
}

class GradeService {
	/**
	 * Calculate user grade based on current stats
	 */
	calculateGrade(stats: UserStats): GradeCalculation {
		const gradePoints = this.calculateTotalPoints(stats);
		const currentGrade = this.getGradeByPoints(gradePoints);
		const nextGrade = this.getNextGrade(currentGrade);
		
		let progress = 0;
		let pointsToNext = 0;
		
		if (nextGrade) {
			const currentRange = nextGrade.minPoints - currentGrade.minPoints;
			const currentProgress = gradePoints - currentGrade.minPoints;
			progress = (currentProgress / currentRange) * 100;
			pointsToNext = nextGrade.minPoints - gradePoints;
		} else {
			progress = 100; // Max grade achieved
		}

		return {
			currentGrade,
			nextGrade,
			progress: Math.min(100, Math.max(0, progress)),
			pointsToNext: Math.max(0, pointsToNext),
			recentActivities: this.getRecentActivities(stats)
		};
	}

	/**
	 * Calculate total grade points from user stats
	 */
	private calculateTotalPoints(stats: UserStats): number {
		let points = 0;
		
		// Base activity points
		points += stats.cardsCreated * 10;        // 카드 제작: 10점
		points += stats.totalLikes * 2;           // 받은 좋아요: 2점
		points += stats.totalViews * 0.1;         // 조회수: 0.1점
		points += stats.followers * 5;            // 팔로워: 5점
		points += stats.commentsReceived * 3;     // 받은 댓글: 3점
		points += stats.featuredCards * 50;       // 추천 카드: 50점
		
		// Quality bonus (high engagement rate)
		if (stats.cardsCreated > 0) {
			const avgLikesPerCard = stats.totalLikes / stats.cardsCreated;
			if (avgLikesPerCard > 10) {
				points += stats.cardsCreated * 5; // 고품질 카드 보너스
			}
		}
		
		// Consistency bonus
		if (stats.monthlyActive) {
			points += 20; // 월간 활성 사용자 보너스
		}
		
		// Membership duration bonus
		const joinDate = new Date(stats.joinDate);
		const monthsSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
		points += Math.floor(monthsSinceJoin) * 5; // 가입 기간 보너스
		
		// Community contribution bonus
		const communityScore = this.calculateCommunityContribution(stats);
		points += communityScore;
		
		return Math.floor(points);
	}

	/**
	 * Calculate community contribution score
	 */
	private calculateCommunityContribution(stats: UserStats): number {
		let score = 0;
		
		// Social engagement
		const socialRatio = stats.followers > 0 ? stats.following / stats.followers : 0;
		if (socialRatio > 0.1 && socialRatio < 2) {
			score += 10; // 건전한 소셜 활동
		}
		
		// Content quality (likes to views ratio)
		if (stats.totalViews > 0) {
			const engagementRate = stats.totalLikes / stats.totalViews;
			if (engagementRate > 0.05) {
				score += 15; // 높은 참여율
			}
		}
		
		// Regular activity
		const lastActive = new Date(stats.lastActive);
		const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
		if (daysSinceActive < 7) {
			score += 10; // 최근 활동
		}
		
		return score;
	}

	/**
	 * Get grade by points
	 */
	private getGradeByPoints(points: number): UserGrade {
		const grades = Object.values(USER_GRADES);
		
		for (let i = grades.length - 1; i >= 0; i--) {
			if (points >= grades[i].minPoints) {
				return { ...grades[i], points };
			}
		}
		
		return { ...USER_GRADES.rookie, points };
	}

	/**
	 * Get next grade level
	 */
	private getNextGrade(currentGrade: UserGrade): UserGrade | null {
		const grades = Object.values(USER_GRADES);
		const currentIndex = grades.findIndex(g => g.level === currentGrade.level);
		
		if (currentIndex < grades.length - 1) {
			return grades[currentIndex + 1];
		}
		
		return null; // Already at max grade
	}

	/**
	 * Get recent activities that contributed to grade points
	 */
	private getRecentActivities(stats: UserStats): ActivityPoint[] {
		const activities: ActivityPoint[] = [];
		const now = new Date();
		
		// Simulate recent activities based on stats
		if (stats.cardsCreated > 0) {
			activities.push({
				type: 'card_created',
				points: 10,
				description: '홀로그래픽 카드 제작',
				timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
			});
		}
		
		if (stats.totalLikes > 0) {
			activities.push({
				type: 'like_received',
				points: 2,
				description: '카드 좋아요 받음',
				timestamp: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000)
			});
		}
		
		if (stats.featuredCards > 0) {
			activities.push({
				type: 'featured',
				points: 50,
				description: '카드가 추천 갤러리에 선정됨',
				timestamp: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000)
			});
		}
		
		if (stats.monthlyActive) {
			activities.push({
				type: 'monthly_active',
				points: 20,
				description: '월간 활성 사용자 보너스',
				timestamp: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
			});
		}
		
		// Sort by timestamp (most recent first)
		return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
	}

	/**
	 * Get grade benefits for a specific grade level
	 */
	getGradeBenefits(grade: UserGrade): GradeBenefit[] {
		const allBenefits: Record<string, GradeBenefit[]> = {
			rookie: [
				{
					type: 'feature',
					name: '기본 카드 제작',
					description: '홀로그래픽 카드 기본 제작 기능',
					icon: '🎨',
					unlocked: true
				},
				{
					type: 'feature',
					name: '커뮤니티 참여',
					description: '댓글 작성 및 좋아요 기능',
					icon: '💬',
					unlocked: true
				}
			],
			fan: [
				{
					type: 'feature',
					name: '응원가 BGM',
					description: '카드에 KBO 팀 응원가 추가 가능',
					icon: '🎵',
					unlocked: true
				},
				{
					type: 'effect',
					name: '팀 컬러 테마',
					description: '응원하는 팀의 컬러로 홀로그래픽 효과',
					icon: '🌈',
					unlocked: true
				}
			],
			supporter: [
				{
					type: 'feature',
					name: '프리미엄 편집 도구',
					description: '고급 텍스트 효과 및 레이어 기능',
					icon: '🛠️',
					unlocked: true
				},
				{
					type: 'privilege',
					name: '응원단 배지',
					description: '특별한 응원단 멤버 배지 획득',
					icon: '🎺',
					unlocked: true
				},
				{
					type: 'effect',
					name: '프리미엄 홀로그래픽',
					description: '더욱 화려한 홀로그래픽 효과',
					icon: '✨',
					unlocked: true
				}
			],
			expert: [
				{
					type: 'feature',
					name: '무제한 업로드',
					description: '카드 업로드 제한 없음',
					icon: '📤',
					unlocked: true
				},
				{
					type: 'privilege',
					name: '멘토 자격',
					description: '신규 사용자 멘토링 권한',
					icon: '👨‍🏫',
					unlocked: true
				},
				{
					type: 'reward',
					name: '수익 분배',
					description: '플랫폼 수익 일부 분배 참여',
					icon: '💰',
					unlocked: true
				},
				{
					type: 'effect',
					name: '독점 홀로그래픽',
					description: '시즌권 홀더 전용 특수 효과',
					icon: '🏟️',
					unlocked: true
				}
			],
			legend: [
				{
					type: 'privilege',
					name: '명예의 전당',
					description: '구단 레전드 명예의 전당 등재',
					icon: '🏆',
					unlocked: true
				},
				{
					type: 'privilege',
					name: '특별 이벤트',
					description: 'VIP 전용 이벤트 초대',
					icon: '🎪',
					unlocked: true
				},
				{
					type: 'effect',
					name: '레전드 홀로그래픽',
					description: '최고급 레전드 전용 효과',
					icon: '👑',
					unlocked: true
				},
				{
					type: 'feature',
					name: '모든 기능',
					description: '플랫폼의 모든 프리미엄 기능',
					icon: '🌟',
					unlocked: true
				}
			]
		};

		// Get benefits for current grade and all previous grades
		const grades = Object.keys(USER_GRADES);
		const currentGradeIndex = grades.indexOf(grade.level);
		
		let benefits: GradeBenefit[] = [];
		for (let i = 0; i <= currentGradeIndex; i++) {
			const gradeBenefits = allBenefits[grades[i]] || [];
			benefits = [...benefits, ...gradeBenefits];
		}

		return benefits;
	}

	/**
	 * Update user grade in database
	 */
	async updateUserGrade(userId: string): Promise<GradeCalculation> {
		try {
			// Get current user stats
			const user = await pb.collection('users').getOne(userId);
			const stats: UserStats = user.stats || this.getDefaultStats();
			
			// Calculate new grade
			const gradeCalculation = this.calculateGrade(stats);
			
			// Update user record
			await pb.collection('users').update(userId, {
				grade: gradeCalculation.currentGrade.level,
				'stats.gradePoints': gradeCalculation.currentGrade.points
			});

			return gradeCalculation;
		} catch (error) {
			console.error('Failed to update user grade:', error);
			throw error;
		}
	}

	/**
	 * Award points for specific activity
	 */
	async awardPoints(userId: string, activity: ActivityPoint): Promise<void> {
		try {
			const user = await pb.collection('users').getOne(userId);
			const stats: UserStats = user.stats || this.getDefaultStats();
			
			// Update relevant stat
			switch (activity.type) {
				case 'card_created':
					stats.cardsCreated += 1;
					break;
				case 'like_received':
					stats.totalLikes += 1;
					break;
				case 'comment_received':
					stats.commentsReceived += 1;
					break;
				case 'featured':
					stats.featuredCards += 1;
					break;
			}
			
			// Update last active
			stats.lastActive = new Date().toISOString();
			
			// Save updated stats
			await pb.collection('users').update(userId, { stats });
			
			// Recalculate grade
			await this.updateUserGrade(userId);
		} catch (error) {
			console.error('Failed to award points:', error);
			throw error;
		}
	}

	/**
	 * Get grade leaderboard
	 */
	async getGradeLeaderboard(limit: number = 10): Promise<Array<{user: any, grade: UserGrade}>> {
		try {
			const users = await pb.collection('users').getList(1, limit, {
				sort: '-stats.gradePoints',
				filter: 'stats.gradePoints > 0'
			});

			return users.items.map(user => ({
				user,
				grade: this.getGradeByPoints(user.stats?.gradePoints || 0)
			}));
		} catch (error) {
			console.error('Failed to get grade leaderboard:', error);
			return [];
		}
	}

	/**
	 * Get default user stats
	 */
	private getDefaultStats(): UserStats {
		return {
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
	}
}

// Export singleton instance
export const gradeService = new GradeService();