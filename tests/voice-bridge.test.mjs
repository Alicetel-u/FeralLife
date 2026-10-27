import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';
import {encryptRequest,decryptIssue} from '../tools/voice-bridge.mjs';
const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
const payload={requestId:'voice-test-123',maxCredits:500,report:{application:'kemono-voice-review',schema:2,records:[]},corrections:[]};
test('issue body is encrypted and decrypts',()=>{const encrypted=encryptRequest(payload,publicKey);assert.ok(!encrypted.includes('kemono-voice-review'));assert.deepEqual(decryptIssue(encrypted,privateKey),payload);});
test('modified ciphertext is rejected',()=>{const encrypted=encryptRequest(payload,publicKey);const [prefix,data]=encrypted.split('\n');const o=JSON.parse(data);o.tag=o.tag.replace(/^./,o.tag[0]==='A'?'B':'A');assert.throws(()=>decryptIssue(prefix+'\n'+JSON.stringify(o),privateKey));});
test('invalid requests are rejected',()=>assert.throws(()=>encryptRequest({...payload,requestId:'bad'},publicKey)));
