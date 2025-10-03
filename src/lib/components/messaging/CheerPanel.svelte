<script lang="ts">
  import { onMount } from 'svelte';
  import { messagingService } from '$lib/services/messagingService';
  import type { CheerMessage, GameLiveChat } from '$lib/types/messaging';

  export let chatId: string;

  let gameLiveData: GameLiveChat | null = null;
  let topCheers: CheerMessage[] = [];
  let cheerStats = {
    totalCheers: 0,
    homeTeamCheers: 0,
    awayTeamCheers: 0
  };

  onMount(() => {
    loadCheerData();
    
    // Update cheer data every 30 seconds
    const interval = setInterval(loadCheerData, 30000);
    
    return () => clearInterval(interval);
  });

  async function loadCheerData() {
    try {
      // This would be implemented with real-time game data
      // For now, using mock data
      gameLiveData = {
        gameId: 'game-123',
        homeTeamId: 'lg-twins',
        awayTeamId: 'doosan-bears',
        chatId,
        currentInning: 7,
        gameStatus: 'in_progress',
        score: { home: 4, away: 2 },
        activeCheerCount: 156,
        topCheers: []
      };

      topCheers = getMockTopCheers();
      cheerStats = {
        totalCheers: 156,
        homeTeamCheers: 89,
        awayTeamCheers: 67
      };
    } catch (error) {
      console.error('Failed to load cheer data:', error);
    }
  }

  function getMockTopCheers(): CheerMessage[] {
    return [
      {
        id: '1',
        chatId,
        senderId: 'user1',
        senderName: '트윈스매니아',
        senderGrade: '시즌권 홀더',
        content: '🎵 LG 트윈스 파이팅! 홈런 한 방 더!',
        type: 'cheer',
        cheerType: 'chant',
        teamId: 'lg-twins',
        intensity: 5,
        attachments: [],
        reactions: [
          { emoji: '🔥', count: 23, users: [], hasReacted: false },
          { emoji: '⚾', count: 15, users: [], hasReacted: true }
        ],
        isEdited: false,
        createdAt: new Date(Date.now() - 300000), // 5분 전
        updatedAt: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        chatId,
        senderId: 'user2',
        senderName: '베어스팬',
        senderGrade: '응원단 멤버',
        content: '📢 두산 베어스 역전하자! 끝까지 응원!',
        type: 'cheer',
        cheerType: 'rally',
        teamId: 'doosan-bears',
        intensity: 4,
        attachments: [],
        reactions: [
          { emoji: '👏', count: 18, users: [], hasReacted: false }
        ],
        isEdited: false,
        createdAt: new Date(Date.now() - 180000), // 3분 전
        updatedAt: new Date(Date.now() - 180000)
      }
    ];
  }

  function getTeamName(teamId: string): string {
    const teamNames: Record<string, string> = {
      'lg-twins': 'LG 트윈스',
      'doosan-bears': '두산 베어스',
      'kia-tigers': 'KIA 타이거즈',
      'samsung-lions': '삼성 라이온즈',
      'lotte-giants': '롯데 자이언츠',
      'kt-wiz': 'KT 위즈',
      'ssg-landers': 'SSG 랜더스',
      'hanwha-eagles': '한화 이글스',
      'nc-dinos': 'NC 다이노스',
      'kiwoom-heroes': '키움 히어로즈'
    };
    return teamNames[teamId] || teamId;
  }

  function getCheerTypeIcon(cheerType: string): string {
    const icons: Record<string, string> = {
      chant: '🎵',
      rally: '📢',
      celebration: '🎉',
      support: '👏',
      defense: '🛡️'
    };
    return icons[cheerType] || '📢';
  }

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    
    return date.toLocaleDateString('ko-KR');
  }

  function getCheerPercentage(teamCheers: number): number {
    return Math.round((teamCheers / cheerStats.totalCheers) * 100);
  }
</script>

<div class="cheer-panel">
  <!-- Game Info Header -->
  {#if gameLiveData}
    <div class="game-header">
      <div class="game-status">
        <div class="live-indicator">
          <div class="live-dot"></div>
          <span>LIVE</span>
        </div>
        <span class="inning">{gameLiveData.currentInning}회</span>
      </div>
      
      <div class="score-board">
        <div class="team home">
          <span class="team-name">{getTeamName(gameLiveData.homeTeamId)}</span>
          <span class="score">{gameLiveData.score.home}</span>
        </div>
        <div class="vs">VS</div>
        <div class="team away">
          <span class="team-name">{getTeamName(gameLiveData.awayTeamId)}</span>
          <span class="score">{gameLiveData.score.away}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Cheer Statistics -->
  <div class="cheer-stats">
    <h3>실시간 응원 현황</h3>
    
    <div class="total-cheers">
      <span class="count">{cheerStats.totalCheers}</span>
      <span class="label">총 응원 메시지</span>
    </div>

    <div class="team-cheer-comparison">
      <div class="team-cheer home">
        <div class="team-info">
          <span class="team-name">{gameLiveData ? getTeamName(gameLiveData.homeTeamId) : 'HOME'}</span>
          <span class="cheer-count">{cheerStats.homeTeamCheers}</span>
        </div>
        <div class="cheer-bar">
          <div 
            class="cheer-fill home-fill"
            style="width: {getCheerPercentage(cheerStats.homeTeamCheers)}%"
          ></div>
        </div>
        <span class="percentage">{getCheerPercentage(cheerStats.homeTeamCheers)}%</span>
      </div>

      <div class="team-cheer away">
        <div class="team-info">
          <span class="team-name">{gameLiveData ? getTeamName(gameLiveData.awayTeamId) : 'AWAY'}</span>
          <span class="cheer-count">{cheerStats.awayTeamCheers}</span>
        </div>
        <div class="cheer-bar">
          <div 
            class="cheer-fill away-fill"
            style="width: {getCheerPercentage(cheerStats.awayTeamCheers)}%"
          ></div>
        </div>
        <span class="percentage">{getCheerPercentage(cheerStats.awayTeamCheers)}%</span>
      </div>
    </div>
  </div>

  <!-- Top Cheers -->
  <div class="top-cheers">
    <h3>인기 응원 메시지</h3>
    
    <div class="cheer-list">
      {#each topCheers as cheer (cheer.id)}
        <div class="cheer-item">
          <div class="cheer-header">
            <div class="cheer-user">
              <span class="user-name">{cheer.senderName}</span>
              <span class="user-grade">{cheer.senderGrade}</span>
            </div>
            <div class="cheer-meta">
              <span class="cheer-type">{getCheerTypeIcon(cheer.cheerType)}</span>
              <span class="cheer-intensity">
                {'⭐'.repeat(cheer.intensity)}
              </span>
            </div>
          </div>
          
          <div class="cheer-content">
            {cheer.content}
          </div>
          
          <div class="cheer-footer">
            <div class="reactions">
              {#each cheer.reactions as reaction}
                <span class="reaction">
                  {reaction.emoji} {reaction.count}
                </span>
              {/each}
            </div>
            <span class="cheer-time">{formatTimeAgo(cheer.createdAt)}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Quick Cheer Actions -->
  <div class="quick-cheers">
    <h4>빠른 응원</h4>
    
    <div class="quick-cheer-buttons">
      <button class="quick-cheer-btn celebration">
        🎉 득점!
      </button>
      <button class="quick-cheer-btn support">
        👏 파이팅!
      </button>
      <button class="quick-cheer-btn rally">
        📢 응원!
      </button>
      <button class="quick-cheer-btn defense">
        🛡️ 수비!
      </button>
    </div>
  </div>

  <!-- Cheer Leaderboard -->
  <div class="cheer-leaderboard">
    <h4>응원왕 순위</h4>
    
    <div class="leaderboard-list">
      <div class="leader-item">
        <span class="rank">1</span>
        <span class="leader-name">야구매니아</span>
        <span class="cheer-count">23</span>
      </div>
      <div class="leader-item">
        <span class="rank">2</span>
        <span class="leader-name">트윈스사랑</span>
        <span class="cheer-count">19</span>
      </div>
      <div class="leader-item">
        <span class="rank">3</span>
        <span class="leader-name">베어스팬</span>
        <span class="cheer-count">15</span>
      </div>
    </div>
  </div>
</div>

<style>
  .cheer-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    overflow-y: auto;
  }

  .game-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-primary);
  }

  .game-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #ff4757;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff4757;
    animation: pulse 2s infinite;
  }

  .inning {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .score-board {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .team {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .team-name {
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
  }

  .score {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .vs {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .cheer-stats {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .cheer-stats h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--text-primary);
  }

  .total-cheers {
    text-align: center;
    margin-bottom: 20px;
  }

  .total-cheers .count {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-color);
  }

  .total-cheers .label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .team-cheer-comparison {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .team-cheer {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .team-info {
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .team-info .team-name {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .cheer-count {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .cheer-bar {
    flex: 1;
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    overflow: hidden;
  }

  .cheer-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .home-fill {
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  }

  .away-fill {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }

  .percentage {
    min-width: 35px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: right;
  }

  .top-cheers {
    flex: 1;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .top-cheers h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--text-primary);
  }

  .cheer-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cheer-item {
    padding: 12px;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .cheer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .cheer-user {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .user-grade {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .cheer-meta {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cheer-type {
    font-size: 16px;
  }

  .cheer-intensity {
    font-size: 12px;
  }

  .cheer-content {
    font-size: 14px;
    line-height: 1.4;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .cheer-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .reactions {
    display: flex;
    gap: 8px;
  }

  .reaction {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .cheer-time {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .quick-cheers {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .quick-cheers h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-primary);
  }

  .quick-cheer-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .quick-cheer-btn {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quick-cheer-btn:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  .cheer-leaderboard {
    padding: 16px;
  }

  .cheer-leaderboard h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-primary);
  }

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .leader-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-primary);
    border-radius: 6px;
    border: 1px solid var(--border-color);
  }

  .rank {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .leader-name {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
  }

  .leader-item .cheer-count {
    font-size: 12px;
    font-weight: 600;
    color: var(--primary-color);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* Scrollbar styling */
  .cheer-panel::-webkit-scrollbar {
    width: 4px;
  }

  .cheer-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .cheer-panel::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  .cheer-panel::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
</style>