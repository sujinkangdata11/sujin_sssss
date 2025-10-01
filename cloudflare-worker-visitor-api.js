// 🔢 VIDHUNT 방문자 통계 API - Cloudflare Workers 스크립트
// 계정 ID: fc1814f8a93d6c57f82d5fcec656baab
// Worker 이름: vidhunt-visitor-api

// KV Namespace: VISITOR_STATS (Workers 설정에서 바인딩 필요)

// 🌏 CORS 헤더
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// 📅 KST 날짜 키 생성
function getKstDateKey() {
  const now = new Date();
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstMillis = utcMillis + 9 * 60 * 60000; // UTC+9
  return new Date(kstMillis).toISOString().split('T')[0];
}

// 🔢 숫자 포맷팅
function formatNumber(num) {
  return Number.isFinite(num) ? num : 0;
}

// 📊 현재 방문자 통계 조회
async function getVisitorStats(kv) {
  try {
    const today = getKstDateKey();

    // KV에서 데이터 읽기 (병렬 처리)
    const [totalVisitsStr, dailyStatsStr] = await Promise.all([
      kv.get('total_visits'),
      kv.get(`daily_${today}`)
    ]);

    const totalVisits = formatNumber(parseInt(totalVisitsStr) || 0);
    const dailyVisits = formatNumber(parseInt(dailyStatsStr) || 0);

    return {
      success: true,
      data: {
        totalVisits,
        dailyVisits,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('방문자 통계 조회 오류:', error);
    return {
      success: false,
      error: '통계 조회 중 오류가 발생했습니다.'
    };
  }
}

// ✅ 방문 기록 (증가)
async function recordVisit(kv) {
  try {
    const today = getKstDateKey();

    // 현재 값들 조회 (병렬 처리)
    const [totalVisitsStr, dailyStatsStr] = await Promise.all([
      kv.get('total_visits'),
      kv.get(`daily_${today}`)
    ]);

    const currentTotal = formatNumber(parseInt(totalVisitsStr) || 0);
    const currentDaily = formatNumber(parseInt(dailyStatsStr) || 0);

    const newTotal = currentTotal + 1;
    const newDaily = currentDaily + 1;

    // KV에 업데이트 (병렬 처리)
    await Promise.all([
      kv.put('total_visits', newTotal.toString()),
      kv.put(`daily_${today}`, newDaily.toString()),
      kv.put('last_updated', new Date().toISOString())
    ]);

    return {
      success: true,
      data: {
        totalVisits: newTotal,
        dailyVisits: newDaily,
        lastUpdated: new Date().toISOString()
      },
      message: '방문이 기록되었습니다.'
    };
  } catch (error) {
    console.error('방문 기록 오류:', error);
    return {
      success: false,
      error: '방문 기록 중 오류가 발생했습니다.'
    };
  }
}

// 🧹 과거 일일 데이터 정리 (옵션)
async function cleanupOldDailyStats(kv) {
  try {
    const today = getKstDateKey();
    const todayDate = new Date(today);

    // 7일 이전 데이터만 삭제 (리소스 절약)
    const deletePromises = [];
    for (let i = 7; i <= 30; i++) {
      const pastDate = new Date(todayDate);
      pastDate.setDate(pastDate.getDate() - i);
      const pastDateKey = pastDate.toISOString().split('T')[0];
      deletePromises.push(kv.delete(`daily_${pastDateKey}`));
    }

    await Promise.all(deletePromises);
    console.log('과거 일일 통계 정리 완료');
  } catch (error) {
    console.error('정리 작업 오류:', error);
  }
}

// 🌐 메인 요청 핸들러
export default {
  async fetch(request, env, ctx) {
    // KV 바인딩 설정
    if (!env.VISITOR_STATS) {
      return new Response('KV namespace not configured', {
        status: 500,
        headers: CORS_HEADERS
      });
    }
    // env에서 직접 VISITOR_STATS 사용

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // OPTIONS 요청 처리 (CORS preflight)
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    try {
      // 🏥 헬스체크
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'VIDHUNT Visitor API'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        });
      }

      // 📊 방문자 통계 조회 (GET /api/stats)
      if (path === '/api/stats' && method === 'GET') {
        const result = await getVisitorStats(env.VISITOR_STATS);
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        });
      }

      // ✅ 방문 기록 (POST /api/visit)
      if (path === '/api/visit' && method === 'POST') {
        const result = await recordVisit(env.VISITOR_STATS);

        // 백그라운드에서 정리 작업 (응답 지연 없이)
        ctx.waitUntil(cleanupOldDailyStats(env.VISITOR_STATS));

        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        });
      }

      // 🔧 관리자용 초기화 (POST /api/admin/reset) - 개발용
      if (path === '/api/admin/reset' && method === 'POST') {
        await Promise.all([
          env.VISITOR_STATS.put('total_visits', '0'),
          env.VISITOR_STATS.put(`daily_${getKstDateKey()}`, '0')
        ]);

        return new Response(JSON.stringify({
          success: true,
          message: '통계가 초기화되었습니다.'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        });
      }

      // ❓ 404 - 지원하지 않는 엔드포인트
      return new Response(JSON.stringify({
        success: false,
        error: 'Not Found',
        availableEndpoints: [
          'GET /health',
          'GET /api/stats',
          'POST /api/visit',
          'POST /api/admin/reset'
        ]
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });

    } catch (error) {
      console.error('Worker 오류:', error);
      return new Response(JSON.stringify({
        success: false,
        error: '서버 내부 오류가 발생했습니다.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    }
  }
};