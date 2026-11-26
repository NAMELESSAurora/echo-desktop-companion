export const MAX_VRM_BYTES = 64 * 1024 * 1024;

// Validate the GLB before the loader gets a chance to resolve external resources.
// This keeps local avatar import local: no URLs, sidecar textures or remote buffers.
export function validateVrm(data: ArrayBuffer): Record<string, unknown> {
  if (data.byteLength > MAX_VRM_BYTES) throw new Error('模型超过 64 MB，请使用较小的 VRM。');
  if (data.byteLength < 20) throw new Error('这不是有效的 VRM 文件。');
  const view = new DataView(data);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2
      || view.getUint32(8, true) !== data.byteLength) throw new Error('VRM 文件头不完整。');
  const length = view.getUint32(12, true);
  if (view.getUint32(16, true) !== 0x4e4f534a || length > data.byteLength - 20 || length > 16 * 1024 * 1024) {
    throw new Error('无法读取 VRM 模型描述。');
  }
  let document;
  try { document = JSON.parse(new TextDecoder().decode(new Uint8Array(data, 20, length))); }
  catch { throw new Error('VRM 模型描述损坏。'); }
  if (!document || typeof document !== 'object' || Array.isArray(document)) throw new Error('VRM 模型描述损坏。');
  if (!document.extensions?.VRMC_vrm && !document.extensions?.VRM) throw new Error('请选择 VRM 0.x 或 1.0 模型。');
  for (const key of ['buffers', 'images', 'nodes']) {
    if (document[key] !== undefined && !Array.isArray(document[key])) throw new Error('VRM 资源列表格式错误。');
  }
  for (const resource of [...(document.buffers ?? []), ...(document.images ?? [])]) {
    if (!resource || typeof resource !== 'object') throw new Error('VRM 资源格式错误。');
    if (resource.uri !== undefined && (typeof resource.uri !== 'string' || !resource.uri.startsWith('data:'))) {
      throw new Error('模型包含外部贴图或资源，请导出为自包含的 VRM 文件。');
    }
  }
  if ((document.nodes?.length ?? 0) > 10000) throw new Error('模型节点过多，暂不支持。');
  return document;
}
