export const media = {
  care: `${import.meta.env.BASE_URL}media/reading-room-editorial.webp`,
  jointAtlas: `${import.meta.env.BASE_URL}media/joint-mri-atlas.webp`,
};
export const products = [
  {
    id: "cloud",
    label: "影像云",
    eyebrow: "CLOUD IMAGING",
    title: "一份影像。\n连接整个医疗网络。",
    summary: "从影像存储到远程协作，让医院、医生与患者之间的连接，更近一步。",
    detail:
      "以影联网为连接入口，围绕区域影像云、电子胶片和远程会诊，让影像资料与专业服务连接。产品展台呈现这些业务方向的界面设计概念。",
    features: ["区域影像云", "数字影像", "远程会诊"],
  },
  {
    id: "ai",
    label: "影像智能",
    eyebrow: "INTELLIGENT IMAGING",
    title: "多一份洞察。\n看见更多细节。",
    summary: "把 AI 融入阅片过程，让影像信息更清晰，让专业判断更从容。",
    detail:
      "结合公开的医学影像 AI 合作方向，探索质控、报告协同与影像对比的界面设计。具体能力以正式产品信息为准，展台不执行影像分析或诊断。",
    features: ["质控场景", "报告协同", "多期对比"],
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
    name: "数字影像",
    title: "影像与报告，随时相连。",
    description: "从电子胶片到检查报告，让移动查阅和影像分享有更轻便的体验。",
    nodes: ["电子胶片", "检查报告", "移动查阅"],
    focus: "数字影像服务",
  },
  {
    name: "远程会诊",
    title: "专业支持，可以更近。",
    description: "把资料准备、阅片讨论与专家复核，连接为一次连续的协作。",
    nodes: ["资料准备", "协同阅片", "专家复核"],
    focus: "远程阅片协作",
  },
] as const;
export const aiModes = [
  {
    name: "智能质控",
    title: "让资料核对，更有条理。",
    description:
      "将检查序列、关联资料与复核事项放在一起，探索清晰的影像质控体验。",
    panelTitle: "关注影像质量。",
    panelIntro: "整理资料核对事项，为专业复核保留清晰的路径。",
    items: ["检查序列关联", "检查资料核对", "专业质量复核"],
    document: "质控复核清单",
  },
  {
    name: "报告协同",
    title: "影像与信息，在一处汇合。",
    description: "把关联资料组织成可复核的报告框架，让医生继续完善所见与结论。",
    panelTitle: "组织报告框架。",
    panelIntro: "从资料到结构化信息，保留医生补充和确认的空间。",
    items: ["检查资料整理", "报告框架组织", "医生补充确认"],
    document: "待复核报告框架",
  },
  {
    name: "多期对比",
    title: "并列查看，让对照更直观。",
    description:
      "把参考视图与当前视图并列呈现，为医生进一步比对提供清晰的界面。",
    panelTitle: "让对照更直观。",
    panelIntro: "关联影像与参考资料，支持专业人员继续比对。",
    items: ["参考影像关联", "对照资料整理", "医生比对复核"],
    document: "影像对照资料索引",
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
  partnership: "https://cn.careverse.com/",
};
