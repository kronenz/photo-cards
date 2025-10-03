<script lang="ts">
  import { onMount } from 'svelte'
  import { notificationService } from '$lib/services/notificationService'
  import type { NotificationSettings } from '$lib/types/notifications'

  export let userId: string

  let settings: NotificationSettings | null = null
  let loading = true
  let saving = false
  let error: string | null = null
  let successMessage: string | null = null

  onMount(async () => {
    await loadSettings()
  })

  async function loadSettings() {
    try {
      loading = true
      error = null
      settings = await notificationService.getNotificationSettings(userId)
    } catch (err) {
      error = '설정을 불러오는데 실패했습니다'
      console.error('❌ 알림 설정 로드 실패:', err)
    } finally {
      loading = false
    }
  }

  async function saveSettings() {
    if (!settings) return

    try {
      saving = true
      error = null
      successMessage = null

      await notificationService.updateNotificationSettings(userId, settings)
      successMessage = '설정이 저장되었습니다'
      
      // 성공 메시지 3초 후 자동 숨김
      setTimeout(() => {
        successMessage = null
      }, 3000)
    } catch (err) {
      error = '설정 저장에 실패했습니다'
      console.error('❌ 알림 설정 저장 실패:', err)
    } finally {
      saving = false
    }
  }

  function handleToggle(category: 'emailNotifications' | 'pushNotifications', type: string) {
    if (!settings) return
    
    settings[category] = {
      ...settings[category],
      [type]: !settings[category][type as keyof typeof settings[category]]
    }
    
    // 자동 저장
    saveSettings()
  }

  function handleFrequencyChange(frequency: 'immediate' | 'hourly' | 'daily' | 'weekly') {
    if (!settings) return
    
    settings.frequency = frequency
    saveSettings()
  }

  function handleQuietHoursToggle() {
    if (!settings) return
    
    settings.quietHours.enabled = !settings.quietHours.enabled
    saveSettings()
  }

  function handleQuietHoursChange(field: 'startTime' | 'endTime', value: string) {
    if (!settings) return
    
    settings.quietHours[field] = value
    saveSettings()
  }
</script>

<div class="notification-settings">
  <div class="settings-header">
    <h2>알림 설정</h2>
    <p>원하는 알림 방식을 선택하세요</p>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>설정을 불러오는 중...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>❌ {error}</p>
      <button on:click={loadSettings} class="retry-btn">다시 시도</button>
    </div>
  {:else if settings}
    <div class="settings-content">
      <!-- 성공 메시지 -->
      {#if successMessage}
        <div class="success-message">
          ✅ {successMessage}
        </div>
      {/if}

      <!-- 이메일 알림 설정 -->
      <div class="settings-section">
        <h3>📧 이메일 알림</h3>
        <p class="section-description">중요한 활동을 이메일로 받아보세요</p>
        
        <div class="setting-items">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">좋아요</span>
              <span class="setting-desc">카드에 좋아요가 달릴 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications.likes}
                on:change={() => handleToggle('emailNotifications', 'likes')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">댓글</span>
              <span class="setting-desc">카드에 댓글이 달릴 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications.comments}
                on:change={() => handleToggle('emailNotifications', 'comments')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">팔로우</span>
              <span class="setting-desc">새로운 팔로워가 생길 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications.follows}
                on:change={() => handleToggle('emailNotifications', 'follows')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">카드 추천</span>
              <span class="setting-desc">카드가 추천될 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications.cardFeatured}
                on:change={() => handleToggle('emailNotifications', 'cardFeatured')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">시스템 업데이트</span>
              <span class="setting-desc">중요한 공지사항</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications.systemUpdates}
                on:change={() => handleToggle('emailNotifications', 'systemUpdates')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">커뮤니티 이벤트</span>
              <span class="setting-desc">특별 이벤트 및 챌린지</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications.communityEvents}
                on:change={() => handleToggle('emailNotifications', 'communityEvents')}
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 푸시 알림 설정 -->
      <div class="settings-section">
        <h3>🔔 푸시 알림</h3>
        <p class="section-description">실시간으로 알림을 받아보세요</p>
        
        <div class="setting-items">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">좋아요</span>
              <span class="setting-desc">카드에 좋아요가 달릴 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications.likes}
                on:change={() => handleToggle('pushNotifications', 'likes')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">댓글</span>
              <span class="setting-desc">카드에 댓글이 달릴 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications.comments}
                on:change={() => handleToggle('pushNotifications', 'comments')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">팔로우</span>
              <span class="setting-desc">새로운 팔로워가 생길 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications.follows}
                on:change={() => handleToggle('pushNotifications', 'follows')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">카드 추천</span>
              <span class="setting-desc">카드가 추천될 때</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications.cardFeatured}
                on:change={() => handleToggle('pushNotifications', 'cardFeatured')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">시스템 업데이트</span>
              <span class="setting-desc">중요한 공지사항</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications.systemUpdates}
                on:change={() => handleToggle('pushNotifications', 'systemUpdates')}
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">커뮤니티 이벤트</span>
              <span class="setting-desc">특별 이벤트 및 챌린지</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications.communityEvents}
                on:change={() => handleToggle('pushNotifications', 'communityEvents')}
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 알림 빈도 설정 -->
      <div class="settings-section">
        <h3>⏰ 알림 빈도</h3>
        <p class="section-description">알림을 받을 빈도를 선택하세요</p>
        
        <div class="frequency-options">
          <label class="frequency-option">
            <input 
              type="radio" 
              name="frequency" 
              value="immediate"
              checked={settings.frequency === 'immediate'}
              on:change={() => handleFrequencyChange('immediate')}
            />
            <span class="radio-label">
              <strong>즉시</strong>
              <span>활동이 발생하면 바로 알림</span>
            </span>
          </label>

          <label class="frequency-option">
            <input 
              type="radio" 
              name="frequency" 
              value="hourly"
              checked={settings.frequency === 'hourly'}
              on:change={() => handleFrequencyChange('hourly')}
            />
            <span class="radio-label">
              <strong>매시간</strong>
              <span>1시간마다 모아서 알림</span>
            </span>
          </label>

          <label class="frequency-option">
            <input 
              type="radio" 
              name="frequency" 
              value="daily"
              checked={settings.frequency === 'daily'}
              on:change={() => handleFrequencyChange('daily')}
            />
            <span class="radio-label">
              <strong>매일</strong>
              <span>하루에 한 번 요약 알림</span>
            </span>
          </label>

          <label class="frequency-option">
            <input 
              type="radio" 
              name="frequency" 
              value="weekly"
              checked={settings.frequency === 'weekly'}
              on:change={() => handleFrequencyChange('weekly')}
            />
            <span class="radio-label">
              <strong>매주</strong>
              <span>일주일에 한 번 요약 알림</span>
            </span>
          </label>
        </div>
      </div>

      <!-- 방해 금지 시간 -->
      <div class="settings-section">
        <h3>🌙 방해 금지 시간</h3>
        <p class="section-description">특정 시간대에는 알림을 받지 않습니다</p>
        
        <div class="quiet-hours-setting">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">방해 금지 시간 사용</span>
              <span class="setting-desc">설정한 시간대에는 알림을 보내지 않습니다</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.quietHours.enabled}
                on:change={handleQuietHoursToggle}
              />
              <span class="slider"></span>
            </label>
          </div>

          {#if settings.quietHours.enabled}
            <div class="time-range-setting">
              <div class="time-input-group">
                <label>
                  <span>시작 시간</span>
                  <input 
                    type="time" 
                    value={settings.quietHours.startTime}
                    on:change={(e) => handleQuietHoursChange('startTime', e.target.value)}
                  />
                </label>
                
                <span class="time-separator">~</span>
                
                <label>
                  <span>종료 시간</span>
                  <input 
                    type="time" 
                    value={settings.quietHours.endTime}
                    on:change={(e) => handleQuietHoursChange('endTime', e.target.value)}
                  />
                </label>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .notification-settings {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  .settings-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .settings-header h2 {
    font-size: 28px;
    font-weight: 700;
    color: #1d1d1f;
    margin: 0 0 8px;
  }

  .settings-header p {
    font-size: 16px;
    color: #8e8e93;
    margin: 0;
  }

  .loading-state,
  .error-state {
    text-align: center;
    padding: 40px 20px;
    color: #8e8e93;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e5ea;
    border-top: 2px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .retry-btn {
    background: #007aff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 16px;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    border: 1px solid #c3e6cb;
  }

  .settings-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .settings-section h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 8px;
  }

  .section-description {
    font-size: 14px;
    color: #8e8e93;
    margin: 0 0 20px;
  }

  .setting-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
  }

  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .setting-label {
    font-size: 16px;
    font-weight: 500;
    color: #1d1d1f;
  }

  .setting-desc {
    font-size: 14px;
    color: #8e8e93;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 30px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 30px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #007aff;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }

  .frequency-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .frequency-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 2px solid #e5e5ea;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .frequency-option:hover {
    border-color: #007aff;
    background: rgba(0, 122, 255, 0.02);
  }

  .frequency-option input[type="radio"] {
    width: 20px;
    height: 20px;
    accent-color: #007aff;
  }

  .frequency-option input[type="radio"]:checked + .radio-label {
    color: #007aff;
  }

  .radio-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .radio-label strong {
    font-size: 16px;
    font-weight: 600;
  }

  .radio-label span {
    font-size: 14px;
    color: #8e8e93;
  }

  .quiet-hours-setting {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .time-range-setting {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .time-input-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .time-input-group label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    color: #1d1d1f;
  }

  .time-input-group input[type="time"] {
    padding: 8px 12px;
    border: 1px solid #d1d1d6;
    border-radius: 6px;
    font-size: 14px;
  }

  .time-separator {
    font-size: 18px;
    color: #8e8e93;
    margin-top: 20px;
  }

  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    .settings-header h2 {
      color: #f2f2f7;
    }

    .settings-section {
      background: #1c1c1e;
    }

    .settings-section h3 {
      color: #f2f2f7;
    }

    .setting-label {
      color: #f2f2f7;
    }

    .frequency-option {
      border-color: #38383a;
      background: #1c1c1e;
    }

    .frequency-option:hover {
      background: rgba(0, 122, 255, 0.1);
    }

    .time-range-setting {
      background: #2c2c2e;
    }

    .time-input-group label {
      color: #f2f2f7;
    }

    .time-input-group input[type="time"] {
      background: #1c1c1e;
      border-color: #38383a;
      color: #f2f2f7;
    }
  }

  /* 모바일 최적화 */
  @media (max-width: 480px) {
    .notification-settings {
      padding: 16px;
    }

    .settings-section {
      padding: 20px 16px;
    }

    .setting-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .toggle-switch {
      align-self: flex-end;
    }

    .time-input-group {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .time-separator {
      text-align: center;
      margin-top: 0;
    }
  }
</style>