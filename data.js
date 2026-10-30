const initialRecords=[
{id:'T-001',name:'林知远',direction:'多模态生成',institution:'清华大学 · 模拟视觉计算研究组',source:'目标实验室 → 论文作者',evidence:'模拟论文：跨模态表示与生成方法',link:'有',status:'待核验',note:'需核对作者身份与当前机构'},
{id:'T-002',name:'周亦辰',direction:'音频生成',institution:'上海交通大学 · 模拟语音研究组',source:'研究团队 → 合作论文',evidence:'模拟项目：语音生成与音色建模',link:'有',status:'核验中',note:'需确认项目个人贡献'},
{id:'T-003',name:'陈思齐',direction:'数据质量',institution:'北京邮电大学 · 模拟数据研究组',source:'团队线索 → 公开项目',evidence:'模拟项目：数据质量监测',link:'有',status:'已复核',note:'示例记录，非真实候选人'},
{id:'T-004',name:'林知远',direction:'多模态生成',institution:'浙江大学 · 模拟智能媒体研究组',source:'共同作者 → 学术主页',evidence:'模拟论文：图文联合生成',link:'有',status:'待核验',note:'与 T-001 姓名相同，需核查是否同一人'},
{id:'T-005',name:'许景行',direction:'音视频生成',institution:'Stanford University · 模拟媒体研究组',source:'目标实验室 → 论文作者',evidence:'模拟论文：音画同步生成',link:'有',status:'待核验',note:''},
{id:'T-006',name:'方予安',direction:'音频生成',institution:'',source:'论文作者 → 合作关系',evidence:'模拟研究摘要：声音合成',link:'无',status:'待核验',note:'机构与来源信息待补充'},
{id:'T-007',name:'顾明轩',direction:'数据质量',institution:'Carnegie Mellon University · 模拟数据研究组',source:'研究团队 → 公开项目',evidence:'模拟项目：数据标注流程设计',link:'有',status:'核验中',note:'需核实项目细节'},
{id:'T-008',name:'叶清和',direction:'音视频生成',institution:'National University of Singapore · 模拟多模态研究组',source:'论文作者 → 合作论文',evidence:'',link:'有',status:'待核验',note:'成果描述待补充'}
];

const demoInstitutionMigration={"北辰大学 · 视觉计算实验室": "清华大学 · 模拟视觉计算研究组", "东岭研究院 · 语音组": "上海交通大学 · 模拟语音研究组", "南川科技 · 数据平台组": "北京邮电大学 · 模拟数据研究组", "西桥大学 · 智能媒体实验室": "浙江大学 · 模拟智能媒体研究组", "北辰大学 · 媒体实验室": "Stanford University · 模拟媒体研究组", "东岭研究院 · 数据智能组": "Carnegie Mellon University · 模拟数据研究组", "西桥大学 · 多模态实验室": "National University of Singapore · 模拟多模态研究组"};
const universityCatalog={"中国内地高校示例": ["清华大学", "北京大学", "浙江大学", "上海交通大学", "复旦大学", "中国科学技术大学", "南京大学", "哈尔滨工业大学", "华中科技大学", "西安交通大学", "北京航空航天大学", "北京理工大学", "同济大学", "东南大学", "天津大学", "南开大学", "中山大学", "武汉大学", "电子科技大学", "西北工业大学", "北京邮电大学", "西安电子科技大学", "北京交通大学", "北京科技大学", "上海大学", "南京航空航天大学"], "港澳及海外高校示例": ["香港大学", "香港中文大学", "香港科技大学", "香港理工大学", "Stanford University", "Massachusetts Institute of Technology", "Carnegie Mellon University", "University of California, Berkeley", "University of Oxford", "University of Cambridge", "ETH Zürich", "National University of Singapore", "Nanyang Technological University", "University of Toronto", "University of Tokyo"]};
