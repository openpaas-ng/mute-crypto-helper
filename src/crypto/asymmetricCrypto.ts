// Licensed to Inria Grand-Est / Loria under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Inria Grand-Est / Loria licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { env } from '../misc/env'
import {
  defaultAsymmetricEncryptionParam,
  defaultAsymmetricSigningParam,
  defaultEncryptParams,
  defaultImportEncryptionParam,
  defaultImportSigningParam,
  defaultSigningParams,
} from './helper/asymmetricCryptoHelper'
import { defaultCryptoKeyDataFormat } from './helper/cryptoHelper'

/**
 * generateSigningKey generates a cryptoKeyPair with sane defaults to be used for signing purpose.
 *
 * @see {@link defaultAsymmetricSigningParam}
 */
export function generateSigningKeyPair(): Promise<CryptoKeyPair> {
  return env.crypto.subtle.generateKey(
    defaultAsymmetricSigningParam,
    true, // whether the key is extractable (i.e. can be used in exportKey)
    ['sign', 'verify']
  ) as Promise<CryptoKeyPair>
}

/**
 * generateSigningKey generates a cryptoKeyPair with sane defaults to be used for asymmetric encryption purpose.
 *
 * @see {@link defaultAsymmetricEncryptionParam}
 */
export function generateEncryptionKeyPair(): Promise<CryptoKeyPair> {
  return env.crypto.subtle.generateKey(
    defaultAsymmetricEncryptionParam,
    true, // whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt']
  ) as Promise<CryptoKeyPair>
}

/**
 * exportKey exports a CryptoKeyPair to an {@link ICryptoKeyPairData}.
 * The CryptoKeyPair should be the same as returned by {@link generateSigningKey} or {@link generateEncryptionKey}.
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return env.crypto.subtle.exportKey(defaultCryptoKeyDataFormat, key)
}

/**
 * importKey imports an ICryptoKeyPairData to a CryptoKeyPair.
 * The ICryptoKeyPairData should be the same as returned by {@link exportKey}.
 */
export async function importKey(key: JsonWebKey): Promise<CryptoKey> {
  const UndefinedKeyOpsError = new TypeError(`key_ops should not be undefined.\
    cryptoKeyPairData should be the same object as returned by exportKey ...`)

  if (key.key_ops) {
    let options: [any, string]
    if (key.key_ops.includes('verify')) {
      options = [defaultImportSigningParam, 'verify']
    } else if (key.key_ops.includes('encrypt')) {
      options = [defaultImportEncryptionParam, 'encrypt']
    } else if (key.key_ops.includes('sign')) {
      options = [defaultImportSigningParam, 'sign']
    } else if (key.key_ops.includes('decrypt')) {
      options = [defaultImportEncryptionParam, 'decrypt']
    } else {
      throw UndefinedKeyOpsError
    }
    return env.crypto.subtle.importKey(defaultCryptoKeyDataFormat, key, options[0], true, [options[1]])
  } else {
    throw UndefinedKeyOpsError
  }
}

/**
 * sign returns the signature of the given plaintext
 *
 * @param signingPrivateKey The private key used to sign.
 */
export async function sign(plaintext: Uint8Array, signingPrivateKey: CryptoKey): Promise<Uint8Array> {
  const signature = await env.crypto.subtle.sign(defaultSigningParams, signingPrivateKey, plaintext)
  return new Uint8Array(signature)
}

/**
 * verifySignature verifies that the given signature and plaintext match.
 *
 * @param signingPublicKey THe public Key associated with the private key used to sign initially.
 */
export async function verifySignature(plaintext: Uint8Array, signature: Uint8Array, signingPublicKey: CryptoKey): Promise<boolean> {
  return env.crypto.subtle.verify(defaultSigningParams, signingPublicKey, signature, plaintext)
}

/**
 * encrypt returns the ciphertext of the given plaintext.
 *
 * @param encryptionPublicKey The public key used to encrypt.
 */
export async function encrypt(plaintext: Uint8Array, encryptionPublicKey: CryptoKey): Promise<Uint8Array> {
  const ciphertext = await env.crypto.subtle.encrypt(defaultEncryptParams, encryptionPublicKey, plaintext)
  return new Uint8Array(ciphertext)
}

/**
 * decrypt decrypts the given ciphertext.
 *
 * @param encryptionPrivateKey The private key associated to the public key used to encrypt.
 */
export async function decrypt(ciphertext: Uint8Array, encryptionPrivateKey: CryptoKey): Promise<Uint8Array> {
  const plaintext = await env.crypto.subtle.decrypt(defaultEncryptParams, encryptionPrivateKey, ciphertext)
  return new Uint8Array(plaintext)
}
