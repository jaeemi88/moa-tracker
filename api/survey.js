// 학생이 QR로 접속해 제출하는 익명 만족도 설문 응답을 저장(POST)/집계 조회(GET)하는 함수입니다.
// 로그인이 필요 없으며, t(강사 코드)+p(프로그램 id)로 어느 프로그램의 설문인지 구분합니다.

import Redis from 'ioredis';

let redis;
function getRedis() {
  if (!redis) redis = new Redis(process.env.REDIS_URL);
  return redis;
}
function safeTeacherId(raw) {
  return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '').slice(0, 40);
}

export default async function handler(req, res) {
  const client = getRedis();
  const t = safeTeacherId(req.query.t);
  const p = String(req.query.p || '').slice(0, 100);
  if (!t || !p) return res.status(400).json({ error: 't, p 파라미터가 모두 필요합니다.' });

  const indexKey = `tracker_survey_index:${t}:${p}`;

  if (req.method === 'POST') {
    const { satisfaction, attitude, helpfulness, comment } = req.body || {};
    if (!satisfaction || !attitude || !helpfulness) {
      return res.status(400).json({ error: '별점 응답이 모두 필요합니다.' });
    }
    try {
      const entry = JSON.stringify({
        satisfaction: Number(satisfaction),
        attitude: Number(attitude),
        helpfulness: Number(helpfulness),
        // 소감(수강생 소감문) — 최대 1000자까지 저장
        comment: String(comment || '').slice(0, 1000),
        submittedAt: new Date().toISOString()
      });
      await client.lpush(indexKey, entry);
      await client.ltrim(indexKey, 0, 999);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: '설문 저장 중 오류가 발생했습니다.' });
    }
  }

  if (req.method === 'GET') {
    if (req.query.list === '1') {
      try {
        const raw = await client.lrange(indexKey, 0, 999);
        const items = raw.map((r) => JSON.parse(r));
        return res.status(200).json({ items });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: '설문 결과 조회 중 오류가 발생했습니다.' });
      }
    }
    return res.status(400).json({ error: 'list=1 파라미터가 필요합니다.' });
  }

  return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
}
