// WebGPU TypeScript declarations
interface Navigator {
  gpu?: GPU;
}

interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): GPUTextureFormat;
}

interface GPURequestAdapterOptions {
  powerPreference?: 'low-power' | 'high-performance';
  forceFallbackAdapter?: boolean;
}

interface GPUAdapter {
  readonly name: string;
  readonly features: GPUSupportedFeatures;
  readonly limits: GPUSupportedLimits;
  readonly isFallbackAdapter: boolean;

  requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
}

interface GPUDeviceDescriptor {
  requiredFeatures?: GPUFeatureName[];
  requiredLimits?: Record<string, GPUSize64>;
  defaultQueue?: GPUQueueDescriptor;
}

interface GPUQueueDescriptor {
  label?: string;
}

interface GPUSupportedFeatures {
  has(name: GPUFeatureName): boolean;
  [Symbol.iterator](): IterableIterator<GPUFeatureName>;
}

type GPUFeatureName = string;

interface GPUSupportedLimits {
  readonly maxTextureDimension1D: number;
  readonly maxTextureDimension2D: number;
  readonly maxTextureDimension3D: number;
  readonly maxTextureArrayLayers: number;
  readonly maxBindGroups: number;
  readonly maxBindingsPerBindGroup: number;
  readonly maxDynamicUniformBuffersPerPipelineLayout: number;
  readonly maxDynamicStorageBuffersPerPipelineLayout: number;
  readonly maxSampledTexturesPerShaderStage: number;
  readonly maxSamplersPerShaderStage: number;
  readonly maxStorageBuffersPerShaderStage: number;
  readonly maxStorageTexturesPerShaderStage: number;
  readonly maxUniformBuffersPerShaderStage: number;
  readonly maxUniformBufferBindingSize: number;
  readonly maxStorageBufferBindingSize: number;
  readonly minUniformBufferOffsetAlignment: number;
  readonly minStorageBufferOffsetAlignment: number;
  readonly maxVertexBuffers: number;
  readonly maxBufferSize: number;
  readonly maxVertexAttributes: number;
  readonly maxVertexBufferArrayStride: number;
  readonly maxInterStageShaderComponents: number;
  readonly maxInterStageShaderVariables: number;
  readonly maxColorAttachments: number;
  readonly maxColorAttachmentBytesPerSample: number;
  readonly maxComputeWorkgroupStorageSize: number;
  readonly maxComputeInvocationsPerWorkgroup: number;
  readonly maxComputeWorkgroupSizeX: number;
  readonly maxComputeWorkgroupSizeY: number;
  readonly maxComputeWorkgroupSizeZ: number;
  readonly maxComputeWorkgroupsPerDimension: number;
}

interface GPUDevice {
  readonly features: GPUSupportedFeatures;
  readonly limits: GPUSupportedLimits;
  readonly queue: GPUQueue;

  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
  createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler;
  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
  createComputePipelineAsync(descriptor: GPUComputePipelineDescriptor): Promise<GPUComputePipeline>;
  createRenderPipelineAsync(descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline>;
  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  createRenderBundleEncoder(descriptor: GPURenderBundleEncoderDescriptor): GPURenderBundleEncoder;
  createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet;

  destroy(): void;
}

interface GPUQueue {
  submit(commandBuffers: GPUCommandBuffer[]): void;
  onSubmittedWorkDone(): Promise<void>;
  writeBuffer(
    buffer: GPUBuffer,
    bufferOffset: GPUSize64,
    data: BufferSource | SharedArrayBuffer,
    dataOffset?: GPUSize64,
    size?: GPUSize64
  ): void;
  writeTexture(
    destination: GPUImageCopyTexture,
    data: BufferSource | SharedArrayBuffer,
    dataLayout: GPUImageDataLayout,
    size: GPUExtent3D
  ): void;
  copyExternalImageToTexture(
    source: GPUImageCopyExternalImage,
    destination: GPUImageCopyTexture,
    copySize: GPUExtent3D
  ): void;
}

interface GPUBuffer {
  readonly size: GPUSize64;
  readonly usage: GPUBufferUsageFlags;
  readonly mapState: 'unmapped' | 'pending' | 'mapped';

  mapAsync(mode: GPUMapModeFlags, offset?: GPUSize64, size?: GPUSize64): Promise<void>;
  getMappedRange(offset?: GPUSize64, size?: GPUSize64): ArrayBuffer;
  unmap(): void;
  destroy(): void;
}

interface GPUTexture {
  readonly width: number;
  readonly height: number;
  readonly depthOrArrayLayers: number;
  readonly mipLevelCount: number;
  readonly sampleCount: number;
  readonly dimension: GPUTextureDimension;
  readonly format: GPUTextureFormat;
  readonly usage: GPUTextureUsageFlags;

  createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
  destroy(): void;
}

interface GPUSampler {}

interface GPUBindGroupLayout {}

interface GPUPipelineLayout {}

interface GPUBindGroup {}

interface GPUShaderModule {}

interface GPUComputePipeline {}

interface GPURenderPipeline {}

interface GPUCommandEncoder {}

interface GPURenderBundleEncoder {}

interface GPUQuerySet {}

interface GPUCommandBuffer {}

// Type definitions for various descriptors and enums
type GPUBufferUsageFlags = number;
type GPUTextureUsageFlags = number;
type GPUMapModeFlags = number;
type GPUSize64 = number;

type GPUTextureDimension = '1d' | '2d' | '3d';

type GPUTextureFormat =
  | 'r8unorm'
  | 'r8snorm'
  | 'r8uint'
  | 'r8sint'
  | 'r16uint'
  | 'r16sint'
  | 'r16float'
  | 'rg8unorm'
  | 'rg8snorm'
  | 'rg8uint'
  | 'rg8sint'
  | 'r32uint'
  | 'r32sint'
  | 'r32float'
  | 'rg16uint'
  | 'rg16sint'
  | 'rg16float'
  | 'rgba8unorm'
  | 'rgba8unorm-srgb'
  | 'rgba8snorm'
  | 'rgba8uint'
  | 'rgba8sint'
  | 'bgra8unorm'
  | 'bgra8unorm-srgb'
  | 'rgb9e5ufloat'
  | 'rgb10a2unorm'
  | 'rg11b10ufloat'
  | 'rg32uint'
  | 'rg32sint'
  | 'rg32float'
  | 'rgba16uint'
  | 'rgba16sint'
  | 'rgba16float'
  | 'rgba32uint'
  | 'rgba32sint'
  | 'rgba32float'
  | 'stencil8'
  | 'depth16unorm'
  | 'depth24plus'
  | 'depth24plus-stencil8'
  | 'depth32float'
  | 'depth32float-stencil8'
  | 'bc1-rgba-unorm'
  | 'bc1-rgba-unorm-srgb'
  | 'bc2-rgba-unorm'
  | 'bc2-rgba-unorm-srgb'
  | 'bc3-rgba-unorm'
  | 'bc3-rgba-unorm-srgb'
  | 'bc4-r-unorm'
  | 'bc4-r-snorm'
  | 'bc5-rg-unorm'
  | 'bc5-rg-snorm'
  | 'bc6h-rgb-ufloat'
  | 'bc6h-rgb-float'
  | 'bc7-rgba-unorm'
  | 'bc7-rgba-unorm-srgb'
  | 'etc2-rgb8unorm'
  | 'etc2-rgb8unorm-srgb'
  | 'etc2-rgb8a1unorm'
  | 'etc2-rgb8a1unorm-srgb'
  | 'etc2-rgba8unorm'
  | 'etc2-rgba8unorm-srgb'
  | 'eac-r11unorm'
  | 'eac-r11snorm'
  | 'eac-rg11unorm'
  | 'eac-rg11snorm'
  | 'astc-4x4-unorm'
  | 'astc-4x4-unorm-srgb'
  | 'astc-5x4-unorm'
  | 'astc-5x4-unorm-srgb'
  | 'astc-5x5-unorm'
  | 'astc-5x5-unorm-srgb'
  | 'astc-6x5-unorm'
  | 'astc-6x5-unorm-srgb'
  | 'astc-6x6-unorm'
  | 'astc-6x6-unorm-srgb'
  | 'astc-8x5-unorm'
  | 'astc-8x5-unorm-srgb'
  | 'astc-8x6-unorm'
  | 'astc-8x6-unorm-srgb'
  | 'astc-8x8-unorm'
  | 'astc-8x8-unorm-srgb'
  | 'astc-10x5-unorm'
  | 'astc-10x5-unorm-srgb'
  | 'astc-10x6-unorm'
  | 'astc-10x6-unorm-srgb'
  | 'astc-10x8-unorm'
  | 'astc-10x8-unorm-srgb'
  | 'astc-10x10-unorm'
  | 'astc-10x10-unorm-srgb'
  | 'astc-12x10-unorm'
  | 'astc-12x10-unorm-srgb'
  | 'astc-12x12-unorm'
  | 'astc-12x12-unorm-srgb';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUBufferDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUTextureDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUSamplerDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUBindGroupLayoutDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUPipelineLayoutDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUBindGroupDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUShaderModuleDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUComputePipelineDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPURenderPipelineDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUCommandEncoderDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPURenderBundleEncoderDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUQuerySetDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUTextureViewDescriptor = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUImageCopyTexture = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUImageDataLayout = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUExtent3D = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUImageCopyExternalImage = any;
