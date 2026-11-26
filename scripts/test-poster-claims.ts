import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

// Runs only against the disposable CI PostgreSQL service, never Neon.
const url = "postgresql://poster:poster@127.0.0.1:5432/poster_test";
const sql = (query: string) => execFileSync("psql",[url,"-X","-v","ON_ERROR_STOP=1","-Atq","-c",query],{encoding:"utf8"}).trim();
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
async function main() {
  sql("CREATE TABLE poster_orders (stripe_session_id text PRIMARY KEY, status text NOT NULL, prodigi_order_id text UNIQUE, updated_at timestamptz DEFAULT now()); INSERT INTO poster_orders VALUES ('cs_test_race','paid',NULL,now());");
  const claim = "UPDATE poster_orders SET status='submitting', updated_at=now() WHERE stripe_session_id='cs_test_race' AND status='paid' AND prodigi_order_id IS NULL RETURNING stripe_session_id";
  const results = await Promise.all(Array.from({length:12},()=>run("psql",[url,"-X","-v","ON_ERROR_STOP=1","-Atq","-c",claim])));
  assert.equal(results.filter(r=>r.stdout.trim()==="cs_test_race").length,1);
  // Simulate process death after claiming: a later delivery must not reclaim.
  assert.equal(sql(claim),"");
  assert.equal(sql("SELECT status FROM poster_orders"),"submitting");
  sql("UPDATE poster_orders SET prodigi_order_id='verified-provider-id',status='submitted' WHERE stripe_session_id='cs_test_race' AND status='submitting' AND prodigi_order_id IS NULL");
  assert.equal(sql(claim),"");
  assert.equal(sql("SELECT status FROM poster_orders"),"submitted");
  console.log("PostgreSQL concurrent claim and interrupted submission checks passed");
}
main().catch(e=>{console.error(e);process.exitCode=1;});
