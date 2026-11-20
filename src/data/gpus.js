/* GPU data — specs from public NVIDIA datasheets / product pages. fp32:null where NVIDIA does not publish a figure.
   tier: 0 entry · 1 GeForce · 2 professional · 3 data center. vram = memory one GPU can address (used for sizing). */
export const GPUS=[
 {id:'gt-730',imgNote:'Illustrative render. This model is sold by board partners only; NVIDIA publishes no product photo.',full:'GeForce GT 730',name:'GT 730',series:'Entry',tier:0,arch:'Kepler',vram:2,mem:'DDR3',bus:64,bw:14.4,tdp:23,cuda:384,tensor:0,rt:0,fp32:0.69,fp64:null,pcie:'PCIe 2.0 ×8',slots:'1-slot, low profile',cool:'Active',ecc:false,nvlink:false,mig:false,nvenc:null,gfx:true,img:'gpu-lp',
  use:['video','cad'],intro:'Entry display card for remote desktops, office graphics and HD media playback. Not designed for AI or 3D workloads.'},
 {id:'quadro-p600',imgNote:'Illustrative render. The product page and datasheet are no longer on nvidia.com.',full:'Quadro P600',name:'P600',series:'Entry',tier:0,arch:'Pascal',vram:2,mem:'GDDR5',bus:128,bw:64,tdp:40,cuda:384,tensor:0,rt:0,fp32:1.2,fp64:null,pcie:'PCIe 3.0 ×16',slots:'1-slot, low profile',cool:'Active',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'gpu-lp',
  use:['cad','video'],intro:'Entry professional card with certified drivers for 2D/3D CAD and multi-display desktops.'},
 {id:'quadro-p1000',full:'Quadro P1000',name:'P1000',series:'Entry',tier:0,arch:'Pascal',vram:4,mem:'GDDR5',bus:128,bw:82,tdp:47,cuda:640,tensor:0,rt:0,fp32:1.9,fp64:null,pcie:'PCIe 3.0 ×16',slots:'1-slot, low profile',cool:'Active',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/quadro-p1000',
  use:['cad','video'],intro:'Low-profile professional card for CAD, light DCC and four-display workstations.'},
 {id:'t1000',full:'NVIDIA T1000 8GB',name:'T1000',series:'Entry',tier:0,arch:'Turing',vram:8,mem:'GDDR6',bus:128,bw:160,tdp:50,cuda:896,tensor:0,rt:0,fp32:2.5,fp64:null,pcie:'PCIe 3.0 ×16',slots:'1-slot, low profile',cool:'Active',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/t1000',
  use:['cad','video'],intro:'Turing low-profile professional card with 8 GB for CAD, design apps and video encode.'},
 {id:'gtx-1650',imgNote:'Illustrative render. NVIDIA made no Founders Edition of this model, so there is no NVIDIA product photo; cards come from board partners.',full:'GeForce GTX 1650',name:'GTX 1650',series:'GeForce',tier:1,arch:'Turing',vram:4,mem:'GDDR5',bus:128,bw:128,tdp:75,cuda:896,tensor:0,rt:0,fp32:3.0,fp64:null,pcie:'PCIe 3.0 ×16',slots:'2-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'gpu1',
  use:['game','video'],intro:'Entry gaming GPU for 1080p esports titles, streaming and video playback.'},
 {id:'gtx-1660',imgNote:'Illustrative render. NVIDIA made no Founders Edition of this model, so there is no NVIDIA product photo; cards come from board partners.',full:'GeForce GTX 1660',name:'GTX 1660',series:'GeForce',tier:1,arch:'Turing',vram:6,mem:'GDDR5',bus:192,bw:192,tdp:120,cuda:1408,tensor:0,rt:0,fp32:5.0,fp64:null,pcie:'PCIe 3.0 ×16',slots:'2-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'gpu1',
  use:['game','video'],intro:'1080p gaming and streaming with Turing NVENC. No RT or Tensor cores.'},
 {id:'rtx-2060',imgNote:'Illustrative render. The product page has been retired from nvidia.com.',full:'GeForce RTX 2060',name:'RTX 2060',series:'GeForce',tier:1,arch:'Turing',vram:6,mem:'GDDR6',bus:192,bw:336,tdp:160,cuda:1920,tensor:240,rt:30,fp32:6.5,fp64:null,pcie:'PCIe 3.0 ×16',slots:'2-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'gpu1',
  use:['game','video','render','cv'],intro:'First-generation RTX: ray tracing and DLSS for gaming, plus Tensor cores for light AI.'},
 {id:'rtx-3060-ti',full:'GeForce RTX 3060 Ti',name:'RTX 3060 Ti',series:'GeForce',tier:1,arch:'Ampere',vram:8,mem:'GDDR6',bus:256,bw:448,tdp:200,cuda:4864,tensor:152,rt:38,fp32:16.2,fp64:null,pcie:'PCIe 4.0 ×16',slots:'2-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/rtx-3060-ti',
  use:['game','video','render','img','vgen','cv','data','speech'],intro:'Ampere gaming GPU for 1440p, creator apps and small AI models.'},
 {id:'rtx-4060',imgNote:'Illustrative render. NVIDIA made no Founders Edition of this model, so there is no NVIDIA product photo; cards come from board partners.',full:'GeForce RTX 4060',name:'RTX 4060',series:'GeForce',tier:1,arch:'Ada Lovelace',vram:8,mem:'GDDR6',bus:128,bw:272,tdp:115,cuda:3072,tensor:96,rt:24,fp32:15.1,fp64:null,pcie:'PCIe 4.0 ×8',slots:'2-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'gpu1',
  use:['game','video','render','img','vgen','cv','speech'],intro:'Efficient Ada GPU with AV1 encode and DLSS 3 for 1080p gaming and streaming.'},
 {id:'rtx-5060',imgNote:'Illustrative render. NVIDIA made no Founders Edition of this model, so there is no NVIDIA product photo; cards come from board partners.',full:'GeForce RTX 5060',name:'RTX 5060',series:'GeForce',tier:1,arch:'Blackwell',vram:8,mem:'GDDR7',bus:128,bw:448,tdp:145,cuda:3840,tensor:120,rt:30,fp32:19.2,fp64:null,pcie:'PCIe 5.0 ×8',slots:'2-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'gpu1',
  use:['game','video','render','img','vgen','cv','speech'],intro:'Blackwell entry GPU with GDDR7 and DLSS 4 for gaming, streaming and creator apps.'},
 {id:'rtx-a4000',full:'NVIDIA RTX A4000',name:'RTX A4000',series:'Professional',tier:2,arch:'Ampere',vram:16,mem:'GDDR6',bus:256,bw:448,tdp:140,cuda:6144,tensor:192,rt:48,fp32:19.2,fp64:null,pcie:'PCIe 4.0 ×16',slots:'1-slot',cool:'Blower',ecc:true,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/rtx-a4000',
  use:['cad','render','video','img','vgen','llm','cv','data','speech'],intro:'Single-slot professional GPU with 16 GB ECC for CAD, rendering and mid-size AI.'},
 {id:'rtx-pro-2000',full:'RTX PRO 2000 Blackwell',name:'RTX PRO 2000',series:'Professional',tier:2,arch:'Blackwell',vram:16,mem:'GDDR7',bus:128,bw:288,tdp:70,cuda:4352,tensor:136,rt:34,fp32:17,fp64:null,pcie:'PCIe 5.0 ×8',slots:'2-slot, low profile',cool:'Active',ecc:true,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/rtx-pro-2000',
  use:['cad','render','video','img','vgen','llm','cv','data','speech'],intro:'70 W compact Blackwell card with 16 GB ECC GDDR7 for design, visualization and AI.'},
 {id:'rtx-a5000',full:'NVIDIA RTX A5000',name:'RTX A5000',series:'Professional',tier:2,arch:'Ampere',vram:24,mem:'GDDR6',bus:384,bw:768,tdp:230,cuda:8192,tensor:256,rt:64,fp32:27.8,fp64:null,pcie:'PCIe 4.0 ×16',slots:'2-slot',cool:'Blower',ecc:true,nvlink:true,mig:false,nvenc:true,gfx:true,img:'official/rtx-a5000',
  use:['cad','render','video','img','vgen','llm','train','cv','data','speech','bio'],intro:'24 GB ECC workstation GPU for rendering, simulation and AI, with NVLink.'},
 {id:'rtx-pro-4000',full:'RTX PRO 4000 Blackwell',name:'RTX PRO 4000',series:'Professional',tier:2,arch:'Blackwell',vram:24,mem:'GDDR7',bus:192,bw:672,tdp:145,cuda:8960,tensor:280,rt:70,fp32:null,pcie:'PCIe 5.0 ×16',slots:'1-slot',cool:'Active',ecc:true,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/rtx-pro-4000',
  use:['cad','render','video','img','vgen','llm','cv','data','speech'],intro:'Single-slot Blackwell professional GPU with 24 GB ECC GDDR7.'},
 {id:'rtx-a6000',full:'NVIDIA RTX A6000',name:'RTX A6000',series:'Professional',tier:2,arch:'Ampere',vram:48,mem:'GDDR6',bus:384,bw:768,tdp:300,cuda:10752,tensor:336,rt:84,fp32:38.7,fp64:null,pcie:'PCIe 4.0 ×16',slots:'2-slot',cool:'Blower',ecc:true,nvlink:true,mig:false,nvenc:true,gfx:true,img:'official/rtx-a6000',
  use:['cad','render','video','img','vgen','llm','train','robot','cv','data','speech','bio'],intro:'48 GB ECC workstation GPU for large scenes, simulation and AI, with NVLink.'},
 {id:'rtx-pro-5000',full:'RTX PRO 5000 Blackwell',name:'RTX PRO 5000',series:'Professional',tier:2,arch:'Blackwell',vram:48,mem:'GDDR7',bus:384,bw:1344,tdp:300,cuda:14080,tensor:440,rt:110,fp32:null,pcie:'PCIe 5.0 ×16',slots:'2-slot',cool:'Active',ecc:true,nvlink:false,mig:true,nvenc:true,gfx:true,img:'official/rtx-pro-5000',
  use:['cad','render','video','img','vgen','llm','train','robot','cv','data','speech','bio'],intro:'Blackwell professional GPU with 48 GB ECC GDDR7 and MIG partitioning.'},
 {id:'rtx-pro-6000',full:'RTX PRO 6000 Blackwell',name:'RTX PRO 6000',series:'Professional',tier:2,arch:'Blackwell',vram:96,mem:'GDDR7',bus:512,bw:1792,tdp:600,cuda:24064,tensor:752,rt:188,fp32:125,fp64:null,pcie:'PCIe 5.0 ×16',slots:'2-slot',cool:'Edition-dependent',ecc:true,nvlink:false,mig:true,nvenc:true,gfx:true,img:'official/rtx-pro-6000',
  use:['cad','render','video','img','vgen','llm','train','robot','cv','data','speech','bio'],intro:'Full GB202 with 96 GB ECC GDDR7 — the largest single-GPU memory here outside HBM cards.'},
 {id:'rtx-4090',full:'GeForce RTX 4090',name:'RTX 4090',series:'GeForce',tier:1,arch:'Ada Lovelace',vram:24,mem:'GDDR6X',bus:384,bw:1008,tdp:450,cuda:16384,tensor:512,rt:128,fp32:82.6,fp64:null,pcie:'PCIe 4.0 ×16',slots:'3-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/rtx-4090',
  use:['game','video','render','img','vgen','llm','train','cv','data','speech','bio'],intro:'Ada flagship with 24 GB. Strong for 4K gaming, rendering, image generation and small LLMs.'},
 {id:'rtx-5090',full:'GeForce RTX 5090',name:'RTX 5090',series:'GeForce',tier:1,arch:'Blackwell',vram:32,mem:'GDDR7',bus:512,bw:1792,tdp:575,cuda:21760,tensor:680,rt:170,fp32:104.8,fp64:null,pcie:'PCIe 5.0 ×16',slots:'2-slot',cool:'Active (fans)',ecc:false,nvlink:false,mig:false,nvenc:true,gfx:true,img:'official/rtx-5090',
  use:['game','video','render','img','vgen','llm','train','cv','data','speech','bio'],intro:'Blackwell flagship with 32 GB GDDR7 and 1.79 TB/s for gaming, rendering and AI.'},
 {id:'a40',full:'NVIDIA A40',name:'A40',series:'Data Center',tier:3,arch:'Ampere',vram:48,mem:'GDDR6',bus:384,bw:696,tdp:300,cuda:10752,tensor:336,rt:84,fp32:37.4,fp64:null,pcie:'PCIe 4.0 ×16',slots:'2-slot',cool:'Passive',ecc:true,nvlink:true,mig:false,nvenc:true,gfx:true,img:'official/a40',
  use:['render','cad','video','img','vgen','llm','train','robot','cv','speech'],intro:'Data center visual computing GPU: 48 GB ECC, RT cores and vGPU support for rendering and virtual workstations.'},
 {id:'a100-40',full:'NVIDIA A100 40GB PCIe',name:'A100 40GB',series:'Data Center',tier:3,arch:'Ampere',vram:40,mem:'HBM2',bus:5120,bw:1555,tdp:250,cuda:6912,tensor:432,rt:0,fp32:19.5,fp64:9.7,pcie:'PCIe 4.0 ×16',slots:'2-slot',cool:'Passive',ecc:true,nvlink:true,mig:true,nvenc:false,gfx:false,img:'official/a100',
  use:['llm','train','hpc','cv','data','speech','bio'],intro:'Ampere data center GPU for AI training, inference and FP64 HPC. MIG splits it into up to 7 instances.'},
 {id:'a100-80',full:'NVIDIA A100 80GB PCIe',name:'A100 80GB',series:'Data Center',tier:3,arch:'Ampere',vram:80,mem:'HBM2e',bus:5120,bw:1935,tdp:300,cuda:6912,tensor:432,rt:0,fp32:19.5,fp64:9.7,pcie:'PCIe 4.0 ×16',slots:'2-slot',cool:'Passive',ecc:true,nvlink:true,mig:true,nvenc:false,gfx:false,img:'official/a100',
  use:['llm','train','hpc','cv','data','speech','bio'],intro:'80 GB HBM2e A100 for large models, long contexts and FP64 HPC.'},
 {id:'h100-pcie',imgNote:'NVIDIA image of the H100 GPU module. The PCIe card has a different form.',full:'NVIDIA H100 PCIe',name:'H100',series:'Data Center',tier:3,arch:'Hopper',vram:80,mem:'HBM2e',bus:5120,bw:2000,tdp:350,cuda:14592,tensor:456,rt:0,fp32:51,fp64:26,pcie:'PCIe 5.0 ×16',slots:'2-slot',cool:'Passive',ecc:true,nvlink:true,mig:true,nvenc:false,gfx:false,img:'official/h100',
  use:['llm','train','hpc','cv','data','speech','bio'],intro:'Hopper with the Transformer Engine (FP8) for large-model training, inference and HPC.'},
 {id:'v100',imgNote:'NVIDIA image of the V100 GPU package, not the full PCIe card.',full:'Tesla V100 16GB PCIe',name:'V100',series:'Data Center',tier:3,arch:'Volta',vram:16,mem:'HBM2',bus:4096,bw:900,tdp:250,cuda:5120,tensor:640,rt:0,fp32:14,fp64:7,pcie:'PCIe 3.0 ×16',slots:'2-slot',cool:'Passive',ecc:true,nvlink:false,mig:false,nvenc:true,gfx:false,img:'official/v100',
  use:['train','hpc','llm','cv','data','bio','speech'],intro:'First GPU with Tensor cores. Still capable for FP64 HPC and classic deep learning.'},
 {id:'p100',imgNote:'NVIDIA image of the P100 GPU package, not the full PCIe card.',full:'Tesla P100 16GB PCIe',name:'P100',series:'Data Center',tier:3,arch:'Pascal',vram:16,mem:'HBM2',bus:4096,bw:732,tdp:250,cuda:3584,tensor:0,rt:0,fp32:9.3,fp64:4.7,pcie:'PCIe 3.0 ×16',slots:'2-slot',cool:'Passive',ecc:true,nvlink:false,mig:false,nvenc:true,gfx:false,img:'official/p100',
  use:['hpc','train','data'],intro:'Pascal HPC accelerator with strong FP64 and HBM2. No Tensor cores.'},
 {id:'k80',full:'Tesla K80',name:'K80',series:'Data Center',tier:3,arch:'Kepler',vram:12,vtot:24,dual:true,mem:'GDDR5',bus:384,bw:240,tdp:300,cuda:4992,tensor:0,rt:0,fp32:8.73,fp64:2.91,pcie:'PCIe 3.0 ×16',slots:'2-slot',cool:'Passive',ecc:true,nvlink:false,mig:false,nvenc:null,gfx:false,img:'official/k80',
  use:['hpc'],intro:'Dual-GPU Kepler board: two GPUs with 12 GB each (24 GB total). Legacy CUDA only — current AI frameworks no longer support Kepler.'},
];

/* Chinese copy for intros and image notes, keyed by GPU id */
const ZH_INTRO={
 'gt-730':'入门显示卡，用于远程桌面、办公图形和高清视频播放，不适合 AI 或 3D。',
 'quadro-p600':'入门专业卡，带认证驱动，适合 2D/3D CAD 和多屏桌面。',
 'quadro-p1000':'半高专业卡，适合 CAD、轻量设计和四屏工作站。',
 't1000':'Turing 半高专业卡，8 GB 显存，适合 CAD、设计软件和视频编码。',
 'gtx-1650':'入门游戏卡，适合 1080p 电竞游戏、直播和视频播放。',
 'gtx-1660':'1080p 游戏和直播，带 Turing NVENC，没有 RT 和 Tensor 核心。',
 'rtx-2060':'第一代 RTX：光追和 DLSS 游戏，Tensor 核心可做轻量 AI。',
 'rtx-3060-ti':'Ampere 游戏卡，适合 1440p、创作软件和小型 AI 模型。',
 'rtx-4060':'高能效 Ada 卡，支持 AV1 编码和 DLSS 3，适合 1080p 游戏和直播。',
 'rtx-5060':'Blackwell 入门卡，GDDR7 显存和 DLSS 4，适合游戏、直播和创作。',
 'rtx-a4000':'单槽专业卡，16 GB ECC 显存，适合 CAD、渲染和中等规模 AI。',
 'rtx-pro-2000':'70 W 小尺寸 Blackwell 卡，16 GB ECC GDDR7，适合设计、可视化和 AI。',
 'rtx-a5000':'24 GB ECC 工作站卡，适合渲染、仿真和 AI，支持 NVLink。',
 'rtx-pro-4000':'单槽 Blackwell 专业卡，24 GB ECC GDDR7。',
 'rtx-a6000':'48 GB ECC 工作站卡，适合大场景、仿真和 AI，支持 NVLink。',
 'rtx-pro-5000':'Blackwell 专业卡，48 GB ECC GDDR7，支持 MIG 切分。',
 'rtx-pro-6000':'完整 GB202 核心，96 GB ECC GDDR7，是 HBM 卡之外单卡显存最大的型号。',
 'rtx-4090':'Ada 旗舰，24 GB 显存，擅长 4K 游戏、渲染、生图和小型大模型。',
 'rtx-5090':'Blackwell 旗舰，32 GB GDDR7、1.79 TB/s 带宽，适合游戏、渲染和 AI。',
 'a40':'数据中心可视计算卡：48 GB ECC、RT 核心，支持 vGPU，适合渲染和虚拟工作站。',
 'a100-40':'Ampere 数据中心卡，用于 AI 训练、推理和 FP64 高性能计算，MIG 最多切 7 份。',
 'a100-80':'80 GB HBM2e 的 A100，适合大模型、长上下文和 FP64 计算。',
 'h100-pcie':'Hopper 架构，Transformer Engine 支持 FP8，适合大模型训练、推理和高性能计算。',
 'v100':'第一款带 Tensor 核心的 GPU，仍可胜任 FP64 计算和传统深度学习。',
 'p100':'Pascal 高性能计算卡，FP64 强，HBM2 显存，没有 Tensor 核心。',
 'k80':'双芯 Kepler 卡：两颗 GPU 各 12 GB（共 24 GB）。仅支持旧版 CUDA，当前 AI 框架已不支持 Kepler。',
};
const ZH_NOTE={
 board:'示意渲染图。该型号只有板卡厂商生产，NVIDIA 没有官方产品图。',
 retired:'示意渲染图。NVIDIA 官网已下架该产品页。',
 nofe:'示意渲染图。NVIDIA 没有出公版，因此没有官方产品图，显卡由板卡厂商生产。',
 module:'NVIDIA 官方的 GPU 模组图，PCIe 版外形不同。',
 pkg:'NVIDIA 官方的 GPU 芯片封装图，不是完整的 PCIe 卡。',
};
const noteKey=n=>!n?null:n.includes('board partners only')?'board':n.includes('no longer on')||n.includes('retired')?'retired':n.includes('Founders Edition')?'nofe':n.includes('module')?'module':'pkg';
const SERIES_ZH={Entry:'入门',GeForce:'GeForce',Professional:'专业','Data Center':'数据中心'};

GPUS.forEach(g=>{
  g.vtot=g.vtot||g.vram;
  g.memL=g.dual?`2 × 12 GB ${g.mem}`:`${g.vram} GB ${g.mem}`;
  g.introI={en:g.intro,zh:ZH_INTRO[g.id]};
  if(g.imgNote)g.imgNoteI={en:g.imgNote,zh:ZH_NOTE[noteKey(g.imgNote)]};
  g.seriesI={en:g.series,zh:SERIES_ZH[g.series]};
});

export const G=id=>GPUS.find(g=>g.id===id);
export const SLOT=['#245AE8','#0F8B8D','#B7791F','#7A3E9D'];
export const fmt=n=>n.toLocaleString('en-US');
export const f1=n=>(Math.round(n*10)/10).toFixed(1);
