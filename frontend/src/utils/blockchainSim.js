import sha256 from 'crypto-js/sha256'

export function makeTxHash(payload) {
  return sha256(JSON.stringify(payload)).toString()
}

export function verifyTx(payload, hash) {
  return makeTxHash(payload) === hash
}
