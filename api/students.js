// 개인관리(수강생별) 레코드를 저장/조회/삭제하는 함수입니다.
// 강사별로 데이터가 섞이지 않도록 t(강사 코드)로 키를 구분합니다.

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
  if (!t) return res.status(400).json({ error: 't(강사 코드) 파라미터가 필요합니다.' });

  const indexKey = `tracker_students_index:${t}`;
  const itemKey = (id) => `tracker_student:${t}:${id}`;

  if (req.method === 'GET') {
    const { id, list } = req.query;
    if (list === '1') {
      try {
        const hash = await client.hgetall(indexKey);
        const items = Object.values(hash).map((v) => JSON.parse(v));
        return res.status(200).json({ items });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: '목록 조회 중 오류가 발생했습니다.' });
      }
    }
    if (!id) return res.status(400).json({ error: 'id가 필요합니다.' });
    try {
      const value = await client.get(itemKey(id));
      if (!value) return res.status(404).json({ error: '수강생을 찾을 수 없습니다.' });
      return res.status(200).json({ record: JSON.parse(value) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: '조회 중 오류가 발생했습니다.' });
    }
  }

  if (req.method === 'POST') {
    const record = req.body;
    if (!record || !record.id || !record.name) {
      return res.status(400).json({ error: '저장할 데이터가 올바르지 않습니다.' });
    }
    try {
      await client.set(itemKey(record.id), JSON.stringify(record));
      // 목록 화면에서 쓰는 요약 정보만 인덱스에 저장 (전체 상담이력은 개별 키에만)
      const summary = JSON.stringify({
        id: record.id, name: record.name, org: record.org, program: record.program,
        status: record.status, nextCheckDate: record.nextCheckDate, careFlag: record.careFlag,
        email: record.email || ''
      });
      await client.hset(indexKey, record.id, summary);
      return res.status(200).json({ ok: true, id: record.id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: '저장 중 오류가 발생했습니다.' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id가 필요합니다.' });
    try {
      await client.del(itemKey(id));
      await client.hdel(indexKey, id);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
    }
  }

  return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
}
