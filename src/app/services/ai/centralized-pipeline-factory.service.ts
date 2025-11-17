import { pipeline, PipelineType } from '@huggingface/transformers';

// Pipeline configuration for different model types
interface PipelineConfig {
  task: PipelineType;
  model: string;
  options: Record<string, unknown>;
}

// Define model factories
// Ensures only one model is created of each type
export class PipelineFactory {
  private static instances: Map<string, unknown> = new Map();

  // Configuration for different pipeline types
  private static configs: Record<string, PipelineConfig> = {
    transcriber: {
      task: 'automatic-speech-recognition',
      model: 'whisper-small',
      options: {
        dtype: {
          encoder_model: 'fp32',
          decoder_model_merged: 'q4', // or 'fp32' ('fp16' is broken)
        },
        device: 'webgpu',
        local_files_only: false,
      },
    },
    embedder: {
      task: 'feature-extraction',
      model: '', // Will be set dynamically based on LLM config
      options: {
        dtype: 'fp32',
        device: 'webgpu',
        local_files_only: false,
      },
    },
    detector: {
      task: 'object-detection',
      model: 'onnx-community/yolov11n', // Default to nano model
      options: {
        dtype: 'fp32',
        device: 'webgpu',
        local_files_only: false,
      },
    },
  };

  static async getInstance(
    type: 'transcriber' | 'embedder' | 'detector',
    modelId?: string,
    progressCallback?: (data: unknown) => void
  ): Promise<unknown> {
    const config = this.configs[type];
    if (!config) {
      throw new Error(`Unknown pipeline type: ${type}`);
    }

    // Use provided modelId or default model
    const modelKey = modelId || config.model;
    const instanceKey = `${type}-${modelKey}`;

    // Check if instance already exists
    if (this.instances.has(instanceKey)) {
      return this.instances.get(instanceKey);
    }

    // Create new instance
    const options = { ...config.options };
    if (progressCallback) {
      options['progress_callback'] = progressCallback;
    }

    const instance = await pipeline(config.task, modelKey, options);
    this.instances.set(instanceKey, instance);

    return instance;
  }

  // Get instance without creating new one (for checking if loaded)
  static getExistingInstance(type: 'transcriber' | 'embedder' | 'detector', modelId?: string): unknown {
    const config = this.configs[type];
    if (!config) return null;

    const modelKey = modelId || config.model;
    const instanceKey = `${type}-${modelKey}`;

    return this.instances.get(instanceKey) ?? null;
  }

  // Dispose of specific instance
  static async disposeInstance(type: 'transcriber' | 'embedder' | 'detector', modelId?: string): Promise<void> {
    const config = this.configs[type];
    if (!config) return;

    const modelKey = modelId || config.model;
    const instanceKey = `${type}-${modelKey}`;

    const instance = this.instances.get(instanceKey);
    if (instance && typeof (instance as { dispose?: unknown }).dispose === 'function') {
      await (instance as { dispose: () => Promise<void> }).dispose();
    }

    this.instances.delete(instanceKey);
  }

  // Dispose all instances
  static async disposeAll(): Promise<void> {
    for (const [key, instance] of this.instances.entries()) {
      if (instance && typeof (instance as { dispose?: unknown }).dispose === 'function') {
        try {
          await (instance as { dispose: () => Promise<void> }).dispose();
        } catch (error) {
          console.warn(`Failed to dispose pipeline instance ${key}:`, error);
        }
      }
    }
    this.instances.clear();
  }
}
