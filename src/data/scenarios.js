/* Scenario guides. Content paraphrased from GPU Mart public pages (sources on each page).
   Prices are list prices seen in Nov 2026 and change; promotions are not used. */
import { SCENARIOS2 } from './scenarios2.js';
const b = (en, zh) => ({ en, zh });
const LLM_SRC = 'https://www.gpu-mart.com/guides/self-hosted-llm';
const HOST_SRC = 'https://www.gpu-mart.com/llm-hosting';
const V_SRC = 'https://www.gpu-mart.com/gpu-virtualization';
const S_SRC = 'https://www.gpu-mart.com/gpu-for-streaming';

const FIRST = [
  {
    id: 'llm', img: 'wl-llm', wl: 'llm',
    name: b('LLM inference', '大模型推理'),
    tagline: b('Run open models on your own GPU: private, predictable cost, no per-token bill.', '在自己的 GPU 上跑开源模型：数据私有、成本可控、不按 token 计费。'),
    kpis: [['144', b('tok/s · Qwen3-8B on RTX 5090', 'tok/s · RTX 5090 跑 Qwen3-8B')], ['2,890', b('tok/s · 32 users on one RTX 5090', 'tok/s · 一张 RTX 5090 服务 32 人')], ['< 0.5 s', b('first token in a customer case', '客户案例的首 token 延迟')]],
    how: {
      flow: [[b('Weights', '模型权重'), b('Parameters × bits ÷ 8. A 14B model is ~28 GB at FP16, ~7 GB at 4-bit.', '参数量 × 位数 ÷ 8。14B 模型 FP16 约 28 GB，4-bit 约 7 GB。')], [b('KV cache', 'KV 缓存'), b('Grows with context length × users. Size for peak load, not one chat.', '随上下文长度 × 用户数增长。按高峰算，不是按一次对话算。')], [b('Headroom', '余量'), b('Keep 20–30% free for the runtime and bursts.', '留 20–30% 给运行时和突发请求。')]],
      cards: [
        [b('Bandwidth sets speed', '带宽决定速度'), b('Generating each token reads all the weights, so memory bandwidth, not TFLOPS, caps single-user speed.', '每生成一个 token 都要读一遍权重，所以单用户速度受显存带宽限制，而不是算力。')],
        [b('Precision sets size', '精度决定大小'), b('FP8 halves weight memory versus FP16; 4-bit quarters it. Blackwell runs FP8 and FP4 natively.', 'FP8 比 FP16 省一半权重显存，4-bit 省四分之三。Blackwell 原生支持 FP8 和 FP4。')],
        [b('Ollama vs vLLM', 'Ollama 还是 vLLM'), b('Ollama for testing and one user; vLLM for production APIs with many users (continuous batching).', 'Ollama 适合测试和单人使用；vLLM 适合多用户的生产 API（连续批处理）。')],
      ],
    },
    pick: {
      cols: [b('Workload', '工作'), b('GPU memory', '显存'), b('Start with', '推荐起步')],
      rows: [
        [b('7B–14B, testing', '7B–14B，测试'), '16–24 GB', ['rtx-a4000', 'rtx-pro-2000', 'rtx-pro-4000']],
        [b('14B–35B, production', '14B–35B，生产'), '24–48 GB', ['rtx-5090', 'rtx-a6000', 'rtx-pro-5000']],
        [b('RAG, agents, several models', 'RAG、智能体、多模型'), '48 GB+', ['rtx-pro-5000', 'rtx-a6000', 'a40']],
        [b('70B class, quantized', '70B 级，量化'), '48–96 GB+', ['rtx-pro-6000', 'a100-80', 'h100-pcie']],
        [b('High-concurrency API', '高并发 API'), b('80 GB+ or multi-GPU', '80 GB 以上或多卡'), ['h100-pcie', 'a100-80']],
      ],
      plans: [
        ['rtx-pro-4000', b('GPU VPS', 'GPU 云服务器'), 189, b('24 cores · 56 GB RAM · 500 Mbps', '24 核 · 56 GB 内存 · 500 Mbps'), b('7B–27B with Ollama', 'Ollama 跑 7B–27B')],
        ['rtx-pro-5000', b('GPU VPS', 'GPU 云服务器'), 359, b('24 cores · 56 GB RAM · 500 Mbps', '24 核 · 56 GB 内存 · 500 Mbps'), b('35B with long context', '35B 长上下文')],
        ['rtx-a6000', b('Dedicated', '独立服务器'), 409, b('Dual Xeon · 256 GB RAM', '双路 Xeon · 256 GB 内存'), b('Best price per token in tests', '测试中单位成本最低')],
        ['rtx-pro-6000', b('GPU VPS', 'GPU 云服务器'), 649, b('32 cores · 84 GB RAM · 1 Gbps', '32 核 · 84 GB 内存 · 1 Gbps'), b('Up to ~120B at 4-bit', '4-bit 最大约 120B')],
        ['h100-pcie', b('Dedicated', '独立服务器'), 2599, b('80 GB HBM · dual Xeon', '80 GB HBM · 双路 Xeon'), b('Low-latency production', '低延迟生产环境')],
      ],
      src: HOST_SRC,
    },
    test: { kind: 'vllm' },
    cases: [
      { t: b('AI app company: private agent platform', 'AI 应用公司：私有智能体平台'), gpu: 'rtx-a6000', stack: 'vLLM · Qwen3.5-27B GPTQ-Int4', res: [b('First token < 500 ms', '首 token < 500 ms'), '40–50 tok/s', b('168 h, zero failures', '连续 168 小时零故障')], note: b('Moved off per-token cloud billing.', '从按 token 计费的云 API 迁出。') },
      { t: b('Enterprise knowledge base (RAG)', '企业知识库（RAG）'), gpu: null, stack: 'vLLM · gpt-oss-20b · Qwen3-Embedding-8B · bge-reranker · Dify', res: [b('1.5–2.5 s average answer', '平均回答 1.5–2.5 秒'), b('P99 < 3.5 s', 'P99 < 3.5 秒'), b('5–8 concurrent users', '5–8 人并发')], note: b('LLM, embedding and reranker on one server.', '大模型、向量和重排序模型放在同一台服务器。') },
      { t: b('Dev team: local coding assistant', '研发团队：本地编程助手'), gpu: 'rtx-pro-6000', stack: 'vLLM · GLM-4.7-Flash', res: [b('1–2 s average', '平均 1–2 秒'), b('P99 < 3 s', 'P99 < 3 秒'), b('Code never leaves', '代码不出服务器')], note: null },
    ],
    faq: [
      [b('Can I run GPT-4 or Claude myself?', '能自己部署 GPT-4 或 Claude 吗？'), b('No, those are API-only. Use open models such as Qwen, Llama, GLM or DeepSeek.', '不能，它们只提供 API。可以用 Qwen、Llama、GLM、DeepSeek 等开源模型。')],
      [b('One GPU or several?', '一张卡还是多张卡？'), b('One, if the model plus KV cache fit with headroom. Go multi-GPU only when they do not.', '模型加 KV 缓存放得下并有余量，就用一张。放不下才上多卡。')],
      [b('Is self-hosting cheaper than an API?', '自己部署比 API 便宜吗？'), b('For steady, high-utilisation traffic, often yes. For a few hours a month, an API or hourly GPU is cheaper.', '流量稳定、利用率高时通常更便宜；每月只用几小时的话，API 或按小时租更划算。')],
      [b('GPU VPS or dedicated server?', 'GPU 云服务器还是独立服务器？'), b('A VPS gives you a whole GPU inside a VM and is quicker to start. A dedicated server is the whole machine.', '云服务器在虚拟机里给你一整张卡，开通快；独立服务器是整台物理机。')],
      [b('How many users per card?', '一张卡能服务多少人？'), b('For 27B–31B models, plan 4–8 concurrent requests per card. At 32, first-token time on an H100 reached ~70 s in tests.', '27B–31B 模型按每张卡 4–8 个并发规划。测试中 H100 在 32 并发时首 token 达到约 70 秒。')],
    ],
    sources: [[LLM_SRC, 'GPU Mart · Self-hosted LLM guide'], [HOST_SRC, 'GPU Mart · LLM hosting']],
  },
  {
    id: 'vgpu', img: 'wl-cad', wl: 'cad',
    name: b('GPU virtualization', 'GPU 虚拟化'),
    tagline: b('Share one GPU across several users or virtual machines, or give each one a whole card.', '让一张 GPU 给多个用户或虚拟机共用，或者每台各占一整张卡。'),
    kpis: [['4', b('ways to split or assign a GPU', '种切分或分配 GPU 的方式')], ['6', b('CAD workstations on one RTX A6000', '台 CAD 工作站共用一张 RTX A6000')], ['10', b('Windows VMs on one A40', '台 Windows 虚拟机共用一张 A40')]],
    how: {
      methods: [
        { k: 'vgpu', n: b('NVIDIA vGPU', 'NVIDIA vGPU'), d: b('Each VM gets a fixed slice of GPU memory; compute is time-shared.', '每台虚拟机分到固定的显存，算力分时共享。'), iso: b('Memory', '显存隔离'), lic: b('Paid NVIDIA licence', '需 NVIDIA 付费授权'), os: 'Proxmox · VMware · KVM · Hyper-V', best: b('Design teams, CAD and cloud desktops', '设计团队、CAD、云桌面') },
        { k: 'mig', n: b('MIG', 'MIG'), d: b('Hardware slices with their own memory and compute.', '硬件级切分，每份有独立的显存和算力。'), iso: b('Full hardware', '硬件完全隔离'), lic: b('No extra licence', '无需额外授权'), os: 'Linux', best: b('Several AI services or students on one card', '多个 AI 服务或学生共用一张卡') },
        { k: 'gpupv', n: b('Hyper-V GPU-PV', 'Hyper-V GPU-PV'), d: b('Windows VMs share the GPU as needed, without fixed slices.', 'Windows 虚拟机按需共享 GPU，没有固定切分。'), iso: b('None', '无隔离'), lic: b('No NVIDIA licence', '无需 NVIDIA 授权'), os: 'Windows', best: b('Budget Windows labs and light gaming', '低成本 Windows 实验室和轻度游戏') },
        { k: 'pass', n: b('Passthrough', '直通'), d: b('One VM owns one or more whole GPUs.', '一台虚拟机独占一张或多张整卡。'), iso: b('Whole GPU', '整卡独占'), lic: b('No extra licence', '无需额外授权'), os: 'KVM · Proxmox · ESXi', best: b('Training, heavy inference, one tenant per GPU', '训练、重负载推理、一卡一租户') },
      ],
    },
    pick: {
      cols: [b('You need', '你的需求'), b('Method', '方式'), b('Supported GPUs', '支持的 GPU')],
      rows: [
        [b('Several CAD / design desktops with set memory', '多台 CAD / 设计桌面，显存固定'), 'NVIDIA vGPU', ['rtx-a6000', 'a40', 'rtx-a5000', 'rtx-5090']],
        [b('Isolated AI services on Linux', 'Linux 上互相隔离的 AI 服务'), 'MIG', ['rtx-pro-6000', 'rtx-pro-5000', 'a100-40', 'h100-pcie']],
        [b('Cheap Windows VMs sharing a GPU', '低成本 Windows 虚拟机共享 GPU'), 'Hyper-V GPU-PV', ['rtx-a5000', 'a40', 'rtx-a6000']],
        [b('Each VM gets whole GPUs', '每台虚拟机独占整卡'), b('Passthrough', '直通'), ['rtx-5090', 'rtx-a6000', 'rtx-a5000', 'v100']],
      ],
      plans: [
        ['rtx-pro-5000', b('GPU VPS · MIG', 'GPU 云服务器 · MIG'), 359, b('24 vCPU · 56 GB RAM · 320 GB SSD', '24 vCPU · 56 GB 内存 · 320 GB SSD'), b('Up to 2 × 24 GB slices', '最多 2 份 24 GB')],
        ['rtx-a6000', b('Dedicated · vGPU', '独立服务器 · vGPU'), 409, b('2 × 18-core Xeon · 256 GB RAM', '2 × 18 核 Xeon · 256 GB 内存'), b('6 × 8 GB design VMs in a case', '案例中 6 台 8 GB 设计虚拟机')],
        ['rtx-pro-6000', b('GPU VPS · MIG', 'GPU 云服务器 · MIG'), 649, b('32 vCPU · 84 GB RAM · 400 GB SSD', '32 vCPU · 84 GB 内存 · 400 GB SSD'), b('Up to 4 × 24 GB slices', '最多 4 份 24 GB')],
      ],
      src: V_SRC,
    },
    test: {
      kind: 'list',
      items: [
        { t: b('MIG memory isolation on H100', 'H100 的 MIG 显存隔离'), gpu: 'h100-pcie', setup: 'Ubuntu 24.04 · Docker · PyTorch · 1g.10gb', res: [b('8 GB job fits its slice', '8 GB 任务正常运行'), b('12 GB job stops with out-of-memory', '12 GB 任务显存不足，被拦住'), b('Two slices compute at once', '两个切片同时计算')], note: b('A memory-allocation test, not a speed benchmark.', '这是显存分配测试，不是速度测试。') },
        { t: b('Ten Windows VMs on one A40', '一张 A40 跑 10 台 Windows 虚拟机'), gpu: 'a40', setup: 'Windows · Hyper-V GPU-PV · 8 vCPU + 12 GB RAM per VM', res: [b('10 VMs running', '10 台虚拟机同时运行'), b('~28 GB GPU memory used', '占用约 28 GB 显存'), b('24 FPS cap per VM', '每台限 24 FPS')], note: b('24 FPS is a configured cap, not a measured frame rate.', '24 FPS 是设定的上限，不是实测帧率。') },
      ],
    },
    cases: [
      { t: b('Architecture firm: six design workstations', '建筑公司：6 台设计工作站'), gpu: 'rtx-a6000', stack: 'Proxmox VE · Windows · vGPU profile A6000-8Q', res: [b('6 VMs × 8 GB', '6 台 × 8 GB'), b('14 light VMs without GPU', '另有 14 台无 GPU 轻量虚拟机')], note: null },
      { t: b('GPU VPS platform: one GPU per tenant', 'GPU 云平台：每个租户一张卡'), gpu: null, stack: 'KVM · IOMMU + VFIO passthrough', res: [b('Each tenant picks its own OS and driver', '每个租户自选系统和驱动')], note: null },
      { t: b('Streaming team: five creator desktops', '直播团队：5 个主播桌面'), gpu: null, stack: 'Windows · OBS · TikTok LIVE Studio · Sunshine', res: [b('From 3 to 5 creators', '从 3 个主播扩到 5 个')], note: null, link: '/scenarios/streaming' },
    ],
    faq: [
      [b('Which needs a paid licence?', '哪种方式要付授权费？'), b('Only NVIDIA vGPU. MIG, passthrough and Hyper-V GPU-PV need no extra NVIDIA licence; Windows licensing still applies.', '只有 NVIDIA vGPU 要。MIG、直通和 Hyper-V GPU-PV 不需要额外的 NVIDIA 授权，但 Windows 授权照常需要。')],
      [b('Can I split an RTX 5090 VPS into ten VMs?', '能把一台 RTX 5090 云服务器拆成 10 台虚拟机吗？'), b('Not as a VPS. Building your own VMs needs a dedicated server, and a supported card for vGPU.', '云服务器不行。自己建虚拟机需要独立服务器，做 vGPU 还要用支持的显卡。')],
      [b('Several AI services on one GPU?', '一张卡上跑多个 AI 服务？'), b('Yes. MIG gives each service an isolated slice; time-slicing works for light loads but heavy ones interfere.', '可以。MIG 给每个服务一个隔离的切片；分时共享适合轻负载，重负载会互相影响。')],
      [b('Is GPU memory pooled across cards?', '多张卡的显存会合并吗？'), b('No. Each card keeps its own memory; your software must split the work.', '不会。每张卡的显存独立，需要软件自己分配任务。')],
      [b('Can I try first?', '能先试用吗？'), b('Yes, a 24-hour free trial: order, write "24-hour free trial" in the notes, then submit a trial request.', '可以，24 小时免费试用：下单时在备注写"24-hour free trial"，然后提交试用申请。')],
    ],
    sources: [[V_SRC, 'GPU Mart · GPU virtualization']],
  },
  {
    id: 'streaming', img: 'wl-video', wl: 'video',
    name: b('Live streaming & transcoding', '直播与转码'),
    tagline: b('Cloud OBS production, 24/7 channels and adaptive-bitrate transcoding on NVENC.', '云端 OBS 直播、7×24 频道和自适应码率转码，用 NVENC 硬件编码。'),
    kpis: [['10', b('1080p50 live feeds on one RTX 5090', '路 1080p50 直播流，一张 RTX 5090')], ['67–76', b('fps per feed (50 needed)', 'fps 每路（只需 50）')], ['$85', b('/mo · RTX 5060 GPU VPS', '/月 · RTX 5060 云服务器')]],
    how: {
      flow: [[b('Input', '输入'), b('Live source, e.g. 1080p from OBS or a camera.', '直播源，例如 OBS 或摄像头的 1080p。')], [b('Decode · scale · encode', '解码 · 缩放 · 编码'), b('NVDEC, GPU scaling and NVENC do the heavy work.', 'NVDEC、GPU 缩放和 NVENC 承担主要负载。')], [b('Outputs', '输出'), b('One encode per rendition: 1080p, 720p, 480p…', '每个码率档一路编码：1080p、720p、480p……')]],
      cards: [
        [b('Count encodes, not inputs', '数编码路数，不是输入路数'), b('8 sources × 5 renditions = 40 encoding outputs. Each one counts.', '8 路输入 × 5 个码率档 = 40 路编码输出，每一路都要算。')],
        [b('Forwarding needs no GPU', '只转发不需要 GPU'), b('Repackaging an already-encoded stream skips decode and re-encode.', '只是重新封装已编码的流，就不用解码和重新编码。')],
        [b('Sessions vs throughput', '路数上限和吞吐量'), b('The driver caps how many encodes open; throughput caps how many keep real time. Check both.', '驱动限制能开几路编码，吞吐量决定几路能保持实时。两个都要看。')],
      ],
    },
    pick: {
      cols: [b('Workload', '工作'), b('Watch for', '重点看'), b('Start with', '推荐起步')],
      rows: [
        [b('One OBS desktop in the cloud', '云端一台 OBS 桌面'), b('NVENC, Windows, bandwidth', 'NVENC、Windows、带宽'), ['rtx-5060', 'rtx-pro-4000']],
        [b('3–5 creators on shared desktops', '3–5 个主播共享桌面'), b('6–10 encode jobs at once', '同时 6–10 路编码'), ['rtx-pro-4000', 'rtx-5090']],
        [b('24/7 channels (FFmpeg)', '7×24 频道（FFmpeg）'), b('Encode sessions per driver', '驱动的编码路数上限'), ['rtx-a5000', 'rtx-5090']],
        [b('ABR ladders, many renditions', '多码率阶梯，大量输出'), b('Total outputs, port speed', '总输出路数、端口带宽'), ['rtx-5090', 'a40', 'rtx-pro-5000']],
      ],
      plans: [
        ['rtx-5060', b('GPU VPS', 'GPU 云服务器'), 85, b('16 cores · 28 GB RAM · 200 Mbps', '16 核 · 28 GB 内存 · 200 Mbps'), b('Entry OBS / single channel', '入门 OBS / 单频道')],
        ['rtx-pro-4000', b('GPU VPS', 'GPU 云服务器'), 189, b('24 cores · 56 GB RAM · 500 Mbps', '24 核 · 56 GB 内存 · 500 Mbps'), b('Several creators or channels', '多个主播或频道')],
        ['rtx-pro-5000', b('GPU VPS', 'GPU 云服务器'), 359, b('24 cores · 56 GB RAM · 500 Mbps', '24 核 · 56 GB 内存 · 500 Mbps'), b('Heavy scenes, AI effects', '复杂场景、AI 特效')],
        ['rtx-5090', b('GPU VPS', 'GPU 云服务器'), 419, b('32 cores · 84 GB RAM · 500 Mbps', '32 核 · 84 GB 内存 · 500 Mbps'), b('10 × 1080p50 feeds in a case', '案例中 10 路 1080p50')],
      ],
      src: S_SRC,
    },
    test: {
      kind: 'list',
      items: [
        { t: b('Ten live TV feeds on one RTX 5090', '一张 RTX 5090 转码 10 路电视直播'), gpu: 'rtx-5090', setup: 'FFmpeg · NVENC P5 · 1080p50 · 6 Mbps', res: [b('All 10 jobs at once', '10 路同时运行'), b('67–76 fps per job', '每路 67–76 fps'), b('50 fps needed', '实时只需 50 fps')], note: b('On the original driver only 8 jobs started; a driver update fixed it.', '旧驱动只能开 8 路，更新驱动后解决。') },
      ],
    },
    cases: [
      { t: b('Live TV transcoding', '电视直播转码'), gpu: 'rtx-5090', stack: 'FFmpeg · NVENC', res: [b('10 feeds, real time', '10 路实时')], note: null },
      { t: b('ABR streaming: 8 feeds × 5 renditions', '多码率直播：8 路 × 5 档'), gpu: 'a40', stack: 'FFmpeg · origin server', res: [b('40 encode outputs', '40 路编码输出'), b('48-hour trial, 1 Gbps port', '48 小时试用，1 Gbps 端口')], note: b('Old encoder hit full load and stopped producing segments.', '原编码器满载，停止输出切片。') },
      { t: b('24/7 channels: 15 → 30', '7×24 频道：15 → 30 路'), gpu: 'rtx-a5000', stack: 'Windows · H.264 / HEVC in · 480p30 out', res: [b('15–17 channels today', '目前 15–17 路'), b('Planning 30', '计划扩到 30 路')], note: null },
      { t: b('Creator desktops', '主播桌面'), gpu: null, stack: 'OBS · TikTok LIVE Studio · Sunshine', res: [b('6 encodes for 3 creators', '3 个主播 6 路编码'), b('10 for 5', '5 个主播 10 路')], note: b('Planning figures, not a measured test.', '规划值，不是实测。') },
    ],
    faq: [
      [b('Do I need a GPU just to forward a stream?', '只转发直播流需要 GPU 吗？'), b('Not always. Forwarding or repackaging keeps the encoded video; a GPU is needed to decode, re-encode or render.', '不一定。转发或重新封装不改编码；需要解码、重新编码或渲染时才要 GPU。')],
      [b('How many streams can one GPU handle?', '一张卡能跑几路？'), b('No single number: it depends on format, frame rate, filters, encoder settings and driver limits. Test your full output set.', '没有固定数字，取决于格式、帧率、滤镜、编码参数和驱动限制。要按完整的输出组合实测。')],
      [b('Will more GPU memory fix slow transcoding?', '显存大了转码就快吗？'), b('Only if memory is the bottleneck. Usually it is encoder throughput or the session limit.', '只有显存是瓶颈时才有用，通常卡在编码吞吐量或路数上限。')],
      [b('How much bandwidth?', '需要多少带宽？'), b('Add up every encoded bitrate leaving the server, plus audio and overhead. Count ingress separately.', '把所有流出服务器的编码码率加起来，再加音频和协议开销；入口带宽另算。')],
      [b('Does the server include a CDN?', '服务器包含 CDN 吗？'), b('No. Origin software, CDN and licences are separate.', '不包含。源站软件、CDN 和授权另算。')],
    ],
    sources: [[S_SRC, 'GPU Mart · GPU for streaming']],
  },
];

/* Guides in workload order; the first three keep their place */
const ORDER = ['llm', 'vgpu', 'streaming', 'img', 'vgen', 'speech', 'train', 'cv', 'render', 'game', 'cad', 'data', 'bio', 'robot', 'hpc'];
export const SCENARIOS = [...FIRST, ...SCENARIOS2].sort((a, c) => ORDER.indexOf(a.id) - ORDER.indexOf(c.id));
/* Workload id → its guide */
export const WL_GUIDE = { llm: 'llm', video: 'streaming', ...Object.fromEntries(SCENARIOS2.map((s) => [s.wl, s.id])) };

export const SC = (id) => SCENARIOS.find((s) => s.id === id);
