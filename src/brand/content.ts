export const media = {
  care: `${import.meta.env.BASE_URL}media/reading-room.webp`,
  imagingHero: `${import.meta.env.BASE_URL}media/joint-imaging-hero.webp`,
  jointAtlas: `${import.meta.env.BASE_URL}media/joint-mri-atlas.webp`,
};
export const products = [
  {
    id: "cloud",
    label: "云影像",
    eyebrow: "CLOUD IMAGING",
    title: "一份影像。\n连接整个医疗网络。",
    summary: "从影像存储到远程协作，让医院、医生与患者之间的连接，更近一步。",
    detail:
      "以影像云为连接基础，贯穿检查、影像访问与远程协作。区域影像云、院内影像管理与远程会诊，围绕同一条诊疗路径协同工作。",
    features: ["区域影像共享", "院内影像管理", "远程阅片协作"],
  },
  {
    id: "ai",
    label: "AI 辅助诊断",
    eyebrow: "INTELLIGENT IMAGING",
    title: "多一份洞察。\n看见更多细节。",
    summary: "把 AI 融入阅片过程，让影像信息更清晰，让专业判断更从容。",
    detail:
      "围绕影像阅片场景，以 AI 辅助识别、信息组织与结构化表达，支持医生进一步复核。这里的标注与影像均为交互设计示意，不呈现临床诊断结论。",
    features: ["影像辅助分析", "信息结构化", "医生复核"],
  },
  {
    id: "agent",
    label: "医疗 Agent",
    eyebrow: "MEDICAL AGENT",
    title: "从一个问题。\n到有序的协作。",
    summary: "让影像、报告和知识，在一条连续的工作流中彼此连接。",
    detail:
      "医疗 Agent 章节展示影像资料整理、报告协作与知识检索的交互概念：按步骤连接资料、工具与人工复核。并非对已发布产品规格或临床性能的承诺。",
    features: ["资料整理", "协作流程", "人工确认"],
  },
] as const;
export const cloudModes = [
  {
    name: "区域影像云",
    title: "跨越院区，影像同频。",
    description: "连接区域内的影像资源，让协同阅片有一条清晰的路径。",
    nodes: ["区域中心", "综合医院", "基层机构"],
    focus: "区域协同网络",
  },
  {
    name: "院内云 PACS",
    title: "检查与阅片，顺畅衔接。",
    description: "让影像归档、科室访问和报告管理，围绕院内工作流有序展开。",
    nodes: ["影像归档", "临床科室", "报告中心"],
    focus: "院内影像工作流",
  },
  {
    name: "远程协作",
    title: "专业支持，可以更近。",
    description: "把资料准备、阅片讨论与专家复核，连接为一次连续的协作。",
    nodes: ["资料准备", "协同阅片", "专家复核"],
    focus: "远程阅片协作",
  },
] as const;
export const agentModes = [
  {
    name: "影像报告",
    prompt: "整理本次影像资料，生成待复核的报告框架。",
    steps: ["整理检查资料", "组织影像信息", "生成报告框架", "交由医生复核"],
    result: [
      "检查资料 · 已整理",
      "影像所见 · 待医生补充",
      "报告结论 · 待医生确认",
    ],
    note: "从资料准备到报告框架，让医生把注意力留给专业判断。",
  },
  {
    name: "临床协作",
    prompt: "为远程阅片讨论准备一份协作清单。",
    steps: ["收集协作资料", "核对检查序列", "整理讨论事项", "等待专家确认"],
    result: ["影像资料 · 已关联", "讨论事项 · 已整理", "专家意见 · 待确认"],
    note: "让资料、任务与复核责任有序连接，协作进度清晰可见。",
  },
  {
    name: "知识检索",
    prompt: "整理影像阅片相关资料，列出可追溯的来源。",
    steps: ["明确检索主题", "检索参考资料", "整理来源索引", "由使用者核验"],
    result: ["检索主题 · 已明确", "资料索引 · 已整理", "参考来源 · 待核验"],
    note: "为资料检索建立可追溯的路径，保留核验和进一步判断的空间。",
  },
] as const;
export const solutions = [
  {
    name: "区域医疗",
    headline: "让优质影像服务，\n走得更远。",
    text: "以区域影像连接为起点，串联医疗机构与专业资源，让跨院协作成为更自然的日常。",
    points: ["影像资源连接", "区域协同阅片", "专业支持下沉"],
  },
  {
    name: "医共体",
    headline: "一个协作网络。\n一条连续路径。",
    text: "围绕牵头医院与基层机构的协作关系，组织检查资料、阅片支持和报告反馈。",
    points: ["机构协作", "资料流转", "报告反馈"],
  },
  {
    name: "医疗机构",
    headline: "把专业的每一步，\n连接得更顺畅。",
    text: "从影像管理到科室协同，为院内检查、阅片和复核流程提供连贯的数字化体验。",
    points: ["院内影像管理", "跨科室访问", "阅片与复核"],
  },
] as const;
export const sources = {
  platform: "https://www.imagingunion.com/iunet/login",
  partnership: "https://shukun.net/news/8/335.html",
};
