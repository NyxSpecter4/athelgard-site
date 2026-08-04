import { generateKeyPair, SignJWT, jwtVerify, exportJWK, importJWK } from 'jose'
import { randomUUID } from 'crypto'

// Open Badges 3.0 + W3C Verifiable Credentials v2 Implementation
// Rebuilt from Certo architecture patterns with MIT license

export interface Achievement {
  id: string
  name: string
  description: string
  image: string
  criteria: { narrative: string }
  alignments?: Array<{
    targetName: string
    targetUrl: string
    targetDescription?: string
  }>
  skills?: Array<{
    id: string
    name: string
    description?: string
  }>
}

export interface Profile {
  id: string
  name: string
  email: string
  profileType: 'Issuer' | 'Recipient' | 'Both'
  did?: string
  publicKeys?: JsonWebKey[]
}

export interface Credential {
  '@context': string[]
  id: string
  type: string[]
  issuer: {
    id: string
    type: string[]
    name: string
  }
  issuanceDate: string
  validFrom?: string
  expirationDate?: string
  credentialSubject: {
    id: string
    achievement: Achievement
  }
  proof?: {
    type: string
    created: string
    verificationMethod: string
    proofPurpose: string
    jws: string
  }
}

export interface EncryptedKey {
  profileId: string
  encryptedPrivateKey: string // AES-256-GCM encrypted
  publicKeyJwk: JsonWebKey
}

// In-memory store (replace with database in production)
const keyStore: Map<string, EncryptedKey> = new Map()
const credentialStore: Map<string, Credential> = new Map()
const achievementStore: Map<string, Achievement> = new Map()

export class CredentialSigner {
  private encryptionKey: Uint8Array

  constructor(encryptionKey: string) {
    // Derive 256-bit key from passphrase
    this.encryptionKey = new TextEncoder().encode(encryptionKey.padEnd(32, '0').slice(0, 32))
  }

  /**
   * Get or create Ed25519 keypair for an issuer
   * Private keys are encrypted at rest with AES-256-GCM
   */
  async getOrCreateKeyPair(profileId: string): Promise<CryptoKeyPair> {
    const existing = keyStore.get(profileId)
    if (existing) {
      const privateKey = await this.decryptKey(existing.encryptedPrivateKey)
      const publicKey = await importJWK(existing.publicKeyJwk, 'EdDSA') as CryptoKey
      return { privateKey, publicKey }
    }

    // Generate new Ed25519 keypair
    const keyPair = await generateKeyPair('EdDSA', { crv: 'Ed25519', extractable: true })
    
    // Export keys
    const privateJwk = await exportJWK(keyPair.privateKey)
    const publicJwk = await exportJWK(keyPair.publicKey)
    
    // Encrypt private key
    const encryptedPrivateKey = await this.encryptKey(JSON.stringify(privateJwk))
    
    // Store encrypted key (NO API access in production)
    keyStore.set(profileId, {
      profileId,
      encryptedPrivateKey,
      publicKeyJwk: publicJwk
    })

    return keyPair
  }

  /**
   * Issue a new Open Badge credential
   */
  async issue(achievement: Achievement, recipient: Profile, issuer: Profile): Promise<Credential> {
    const keyPair = await this.getOrCreateKeyPair(issuer.id)
    const credentialId = `urn:uuid:${randomUUID()}`
    const now = new Date().toISOString()

    const payload = {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
        'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'
      ],
      id: credentialId,
      type: ['VerifiableCredential', 'OpenBadgeCredential'],
      issuer: {
        id: issuer.did || `did:web:athelgard.io#${issuer.id}`,
        type: ['Profile'],
        name: issuer.name
      },
      issuanceDate: now,
      credentialSubject: {
        id: `mailto:${recipient.email}`,
        achievement
      }
    }

    // Sign with Ed25519
    const jws = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'EdDSA', b64: false, crit: ['b64'] })
      .setIssuedAt()
      .setIssuer(issuer.did || `did:web:athelgard.io#${issuer.id}`)
      .setSubject(`mailto:${recipient.email}`)
      .sign(keyPair.privateKey)

    const credential: Credential = {
      ...payload,
      proof: {
        type: 'Ed25519Signature2020',
        created: now,
        verificationMethod: `${issuer.did || `did:web:athelgard.io#${issuer.id}`}#key-1`,
        proofPurpose: 'assertionMethod',
        jws
      }
    }

    // Store credential
    credentialStore.set(credentialId, credential)

    return credential
  }

  /**
   * Verify a credential's cryptographic signature
   */
  async verify(credential: Credential): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Check expiration
      if (credential.expirationDate && new Date(credential.expirationDate) < new Date()) {
        return { valid: false, reason: 'expired' }
      }

      // Verify proof exists
      if (!credential.proof?.jws) {
        return { valid: false, reason: 'no_proof' }
      }

      // Get issuer's public key
      const issuerId = credential.issuer.id
      const keyData = Array.from(keyStore.values()).find(k => {
        const did = `did:web:athelgard.io#${k.profileId}`
        return did === issuerId || k.profileId === issuerId
      })

      if (!keyData) {
        return { valid: false, reason: 'issuer_not_found' }
      }

      const publicKey = await importJWK(keyData.publicKeyJwk, 'EdDSA') as CryptoKey

      // Verify JWS
      await jwtVerify(credential.proof.jws, publicKey)

      return { valid: true }
    } catch (error) {
      return { valid: false, reason: 'signature_mismatch' }
    }
  }

  /**
   * Encrypt a key using AES-256-GCM
   */
  private async encryptKey(plainText: string): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plainText)
    
    const key = await crypto.subtle.importKey(
      'raw',
      this.encryptionKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    )

    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)

    return btoa(String.fromCharCode(...combined))
  }

  /**
   * Decrypt a key using AES-256-GCM
   */
  private async decryptKey(encryptedData: string): Promise<CryptoKey> {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    const key = await crypto.subtle.importKey(
      'raw',
      this.encryptionKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )

    const jwk = JSON.parse(new TextDecoder().decode(decrypted))
    return importJWK(jwk, 'EdDSA') as Promise<CryptoKey>
  }
}

// Predefined Athelgard achievements
export const ATHELGARD_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'athelgard-rookie',
    name: 'Athelgard Rookie',
    description: 'Completed foundational training in ethical security research and responsible disclosure.',
    image: 'https://athelgard.io/badges/rookie.png',
    criteria: { narrative: 'Pass all Rookie-tier modules with 80% or higher accuracy.' },
    skills: [
      { id: 'recon-basics', name: 'Basic Reconnaissance' },
      { id: 'ethical-framework', name: 'Ethical Hacking Framework' },
      { id: 'legal-basics', name: 'Legal & Compliance Basics' }
    ]
  },
  {
    id: 'athelgard-scout',
    name: 'Athelgard Scout',
    description: 'Demonstrated intermediate vulnerability assessment skills and tool proficiency.',
    image: 'https://athelgard.io/badges/scout.png',
    criteria: { narrative: 'Pass Scout-tier assessment including live lab exercises.' },
    skills: [
      { id: 'xss-mastery', name: 'XSS Exploitation & Mitigation' },
      { id: 'sqli-mastery', name: 'SQL Injection Techniques' },
      { id: 'owasp-top10', name: 'OWASP Top 10 Mastery' }
    ]
  },
  {
    id: 'athelgard-hunter',
    name: 'Athelgard Hunter',
    description: 'Successfully completed advanced exploitation training and participated in live bounty programs.',
    image: 'https://athelgard.io/badges/hunter.png',
    criteria: { narrative: 'Submit 3 valid vulnerability reports to approved bug bounty programs.' },
    skills: [
      { id: 'rce-advanced', name: 'Remote Code Execution' },
      { id: 'auth-bypass', name: 'Authentication Bypass' },
      { id: 'bug-bounty-live', name: 'Live Bounty Participation' }
    ]
  },
  {
    id: 'athelgard-elite',
    name: 'Athelgard Elite',
    description: 'Recognized leader in ethical security research. Mentors others and shapes platform evolution.',
    image: 'https://athelgard.io/badges/elite.png',
    criteria: { narrative: 'Demonstrate mastery across all domains and mentor 5+ Rookie hunters to Scout tier.' },
    skills: [
      { id: 'zero-day-research', name: 'Zero-Day Research' },
      { id: 'team-leadership', name: 'Team Leadership' },
      { id: 'platform-design', name: 'Platform Design' }
    ]
  }
]

// XP/Level system (from OmniRoute polynomial curve)
export function xpForLevel(level: number): number {
  const base = 100
  const exponent = 1.5
  const linear = 50
  return Math.floor(base * Math.pow(level, exponent) + linear * level)
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp && level < 100) {
    level++
  }
  return level
}
