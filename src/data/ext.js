/* Published benchmarks from official sources and major reviewers, collected Nov 2026.
   Every set keeps its source, version and settings. Rows are [gpuId or label, ...values per col].
   A row whose first item is a GPU id from gpus.js also shows on that GPU's detail page. */
const b = (en, zh) => ({ en, zh });

export const EXT = {
  blender: {
    name: b('Blender Cycles render score', 'Blender Cycles 渲染分'),
    src: { label: 'Blender Open Data', url: 'https://opendata.blender.org/benchmarks/query/?compute_type=OPTIX&group_by=device_name&blender_version=4.2.0', ver: b('Blender 4.2.0 · OptiX · median of user submissions', 'Blender 4.2.0 · OptiX · 用户提交结果的中位数') },
    cols: [{ k: 'score', n: b('Median score', '中位分'), unit: '' }],
    rows: [['rtx-5090', 14263.3], ['rtx-4090', 10893.5], ['rtx-a6000', 4969.3], ['rtx-a5000', 4362.3], ['a40', 3980.2], ['a100-80', 3721.7], ['a100-40', 3664.3], ['rtx-5060', 3423.4], ['rtx-4060', 3065.5], ['rtx-a4000', 2967.3], ['rtx-3060-ti', 2723.4], ['rtx-2060', 1516.7], ['p100', 1092.4], ['gtx-1660', 689.2], ['gtx-1650', 436.5], ['t1000', 433.8], ['quadro-p1000', 128.0]],
    note: b('RTX 5090 has only 4 submissions in 4.2.0. RTX PRO Blackwell cards are only in newer versions, whose scores are not comparable.', 'RTX 5090 在 4.2.0 里只有 4 条提交。RTX PRO Blackwell 只出现在更新的版本里，分数不能直接比较。'),
  },
  steelnomad: {
    name: b('3DMark Steel Nomad', '3DMark Steel Nomad'),
    src: { label: 'UL Benchmarks', url: 'https://benchmarks.ul.com/compare/best-gpus', ver: b('Desktop GPUs · November 2026 list', '桌面 GPU · 2026 年 11 月榜单') },
    cols: [{ k: 'score', n: b('Score', '分数'), unit: '' }],
    rows: [['rtx-pro-6000', 15797], ['rtx-5090', 14636], ['rtx-4090', 9225], ['rtx-a6000', 4869], ['rtx-a5000', 3796], ['rtx-5060', 3178], ['rtx-3060-ti', 2691], ['rtx-a4000', 2608], ['rtx-4060', 2309], ['rtx-2060', 1703], ['gtx-1660', 1046], ['gtx-1650', 320]],
    note: b('A DirectX 12 graphics test at 4K; a good guide to gaming and real-time 3D.', 'DirectX 12 的 4K 图形测试，可以参考游戏和实时 3D 性能。'),
  },
  lambda: {
    name: b('PyTorch training throughput', 'PyTorch 训练吞吐'),
    src: { label: 'Lambda · deeplearning-benchmark', url: 'https://github.com/lambdal/deeplearning-benchmark/tree/master/pytorch', ver: b('1 GPU · FP16 · NGC PyTorch containers', '单卡 · FP16 · NGC PyTorch 容器') },
    cols: [{ k: 'rn50', n: b('ResNet-50', 'ResNet-50'), unit: 'img/s' }, { k: 'bertl', n: b('BERT-large', 'BERT-large'), unit: 'seq/s' }, { k: 'ssd', n: b('SSD', 'SSD'), unit: 'img/s' }],
    rows: [['H100 SXM', 2616, 301, 782], ['h100-pcie', 1866, 203, 566], ['a100-80', 1527, 140, 437], ['a100-40', 1396, 117, 395], ['rtx-4090', 1301, 93, 379], ['rtx-a6000', 916, 68, 260], ['RTX 3090', 905, 52, 236], ['v100', 833, 57, 229]],
    note: b('A100 rows are PCIe cards. H100 SXM and RTX 3090 are shown for reference.', 'A100 为 PCIe 版本。H100 SXM 和 RTX 3090 仅供参考。'),
  },
  amber: {
    name: b('AMBER molecular dynamics', 'AMBER 分子动力学'),
    src: { label: 'AMBER · pmemd.cuda performance', url: 'https://ambermd.org/GPUPerformance.php', ver: b('Official AMBER page · Feb 2023 runs · single GPU · NVE', 'AMBER 官方页面 · 2023 年 2 月测试 · 单卡 · NVE') },
    cols: [{ k: 'jac', n: b('DHFR (JAC) 23k atoms', 'DHFR (JAC) 2.3 万原子'), unit: 'ns/day' }, { k: 'f9', n: b('Factor IX 91k atoms', 'Factor IX 9.1 万原子'), unit: 'ns/day' }, { k: 'cel', n: b('Cellulose 409k atoms', 'Cellulose 40.9 万原子'), unit: 'ns/day' }],
    rows: [['rtx-4090', 1638.75, 466.44, 129.63], ['H100', 1479.32, 389.18, 119.27], ['RTX 4070 Ti', 1322.64, 301.03, 69.3], ['A100', 1199.22, 271.36, 85.23], ['RTX 3090', 1196.5, 264.78, 63.23]],
    note: b('The page does not say which H100 or A100 variant was used.', '页面没有注明 H100 和 A100 的具体型号。'),
  },
  specvp: {
    name: b('SPECviewperf 2020 (CAD and 3D viewports)', 'SPECviewperf 2020（CAD 与 3D 视口）'),
    src: { label: 'SPEC GWPG · published results', url: 'https://spec.org/gwpg/gpc.data/viewperf2020v3.1/summary.html', ver: b('v3.1 · 1920×1080 · Dell Precision workstations', 'v3.1 · 1920×1080 · 戴尔 Precision 工作站') },
    cols: [{ k: 'sw', n: b('SOLIDWORKS', 'SOLIDWORKS'), unit: '' }, { k: 'catia', n: b('CATIA', 'CATIA'), unit: '' }, { k: 'creo', n: b('Creo', 'Creo'), unit: '' }, { k: 'maya', n: b('Maya', 'Maya'), unit: '' }, { k: 'max', n: b('3ds Max', '3ds Max'), unit: '' }, { k: 'snx', n: b('Siemens NX', 'Siemens NX'), unit: '' }],
    rows: [['rtx-a6000', 372.63, 155.11, 202.65, 573.07, 205.53, 613.02], ['rtx-a5000', 313.27, 130.23, 179.89, 468.59, 164.72, 505.43], ['RTX A2000 12GB', 153.37, 66.43, 127.42, 289.53, 83.58, 241.4]],
    note: b('SPEC has no published results yet for RTX PRO Blackwell cards.', 'SPEC 尚未发布 RTX PRO Blackwell 的结果。'),
  },
  nvimg: {
    name: b('Image and video generation (TensorRT)', '图像与视频生成（TensorRT）'),
    src: { label: 'NVIDIA · AI inference performance', url: 'https://developer.nvidia.com/deep-learning-performance-training-inference/ai-inference', ver: b('Single GPU · NGC 26.07 containers', '单卡 · NGC 26.07 容器') },
    cols: [{ k: 'flux', n: b('FLUX', 'FLUX'), unit: 'img/s' }, { k: 'sdxl', n: b('SDXL, batch 4', 'SDXL，批量 4'), unit: 'img/s' }, { k: 'svd', n: b('Stable Video Diffusion', 'Stable Video Diffusion'), unit: 'videos/min' }],
    rows: [['H100 SXM', 0.2, 0.98, 3.76], ['RTX PRO 6000 Server', 0.2, 0.72, 2.82], ['L40S', 0.08, null, 1.34]],
    note: b('FLUX runs FP8 on H100 and L40S, FP4 on RTX PRO 6000. L40S SDXL was run at batch 1, so it is left out.', 'FLUX 在 H100 和 L40S 上用 FP8，在 RTX PRO 6000 上用 FP4。L40S 的 SDXL 用的是批量 1，因此不列入。'),
  },
  whisper: {
    name: b('Whisper large-v2: 13 minutes of audio', 'Whisper large-v2：13 分钟音频'),
    src: { label: 'faster-whisper · README benchmark', url: 'https://github.com/SYSTRAN/faster-whisper#benchmark', ver: b('RTX 3070 Ti 8 GB · CUDA 12.4 · beam 5', 'RTX 3070 Ti 8 GB · CUDA 12.4 · beam 5') },
    cols: [{ k: 't', n: b('Time', '耗时'), unit: 's', lower: true }],
    rows: [['openai/whisper · fp16', 143], ['transformers · fp16', 112], ['whisper.cpp · fp16', 65], ['faster-whisper · fp16', 63], ['faster-whisper · int8', 59], ['faster-whisper batch 8 · fp16', 17], ['faster-whisper batch 8 · int8', 16]],
    note: b('Peak memory: 4.7 GB for openai/whisper, 2.9 GB for faster-whisper int8.', '显存峰值：openai/whisper 4.7 GB，faster-whisper int8 2.9 GB。'),
  },
  yolo: {
    name: b('YOLO11 detection latency', 'YOLO11 检测延迟'),
    src: { label: 'Ultralytics · YOLO11 docs', url: 'https://docs.ultralytics.com/models/yolo11/', ver: b('T4 · TensorRT 10 · 640 px · COCO', 'T4 · TensorRT 10 · 640 px · COCO') },
    cols: [{ k: 'ms', n: b('ms per image', '每张耗时'), unit: 'ms', lower: true }, { k: 'map', n: b('Accuracy (mAP 50–95)', '精度（mAP 50–95）'), unit: '' }],
    rows: [['YOLO11n', 1.5, 39.5], ['YOLO11s', 2.5, 47.0], ['YOLO11m', 4.7, 51.5], ['YOLO11l', 6.2, 53.4], ['YOLO11x', 11.3, 54.7]],
    note: b('T4 is a 70 W inference card; current RTX cards are faster.', 'T4 是 70 W 的推理卡，现在的 RTX 显卡更快。'),
  },
  deepstream: {
    name: b('DeepStream video analytics', 'DeepStream 视频分析'),
    src: { label: 'NVIDIA DeepStream 9.2 · performance', url: 'https://docs.nvidia.com/metropolis/deepstream/dev-guide/text/DS_Performance.html', ver: b('1080p H.265 input · FP16 · display off', '1080p H.265 输入 · FP16 · 关闭显示') },
    cols: [{ k: 'pn', n: b('PeopleNet + tracker', 'PeopleNet + 跟踪'), unit: 'FPS' }, { k: 'rt', n: b('RT-DETR', 'RT-DETR'), unit: 'FPS' }, { k: 'tc', n: b('TrafficCamNet + tracker', 'TrafficCamNet + 跟踪'), unit: 'FPS' }, { k: 'seg', n: b('SegFormer', 'SegFormer'), unit: 'FPS' }],
    rows: [['rtx-pro-6000', 1899, 1063, 994, 1348], ['RTX PRO 6000 Server', 1524, 1037, 920, 1291], ['L40S', 1114, 643, 643, 986], ['RTX PRO 4500 Server', 741, 380, 373, 633]],
    note: b('Total frames per second across streams; divide by 30 for a rough count of 1080p30 cameras.', '所有视频流合计的每秒帧数；除以 30 可以粗略估算能接多少路 1080p30 摄像头。'),
  },
  isaac: {
    name: b('Isaac Sim performance', 'Isaac Sim 性能'),
    src: { label: 'NVIDIA Isaac Sim · benchmarks', url: 'https://docs.isaacsim.omniverse.nvidia.com/latest/reference_material/benchmarks.html', ver: b('Ubuntu · one GPU', 'Ubuntu · 单卡') },
    cols: [{ k: 'wh', n: b('Warehouse scene FPS', '仓库场景 FPS'), unit: 'FPS' }, { k: 'ros', n: b('ROS 2 sensors FPS', 'ROS 2 传感器 FPS'), unit: 'FPS' }, { k: 'sdg', n: b('Synthetic data, images/s', '合成数据 张/秒'), unit: 'img/s' }],
    rows: [['rtx-pro-6000', 186.92, 48.08, 40.15], ['RTX 5080', 172.71, 33.21, 42.9], ['L40', 127.71, 32.17, 25.96], ['RTX PRO 6000 Server', 118.5, 37.3, 36.1]],
    note: b('Workstation rows use a Core Ultra 9 285K; server rows use dual Xeon.', '工作站用 Core Ultra 9 285K，服务器用双路 Xeon。'),
  },
  nvhpc: {
    name: b('HPC apps: speed-up over a CPU node', 'HPC 应用：相对 CPU 节点的加速比'),
    src: { label: 'NVIDIA · HPC application performance', url: 'https://developer.nvidia.com/hpc-application-performance', ver: b('2 GPUs vs dual AMD Genoa 9684X CPU node', '2 张 GPU 对比双路 AMD Genoa 9684X 节点') },
    cols: [{ k: 'amber', n: b('AMBER JAC', 'AMBER JAC'), unit: '×' }, { k: 'gmx', n: b('GROMACS ADH', 'GROMACS ADH'), unit: '×' }, { k: 'namd', n: b('NAMD ApoA1', 'NAMD ApoA1'), unit: '×' }, { k: 'milc', n: b('MILC', 'MILC'), unit: '×' }, { k: 'chroma', n: b('Chroma', 'Chroma'), unit: '×' }, { k: 'rtm', n: b('RTM seismic', 'RTM 地震成像'), unit: '×' }, { k: 'fun3d', n: b('FUN3D CFD', 'FUN3D 流体'), unit: '×' }],
    rows: [['2 × H100 SXM', 24.4, 4.7, 7.0, 21.0, 92.9, 14.5, 8.5], ['2 × RTX PRO 6000 Server', 30.6, 6.8, 8.9, 11.7, 52.8, 8.7, 3.6], ['2 × L40S', 21.9, 4.1, 5.5, 6.7, 27.3, 4.0, 2.0]],
    note: b('Speed-ups are calculated by us from the published times and rates.', '加速比由我们根据官方公布的时间和速率计算。'),
  },
};

/* NVENC per GPU: [encoders, max concurrent sessions, AV1 encode]. Source: NVIDIA support matrix. */
export const NVENC_SRC = 'https://developer.nvidia.com/video-encode-and-decode-gpu-support-matrix-new';
export const NVENC = {
  'rtx-5090': [3, '12', true], 'rtx-5060': [1, '12', true], 'rtx-4090': [2, '12', true], 'rtx-4060': [1, '12', true], 'rtx-3060-ti': [1, '12', false], 'rtx-2060': [1, '12', false],
  'gtx-1660': [1, '12', false], 'gtx-1650': [1, '12', false], 'rtx-a4000': [1, '∞', false], 'rtx-a5000': [1, '∞', false], 'rtx-a6000': [1, '∞', false],
  'rtx-pro-2000': [1, '∞', true], 'rtx-pro-4000': [2, '∞', true], 'rtx-pro-5000': [3, '∞', true], 'rtx-pro-6000': [4, '∞', true], a40: [1, '∞', false],
  'a100-40': [0, '–', false], 'a100-80': [0, '–', false], 'h100-pcie': [0, '–', false], v100: [3, '∞', false], p100: [3, '∞', false], t1000: [1, '8', false], 'quadro-p1000': [1, '8', false], 'quadro-p600': [1, '8', false],
};

/* Short published facts used on scenario pages */
export const FACTS = {
  toms: { label: "Tom's Hardware · Stable Diffusion benchmarks", url: 'https://www.tomshardware.com/pc-components/gpus/stable-diffusion-benchmarks' },
  wan21: { label: 'Wan2.1 · official README', url: 'https://github.com/Wan-Video/Wan2.1' },
  wan22: { label: 'Wan2.2 · official README', url: 'https://github.com/Wan-Video/Wan2.2' },
  cudf150: { label: 'NVIDIA blog · cuDF pandas ~150×', url: 'https://developer.nvidia.com/blog/rapids-cudf-accelerates-pandas-nearly-150x-with-zero-code-changes/' },
  cudf50: { label: 'NVIDIA blog · cuDF pandas 50× on L4', url: 'https://developer.nvidia.com/blog/rapids-cudf-instantly-accelerates-pandas-up-to-50x-on-google-colab/' },
  isaacReq: { label: 'Isaac Sim · requirements', url: 'https://docs.isaacsim.omniverse.nvidia.com/latest/installation/requirements.html' },
};
