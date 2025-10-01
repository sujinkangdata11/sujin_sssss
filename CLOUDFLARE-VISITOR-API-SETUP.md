# 🔢 VIDHUNT 방문자 통계 API 설정 가이드

Cloudflare Workers를 사용하여 방문자 통계를 서버에서 관리하는 방법입니다.

## 📋 필요한 작업

### 1. Cloudflare KV Namespace 생성

1. Cloudflare 대시보드에 로그인
2. **Workers & Pages** > **KV** 섹션으로 이동
3. **Create a namespace** 클릭
4. Namespace 이름: `vidhunt-visitor-stats` 입력
5. 생성 후 **ID를 복사**해두기

### 2. wrangler.toml 설정

```bash
# wrangler.toml 파일에서 YOUR_KV_NAMESPACE_ID 부분을 실제 ID로 교체
[[kv_namespaces]]
binding = "VISITOR_STATS"
id = "복사한_KV_네임스페이스_ID"  # <- 여기에 입력
```

### 3. Cloudflare Workers 배포

```bash
# Wrangler CLI 설치 (아직 안했다면)
npm install -g wrangler

# Cloudflare 계정 인증
wrangler auth login

# Workers 배포
wrangler deploy
```

### 4. 배포 확인

Workers가 배포되면 다음 URL에서 테스트:

- **Health Check**: `https://vidhunt-visitor-api.fc1814f8a93d6c57f82d5fcec656baab.workers.dev/health`
- **통계 조회**: `https://vidhunt-visitor-api.fc1814f8a93d6c57f82d5fcec656baab.workers.dev/api/stats`

## 🔧 API 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/health` | 서비스 상태 확인 |
| GET | `/api/stats` | 현재 방문자 통계 조회 |
| POST | `/api/visit` | 방문 기록 (자동으로 카운트 증가) |
| POST | `/api/admin/reset` | 통계 초기화 (개발용) |

## 📊 데이터 구조

```json
{
  "success": true,
  "data": {
    "totalVisits": 12345,
    "dailyVisits": 89,
    "lastUpdated": "2025-01-15T10:30:00.000Z"
  }
}
```

## 🔄 자동 fallback

API가 실패하면 자동으로 localStorage fallback 사용:
- 브라우저별 독립적인 카운터 유지
- 네트워크 오류 시에도 기본 기능 동작

## 🧹 자동 정리

- 7일 이상 된 일일 통계는 자동 삭제
- KV 스토리지 용량 절약
- 성능 최적화

## ⚡ 성능 특징

- **빠른 응답**: 전 세계 CDN 엣지에서 실행
- **무료 한도**: 월 100,000 요청까지 무료
- **자동 스케일링**: 트래픽 증가에 자동 대응
- **CORS 지원**: 모든 도메인에서 접근 가능

## 🔐 보안

- 읽기/쓰기 분리된 엔드포인트
- 관리자 기능은 별도 엔드포인트
- Rate limiting은 Cloudflare에서 자동 처리