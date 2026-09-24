function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function csvEscape(v){return `"${String(v??'').replaceAll('"','""')}"`}
async function ensureDb(env){if(!env.DB)throw new Error('D1_NOT_CONFIGURED');await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wishes (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))` ).run()}
async function listWishes(env,limit=200){await ensureDb(env);limit=Math.max(1,Math.min(Number(limit)||200,500));const {results}=await env.DB.prepare('SELECT id,message,created_at FROM wishes ORDER BY id DESC LIMIT ?').bind(limit).all();return results||[]}
export default {async fetch(request,env){const url=new URL(request.url);try{
  if(url.pathname==='/api/wishes'&&request.method==='GET'){return json({wishes:await listWishes(env,url.searchParams.get('limit'))})}
  if(url.pathname==='/api/wishes'&&request.method==='POST'){
    await ensureDb(env);let body;try{body=await request.json()}catch{return json({error:'JSON không hợp lệ'},400)}
    const message=String(body?.message??'').trim().normalize('NFC');if(!message||message.length>160)return json({error:'Ước nguyện phải từ 1 đến 160 ký tự'},400);
    const created_at=new Date().toISOString();const result=await env.DB.prepare('INSERT INTO wishes(message,created_at) VALUES(?,?)').bind(message,created_at).run();return json({ok:true,wish:{id:result.meta?.last_row_id,message,created_at}},201)
  }
  if(url.pathname==='/api/wishes.csv'&&request.method==='GET'){
    const rows=await listWishes(env,500);const lines=['STT,Thời gian,Ước nguyện',...rows.map((w,i)=>[i+1,w.created_at,w.message].map(csvEscape).join(','))];
    return new Response('\uFEFF'+lines.join('\r\n'),{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="uoc-nguyen-trung-thu.csv"','cache-control':'no-store'}})
  }
}catch(e){if(String(e?.message).includes('D1_NOT_CONFIGURED'))return json({error:'D1 chưa được cấu hình'},503);return json({error:'Lỗi máy chủ'},500)}
  return env.ASSETS.fetch(request)
}}
