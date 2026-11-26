import assert from "node:assert/strict";
import { buildProdigiRequest, createProdigiSubmit, orderKey, readProdigiStatus } from "../src/lib/prodigiOrders";

async function main() {
  process.env.VERCEL_ENV = "preview";
  process.env.PRODIGI_ENABLE_FULFILMENT = "true";
  process.env.PRODIGI_V5_API_KEY = "sandbox_mock";
  const order = {stripe_session_id:"cs_test_mock",poster_id:"greek-theogony",variant_id:"translucent",customer_email:"test@example.com",shipping_address:{name:"Test",address:{line1:"1 Test Road",city:"Dublin",country:"IE",postal_code:"TEST"}}};
  const artwork = "https://example.com/art.png";
  assert.equal(orderKey(order.stripe_session_id).length,64);
  assert.notEqual(orderKey(order.stripe_session_id),orderKey("cs_test_other"));
  assert.equal(buildProdigiRequest(order,artwork).items[0].sku,"GLOBAL-FAP-A2");
  assert.throws(()=>buildProdigiRequest({...order,variant_id:"unknown"},artwork));
  assert.throws(()=>buildProdigiRequest(order,"http://example.com/art.png"));
  const mock: typeof fetch = async (url,init) => {
    assert.equal(url,"https://api.prodigi.com/v5/orders");
    assert.equal(new Headers(init?.headers).get("Idempotency-Key"),orderKey(order.stripe_session_id));
    return Response.json({data:{id:"mock-order"}},{status:202});
  };
  assert.deepEqual(await createProdigiSubmit(artwork,mock)(order,order.stripe_session_id),{kind:"accepted",orderId:"mock-order"});
  for (const status of [429,500,503]) {
    assert.deepEqual(await createProdigiSubmit(artwork,async()=>new Response(null,{status}))(order,order.stripe_session_id),{kind:"uncertain"});
  }
  assert.deepEqual(await createProdigiSubmit(artwork,async()=>new Response(null,{status:400}))(order,order.stripe_session_id),{kind:"rejected"});
  assert.deepEqual(await createProdigiSubmit(artwork,async()=>{throw new Error("timeout")})(order,order.stripe_session_id),{kind:"uncertain"});
  assert.deepEqual(await createProdigiSubmit(artwork,async()=>Response.json({data:{}}))(order,order.stripe_session_id),{kind:"uncertain"});
  assert.equal(await readProdigiStatus("mock-order",async()=>Response.json({data:{id:"mock-order",status:"shipped"}})),"shipped");
  await assert.rejects(readProdigiStatus("mock-order",async()=>Response.json({data:{id:"other",status:"shipped"}})));
  process.env.PRODIGI_ENABLE_FULFILMENT = "false";
  await assert.rejects(createProdigiSubmit(artwork,mock)(order,order.stripe_session_id));
  console.log("Mock Prodigi contract checks passed");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
