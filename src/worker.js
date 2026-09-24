const DEVICE_COOKIE='__Host-nguyet_device';
const DEVICE_MAX_AGE=60*60*24*365;

function responseHeaders(extra={}){return {'cache-control':'no-store',...extra}}
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:responseHeaders({'content-type':'application/json; charset=utf-8',...extra})})}
function csvEscape(v){return `"${String(v??'').replaceAll('"','""')}"`}
function parseCookies(request){const raw=request.headers.get('cookie')||'';const out={};for(const part of raw.split(';')){const i=part.indexOf('=');if(i<0)continue;const k=part.slice(0,i).trim(),v=part.slice(i+1).trim();if(k)out[k]=decodeURIComponent(v)}return out}
function newDeviceToken(){return crypto.randomUUID()+'-'+crypto.randomUUID()}
function cookieValue(token){return `${DEVICE_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${DEVICE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`}
async function sha256(text){const data=new TextEncoder().encode(text);const digest=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function deviceContext(request){const cookies=parseCookies(request);let token=cookies[DEVICE_COOKIE];let setCookie=null;if(!token){token=newDeviceToken();setCookie=cookieValue(token)}return{deviceHash:await sha256(token),setCookie}}
function withDeviceCookie(ctx,headers={}){return ctx.setCookie?{...headers,'set-cookie':ctx.setCookie}:headers}

async function ensureDb(env){
  if(!env.DB)throw new Error('D1_NOT_CONFIGURED');
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_hash TEXT NOT NULL DEFAULT 'legacy',
    sender_name TEXT NOT NULL DEFAULT 'Ẩn danh',
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`).run();
  const info=await env.DB.prepare('PRAGMA table_info(wishes)').all();
  const columns=new Set((info.results||[]).map(c=>c.name));
  if(!columns.has('sender_name')){
    try{await env.DB.prepare(`ALTER TABLE wishes ADD COLUMN sender_name TEXT NOT NULL DEFAULT 'Ẩn danh'`).run()}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e}
  }
  if(!columns.has('device_hash')){
    try{await env.DB.prepare(`ALTER TABLE wishes ADD COLUMN device_hash TEXT NOT NULL DEFAULT 'legacy'`).run()}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e}
  }
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wishes_device_hash ON wishes(device_hash, id DESC)').run();
}
async function listMine(env,deviceHash,limit=200){await ensureDb(env);limit=Math.max(1,Math.min(Number(limit)||200,500));const {results}=await env.DB.prepare('SELECT id,sender_name,message,created_at FROM wishes WHERE device_hash=? ORDER BY id DESC LIMIT ?').bind(deviceHash,limit).all();return results||[]}
async function countAll(env){await ensureDb(env);const row=await env.DB.prepare('SELECT COUNT(*) AS total FROM wishes').first();return Number(row?.total||0)}

export default {async fetch(request,env){const url=new URL(request.url);try{
  if(url.pathname==='/api/wishes/mine'&&request.method==='GET'){
    const ctx=await deviceContext(request);return json({wishes:await listMine(env,ctx.deviceHash,url.searchParams.get('limit'))},200,withDeviceCookie(ctx));
  }
  if(url.pathname==='/api/wishes/count'&&request.method==='GET'){
    const ctx=await deviceContext(request);return json({count:await countAll(env)},200,withDeviceCookie(ctx));
  }
  if(url.pathname==='/api/wishes'&&request.method==='POST'){
    await ensureDb(env);const ctx=await deviceContext(request);let body;try{body=await request.json()}catch{return json({error:'JSON không hợp lệ'},400,withDeviceCookie(ctx))}
    const sender_name=String(body?.sender_name??body?.senderName??'').trim().normalize('NFC')||'Ẩn danh';
    const message=String(body?.message??'').trim().normalize('NFC');
    if(sender_name.length>60)return json({error:'Tên người gửi / thiết bị tối đa 60 ký tự'},400,withDeviceCookie(ctx));
    if(!message||message.length>160)return json({error:'Ước nguyện phải từ 1 đến 160 ký tự'},400,withDeviceCookie(ctx));
    const created_at=new Date().toISOString();
    const result=await env.DB.prepare('INSERT INTO wishes(device_hash,sender_name,message,created_at) VALUES(?,?,?,?)').bind(ctx.deviceHash,sender_name,message,created_at).run();
    return json({ok:true,wish:{id:result.meta?.last_row_id,sender_name,message,created_at}},201,withDeviceCookie(ctx));
  }
  if(url.pathname==='/api/wishes/mine.csv'&&request.method==='GET'){
    const ctx=await deviceContext(request);const rows=await listMine(env,ctx.deviceHash,500);const lines=['STT,Thời gian,Tên / thiết bị,Ước nguyện',...rows.map((w,i)=>[i+1,w.created_at,w.sender_name||'Ẩn danh',w.message].map(csvEscape).join(','))];
    return new Response('\uFEFF'+lines.join('\r\n'),{headers:responseHeaders(withDeviceCookie(ctx,{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="uoc-nguyen-cua-toi.csv"'}))})
  }
  // Privacy: never expose the complete shared wish list publicly.
  if((url.pathname==='/api/wishes'||url.pathname==='/api/wishes.csv')&&request.method==='GET')return json({error:'Danh sách ước nguyện chung không công khai'},403);
}catch(e){if(String(e?.message).includes('D1_NOT_CONFIGURED'))return json({error:'D1 chưa được cấu hình'},503);return json({error:'Lỗi máy chủ'},500)}
  return env.ASSETS.fetch(request)
}}
