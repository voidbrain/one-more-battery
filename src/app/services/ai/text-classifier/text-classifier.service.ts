import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { PipelineFactory } from '@services/ai/ai-common/common-ai.service';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';
import { Command, CommandMatch } from '@interfaces/index';

@Injectable({ providedIn: 'root' })
export class TextClassifierService {
  // Model loading process
  public isModelLoadingSignal: WritableSignal<boolean> = signal<boolean>(false);
  public isModelLoadedSignal: WritableSignal<boolean> = signal<boolean>(false);

  private loadingPromise: Promise<void> | null = null;
  private llmConfig = inject(LLMConfigService);

  // Getter for text-classifier instance from centralized pipeline factory
  private get textClassifier(): unknown {
    const recommendedModel = this.llmConfig.getRecommendedModelForBrowser('textClassifier');
    return PipelineFactory.getExistingInstance('textClassifier', recommendedModel.id);
  }

  // Getters for accessing signals in templates or codes
  get isModelLoading() {
    return this.isModelLoadingSignal();
  }

  get isModelLoaded() {
    return this.isModelLoadedSignal();
  }

  // --- Command definitions ---
  private commands: Command[] = [
    {
      command: 'charge_battery',
      examples: [
        'Carica la batteria {batteryId} {series}',
        'Carica la batteria {series} {batteryId}',
        'Carica la batteria {series} numero {batteryId}',
        'Carica la batteria numero {batteryId} {series}',
        'Carica la batteria {batteryId} serie {series}',
        'Charge battery {batteryId} {series}',
        'Charge battery {series} {batteryId}',
        'Charge battery {series} number {batteryId}',
        'Charge battery {batteryId} {series} series',
        'Charge battery {batteryId} series {series}',
        'Charge {series} battery {batteryId}',
      ],
      params: ['batteryId', 'series'],
    },
    {
      command: 'discharge_battery',
      examples: [
        'Scarica la batteria {batteryId} {series}',
        'Scarica la batteria {series} numero {batteryId}',
        'Scarica la batteria {batteryId} serie {series}',
        'Discharge battery {batteryId} {series}',
        'Discharge battery {series} number {batteryId}',
        'Discharge battery {batteryId} {series} series',
        'Discharge battery {batteryId} series {series}',
      ],
      params: ['batteryId'],
    },
    {
      command: 'check_resistance',
      examples: ['Controlla resistenza batteria 1', 'Check resistance battery 1'],
      params: ['batteryId'],
    },
    {
      command: 'store_battery',
      examples: ['Metti in deposito batteria 1', 'Store battery 1'],
      params: ['batteryId'],
    },
  ];

  private commandEmbeddings: { command: string; embedding: number[] }[] = [];

  /** --- Initialize Hugging Face text-classifier and precompute embeddings --- */
  async load(): Promise<void> {
    if (this.isModelLoadedSignal()) return;
    if (this.loadingPromise) return this.loadingPromise;

    // Show loading state
    this.isModelLoadingSignal.set(true);

    this.loadingPromise = (async () => {
      try {
        const recommendedModel = this.llmConfig.getRecommendedModelForBrowser('textClassifier');
        console.log(
          `[STTTextClassifierService] Loading ${recommendedModel.name} (${recommendedModel.size}MB)...`,
        );

        // Use centralized pipeline factory
        await PipelineFactory.getInstance('textClassifier', recommendedModel.id);
        console.log('[STTTextClassifierService] TextClassifier ready ✅');

        for (const cmd of this.commands) {
          for (const ex of cmd.examples) {
            const emb = await this.embed(ex);
            if (emb.length > 0) {
              this.commandEmbeddings.push({ command: cmd.command, embedding: emb });
              console.log(
                `[STTTextClassifierService] Embedded example: "${ex}" → len=${emb.length}`,
              );
            } else {
              console.warn(`[STTTextClassifierService] ⚠️ Failed to embed example: "${ex}"`);
            }
          }
        }

        console.log(
          `[STTTextClassifierService] Command embeddings ready ✅ (${this.commandEmbeddings.length} total)`,
        );
      } catch (err) {
        console.error('[STTTextClassifierService] Initialization error:', err);
        throw err;
      } finally {
        // Hide loading state
        this.isModelLoadingSignal.set(false);
        this.isModelLoadedSignal.set(true);
      }
    })();

    return this.loadingPromise;
  }

  /** --- Embed text into flat number[] --- */
  async embed(text: string): Promise<number[]> {
    if (!text?.trim()) return [];
    if (!this.textClassifier) {
      console.warn(
        '[STTTextClassifierService] TextClassifier not loaded. Please load the MiniLM model first.',
      );
      return [];
    }

    try {
      const result = await (this.textClassifier as (input: string) => Promise<unknown>)(text);
      const resultArray = result as unknown[];
      const tensor = resultArray?.[0];
      const flat = this.tensorToVector(tensor);

      if (!flat.length) {
        console.warn('[STTTextClassifierService] ⚠️ Empty embedding for text:', text);
        return [];
      }

      return this.normalizeVector(flat);
    } catch (err) {
      console.error('[STTTextClassifierService] Error embedding text:', text, err);
      return [];
    }
  }

  /** --- Convert ORT tensor or nested array to flat number[] --- */
  private tensorToVector(tensor: unknown): number[] {
    const flat: number[] = [];

    const flatten = (obj: unknown): void => {
      if (!obj) return;

      // Normal array
      if (Array.isArray(obj)) {
        for (const x of obj) flatten(x);
      }
      // Typed array (Float32Array, Int32Array, etc.)
      else if (ArrayBuffer.isView(obj)) {
        const arr = obj as Float32Array | Int32Array | Uint8Array | number[];
        for (const val of arr) {
          if (typeof val === 'number' && isFinite(val)) flat.push(val);
          else flatten(val);
        }
      }
      // ORT tensor with cpuData
      else if (typeof obj === 'object') {
        if ('cpuData' in obj && obj.cpuData) {
          const arr = obj.cpuData as Float32Array | number[];
          // for (let i = 0; i < arr.length; i++) {
          for (const val of arr) {
            flat.push(val);
          }
        } else {
          Object.values(obj).forEach(flatten);
        }
      }
      // Single number
      else if (typeof obj === 'number' && isFinite(obj)) {
        flat.push(obj);
      }
    };

    flatten(tensor);
    return flat;
  }

  /** --- Normalize vector to unit length --- */
  private normalizeVector(vec: number[]): number[] {
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return mag > 0 ? vec.map((v) => v / mag) : vec;
  }

  /** --- Cosine similarity --- */
  cosineSim(a: number[], b: number[]): number {
    if (!a.length || !b.length) return 0;
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] ** 2;
      normB += b[i] ** 2;
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
  }

  /** --- Parse command text with robust series extraction --- */
  async parseCommand(text: string): Promise<CommandMatch> {
    // DISABLED: Automatic loading - user must load model manually first
    // if (!this.commandEmbeddings.length) await this.init();

    // Check if model is loaded
    if (!this.commandEmbeddings.length || !this.textClassifier) {
      console.warn(
        '[STTTextClassifierService] Model not loaded. Please load the MiniLM model first.',
      );
      return { command: null, params: {} };
    }

    const inputEmb = await this.embed(text);
    if (!inputEmb.length) return { command: null, params: {} };

    let bestScore = -1;
    let bestCommand: string | null = null;
    for (const cmd of this.commandEmbeddings) {
      const score = this.cosineSim(inputEmb, cmd.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestCommand = cmd.command;
      }
    }
    console.log(
      '[STTTextClassifierService] Best match:',
      bestCommand,
      'score:',
      bestScore.toFixed(3),
    );

    // --- Extract batteryId ---
    const ids = text.match(/\b\d+\b/g)?.map(Number) || [];
    const batteryId = ids.length === 1 ? ids[0] : ids;

    // --- Extract series/color robustly ---
    const seriesList = ['rossa', 'blu', 'gialla', 'yellow', 'red', 'green', 'blue'];
    let series: string | undefined;

    const words = text.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (seriesList.includes(w)) {
        series = w;
        break;
      }
    }

    // Fallback: word immediately after battery number
    if (!series && batteryId) {
      const match = text.match(new RegExp(`\\b${batteryId}\\b\\s+(\\w+)`, 'i'));
      if (match) series = match[1].toLowerCase();
    }

    return { command: bestCommand, params: { batteryId, series } };
  }

  /** --- Unload text-classifier to free memory --- */
  async unload(): Promise<void> {
    const recommendedModel = this.llmConfig.getRecommendedModelForBrowser('textClassifier');
    await PipelineFactory.disposeInstance('textClassifier', recommendedModel.id);
    this.commandEmbeddings = [];
    this.loadingPromise = null;
    this.isModelLoadingSignal.set(false);
    this.isModelLoadedSignal.set(false);
    console.log('[STTTextClassifierService] TextClassifier unloaded ✅');
  }

  /** --- Execute command --- */
  async executeCommand(result: CommandMatch) {
    if (!result.command) {
      console.warn('[STTTextClassifierService] ⚠️ No command recognized');
      return;
    }

    const { batteryId, series } = result.params;
    switch (result.command) {
      case 'charge_battery':
        console.log(`⚡ Charging battery ${batteryId}` + (series ? ` (${series} series)` : ''));
        break;
      case 'discharge_battery':
        console.log(`🔋 Discharging battery ${batteryId}`);
        break;
      case 'check_resistance':
        console.log(`🧪 Checking resistance for battery ${batteryId}`);
        break;
      case 'store_battery':
        console.log(`📦 Storing battery ${batteryId}`);
        break;
      default:
        console.warn('[STTTextClassifierService] Unknown command:', result.command);
    }
  }
}
