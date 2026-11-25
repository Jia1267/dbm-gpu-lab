/* Scenario guides for the remaining workloads. Test data comes from published sources in ext.js;
   each page lists its sources. Plan prices are the same list prices used on the first three guides. */
import { EXT, FACTS } from './ext.js';
import PRICES from './prices.json';
const b = (en, zh) => ({ en, zh });
const GM = 'https://www.gpu-mart.com/';
const VPS = b('GPU VPS', 'GPU 云服务器'), DED = b('Dedicated', '独立服务器');
/* Plan prices live only in prices.json (with source page and date checked) */
export const SPEC = Object.fromEntries(Object.entries(PRICES.plans).map(([id, p]) => [id, [p.type === 'vps' ? VPS : DED, p.usd, b(...p.spec)]]));
export const usd = (id) => PRICES.plans[id].usd;
export const P = (id, fit) => [id, ...SPEC[id], fit];
const S = (k) => [EXT[k].src.url, EXT[k].src.label];
const F = (k) => [FACTS[k].url, FACTS[k].label];
const COLS = [b('Workload', '工作'), b('GPU memory', '显存'), b('Start with', '推荐起步')];

export const SCENARIOS2 = [
  {
    id: 'img', img: 'wl-img', wl: 'img',
    name: b('AI image generation', 'AI 生图'),
    tagline: b('Run FLUX, SDXL and ComfyUI workflows on your own GPU, with no per-image fees.', '在自己的 GPU 上跑 FLUX、SDXL 和 ComfyUI 工作流，不按张收费。'),
    kpis: [['75', b('images/min · SD 1.5 on RTX 4090', '张/分钟 · RTX 4090 跑 SD 1.5')], ['0.98', b('images/s · SDXL on H100', '张/秒 · H100 跑 SDXL')], ['0.20', b('images/s · FLUX on RTX PRO 6000', '张/秒 · RTX PRO 6000 跑 FLUX')]],
    how: {
      flow: [[b('Prompt', '提示词'), b('A text encoder turns the prompt into numbers the model reads.', '文本编码器把提示词变成模型能读的向量。')], [b('Denoise', '去噪'), b('The model refines noise over 20–50 steps. Time grows with steps and resolution.', '模型用 20–50 步把噪声逐步变成图像，步数和分辨率越高越慢。')], [b('Decode', '解码'), b('A VAE turns the result into pixels.', 'VAE 把结果还原成像素。')]],
      cards: [
        [b('Memory sets the model', '显存决定能跑哪个模型'), b('SD 1.5 and SDXL run in 8–12 GB. FLUX (12B) needs about 24 GB at FP16, roughly half at FP8.', 'SD 1.5 和 SDXL 8–12 GB 就能跑。FLUX（12B）FP16 约需 24 GB，FP8 约一半。')],
        [b('Tensor cores set speed', 'Tensor 核心决定速度'), b('Throughput tracks FP16/FP8 tensor performance more than memory bandwidth.', '出图速度主要看 FP16/FP8 张量算力，而不是显存带宽。')],
        [b('Batch for throughput', '批量提高吞吐'), b('Several images at once use the GPU better, if memory allows.', '显存够的话，一次出多张更能吃满 GPU。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('SD 1.5 / SDXL, personal use', 'SD 1.5 / SDXL，个人使用'), '8–12 GB', ['rtx-5060', 'rtx-4060', 'rtx-3060-ti']],
        [b('FLUX at FP8, ComfyUI pipelines', 'FLUX FP8、ComfyUI 工作流'), '16–24 GB', ['rtx-pro-4000', 'rtx-4090', 'rtx-a5000']],
        [b('FLUX at FP16, LoRA training', 'FLUX FP16、训练 LoRA'), '32–48 GB', ['rtx-5090', 'rtx-a6000', 'rtx-pro-5000']],
        [b('Image API for many users', '多用户生图 API'), '96 GB+', ['rtx-pro-6000', 'h100-pcie']],
      ],
      plans: [P('rtx-5060', b('SDXL for one user', '单人跑 SDXL')), P('rtx-pro-4000', b('FLUX FP8 in ComfyUI', 'ComfyUI 跑 FLUX FP8')), P('rtx-5090', b('FLUX FP16 and LoRA', 'FLUX FP16 和 LoRA')), P('rtx-pro-6000', b('Production image API', '生产级生图 API'))],
      src: GM,
    },
    test: {
      kind: 'ext', charts: ['nvimg'],
      items: [{ t: b('Stable Diffusion 1.5 on RTX 4090', 'RTX 4090 跑 Stable Diffusion 1.5'), gpu: 'rtx-4090', setup: 'A1111 + TensorRT · 50 steps · Euler a', res: [b('75 images/min at 512 px', '512 px 每分钟 75 张'), b('13.4 images/min at 1024 px', '1024 px 每分钟 13.4 张')], note: b('Tested December 2023 with the drivers of the time.', '2023 年 12 月测试，使用当时的驱动。'), src: FACTS.toms }],
    },
    faq: [
      [b('Can I run FLUX on 8 GB?', '8 GB 能跑 FLUX 吗？'), b('Only with heavy quantization and offloading, and slowly. Plan 16–24 GB for comfortable use.', '要大幅量化并把部分模型放到内存，速度很慢。想顺畅用建议 16–24 GB。')],
      [b('Can I sell the images?', '生成的图能商用吗？'), b('It depends on the model licence. FLUX.1 [schnell] is Apache 2.0; FLUX.1 [dev] is non-commercial. Check each model.', '看模型许可证。FLUX.1 [schnell] 是 Apache 2.0；FLUX.1 [dev] 不可商用。每个模型都要单独确认。')],
      [b('Does more memory make it faster?', '显存越大越快吗？'), b('No. Memory decides what fits; tensor performance decides speed.', '不会。显存决定装不装得下，张量算力决定快慢。')],
    ],
    sources: [S('nvimg'), F('toms')],
  },
  {
    id: 'vgen', img: 'wl-vgen', wl: 'vgen',
    name: b('AI video generation', 'AI 视频生成'),
    tagline: b('Text-to-video and image-to-video with open models like Wan and LTX-Video.', '用 Wan、LTX-Video 等开源模型做文生视频和图生视频。'),
    kpis: [['8.19 GB', b('memory · Wan2.1 1.3B at 480p', '显存 · Wan2.1 1.3B 480p')], ['~4 min', b('5 s 480p clip on RTX 4090', 'RTX 4090 生成 5 秒 480p')], ['3.76', b('videos/min · SVD on H100', '段/分钟 · H100 跑 SVD')]],
    how: {
      flow: [[b('Prompt or image', '提示词或图片'), b('The model reads text and an optional first frame.', '模型读取文字，以及可选的首帧图片。')], [b('Denoise frames', '逐帧去噪'), b('All frames are generated together; memory grows with frames × resolution.', '所有帧一起生成，显存随帧数 × 分辨率增长。')], [b('Decode', '解码'), b('A video VAE turns the result into frames.', '视频 VAE 把结果还原成画面。')]],
      cards: [
        [b('Model size sets the GPU', '模型大小决定显卡'), b('Wan2.2 5B runs 720p on a 24 GB card; the 14B models need 80 GB on a single GPU.', 'Wan2.2 5B 在 24 GB 卡上能跑 720p；14B 模型单卡需要 80 GB。')],
        [b('Offloading trades time for memory', '卸载用时间换显存'), b('Moving parts of the model to system RAM lets smaller cards run big models, much more slowly.', '把部分模型放到内存，小显存也能跑大模型，但会慢很多。')],
        [b('Minutes, not seconds', '按分钟算，不是按秒'), b('A few seconds of video takes minutes. Plan for queues, not live use.', '几秒视频要几分钟生成，适合排队处理，不适合实时。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('Short 480p clips, 1.3B–5B models', '480p 短片，1.3B–5B 模型'), '24 GB', ['rtx-4090', 'rtx-pro-4000', 'rtx-a5000']],
        [b('720p with 5B, or 14B with offloading', '5B 跑 720p，或 14B 加卸载'), '32–48 GB', ['rtx-5090', 'rtx-a6000', 'rtx-pro-5000']],
        [b('14B models at full speed', '14B 模型全速'), '80–96 GB', ['rtx-pro-6000', 'h100-pcie', 'a100-80']],
      ],
      plans: [P('rtx-pro-4000', b('Wan2.2 5B experiments', 'Wan2.2 5B 试验')), P('rtx-5090', b('720p with the 5B model', '5B 模型 720p')), P('rtx-pro-6000', b('14B models on one GPU', '单卡跑 14B 模型')), P('h100-pcie', b('Fastest single-GPU option', '最快的单卡方案'))],
      src: GM,
    },
    test: {
      kind: 'ext', charts: ['nvimg'],
      items: [
        { t: b('Wan2.1 1.3B, text to video', 'Wan2.1 1.3B 文生视频'), gpu: 'rtx-4090', setup: '480p · 5 s · no quantization', res: [b('8.19 GB memory', '显存 8.19 GB'), b('About 4 minutes', '约 4 分钟')], src: FACTS.wan21 },
        { t: b('Wan2.2 TI2V-5B, 720p', 'Wan2.2 TI2V-5B 720p'), gpuName: 'RTX 4090 class (24 GB)', setup: '1280×704 · 24 fps · 5 s', res: [b('Under 9 minutes', '9 分钟以内'), b('Needs 24 GB+', '需要 24 GB 以上')], src: FACTS.wan22 },
        { t: b('Wan2.2 A14B on one GPU', 'Wan2.2 A14B 单卡'), gpuName: '80 GB GPU', setup: 'T2V / I2V A14B · offload on', res: [b('Needs 80 GB on one GPU', '单卡需要 80 GB')], note: b('Multi-GPU runs split the model across cards.', '多卡运行会把模型拆到多张卡上。'), src: FACTS.wan22 },
      ],
    },
    faq: [
      [b('Can a 24 GB card run Wan 14B?', '24 GB 显卡能跑 Wan 14B 吗？'), b('Only with offloading and quantization, and slowly. The official single-GPU setup asks for 80 GB.', '要靠卸载和量化，速度很慢。官方单卡配置要求 80 GB。')],
      [b('How long does a clip take?', '一段视频要多久？'), b('Minutes per few seconds of video, depending on model, resolution and steps.', '几秒视频要几分钟，取决于模型、分辨率和步数。')],
      [b('Several GPUs?', '能用多张卡吗？'), b('Yes. Wan supports multi-GPU inference, which cuts time per clip.', '可以。Wan 支持多卡推理，能缩短每段的生成时间。')],
    ],
    sources: [F('wan21'), F('wan22'), S('nvimg')],
  },
  {
    id: 'speech', img: 'wl-speech', wl: 'speech',
    name: b('Speech AI', '语音 AI'),
    tagline: b('Transcription, voice agents and text-to-speech with Whisper and open TTS models.', '用 Whisper 和开源 TTS 模型做转写、语音智能体和语音合成。'),
    kpis: [['17 s', b('13 min of audio · faster-whisper, batched', '13 分钟音频 · faster-whisper 批量')], ['8×', b('faster than the reference Whisper', '比原版 Whisper 快')], ['2.9 GB', b('memory · Whisper large-v2 int8', '显存 · Whisper large-v2 int8')]],
    how: {
      flow: [[b('Speech to text', '语音转文字'), b('Whisper or a similar model transcribes the audio.', 'Whisper 等模型把音频转成文字。')], [b('Understand', '理解'), b('An LLM answers or summarises (voice agents only).', '大模型回答或总结（仅语音智能体需要）。')], [b('Text to speech', '文字转语音'), b('A TTS model speaks the reply.', 'TTS 模型把回复读出来。')]],
      cards: [
        [b('Batch for throughput', '批量提高吞吐'), b('Batching cut 13 minutes of audio from 63 s to 17 s on the same GPU.', '在同一张卡上，批量处理把 13 分钟音频的耗时从 63 秒降到 17 秒。')],
        [b('int8 halves memory', 'int8 省一半显存'), b('Accuracy stays close; you can fit more workers per GPU.', '精度变化不大，一张卡能放更多实例。')],
        [b('Agents need low latency', '智能体要低延迟'), b('ASR, LLM and TTS on one GPU avoids network hops.', 'ASR、大模型和 TTS 放在同一张卡上，省掉网络往返。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('Batch transcription', '批量转写'), '8–16 GB', ['rtx-5060', 'rtx-4060', 'rtx-a4000']],
        [b('Voice agent: ASR + LLM + TTS', '语音智能体：ASR + 大模型 + TTS'), '24–48 GB', ['rtx-pro-4000', 'rtx-5090', 'rtx-a6000']],
        [b('Call-centre scale', '呼叫中心规模'), '48–96 GB', ['rtx-pro-5000', 'rtx-pro-6000']],
      ],
      plans: [P('rtx-5060', b('Whisper transcription', 'Whisper 转写')), P('rtx-pro-4000', b('Small voice agent', '小型语音智能体')), P('rtx-5090', b('Agent with a 14B–27B LLM', '搭配 14B–27B 大模型的智能体'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['whisper'], items: [] },
    faq: [
      [b('Which Whisper should I use?', '用哪个 Whisper？'), b('faster-whisper with batching for throughput; large-v3 or turbo for accuracy.', '要吞吐用 faster-whisper 批量模式；要精度用 large-v3 或 turbo。')],
      [b('Does it need a big GPU?', '需要大显卡吗？'), b('No. Whisper large fits in 3–5 GB. The LLM in a voice agent is what needs memory.', '不需要。Whisper large 只占 3–5 GB，语音智能体里真正吃显存的是大模型。')],
      [b('Real time?', '能实时吗？'), b('Yes. Even an 8 GB card transcribes many times faster than real time.', '能。即使 8 GB 显卡，转写速度也是实时的很多倍。')],
    ],
    sources: [S('whisper')],
  },
  {
    id: 'train', img: 'wl-train', wl: 'train',
    name: b('Training & fine-tuning', '训练与微调'),
    tagline: b('Fine-tune open models with LoRA, or train your own, on dedicated GPUs.', '用 LoRA 微调开源模型，或在独享 GPU 上训练自己的模型。'),
    kpis: [['1,866', b('img/s · ResNet-50 on H100 PCIe', '张/秒 · H100 PCIe 跑 ResNet-50')], ['2.0×', b('H100 PCIe vs RTX A6000', 'H100 PCIe 对比 RTX A6000')], ['1,301', b('img/s · RTX 4090', '张/秒 · RTX 4090')]],
    how: {
      flow: [[b('Weights', '权重'), b('2 bytes per parameter at FP16.', 'FP16 每个参数 2 字节。')], [b('Gradients + optimizer', '梯度 + 优化器'), b('Full fine-tuning with Adam adds about 14 bytes per parameter more.', '用 Adam 全量微调，每个参数还要再加约 14 字节。')], [b('Activations', '激活值'), b('Grow with batch size and sequence length.', '随批量和序列长度增长。')]],
      cards: [
        [b('LoRA changes the maths', 'LoRA 大幅省显存'), b('Only small adapters are trained. QLoRA also stores the base model in 4-bit.', '只训练很小的适配层。QLoRA 还把底座模型存成 4-bit。')],
        [b('Tensor cores and bandwidth', 'Tensor 核心和带宽'), b('Training is compute-heavy; data-centre GPUs pull ahead at scale.', '训练很吃算力，规模越大数据中心卡优势越明显。')],
        [b('Multi-GPU for big models', '大模型要多卡'), b('Full fine-tuning above ~7B usually needs several 80 GB GPUs.', '7B 以上全量微调通常要多张 80 GB 卡。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('QLoRA on 7B–8B models', '7B–8B 模型 QLoRA'), '16–24 GB', ['rtx-4090', 'rtx-pro-4000', 'rtx-a5000']],
        [b('LoRA on 14B–32B, small full fine-tunes', '14B–32B LoRA、小模型全量微调'), '48 GB', ['rtx-a6000', 'rtx-pro-5000', 'a40']],
        [b('Full fine-tuning 7B+, pre-training', '7B 以上全量微调、预训练'), '80 GB+ × N', ['h100-pcie', 'a100-80', 'rtx-pro-6000']],
      ],
      plans: [P('rtx-pro-4000', b('QLoRA on 8B models', '8B 模型 QLoRA')), P('rtx-a6000', b('LoRA up to ~32B', '最大约 32B 的 LoRA')), P('rtx-pro-6000', b('96 GB for bigger runs', '96 GB 跑更大任务')), P('h100-pcie', b('Fastest per-GPU training', '单卡训练最快'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['lambda'], items: [] },
    faq: [
      [b('LoRA or full fine-tuning?', 'LoRA 还是全量微调？'), b('Start with LoRA. It needs a fraction of the memory and usually gets close in quality.', '先用 LoRA。显存只要一小部分，效果通常接近。')],
      [b('Do consumer GPUs work?', '消费级显卡能训练吗？'), b('Yes for LoRA and small models. RTX 4090 reached 85% of an A100 80GB on ResNet-50 in Lambda tests.', '做 LoRA 和小模型可以。Lambda 测试中 RTX 4090 跑 ResNet-50 达到 A100 80GB 的 85%。')],
      [b('How long will training take?', '训练要多久？'), b('Run a short job and multiply by steps; throughput is steady once warmed up.', '先跑一小段，再按总步数推算；预热后吞吐比较稳定。')],
    ],
    sources: [S('lambda')],
  },
  {
    id: 'cv', img: 'wl-cv', wl: 'cv',
    name: b('Computer vision', '计算机视觉'),
    tagline: b('Detection, tracking and video analytics for cameras, factories and retail.', '摄像头、工厂、零售场景的检测、跟踪和视频分析。'),
    kpis: [['1.5 ms', b('YOLO11n per image on T4', 'T4 上 YOLO11n 每张')], ['1,899', b('FPS · PeopleNet on RTX PRO 6000', 'FPS · RTX PRO 6000 跑 PeopleNet')], ['~63', b('1080p30 cameras at that rate', '按此速率约可接 1080p30 摄像头')]],
    how: {
      flow: [[b('Decode', '解码'), b('NVDEC decodes camera streams on the GPU.', 'NVDEC 在 GPU 上解码摄像头视频流。')], [b('Infer', '推理'), b('TensorRT runs the detector on each frame.', 'TensorRT 对每一帧做检测。')], [b('Track and act', '跟踪与输出'), b('A tracker links detections; results go to alerts or a database.', '跟踪器把检测结果串起来，再输出到告警或数据库。')]],
      cards: [
        [b('Count frames, not cameras', '按帧数算，不按摄像头算'), b('Total FPS ÷ camera frame rate ≈ cameras per GPU.', '总 FPS ÷ 摄像头帧率 ≈ 一张卡能接的路数。')],
        [b('TensorRT matters', 'TensorRT 很关键'), b('Exporting to TensorRT is often several times faster than plain PyTorch.', '导出成 TensorRT 通常比直接用 PyTorch 快好几倍。')],
        [b('Model size is a dial', '模型大小可以调'), b('YOLO11x is 7× slower than 11n for +15 mAP.', 'YOLO11x 比 11n 慢 7 倍，换来 15 点 mAP。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('A few cameras, prototypes', '少量摄像头、原型'), '8–16 GB', ['rtx-4060', 'rtx-5060', 'rtx-a4000']],
        [b('Dozens of streams', '几十路视频流'), '24–32 GB', ['rtx-pro-4000', 'rtx-a5000', 'rtx-5090']],
        [b('Training detectors, big models', '训练检测模型、大模型'), '48–96 GB', ['rtx-a6000', 'rtx-pro-6000']],
      ],
      plans: [P('rtx-5060', b('Prototype pipeline', '原型流水线')), P('rtx-pro-4000', b('Multi-camera analytics', '多路视频分析')), P('rtx-pro-6000', b('Large deployments', '大规模部署'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['deepstream', 'yolo'], items: [] },
    faq: [
      [b('How many cameras per GPU?', '一张卡能接多少路摄像头？'), b('Divide total FPS for your model by the camera frame rate, then leave headroom for decode.', '用模型的总 FPS 除以摄像头帧率，再给解码留出余量。')],
      [b('Do I need a data-centre GPU?', '一定要数据中心卡吗？'), b('No. RTX cards run TensorRT well and include video decoders.', '不用。RTX 显卡跑 TensorRT 很好，还自带视频解码器。')],
      [b('Edge or cloud?', '边缘还是云端？'), b('Cloud when you have many streams in one place and good uplinks; edge when bandwidth is tight.', '视频流集中、上行带宽好就放云端；带宽紧张就放边缘。')],
    ],
    sources: [S('deepstream'), S('yolo')],
  },
  {
    id: 'render', img: 'wl-render', wl: 'render',
    name: b('3D rendering', '3D 渲染'),
    tagline: b('GPU rendering for Blender Cycles, V-Ray, Octane and Redshift.', 'Blender Cycles、V-Ray、Octane、Redshift 的 GPU 渲染。'),
    kpis: [['14,263', b('Blender score · RTX 5090', 'Blender 分 · RTX 5090')], ['1.3×', b('RTX 5090 vs RTX 4090', 'RTX 5090 对比 RTX 4090')], ['2.9×', b('RTX 5090 vs RTX A6000', 'RTX 5090 对比 RTX A6000')]],
    how: {
      flow: [[b('Load the scene', '加载场景'), b('Geometry and textures must fit in GPU memory.', '模型和贴图要能放进显存。')], [b('Trace rays', '光线追踪'), b('RT cores speed up ray tests; CUDA cores shade.', 'RT 核心加速光线求交，CUDA 核心负责着色。')], [b('Denoise', '降噪'), b('An AI denoiser cleans up fewer samples.', 'AI 降噪器用更少的采样得到干净的画面。')]],
      cards: [
        [b('GeForce is fastest per dollar', 'GeForce 性价比最高'), b('RTX 5090 tops the Blender chart among cards with broad data.', '在数据充足的显卡里，RTX 5090 的 Blender 分最高。')],
        [b('Memory decides big scenes', '大场景看显存'), b('If a scene does not fit, it fails or falls back to slow out-of-core modes.', '场景放不下就会报错，或退到很慢的核外模式。')],
        [b('Scale out across GPUs', '多卡横向扩展'), b('Most renderers split frames across cards almost linearly.', '多数渲染器能把画面分到多张卡上，提速接近线性。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('Look-dev, small scenes', '材质预览、小场景'), '8–12 GB', ['rtx-5060', 'rtx-4060', 'rtx-3060-ti']],
        [b('Production frames', '正式出图'), '24–32 GB', ['rtx-5090', 'rtx-4090']],
        [b('Huge scenes, archviz', '超大场景、建筑可视化'), '48–96 GB', ['rtx-a6000', 'rtx-pro-6000', 'rtx-pro-5000']],
      ],
      plans: [P('rtx-5060', b('Look-dev and previews', '材质预览')), P('rtx-5090', b('Fastest frames per dollar', '单位成本出图最快')), P('rtx-pro-6000', b('96 GB for huge scenes', '96 GB 跑超大场景'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['blender', 'steelnomad'], items: [] },
    faq: [
      [b('GeForce or RTX PRO?', 'GeForce 还是 RTX PRO？'), b('GeForce for speed per dollar; RTX PRO when scenes need 48–96 GB or certified drivers.', '追求性价比选 GeForce；场景要 48–96 GB 或需要认证驱动选 RTX PRO。')],
      [b('Do A100 or H100 help?', 'A100 或 H100 有帮助吗？'), b('Not much. They lack RT cores, so they trail RTX cards in Blender.', '帮助不大。它们没有 RT 核心，Blender 分数不如 RTX 卡。')],
      [b('Render farm software?', '渲染农场软件？'), b('Use your renderer’s network rendering or a manager like Deadline or Flamenco.', '用渲染器自带的网络渲染，或 Deadline、Flamenco 等管理工具。')],
    ],
    sources: [S('blender'), S('steelnomad')],
  },
  {
    id: 'game', img: 'wl-game', wl: 'game',
    name: b('Gaming & cloud gaming', '游戏与云游戏'),
    tagline: b('Cloud gaming, game streaming and game-server rendering on GeForce-class GPUs.', '用 GeForce 级 GPU 做云游戏、游戏串流和服务器端渲染。'),
    kpis: [['14,636', b('3DMark Steel Nomad · RTX 5090', '3DMark Steel Nomad · RTX 5090')], ['3,178', b('RTX 5060', 'RTX 5060')], ['12', b('NVENC sessions on GeForce', 'GeForce 的 NVENC 并发路数')]],
    how: {
      flow: [[b('Render', '渲染'), b('The game runs on the server GPU.', '游戏在服务器 GPU 上运行。')], [b('Encode', '编码'), b('NVENC compresses each frame to H.264, HEVC or AV1.', 'NVENC 把每一帧压成 H.264、HEVC 或 AV1。')], [b('Stream', '串流'), b('Sunshine, Parsec or your own client delivers it to players.', 'Sunshine、Parsec 或自研客户端推给玩家。')]],
      cards: [
        [b('Frame rate needs headroom', '帧率要留余量'), b('Streaming adds encode time; aim above your target fps.', '串流会增加编码耗时，帧率目标要留余量。')],
        [b('AV1 saves bandwidth', 'AV1 省带宽'), b('RTX 40 and 50 series encode AV1 for better quality per Mbps.', 'RTX 40 和 50 系列支持 AV1 编码，同码率画质更好。')],
        [b('Sharing a GPU', '多人共用一张卡'), b('Several players per GPU needs virtualization; see the GPU sharing guide.', '一张卡给多个玩家需要虚拟化，见 GPU 共享方案。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('1080p, one player', '1080p，单人'), '8 GB', ['rtx-5060', 'rtx-4060', 'rtx-3060-ti']],
        [b('1440p–4K, high settings', '1440p–4K，高画质'), '24–32 GB', ['rtx-5090', 'rtx-4090']],
        [b('Several players per server', '一台服务器多个玩家'), '24–48 GB', ['rtx-a5000', 'rtx-a6000', 'rtx-5090']],
      ],
      plans: [P('rtx-5060', b('1080p cloud gaming', '1080p 云游戏')), P('rtx-5090', b('4K and high refresh', '4K 和高刷新率'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['steelnomad'], items: [] },
    faq: [
      [b('Will anti-cheat work in a VM?', '虚拟机里反作弊能用吗？'), b('Some anti-cheat systems block VMs. Check each title; a dedicated server avoids most issues.', '部分反作弊会拦截虚拟机，要逐个游戏确认；独立服务器能避开大部分问题。')],
      [b('How much bandwidth per player?', '每个玩家要多少带宽？'), b('Roughly 10–20 Mbps for 1080p60 and 25–50 Mbps for 4K, depending on codec.', '1080p60 约 10–20 Mbps，4K 约 25–50 Mbps，取决于编码格式。')],
      [b('Where are the servers?', '服务器在哪里？'), b('Pick the data centre nearest your players; latency matters more than GPU speed.', '选离玩家最近的机房，延迟比显卡速度更重要。')],
    ],
    sources: [S('steelnomad'), ['https://developer.nvidia.com/video-encode-and-decode-gpu-support-matrix-new', 'NVIDIA · NVENC matrix']],
  },
  {
    id: 'cad', img: 'wl-cad', wl: 'cad',
    name: b('Remote workstation & CAD', '远程工作站与 CAD'),
    tagline: b('Cloud desktops for SOLIDWORKS, Revit, CATIA and Maya with workstation GPUs.', '用工作站 GPU 搭建跑 SOLIDWORKS、Revit、CATIA、Maya 的云桌面。'),
    kpis: [['372.6', b('SPECviewperf SOLIDWORKS · RTX A6000', 'SPECviewperf SOLIDWORKS · RTX A6000')], ['313.3', b('RTX A5000', 'RTX A5000')], ['∞', b('NVENC sessions on RTX PRO cards', 'RTX PRO 的 NVENC 路数不限')]],
    how: {
      flow: [[b('App on the server', '软件在服务器上'), b('CAD runs on a Windows VM with a workstation GPU.', 'CAD 软件跑在带工作站 GPU 的 Windows 虚拟机里。')], [b('Encode the screen', '编码屏幕'), b('The GPU encodes the desktop in real time.', 'GPU 实时编码桌面画面。')], [b('Remote client', '远程客户端'), b('Users connect with RDP, Parsec, HP Anyware or similar.', '用户用 RDP、Parsec、HP Anyware 等连接。')]],
      cards: [
        [b('Certified drivers', '认证驱动'), b('Vendors certify RTX PRO / RTX A cards; GeForce often works but is not supported.', '软件厂商认证的是 RTX PRO / RTX A 系列；GeForce 往往能用，但不在支持范围。')],
        [b('Viewport, not render', '看视口，不看渲染'), b('Modelling speed tracks viewport benchmarks like SPECviewperf.', '建模流畅度看 SPECviewperf 这类视口测试。')],
        [b('One GPU, several users', '一张卡多人用'), b('vGPU splits a card into fixed slices for each designer.', 'vGPU 能把一张卡切成固定份额，分给每个设计师。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('2D drafting, light 3D', '2D 绘图、轻量 3D'), '4–16 GB', ['t1000', 'rtx-pro-2000', 'rtx-a4000']],
        [b('Assemblies, BIM', '装配体、BIM'), '16–24 GB', ['rtx-a4000', 'rtx-a5000', 'rtx-pro-4000']],
        [b('Large models, visualisation', '大模型、可视化'), '48 GB+', ['rtx-a6000', 'rtx-pro-5000', 'rtx-pro-6000']],
      ],
      plans: [P('rtx-pro-4000', b('One designer, certified GPU', '单个设计师，认证显卡')), P('rtx-a6000', b('Split across 6 designers with vGPU', '用 vGPU 分给 6 个设计师'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['specvp', 'steelnomad'], items: [] },
    faq: [
      [b('Is remote CAD smooth enough?', '远程 CAD 够流畅吗？'), b('With under ~30 ms latency and a good protocol, most users cannot tell.', '延迟在 30 ms 左右以内、协议合适时，多数用户感觉不出区别。')],
      [b('Licences?', '授权怎么办？'), b('Your CAD licences move with you; vGPU needs an NVIDIA licence.', 'CAD 授权照常使用；用 vGPU 需要 NVIDIA 授权。')],
      [b('Several designers on one server?', '多个设计师共用一台服务器？'), b('Yes, see the GPU virtualization guide.', '可以，见 GPU 虚拟化方案。')],
    ],
    sources: [S('specvp'), S('steelnomad')],
  },
  {
    id: 'data', img: 'wl-data', wl: 'data',
    name: b('Data science & notebooks', '数据科学与 Notebook'),
    tagline: b('GPU-accelerated pandas, scikit-learn and Jupyter notebooks.', 'GPU 加速的 pandas、scikit-learn 和 Jupyter Notebook。'),
    kpis: [['50×', b('pandas speed-up with cuDF on L4', 'L4 上 cuDF 加速 pandas')], ['~150×', b('on Grace Hopper', 'Grace Hopper 上')], ['0', b('code changes needed', '无需改代码')]],
    how: {
      flow: [[b('Load', '加载'), b('Data is read into GPU memory.', '数据读入显存。')], [b('Transform', '处理'), b('cudf.pandas runs joins and group-bys on the GPU.', 'cudf.pandas 在 GPU 上做 join 和 group-by。')], [b('Model', '建模'), b('cuML, XGBoost or PyTorch train on the same GPU.', 'cuML、XGBoost 或 PyTorch 在同一张卡上训练。')]],
      cards: [
        [b('Memory sets dataset size', '显存决定数据量'), b('Data plus intermediates should fit in GPU memory, or use unified memory.', '数据加中间结果要放得进显存，否则要用统一内存。')],
        [b('Falls back safely', '不支持时自动回退'), b('Unsupported pandas calls run on the CPU automatically.', '不支持的 pandas 调用会自动在 CPU 上运行。')],
        [b('Bandwidth helps', '带宽有帮助'), b('Data work is memory-bound; high-bandwidth cards gain most.', '数据处理受内存带宽限制，带宽高的卡收益最大。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('Notebooks, small datasets', 'Notebook、小数据集'), '8–16 GB', ['rtx-4060', 'rtx-a4000', 'rtx-pro-2000']],
        [b('10–40 GB datasets', '10–40 GB 数据集'), '24–48 GB', ['rtx-5090', 'rtx-a5000', 'rtx-a6000']],
        [b('Large tables, team servers', '大表、团队共用'), '80 GB+', ['a100-80', 'h100-pcie', 'rtx-pro-6000']],
      ],
      plans: [P('rtx-pro-4000', b('Personal Jupyter server', '个人 Jupyter 服务器')), P('rtx-5090', b('Mid-size datasets', '中等数据量')), P('rtx-pro-6000', b('96 GB for big tables', '96 GB 处理大表'))],
      src: GM,
    },
    test: {
      kind: 'ext', charts: [],
      items: [
        { t: b('cudf.pandas on DuckDB benchmark', 'DuckDB 基准测试上的 cudf.pandas'), gpuName: 'NVIDIA L4', setup: '5 GB · joins + group-bys · cuDF 24.02', res: [b('Up to 50× faster than pandas', '最快比 pandas 快 50 倍')], src: FACTS.cudf50 },
        { t: b('Same benchmark on Grace Hopper', 'Grace Hopper 上的同一测试'), gpuName: 'NVIDIA GH200', setup: '5 GB · cuDF 23.10 · Xeon 8480C baseline', res: [b('Nearly 150× faster', '快近 150 倍'), b('Minutes become 1–2 seconds', '几分钟缩短到 1–2 秒')], src: FACTS.cudf150 },
      ],
    },
    faq: [
      [b('Do I have to rewrite code?', '要改代码吗？'), b('No. Load the cudf.pandas extension and keep using pandas.', '不用。加载 cudf.pandas 扩展，照常用 pandas。')],
      [b('What if my data is bigger than GPU memory?', '数据比显存大怎么办？'), b('Use unified memory, chunking, or Dask with several GPUs.', '用统一内存、分块处理，或用 Dask 加多张卡。')],
      [b('Is it worth it for small data?', '小数据值得用 GPU 吗？'), b('Below a few hundred MB, the CPU is often just as fast.', '几百 MB 以下，CPU 往往一样快。')],
    ],
    sources: [F('cudf50'), F('cudf150')],
  },
  {
    id: 'bio', img: 'wl-bio', wl: 'bio',
    name: b('Life sciences', '生命科学'),
    tagline: b('Molecular dynamics, protein structure prediction and genomics on GPUs.', '用 GPU 做分子动力学、蛋白质结构预测和基因组分析。'),
    kpis: [['1,639', b('ns/day · AMBER DHFR on RTX 4090', 'ns/天 · RTX 4090 跑 AMBER DHFR')], ['24×', b('AMBER, 2 × H100 vs a CPU node', 'AMBER：2 × H100 对比 CPU 节点')], ['30×', b('AMBER, 2 × RTX PRO 6000', 'AMBER：2 × RTX PRO 6000')]],
    how: {
      flow: [[b('Prepare', '准备'), b('Build the system: protein, water, ions.', '搭建体系：蛋白质、水、离子。')], [b('Simulate', '模拟'), b('The GPU integrates forces billions of times.', 'GPU 进行数十亿次力的积分计算。')], [b('Analyse', '分析'), b('Trajectories are analysed on CPU or GPU.', '在 CPU 或 GPU 上分析轨迹。')]],
      cards: [
        [b('MD runs in single precision', 'MD 主要用单精度'), b('AMBER, GROMACS and NAMD use FP32, so GeForce and RTX PRO cards excel.', 'AMBER、GROMACS、NAMD 主要用 FP32，GeForce 和 RTX PRO 表现很好。')],
        [b('One GPU per simulation', '一个模拟一张卡'), b('Most MD scales best by running many simulations, one per GPU.', '多数 MD 最划算的方式是一张卡跑一个模拟，并行跑多个。')],
        [b('Structure prediction needs memory', '结构预测吃显存'), b('Large complexes in AlphaFold-style models need 40–80 GB.', 'AlphaFold 类模型预测大复合物需要 40–80 GB。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('MD: AMBER, GROMACS, NAMD', '分子动力学：AMBER、GROMACS、NAMD'), '16–32 GB', ['rtx-4090', 'rtx-5090', 'rtx-a5000']],
        [b('Structure prediction', '结构预测'), '48–80 GB', ['rtx-a6000', 'a100-80', 'rtx-pro-6000']],
        [b('Genomics pipelines', '基因组流程'), '24–80 GB', ['a100-80', 'h100-pcie', 'rtx-pro-6000']],
      ],
      plans: [P('rtx-5090', b('Fast single-GPU MD', '单卡 MD 速度快')), P('rtx-pro-6000', b('Large systems, prediction', '大体系、结构预测')), P('h100-pcie', b('Mixed MD and AI', 'MD 与 AI 混合'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['amber', 'nvhpc'], items: [] },
    faq: [
      [b('Do I need FP64?', '需要 FP64 吗？'), b('Not for AMBER, GROMACS or NAMD in their default mixed-precision modes.', 'AMBER、GROMACS、NAMD 默认的混合精度模式不需要。')],
      [b('Several GPUs per job?', '一个任务用多张卡？'), b('Possible, but many short runs, one per GPU, usually give more science per dollar.', '可以，但多数情况下一张卡跑一个任务、并行多个，更划算。')],
      [b('Licensed software?', '商业软件授权？'), b('AMBER and Schrödinger need their own licences; GROMACS and NAMD are free for research.', 'AMBER、Schrödinger 需要自己的授权；GROMACS、NAMD 科研免费。')],
    ],
    sources: [S('amber'), S('nvhpc')],
  },
  {
    id: 'robot', img: 'wl-robot', wl: 'robot',
    name: b('Robotics & simulation', '机器人与仿真'),
    tagline: b('Isaac Sim, ROS 2 and synthetic data for robots and self-driving.', '用 Isaac Sim、ROS 2 和合成数据开发机器人和自动驾驶。'),
    kpis: [['16 GB', b('minimum GPU memory for Isaac Sim', 'Isaac Sim 最低显存')], ['186.9', b('FPS · warehouse scene, RTX PRO 6000', 'FPS · 仓库场景，RTX PRO 6000')], ['40', b('synthetic images/s · RTX PRO 6000', '合成图像/秒 · RTX PRO 6000')]],
    how: {
      flow: [[b('Build the world', '搭建场景'), b('USD scenes with robots, sensors and props.', '用 USD 搭建机器人、传感器和环境。')], [b('Simulate', '仿真'), b('PhysX runs physics; RTX renders cameras and lidar.', 'PhysX 算物理，RTX 渲染摄像头和激光雷达。')], [b('Train or test', '训练或测试'), b('Feed ROS 2 stacks or generate labelled data.', '接入 ROS 2，或生成带标注的数据。')]],
      cards: [
        [b('RTX cores are required', '必须有 RT 核心'), b('Sensor rendering needs RTX; A100 and H100 have no RT cores.', '传感器渲染需要 RTX；A100 和 H100 没有 RT 核心。')],
        [b('16 GB is the floor', '16 GB 是底线'), b('NVIDIA lists 16 GB minimum and 48 GB for the ideal setup.', 'NVIDIA 官方要求最低 16 GB，理想配置 48 GB。')],
        [b('Synthetic data scales', '合成数据可以横向扩展'), b('Run several instances, one per GPU, to make datasets faster.', '一张卡跑一个实例，多开可以更快生成数据集。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('ROS 2 development, light scenes', 'ROS 2 开发、轻量场景'), '16–24 GB', ['rtx-a4000', 'rtx-pro-4000', 'rtx-4090']],
        [b('Full scenes, many sensors', '完整场景、多传感器'), '32–48 GB', ['rtx-5090', 'rtx-a6000', 'rtx-pro-5000']],
        [b('Synthetic data, RL at scale', '大规模合成数据、强化学习'), '96 GB', ['rtx-pro-6000']],
      ],
      plans: [P('rtx-pro-4000', b('Isaac Sim development', 'Isaac Sim 开发')), P('rtx-5090', b('Heavier scenes', '更复杂的场景')), P('rtx-pro-6000', b('NVIDIA’s ideal-tier GPU', 'NVIDIA 推荐的理想配置'))],
      src: GM,
    },
    test: {
      kind: 'ext', charts: ['isaac'],
      items: [{ t: b('Isaac Sim requirements', 'Isaac Sim 配置要求'), gpuName: 'RTX 4080 → RTX PRO 6000', setup: 'Ubuntu 22.04/24.04 · Windows 11', res: [b('Minimum: 16 GB', '最低 16 GB'), b('Ideal: 48 GB', '理想 48 GB'), b('32–64 GB RAM', '内存 32–64 GB')], src: FACTS.isaacReq }],
    },
    faq: [
      [b('Can I use an A100 or H100?', '能用 A100 或 H100 吗？'), b('For training policies, yes; for rendering cameras and lidar, no, they lack RT cores.', '训练策略可以；渲染摄像头和激光雷达不行，它们没有 RT 核心。')],
      [b('Remote desktop or headless?', '远程桌面还是无界面？'), b('Both. Use streaming for the editor and headless mode for batch runs.', '都可以。编辑器用串流，批量任务用无界面模式。')],
      [b('CARLA or Isaac Sim?', 'CARLA 还是 Isaac Sim？'), b('CARLA for driving research on Unreal; Isaac Sim for robots, ROS 2 and synthetic data.', '做自动驾驶研究用基于 Unreal 的 CARLA；做机器人、ROS 2 和合成数据用 Isaac Sim。')],
    ],
    sources: [S('isaac'), F('isaacReq')],
  },
  {
    id: 'hpc', img: 'wl-hpc', wl: 'hpc',
    name: b('Scientific computing', '科学计算'),
    tagline: b('CFD, weather, physics and chemistry codes that run on CUDA.', '跑在 CUDA 上的流体、气象、物理和化学计算。'),
    kpis: [['93×', b('Chroma, 2 × H100 vs a CPU node', 'Chroma：2 × H100 对比 CPU 节点')], ['21×', b('MILC, 2 × H100', 'MILC：2 × H100')], ['14×', b('Quantum ESPRESSO, 8 × H100', 'Quantum ESPRESSO：8 × H100')]],
    how: {
      flow: [[b('Discretise', '离散化'), b('The problem becomes a mesh, grid or particle set.', '把问题变成网格、格点或粒子。')], [b('Solve', '求解'), b('Thousands of GPU cores update it in parallel.', '上千个 GPU 核心并行更新。')], [b('Output', '输出'), b('Results go to files for analysis.', '结果写入文件供分析。')]],
      cards: [
        [b('Check FP64 first', '先看要不要 FP64'), b('Many CFD, chemistry and physics codes need double precision; only A100, H100, V100 and P100 have fast FP64.', '很多流体、化学、物理代码需要双精度，只有 A100、H100、V100、P100 的 FP64 快。')],
        [b('Bandwidth-bound codes', '受带宽限制的代码'), b('Stencil and sparse solvers scale with memory bandwidth; HBM helps.', '模板计算和稀疏求解随显存带宽提升，HBM 有优势。')],
        [b('FP32 codes love RTX', 'FP32 代码适合 RTX'), b('Codes that run in single precision, such as MD and seismic, do well on RTX PRO.', '分子动力学、地震成像等单精度代码在 RTX PRO 上表现很好。')],
      ],
    },
    pick: {
      cols: COLS,
      rows: [
        [b('Double-precision codes (CFD, DFT, VASP)', '双精度代码（流体、DFT、VASP）'), '16–80 GB', ['a100-80', 'h100-pcie', 'v100']],
        [b('Single-precision codes (MD, seismic, LBM)', '单精度代码（MD、地震、LBM）'), '24–96 GB', ['rtx-5090', 'rtx-pro-6000', 'rtx-a6000']],
        [b('Teaching and porting to CUDA', '教学、移植 CUDA'), '8–16 GB', ['rtx-4060', 'rtx-a4000', 'v100']],
      ],
      plans: [P('rtx-5090', b('FP32 codes', '单精度代码')), P('rtx-pro-6000', b('Large FP32 problems', '大规模单精度问题')), P('h100-pcie', b('FP64 and HBM bandwidth', 'FP64 和 HBM 带宽'))],
      src: GM,
    },
    test: { kind: 'ext', charts: ['nvhpc'], items: [] },
    faq: [
      [b('Does my code need FP64?', '我的代码需要 FP64 吗？'), b('Check its documentation; if it does, RTX cards will be many times slower than A100 or H100.', '查一下文档；如果需要，RTX 卡会比 A100、H100 慢很多倍。')],
      [b('Multi-GPU and MPI?', '多卡和 MPI？'), b('Most codes run one MPI rank per GPU; NVLink helps when ranks talk a lot.', '多数代码一张卡一个 MPI 进程；进程间通信多时 NVLink 有帮助。')],
      [b('Containers?', '用容器吗？'), b('NVIDIA NGC provides ready-built containers for many HPC codes.', 'NVIDIA NGC 提供很多 HPC 软件的现成容器。')],
    ],
    sources: [S('nvhpc'), S('amber')],
  },
];
