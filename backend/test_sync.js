require('dotenv').config();
const supabase = require('./src/db/supabaseClient');
const { ethers } = require('ethers');
const fs = require('fs');

async function testSync() {
  try {
    const wallet = '0xeb39514933728A6f2Eb67C7DB9944AcdA6caDFA0';
    const { error } = await supabase.from('contractors').upsert({
      wallet_address: ethers.getAddress(wallet),
      reputation_score: 99,
      total_projects: 8,
      completed_projects: 2,
      on_time_milestones: 6
    }, { onConflict: 'wallet_address' });

    if (error) {
      console.error('SYNC ERROR:', error);
      fs.writeFileSync('sync_res.json', JSON.stringify({ error }, null, 2));
    } else {
      console.log('SYNC SUCCESS');
      fs.writeFileSync('sync_res.json', JSON.stringify({ ok: true }, null, 2));
    }
  } catch (e) {
    console.error('EXCEPTION:', e);
    fs.writeFileSync('sync_res.json', JSON.stringify({ exception: e.message }, null, 2));
  }
}
testSync();
