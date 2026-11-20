import { GPUS, fmt, f1 } from './gpus.js';

/* Every user-facing string is {en, zh}; components pick one with L(). Functions that build text take the language. */
const b = (en, zh) => ({ en, zh });

/* LLM architectures (public model configs) for KV-cache maths */
export const LLM = {
  'llama-8b': { name: 'Llama 3.1 8B', p: 8.0, L: 32, kv: 8, hd: 128 },
  'qwen-14b': { name: 'Qwen2.5 14B', p: 14.7, L: 48, kv: 8, hd: 128 },
  'qwen-32b': { name: 'Qwen2.5 32B', p: 32.5, L: 64, kv: 8, hd: 128 },
  'llama-70b': { name: 'Llama 3.3 70B', p: 70.6, L: 80, kv: 8, hd: 128 },
  'glm-air': { name: 'GLM-4.5-Air 106B', p: 106, L: 46, kv: 8, hd: 128, moe: 12 },
};
export const BITS = { fp16: 16, int8: 8, int4: 4 };

const noKepler = (en, zh) => (g) => (g.arch === 'Kepler' ? b(`Kepler is not supported by current ${en}`, `当前的${zh}已不支持 Kepler`) : null);
/* Max MIG slices and slice size (GB) at that count, from NVIDIA MIG profiles */
export const MIG = { 'a100-40': [7, 5], 'a100-80': [7, 10], 'h100-pcie': [7, 10], 'rtx-pro-6000': [4, 24], 'rtx-pro-5000': [2, 24] };

const R = (en, zh) => ({ en, zh });
const res = { 1080: '1080p', 1440: '1440p', 2160: '4K', 4320: '8K' };

export const WL = {
  llm: {
    name: b('LLM inference', '大模型推理'), req: noKepler('LLM runtimes', '大模型推理框架'), img: 'wl-llm',
    stack: 'Qwen · Llama · GLM · vLLM · LangChain RAG',
    q: b('A private ChatGPT, AI agent, coding assistant or chat API', '私有 ChatGPT、AI 智能体、编程助手或对话 API'),
    fields: [
      { k: 'model', label: b('Which model do you want to run?', '想跑哪个模型？'), ns: 'qwen-14b', opts: [['llama-8b', b('Small — Llama 3.1 8B', '小 — Llama 3.1 8B')], ['qwen-14b', b('Medium — Qwen2.5 14B', '中 — Qwen2.5 14B')], ['qwen-32b', b('Large — Qwen2.5 32B', '大 — Qwen2.5 32B')], ['llama-70b', b('Very large — Llama 3.3 70B', '很大 — Llama 3.3 70B')], ['glm-air', b('Huge, mixture-of-experts — GLM-4.5-Air 106B', '超大，混合专家 — GLM-4.5-Air 106B')]] },
      { k: 'prec', label: b('Quality or cost?', '质量优先还是成本优先？'), ns: 'int8', opts: [['fp16', b('Best quality (uses the most memory)', '质量最好（显存占用最多）')], ['int8', b('Balanced (8-bit, near-identical quality)', '均衡（8-bit，质量几乎不变）')], ['int4', b('Lowest cost (4-bit, small quality loss)', '成本最低（4-bit，质量略降）')]] },
      { k: 'ctx', label: b('How long are the chats or documents?', '对话或文档有多长？'), ns: 8192, opts: [[4096, b('Short chats (about 3 pages)', '短对话（约 3 页）')], [8192, b('Normal (about 6 pages)', '一般（约 6 页）')], [16384, b('Long documents (about 12 pages)', '长文档（约 12 页）')], [32768, b('Very long (about 25 pages)', '很长（约 25 页）')]] },
      { k: 'conc', label: b('How many people use it at the same time?', '同时有多少人在用？'), ns: 8, opts: [[1, '1'], [4, '4'], [8, '8'], [16, '16'], [32, '32']] },
      { k: 'rag', label: b('Does it answer from your own documents (knowledge base, AI agent)?', '是否要先查你自己的文档再回答（知识库、AI 智能体）？'), ns: 'yes', opts: [['no', b('No — chat only', '不需要 — 只聊天')], ['yes', b('Yes — search our documents first (RAG)', '需要 — 先检索文档（RAG）')]] },
    ],
    def: { model: 'llama-8b', prec: 'fp16', ctx: 8192, conc: 4, rag: 'no' },
    need(a) {
      const m = LLM[a.model], w = m.p * BITS[a.prec] / 8, kv = 2 * m.L * m.kv * m.hd * 2 * a.ctx * a.conc / 1e9, rt = 1.5 + 0.05 * w, rag = a.rag === 'yes';
      return {
        parts: [[b('Weights', '模型权重'), w], [b('KV cache', 'KV 缓存'), kv], [b('Search models (RAG)', '检索模型（RAG）'), rag ? 2.5 : 0], [b('Runtime', '运行时'), rt]],
        basis: b(
          `Weights = ${m.p}B × ${BITS[a.prec]} bit ÷ 8. KV cache = 2 × ${m.L} layers × ${m.kv} KV heads × ${m.hd} dim × 2 bytes (FP16) × ${fmt(a.ctx)} tokens × ${a.conc} requests. Runtime allowance = 1.5 GB + 5% of weights (assumption).${m.est ? " KV cache uses a typical 60-layer, 8-KV-head layout, because this model's exact architecture is not in our table." : ''}${m.moe ? ` Mixture-of-experts: all ${m.p}B weights must sit in GPU memory, but only about ${m.moe}B are used per token.` : ''}${rag ? ' RAG adds an embedding model and a reranker (about 2.5 GB); the document index usually lives in system RAM or a vector database.' : ''}`,
          `权重 = ${m.p}B × ${BITS[a.prec]} bit ÷ 8。KV 缓存 = 2 × ${m.L} 层 × ${m.kv} 个 KV 头 × ${m.hd} 维 × 2 字节（FP16）× ${fmt(a.ctx)} tokens × ${a.conc} 个请求。运行时预留 = 1.5 GB + 权重的 5%（估计值）。${m.est ? '该模型的准确结构不在我们的表里，KV 缓存按常见的 60 层、8 个 KV 头估算。' : ''}${m.moe ? `混合专家模型：${m.p}B 权重要全部放进显存，但每个 token 只用约 ${m.moe}B。` : ''}${rag ? 'RAG 需要额外的向量模型和重排序模型（约 2.5 GB）；文档索引一般放在内存或向量数据库里。' : ''}`),
        label: `${m.name} · ${a.prec.toUpperCase()} · ${a.ctx / 1024}K × ${a.conc}${rag ? ' + RAG' : ''}`,
      };
    },
  },
  img: {
    name: b('Image generation', 'AI 生图'), req: noKepler('PyTorch builds', 'PyTorch 版本'), img: 'wl-img', stack: 'ComfyUI · FLUX · Stable Diffusion',
    q: b('AI pictures, product shots and art with ComfyUI', '用 ComfyUI 生成图片、商品图和插画'),
    fields: [
      { k: 'model', label: b('Which image model?', '用哪个生图模型？'), ns: 'flux8', opts: [['sd15', b('Stable Diffusion 1.5 (fast, basic)', 'Stable Diffusion 1.5（快，基础）')], ['sdxl', b('SDXL (good all-rounder)', 'SDXL（全能）')], ['flux8', b('FLUX.1 [dev], compressed (high quality)', 'FLUX.1 [dev] 压缩版（高质量）')], ['flux16', b('FLUX.1 [dev], full (highest quality)', 'FLUX.1 [dev] 完整版（最高质量）')]] },
      { k: 'res', label: b('How large are the images?', '图片多大？'), ns: 1536, opts: [[1024, b('Social / web (1024 px)', '社交媒体 / 网页（1024 px）')], [1536, b('Print-ready (1536 px)', '可印刷（1536 px）')], [2048, b('Poster (2048 px)', '海报（2048 px）')]] },
      { k: 'batch', label: b('How many images per run?', '一次出几张？'), ns: 2, opts: [[1, '1'], [2, '2'], [4, '4']] },
    ],
    def: { model: 'flux8', res: 1024, batch: 1 },
    need(a) {
      const base = { sd15: 4.5, sdxl: 9, flux8: 17, flux16: 33 }[a.model], act = { 1024: 1.5, 1536: 3.5, 2048: 6 }[a.res] * a.batch;
      return {
        parts: [[b('Models loaded', '加载的模型'), base], [b('Activations', '计算中间量'), act], [b('Runtime', '运行时'), 1.5]],
        basis: b('Rule of thumb with all components resident (diffusion model, text encoders, VAE). Activation memory scales with pixels and batch. Extra nodes, LoRAs and ControlNets add more.', '经验值，假设所有组件常驻显存（扩散模型、文本编码器、VAE）。中间量随像素和张数增长；额外的节点、LoRA 和 ControlNet 会更多。'),
        label: `${{ sd15: 'SD 1.5', sdxl: 'SDXL', flux8: 'FLUX.1 dev FP8', flux16: 'FLUX.1 dev FP16' }[a.model]} · ${a.res}px × ${a.batch}`,
      };
    },
  },
  vgen: {
    name: b('AI video generation', 'AI 视频生成'), req: noKepler('PyTorch builds', 'PyTorch 版本'), img: 'wl-vgen', stack: 'ComfyUI · Wan 2.2 · LTX-Video',
    q: b('Turn a prompt or a photo into a short video clip', '把一句话或一张图变成短视频'),
    fields: [
      { k: 'model', label: b('Which video model?', '用哪个视频模型？'), ns: 'wan14f8', opts: [['wan5', b('Wan 2.2 5B (fast, good quality)', 'Wan 2.2 5B（快，质量好）')], ['wan14f8', b('Wan 2.2 14B, compressed (high quality)', 'Wan 2.2 14B 压缩版（高质量）')], ['wan14', b('Wan 2.2 14B, full (highest quality)', 'Wan 2.2 14B 完整版（最高质量）')]] },
      { k: 'res', label: b('What resolution?', '什么清晰度？'), ns: '720', opts: [['480', b('480p (preview, social)', '480p（预览、社交媒体）')], ['720', b('720p (HD)', '720p（高清）')]] },
      { k: 'len', label: b('How long is each clip?', '每段多长？'), ns: 5, opts: [[3, b('About 3 seconds', '约 3 秒')], [5, b('About 5 seconds', '约 5 秒')]] },
    ],
    def: { model: 'wan5', res: '720', len: 5 },
    need(a) {
      const base = { wan5: 10, wan14f8: 14.5, wan14: 28.5 }[a.model], act = { 480: 2.5, 720: 5.5 }[a.res] * (a.len / 5);
      return {
        parts: [[b('Video model', '视频模型'), base], [b('VAE', 'VAE'), 1], [b('Frame activations', '帧中间量'), act], [b('Runtime', '运行时'), 1.5]],
        basis: b('Rule of thumb for ComfyUI. The text encoder is unloaded after the prompt is read, and Wan 2.2 14B loads its two expert models one at a time. A 5-second clip takes minutes; speed is not estimated here.', 'ComfyUI 经验值。文本编码器读完提示词后会卸载，Wan 2.2 14B 的两个专家模型轮流加载。生成一段 5 秒视频要几分钟，这里不估算速度。'),
        label: `${{ wan5: 'Wan 2.2 5B', wan14f8: 'Wan 2.2 14B FP8', wan14: 'Wan 2.2 14B FP16' }[a.model]} · ${a.res}p · ${a.len}s`,
      };
    },
  },
  speech: {
    name: b('Speech AI', '语音 AI'), req: noKepler('PyTorch builds', 'PyTorch 版本'), img: 'wl-speech', stack: 'Whisper · TTS · voice agents',
    q: b('Transcribe audio, or turn text into a voice', '语音转文字，或文字转语音'),
    fields: [{ k: 'task', label: b('What do you need?', '要做什么？'), ns: 'both', opts: [['asr', b('Turn speech into text (transcription)', '语音转文字（转写）')], ['tts', b('Turn text into speech (voice)', '文字转语音（配音）')], ['both', b('Both — a voice assistant or call bot', '都要 — 语音助手或电话机器人')]] }],
    def: { task: 'asr' },
    need(a) {
      return {
        parts: [[b('Speech-to-text (Whisper large-v3-turbo)', '语音转文字（Whisper large-v3-turbo）'), a.task === 'tts' ? 0 : 6], [b('Text-to-speech model', '文字转语音模型'), a.task === 'asr' ? 0 : 4], [b('Runtime', '运行时'), 1]],
        basis: b('Whisper large-v3-turbo needs ~6 GB (openai/whisper README). Text-to-speech ≈ 4 GB is an assumption. More streams mainly need more speed, not memory.', 'Whisper large-v3-turbo 约需 6 GB（openai/whisper 说明）。文字转语音约 4 GB 为估计值。路数多了主要需要更快的卡，而不是更大的显存。'),
        label: { asr: 'Speech-to-text', tts: 'Text-to-speech', both: 'Speech in + out' }[a.task],
      };
    },
  },
  train: {
    name: b('Training & fine-tuning', '训练与微调'), req: noKepler('PyTorch builds', 'PyTorch 版本'), img: 'wl-train', stack: 'PyTorch · LoRA · DeepSpeed',
    q: b('Teach a model your data, or train one from scratch', '用你的数据微调模型，或从头训练'),
    fields: [
      { k: 'method', label: b('Adapt an existing model, or train from scratch?', '改现成模型，还是从头训练？'), ns: 'lora', opts: [['qlora', b('Adapt it — lightest (QLoRA)', '微调 — 最轻（QLoRA）')], ['lora', b('Adapt it — standard (LoRA)', '微调 — 标准（LoRA）')], ['full', b('Adapt it — update every weight', '微调 — 更新全部权重')], ['scratch', b('Train from scratch', '从头训练')]] },
      { k: 'size', label: b('How big is the model?', '模型多大？'), ns: 8, opts: [[0.1, b('Vision model (ResNet / ViT)', '视觉模型（ResNet / ViT）')], [1, b('Small language model (1B)', '小语言模型（1B）')], [3, '3B'], [8, b('8B (Llama 3.1 8B class)', '8B（Llama 3.1 8B 级）')], [14, '14B'], [32, '32B'], [70, '70B']] },
    ],
    def: { method: 'qlora', size: 8 },
    need(a) {
      const p = +a.size, r = { qlora: [p * 0.55, b('4-bit base weights', '4-bit 基础权重'), 4], lora: [p * 2, b('16-bit base weights', '16-bit 基础权重'), 6], full: [p * 16, b('Weights, grads, Adam', '权重、梯度、Adam 状态'), 8], scratch: [p * 16, b('Weights, grads, Adam', '权重、梯度、Adam 状态'), 8] }[a.method];
      return {
        parts: [[r[1], r[0]], [b('Activations', '计算中间量'), r[2]], [b('Runtime', '运行时'), 1.5]],
        basis: b('Rule of thumb. Updating every weight with Adam in mixed precision needs ≈16 bytes per parameter before activations; ZeRO / FSDP can shard that across GPUs.', '经验值。用 Adam 混合精度更新全部权重，每个参数约需 16 字节（不含中间量）；ZeRO / FSDP 可以分摊到多张卡。'),
        label: `${p < 1 ? '~100M vision' : p + 'B'} · ${{ qlora: 'QLoRA', lora: 'LoRA', full: 'full fine-tune', scratch: 'from scratch' }[a.method]}`,
      };
    },
  },
  cv: {
    name: b('Computer vision', '计算机视觉'), req: noKepler('TensorRT', 'TensorRT'), img: 'wl-cv', stack: 'YOLO · OpenCV · TensorRT',
    q: b('Spot people, vehicles or behaviour in camera video', '在监控视频里识别人、车或行为'),
    fields: [
      { k: 'size', label: b('What do you need to recognise?', '要识别什么？'), ns: 'm', opts: [['s', b('People and vehicles', '人和车辆')], ['m', b('Behaviour or fine detail', '行为或细节')], ['l', b('Exact outlines of objects', '物体的精确轮廓')]] },
      { k: 'streams', label: b('How many cameras at once?', '同时几路摄像头？'), ns: 16, opts: [[1, '1'], [4, '4'], [16, '16'], [32, '32']] },
      { k: 'rt', label: b('Do you need real-time detection or alerts?', '需要实时检测或告警吗？'), ns: 'yes', opts: [['yes', b('Yes — alert as it happens', '需要 — 实时告警')], ['no', b('No — analyse recordings later', '不需要 — 事后分析录像')]] },
    ],
    def: { size: 'm', streams: 16, rt: 'yes' },
    need(a) {
      const m = { s: 2, m: 4, l: 10 }[a.size], n = a.rt === 'yes' ? +a.streams : Math.min(+a.streams, 4);
      return {
        parts: [[b('Model + engine', '模型和推理引擎'), m], [b('Stream buffers', '视频流缓冲'), n * 0.35], [b('Runtime', '运行时'), 1.5]],
        basis: b('Rule of thumb: decoded frame buffers ≈ 0.35 GB per 1080p stream. Real-time decodes every camera at once. FPS per stream needs testing and is not estimated.', '经验值：每路 1080p 解码缓冲约 0.35 GB。实时检测要同时解码所有摄像头。每路帧率需要实测，这里不估算。'),
        label: `${a.streams} cams · ${a.rt === 'yes' ? 'real-time' : 'offline'}`,
      };
    },
  },
  render: {
    name: b('3D rendering', '3D 渲染'), img: 'wl-render', stack: 'Blender Cycles · V-Ray · Octane · Redshift',
    q: b('Final images and animation from Blender, V-Ray or Unreal', '用 Blender、V-Ray 或 Unreal 出图和动画'),
    req: (g) => (!g.gfx ? b('Compute-only — no RT cores or graphics APIs for rendering', '纯计算卡，没有 RT 核心和图形接口') : null),
    fields: [
      { k: 'scene', label: b('What are you rendering?', '渲染什么？'), ns: 'l', opts: [['s', b('A product shot', '产品图')], ['m', b('An interior / architecture', '室内 / 建筑')], ['l', b('An exterior or VFX shot', '室外场景或特效镜头')], ['xl', b('A film or city-scale scene', '电影级或城市级场景')]] },
      { k: 'res', label: b('How large is the final image?', '成品多大？'), ns: '2160', opts: [['1080', '1080p'], ['2160', '4K'], ['4320', '8K']] },
    ],
    def: { scene: 'm', res: '2160' },
    need(a) {
      const sc = { s: 3, m: 8, l: 20, xl: 40 }[a.scene], fb = { 1080: 0.5, 2160: 1.5, 4320: 5 }[a.res];
      return {
        parts: [[b('Scene geometry + textures', '场景几何和贴图'), sc], [b('Render buffers', '渲染缓冲'), fb], [b('Runtime', '运行时'), 1]],
        basis: b('Rule of thumb. GPU renderers must fit the whole scene in GPU memory (out-of-core modes are slower). RT cores accelerate ray tracing.', '经验值。GPU 渲染器要把整个场景放进显存（超出显存的模式会慢很多）。RT 核心加速光线追踪。'),
        label: `${{ s: 'S', m: 'M', l: 'L', xl: 'XL' }[a.scene]} scene · ${res[a.res]}`,
      };
    },
  },
  game: {
    name: b('Gaming & cloud gaming', '游戏与云游戏'), img: 'wl-game', stack: 'DirectX 12 · Vulkan · DLSS',
    q: b('Play or stream games with low latency', '低延迟玩游戏或串流游戏'),
    req: (g) => (!g.gfx ? b('Compute-only accelerator — not built for graphics or gaming', '纯计算卡，不能跑图形和游戏') : null),
    fields: [
      { k: 'res', label: b('What resolution?', '什么分辨率？'), ns: '1440', opts: [['1080', '1080p'], ['1440', '1440p'], ['2160', '4K']] },
      { k: 'q', label: b('What graphics quality?', '画质？'), ns: 'high', opts: [['med', b('Medium', '中')], ['high', b('High', '高')], ['rt', b('Ultra + ray tracing', '极致 + 光追')]] },
      { k: 's', label: b('How many players per GPU?', '一张卡几个玩家？'), ns: 1, opts: [[1, '1'], [2, '2'], [4, '4']] },
    ],
    def: { res: '1080', q: 'high', s: 1 },
    need(a) {
      const base = { 1080: 4, 1440: 6, 2160: 8 }[a.res] * { med: 0.75, high: 1, rt: 1.4 }[a.q];
      return {
        parts: [[b('Game assets', '游戏资源'), base * a.s], [b('Frame buffers', '帧缓冲'), 0.5 * a.s], [b('Runtime', '运行时'), 1]],
        basis: b('Rule of thumb for current AAA titles; varies widely by game. Several players on one GPU need partitioning or a multi-session platform.', '当前 3A 游戏的经验值，不同游戏差别很大。一张卡给多个玩家，需要 GPU 切分或多会话平台。'),
        label: `${res[a.res]} · ${a.q} × ${a.s}`,
      };
    },
  },
  cad: {
    name: b('Remote workstation & CAD', '远程工作站与 CAD'), img: 'wl-cad', stack: 'Cloud desktop · SOLIDWORKS · Revit · Maya',
    q: b('Cloud desktops, multi-screen office work, design and BIM', '云桌面、多屏办公、设计和 BIM'),
    req: (g) => (!g.gfx ? b('Compute-only accelerator — no display or graphics APIs', '纯计算卡，没有显示输出和图形接口') : null),
    fields: [
      { k: 'app', label: b('What will people do on it?', '主要用来做什么？'), ns: 'part', opts: [['office', b('Office work and browsing', '办公和上网')], ['2d', b('2D drawing', '2D 制图')], ['part', b('3D parts & small assemblies', '3D 零件和小装配')], ['asm', b('Large assemblies / BIM', '大装配 / BIM')], ['dcc', b('Animation & VFX', '动画和特效')]] },
      { k: 'disp', label: b('How many screens?', '几块屏幕？'), ns: 2, opts: [[1, '1'], [2, '2'], [4, '4']] },
    ],
    def: { app: 'asm', disp: 2 },
    need(a) {
      const m = { office: 0.5, '2d': 1.5, part: 4, asm: 8, dcc: 14 }[a.app], o = a.app === 'office';
      return {
        parts: [[b('Models + viewport', '模型和视口'), m], [b('Displays', '显示输出'), (o ? 0.25 : 0.4) * a.disp], [b('Runtime', '运行时'), o ? 0.3 : 1]],
        basis: b('Rule of thumb. ISV-certified professional drivers (RTX / Quadro) are recommended for CAD; GeForce drivers are not certified.', '经验值。CAD 建议用通过软件厂商认证的专业驱动（RTX / Quadro），GeForce 驱动没有认证。'),
        label: `${a.app} · ${a.disp} screen${a.disp > 1 ? 's' : ''}`,
      };
    },
  },
  video: {
    name: b('Video & live streaming', '视频与直播'), img: 'wl-video', stack: 'FFmpeg · OBS · NVENC · DaVinci Resolve',
    q: b('Convert, compress, upscale or broadcast video', '视频转码、压缩、超分或直播推流'),
    req: (g, a) => (g.nvenc === false ? b('No NVENC video encoder', '没有 NVENC 视频编码器') : g.nvenc == null ? b('NVENC support not listed for this card', '这张卡没有列出 NVENC 支持') : (a.codec === 'av1' && !['Ada Lovelace', 'Blackwell'].includes(g.arch)) ? b('AV1 encode needs Ada or Blackwell', 'AV1 编码需要 Ada 或 Blackwell') : null),
    fields: [
      { k: 'out', label: b('Is the result a video file or a live stream?', '结果是视频文件还是直播？'), ns: 'file', opts: [['file', b('A video file (convert, compress, edit)', '视频文件（转码、压缩、剪辑）')], ['live', b('A live stream to viewers', '直播给观众')]] },
      { k: 'res', label: b('What resolution?', '什么分辨率？'), ns: '2160', opts: [['1080', '1080p'], ['1440', '1440p'], ['2160', '4K'], ['4320', '8K']] },
      { k: 'codec', label: b('Which video format?', '什么视频格式？'), ns: 'hevc', opts: [['h264', b('H.264 (plays everywhere)', 'H.264（兼容性最好）')], ['hevc', b('HEVC / H.265 (smaller files)', 'HEVC / H.265（文件更小）')], ['av1', b('AV1 (best quality per bit)', 'AV1（同码率画质最好）')]] },
      { k: 'ai', label: b('Do you also want to improve quality?', '还要提升画质吗？'), ns: 'no', opts: [['no', b('No — just convert or broadcast', '不用 — 只转码或推流')], ['yes', b('Yes — AI upscale / denoise', '要 — AI 超分 / 降噪')]] },
      { k: 'ch', label: b('How many videos or channels at once?', '同时几路？'), ns: 2, opts: [[1, '1'], [2, '2'], [4, '4'], [8, '8']] },
    ],
    def: { out: 'file', res: '2160', codec: 'hevc', ai: 'no', ch: 1 },
    need(a) {
      const per = { 1080: 0.3, 1440: 0.5, 2160: 1, 4320: 3 }[a.res], live = a.out === 'live', ai = a.ai === 'yes';
      return {
        parts: [[b('Encode / decode buffers', '编解码缓冲'), per * a.ch], [b('AI enhancement model', 'AI 增强模型'), ai ? 6 : 0], [b('AI frame buffers', 'AI 帧缓冲'), ai ? per * 2 * a.ch : 0], [b('Scene compositing', '画面合成'), live ? 1.5 : 0], [b('Runtime', '运行时'), 1]],
        basis: b('Rule of thumb. Hardware encoding (NVENC) needs little memory; throughput and the number of encode sessions matter more and are not estimated here. GeForce cards cap concurrent encode sessions.', '经验值。硬件编码（NVENC）占显存很少，真正限制的是吞吐量和同时编码路数，这里不估算。GeForce 卡限制同时编码的路数。'),
        label: `${live ? 'Live' : 'File'} · ${res[a.res]} ${a.codec.toUpperCase()}${ai ? ' + AI' : ''} × ${a.ch}`,
      };
    },
  },
  data: {
    name: b('Data science & notebooks', '数据科学与 Notebook'), req: noKepler('CUDA 12 frameworks', 'CUDA 12 框架'), img: 'wl-data', stack: 'Jupyter · PyTorch · RAPIDS cuDF',
    q: b('Notebooks for analysis, AI development or a class', '数据分析、AI 开发或教学用的 Notebook'),
    fields: [{ k: 'data', label: b('How much data do you work with?', '数据量多大？'), ns: 4, opts: [[1, b('Small — spreadsheets, under a million rows', '小 — 表格，百万行以内')], [4, b('Medium — tens of millions of rows', '中 — 几千万行')], [12, b('Large — hundreds of millions of rows', '大 — 几亿行')]] }],
    def: { data: 4 },
    need(a) {
      return {
        parts: [[b('Data + working copies', '数据和工作副本'), a.data * 2], [b('Notebook session', 'Notebook 会话'), 1], [b('Runtime', '运行时'), 1]],
        basis: b('Rule of thumb: dataframe operations need about twice the data in GPU memory. RAPIDS requires Volta or newer. To give each student an isolated slice, require MIG in step 3.', '经验值：数据表运算约需数据量两倍的显存。RAPIDS 需要 Volta 或更新的架构。要给每个学生一份隔离的资源，在第 3 步打开 MIG。'),
        label: `${{ 1: 'Small', 4: 'Medium', 12: 'Large' }[a.data]} dataset`,
      };
    },
  },
  bio: {
    name: b('Life sciences', '生命科学'), img: 'wl-bio', stack: 'AlphaFold · GROMACS · Parabricks',
    q: b('Protein structures, molecular simulation, DNA / RNA analysis', '蛋白结构、分子模拟、DNA / RNA 分析'),
    req: (g, a) => (g.arch === 'Kepler' ? b('Kepler is not supported by current life-science GPU builds', '当前的生命科学软件已不支持 Kepler') : a.task === 'genome' && g.arch === 'Pascal' ? b('Parabricks needs Volta or newer', 'Parabricks 需要 Volta 或更新的架构') : a.task === 'genome' && g.vram < 16 ? b('Parabricks needs at least 16 GB per GPU', 'Parabricks 每张卡至少需要 16 GB') : null),
    fields: [{ k: 'task', label: b('What are you working on?', '做什么研究？'), ns: 'foldl', opts: [['fold', b('Protein structures — typical proteins', '蛋白结构 — 普通蛋白')], ['foldl', b('Protein structures — large proteins or complexes', '蛋白结构 — 大蛋白或复合物')], ['md', b('Molecular simulation (GROMACS / AMBER)', '分子模拟（GROMACS / AMBER）')], ['genome', b('DNA / RNA sequencing analysis (Parabricks)', 'DNA / RNA 测序分析（Parabricks）')]] }],
    def: { task: 'fold' },
    need(a) {
      const t = { fold: [20, b('Model + structure features', '模型和结构特征')], foldl: [60, b('Model + structure features', '模型和结构特征')], md: [4, b('System + neighbour lists', '体系和邻居列表')], genome: [14, b('Pipeline working memory', '流程工作内存')] }[a.task];
      return {
        parts: [[t[1], t[0]], [b('Runtime', '运行时'), 1]],
        basis: b('Rule of thumb: structure-prediction memory grows steeply with sequence length; molecular dynamics fits easily; Parabricks needs Volta or newer with at least 16 GB (NVIDIA documentation).', '经验值：结构预测的显存随序列长度急剧增长；分子动力学占用很小；Parabricks 需要 Volta 或更新、至少 16 GB 的卡（NVIDIA 文档）。'),
        label: { fold: 'Protein · typical', foldl: 'Protein · large', md: 'Molecular dynamics', genome: 'Genomics' }[a.task],
      };
    },
  },
  robot: {
    name: b('Robotics & self-driving sim', '机器人与自动驾驶仿真'), req: (g) => (!g.gfx ? b('RTX rendering needed for sensor simulation', '传感器仿真需要 RTX 渲染') : null), img: 'wl-robot', stack: 'ROS 2 · Isaac Sim · CARLA',
    q: b('Simulate robots or self-driving cars before the real thing', '在上真机之前仿真机器人或自动驾驶'),
    fields: [
      { k: 'scene', label: b('What are you simulating?', '仿真什么？'), ns: 'medium', opts: [['light', b('A single robot or arm', '单个机器人或机械臂')], ['medium', b('A warehouse or factory with sensors', '带传感器的仓库或工厂')], ['heavy', b('City driving, many cameras and lidar', '城市驾驶，多摄像头和激光雷达')]] },
      { k: 'envs', label: b('Do you train robots by running many simulations at once?', '是否同时跑很多份仿真来训练？'), ns: 16, opts: [[1, b('No — one simulation', '不是 — 只跑一份')], [16, b('Yes — about 16 copies', '是 — 约 16 份')], [64, b('Yes — 64 or more (reinforcement learning)', '是 — 64 份以上（强化学习）')]] },
    ],
    def: { scene: 'medium', envs: 16 },
    need(a) {
      const s = { light: 10, medium: 20, heavy: 36 }[a.scene], e = { 1: 0, 16: 4, 64: 12 }[a.envs];
      return {
        parts: [[b('Scene + renderer', '场景和渲染器'), s], [b('Parallel envs', '并行环境'), e], [b('Runtime', '运行时'), 1.5]],
        basis: b('Rule of thumb for RTX-rendered simulators. Ray-traced sensors and large assets can exceed these values.', 'RTX 渲染仿真器的经验值。光追传感器和大型资源可能超出这个数。'),
        label: `${a.scene} · ${a.envs} envs`,
      };
    },
  },
  hpc: {
    name: b('Scientific computing', '科学计算'), img: 'wl-hpc', stack: 'CUDA · OpenFOAM · LAMMPS · WRF',
    q: b('Simulation and number crunching: CFD, weather, physics', '数值仿真：流体、气象、物理'),
    req: (g, a) => (a.prec === 'fp64' && !(g.fp64 >= 2) ? b('Needs high FP64 throughput (data center GPU)', '需要高 FP64 算力（数据中心卡）') : null),
    fields: [
      { k: 'prec', label: b('Does your code need double precision (FP64)?', '程序需要双精度（FP64）吗？'), ns: 'fp64', opts: [['fp64', b('Yes — e.g. CFD, structural or physics solvers', '需要 — 如流体、结构或物理求解器')], ['mixed', b('No — single / mixed precision is fine', '不需要 — 单精度 / 混合精度即可')]] },
      { k: 'data', label: b('How big is the simulation?', '仿真规模多大？'), ns: 32, opts: [[8, b('Small — about 5 million cells or particles', '小 — 约 500 万网格或粒子')], [16, b('Medium — about 10 million', '中 — 约 1000 万')], [32, b('Large — about 20 million', '大 — 约 2000 万')], [64, b('Very large — 40 million or more', '很大 — 4000 万以上')]] },
    ],
    def: { prec: 'fp64', data: 16 },
    need(a) {
      return {
        parts: [[b('Working set', '工作数据'), +a.data], [b('Solver workspace', '求解器工作区'), +a.data * 0.15], [b('Runtime', '运行时'), 1]],
        basis: b('Rule of thumb: about 1.5 GB per million cells or particles. FP64 rates: H100 PCIe 26 TFLOPS, A100 9.7, V100 7, P100 4.7, K80 2.91 (datasheets).', '经验值：每百万网格或粒子约 1.5 GB。FP64 算力：H100 PCIe 26 TFLOPS，A100 9.7，V100 7，P100 4.7，K80 2.91（规格书）。'),
        label: `${a.prec === 'fp64' ? 'FP64' : 'Mixed'} · ${a.data} GB`,
      };
    },
  },
};

/* "Not sure" on every question: add the option and resolve it before sizing and requirement checks */
Object.values(WL).forEach((w) => {
  w.fields.forEach((f) => f.opts.push(['?', b('Not sure — use a safe default', '不确定 — 用稳妥的默认值')]));
  const Rz = (a) => { const r = { ...a }; w.fields.forEach((f) => { if (r[f.k] === '?') r[f.k] = f.ns; }); return r; };
  const n0 = w.need, r0 = w.req;
  w.need = (a) => n0(Rz(a));
  if (r0) w.req = (g, a) => r0(g, Rz(a || w.def));
});
export const WL_ORDER = ['llm', 'img', 'vgen', 'speech', 'train', 'cv', 'render', 'game', 'cad', 'video', 'data', 'bio', 'robot', 'hpc'];

export function need(wl, a) {
  const r = WL[wl].need(a);
  r.parts = r.parts.filter((p) => p[1] > 0);
  r.total = r.parts.reduce((s, p) => s + p[1], 0);
  return r;
}

/* Rule-based recommendation; S = advisor state */
export function recommend(S) {
  const n = need(S.wl, S.a[S.wl]), T = n.total;
  const rq = WL[S.wl].req || (() => null);
  const fit = GPUS.filter((g) => (!S.ecc || g.ecc) && (!S.mig || g.mig) && !rq(g, S.a[S.wl]))
    .map((g) => { const count = Math.max(1, Math.ceil(T / (g.vram * 0.95))); return { g, count, cap: g.vram * count, head: g.vram * count - T }; })
    .filter((x) => (S.multi === 'yes' ? x.count <= 8 : x.count === 1));
  const score = { cost: (x) => x.count * 100 + x.g.tier * 10 + x.g.vram / 100, bal: (x) => x.count * 100 + (x.head / x.cap < 0.15 ? 50 : 0) + x.g.tier * 6 + x.g.vram / 20, head: (x) => x.count * 100 - x.cap }[S.pri];
  const pos = (x) => (x.g.use.includes(S.wl) ? 0 : 10);
  fit.sort((a, c) => score(a) + pos(a) - score(c) - pos(c) || c.g.bw - a.g.bw);
  return { n, fit };
}

export function reasonsFor(x, n, S) {
  const g = x.g, Rr = [], Ll = [], pct = Math.round(x.head / x.cap * 100), cnt = x.count > 1 ? x.count + ' × ' : '';
  Rr.push(R(`${cnt}${g.vram} GB covers the ${f1(n.total)} GB estimate with ${f1(x.head)} GB (${pct}%) headroom.`, `${cnt}${g.vram} GB 装得下 ${f1(n.total)} GB 的估算，还余 ${f1(x.head)} GB（${pct}%）。`));
  if (S.pri === 'cost') Rr.push(R('The lowest product class that fits this estimate.', '装得下的最低一档产品。'));
  if (S.pri === 'bal') Rr.push(R('Smallest card that leaves at least 15% headroom.', '留出至少 15% 余量的最小一张卡。'));
  if (S.pri === 'head') Rr.push(R('Largest memory pool among the matches.', '符合条件的卡里显存最大。'));
  if (g.bw >= 1700 && S.wl === 'llm') Rr.push(R(`${fmt(g.bw)} GB/s memory bandwidth — token generation is usually bandwidth-bound.`, `${fmt(g.bw)} GB/s 显存带宽 — 生成速度通常受带宽限制。`));
  if (g.ecc) Rr.push(R('ECC memory for long-running production jobs.', 'ECC 显存，适合长时间运行的生产任务。'));
  if (S.mig && MIG[g.id]) Rr.push(R(`MIG splits it into up to ${MIG[g.id][0]} isolated slices of ${MIG[g.id][1]} GB each.`, `MIG 最多切成 ${MIG[g.id][0]} 份互相隔离的 ${MIG[g.id][1]} GB。`));
  if (g.dual) Rr.push(R('Dual-GPU board: two GPUs with 12 GB each; the estimate is per GPU.', '双芯卡：两颗 GPU 各 12 GB，估算按单颗计。'));
  if (pct < 15) Ll.push(R('Under 15% headroom — longer context or more users may not fit.', '余量不到 15% — 更长的对话或更多用户可能装不下。'));
  if (!g.ecc) Ll.push(R('No ECC memory; consumer card not designed for 24/7 duty.', '没有 ECC 显存；消费级卡不是为 7×24 运行设计的。'));
  if (g.cool === 'Passive') Ll.push(R('Passive cooling — needs a server chassis with directed airflow.', '被动散热 — 需要有定向风道的服务器机箱。'));
  if (x.count > 1) Ll.push(g.nvlink ? R('Multi-GPU: NVLink bridge available; otherwise traffic goes over PCIe.', '多卡：可用 NVLink 桥接，否则走 PCIe。') : R('Multi-GPU over PCIe only (no NVLink).', '多卡只能走 PCIe（没有 NVLink）。'));
  if (S.wl === 'video' && g.tier === 1) Ll.push(R('GeForce cards limit concurrent NVENC encode sessions.', 'GeForce 卡限制同时编码的路数。'));
  if ((S.wl === 'render' || S.wl === 'game') && !g.rt) Ll.push(R('No RT cores — ray tracing is much slower.', '没有 RT 核心 — 光追会慢很多。'));
  if (S.wl === 'cad' && g.tier === 1) Ll.push(R('GeForce drivers are not ISV-certified for CAD.', 'GeForce 驱动没有 CAD 软件认证。'));
  if (!g.use.includes(S.wl)) Ll.push(R(`DBM does not list the ${g.name} as a typical card for this workload.`, `DBM 没有把 ${g.name} 列为这类工作的常用卡。`));
  return { R: Rr, L: Ll };
}

/* Fixed reference workloads shown on GPU detail pages */
export const SCEN = [
  { t: 'Llama 3.1 8B', s: 'FP16 · 8K × 4', wl: 'llm', a: { model: 'llama-8b', prec: 'fp16', ctx: 8192, conc: 4, rag: 'no' } },
  { t: 'Qwen2.5 32B', s: 'INT4 · 8K × 4', wl: 'llm', a: { model: 'qwen-32b', prec: 'int4', ctx: 8192, conc: 4, rag: 'no' } },
  { t: 'FLUX.1 [dev]', s: 'FP16 · 1024px', wl: 'img', a: { model: 'flux16', res: 1024, batch: 1 } },
  { t: b('3D rendering', '3D 渲染'), s: '4K', wl: 'render', a: { scene: 'l', res: '2160' } },
  { t: b('Gaming', '游戏'), s: '1440p · high', wl: 'game', a: { res: '1440', q: 'high', s: 1 } },
  { t: b('Live streaming', '直播'), s: '4K · AV1', wl: 'video', a: { out: 'live', res: '2160', codec: 'av1', ai: 'no', ch: 1 } },
  { t: b('Scientific computing', '科学计算'), s: 'FP64 · 16 GB', wl: 'hpc', a: { prec: 'fp64', data: 16 } },
];

/* Fit of one GPU for one reference workload: {why} when blocked, else {spare} or {gpus} */
export function fitOf(g, sc) {
  const why = (WL[sc.wl].req || (() => null))(g, sc.a);
  if (why) return { why };
  const T = need(sc.wl, sc.a).total, h = g.vram - T;
  return h >= 0 ? { spare: h } : { gpus: Math.ceil(T / (g.vram * 0.95)) };
}
