import { describe, expect, it } from 'vitest';
import { validateVrm } from '../src/vrm-file';

function glb(json: unknown) {
  const raw = new TextEncoder().encode(JSON.stringify(json));
  const length = Math.ceil(raw.length / 4) * 4;
  const buffer = new ArrayBuffer(20 + length);
  const view = new DataView(buffer);
  view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, buffer.byteLength, true);
  view.setUint32(12, length, true); view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(buffer, 20).fill(32); new Uint8Array(buffer, 20).set(raw);
  return buffer;
}

describe('local VRM boundary', () => {
  it('accepts embedded VRM 0 and 1 resources', () => {
    expect(validateVrm(glb({ extensions: { VRMC_vrm: {} }, images: [{ bufferView: 0 }] }))).toBeTruthy();
    expect(validateVrm(glb({ extensions: { VRM: {} }, buffers: [{ uri: 'data:application/octet-stream;base64,AA==' }] }))).toBeTruthy();
  });
  it('rejects external buffers and textures before the loader runs', () => {
    for (const uri of ['https://example.com/image.png', '/v1/config', '../image.png', 'file:///private']) {
      expect(() => validateVrm(glb({ extensions: { VRMC_vrm: {} }, images: [{ uri }] }))).toThrow('外部');
    }
  });
  it('rejects invalid containers and ordinary GLBs', () => {
    expect(() => validateVrm(new ArrayBuffer(3))).toThrow();
    expect(() => validateVrm(glb({ asset: { version: '2.0' } }))).toThrow('VRM');
    expect(() => validateVrm(glb(null))).toThrow('描述损坏');
    expect(() => validateVrm(glb({ extensions: { VRM: {} }, images: {} }))).toThrow('资源列表');
    const broken = glb({ extensions: { VRMC_vrm: {} } });
    new DataView(broken).setUint32(12, 9999999, true);
    expect(() => validateVrm(broken)).toThrow();
  });
});
