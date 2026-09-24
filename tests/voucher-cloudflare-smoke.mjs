const site=(process.env.SITE_URL||'').replace(/\/$/,'');
const key=process.env.VOUCHER_TEST_KEY||'';
const phone=process.env.TEST_PHONE||'';
const name=process.env.TEST_NAME||'Voucher Smoke Test';
if(!site){console.error('❌ Thiếu SITE_URL');process.exit(1)}
if(!key){console.error('❌ Thiếu VOUCHER_TEST_KEY');process.exit(1)}

function cookieOnly(raw=''){return raw.split(';')[0]||''}
console.log('1/3 Gọi API ép trúng voucher...');
const draw=await fetch(site+'/api/fortune/guest-draw',{
  method:'POST',
  headers:{'x-voucher-test-key':key},
  redirect:'manual'
});
const drawData=await draw.json().catch(()=>({}));
if(!draw.ok){console.error('❌ Draw failed',draw.status,drawData);process.exit(1)}
if(!drawData.lucky||!drawData.test_mode||!drawData.claim_token){console.error('❌ Không nhận được voucher test hợp lệ',drawData);process.exit(1)}
console.log('✅ Forced voucher OK:',drawData.claim_token.slice(0,18)+'...');
const cookie=cookieOnly(draw.headers.get('set-cookie')||'');
if(!cookie){console.error('❌ Không nhận được device cookie');process.exit(1)}
console.log('2/3 Device cookie OK');

if(phone){
  console.log('3/3 Kiểm tra lưu callback lead...');
  const lead=await fetch(site+'/api/voucher-leads',{
    method:'POST',
    headers:{'content-type':'application/json','cookie':cookie},
    body:JSON.stringify({claim_token:drawData.claim_token,customer_name:name,phone,consent:true})
  });
  const leadData=await lead.json().catch(()=>({}));
  if(!lead.ok||!leadData.ok){console.error('❌ Lead failed',lead.status,leadData);process.exit(1)}
  console.log('✅ Voucher lead saved successfully');
}else{
  console.log('3/3 Bỏ qua test lead vì chưa đặt TEST_PHONE');
}
console.log('\n🎉 VOUCHER SMOKE TEST PASSED');
