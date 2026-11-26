'use strict';

/* =========================================================
   竹韵 · 数据
   ========================================================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const REG_LABEL = { low: '低音', mid: '中音', high: '高音' };
const REG_DOT = { low: 'is-low', mid: '', high: 'is-high' };
const SCALE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };
const PITCH_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const HOLE_FINGERS = {
  6: '左手食指',
  5: '左手中指',
  4: '左手无名指',
  3: '右手食指',
  2: '右手中指',
  1: '右手无名指'
};
const HOLE_CN = ['零', '一', '二', '三', '四', '五', '六'];
const BLOW = {
  平吹: '气流缓而集中，音色松透。',
  急吹: '气流加速、口风收紧，得到高八度。',
  超吹: '气息更急，音准更要靠耳朵校正。'
};

const KEYS = {
  // 这里存实音中音 1：常规曲笛/梆笛的记谱八度与实际发声须分开。
  // Charlie Lui / Sound of Dragon 音域表：C 曲笛筒音 G4，D 曲笛筒音 A4。
  D: { name: 'D 调', type: '曲笛', midi: 74, desc: '孔距适中、音色温润，是入门首选。' },
  C: { name: 'C 调', type: '曲笛', midi: 72, desc: '管身更长、音色宽厚，需要更稳的气。' },
  G: { name: 'G 调', type: '梆笛', midi: 79, desc: '笛身短、音色亮，需要更急的气流。' },
  F: { name: 'F 调', type: '曲笛', midi: 77, desc: '音色柔和中庸，适合抒情乐句。' }
};

const SYSTEMS = {
  5: {
    name: '筒音作 5',
    short: '作 5',
    tag: '最常用',
    tonic: 0,
    desc: '全按六孔为低音 5，是大多数入门曲的指法。',
    tip: '先记开孔次序，再让手指记住距离。'
  },
  2: {
    name: '筒音作 2',
    short: '作 2',
    tag: 'G 调常用',
    tonic: 5,
    desc: '全按为低音 2；低音 4 与中音 1 会用到半孔或组合指法。',
    tip: '低音 4 的半孔位置，是这套指法的第一道门槛。'
  },
  1: {
    name: '筒音作 1',
    short: '作 1',
    tag: '唱名统一',
    tonic: 7,
    desc: '全按为低音 1，音阶与唱名一一对应。',
    tip: '把 1 当作音阶的起点，唱谱会更容易。'
  }
};

const SYSTEM_ORDER = [5, 2, 1];

function makeNote(degree, reg, holes, blow, tip = '') {
  return {
    degree,
    reg,
    holes,
    blow,
    tip,
    label: REG_LABEL[reg] + degree
  };
}

const FINGERINGS = {
  5: [
    makeNote(5, 'low', '000000', '平吹', '六孔全按，也就是筒音。气息沉下去，音色要松、稳。'),
    makeNote(6, 'low', '000001', '平吹'),
    makeNote(7, 'low', '000011', '平吹'),
    makeNote(1, 'mid', '000111', '平吹', '开第一至三孔，右手三指全开。'),
    makeNote(2, 'mid', '001111', '平吹'),
    makeNote(3, 'mid', '011111', '平吹'),
    makeNote(4, 'mid', '211111', '平吹', '第六孔半按，其余全开。手指向孔边平移，不要抬起来。'),
    makeNote(5, 'mid', '000000', '急吹', '与低音 5 同指法，靠气速升高八度。'),
    makeNote(6, 'mid', '000001', '急吹'),
    makeNote(7, 'mid', '000011', '急吹'),
    makeNote(1, 'high', '000111', '急吹', '高音 1 与中音 1 同指法，气速更快、口风更细。'),
    makeNote(2, 'high', '001111', '急吹'),
    makeNote(3, 'high', '011111', '急吹'),
    makeNote(4, 'high', '211111', '超吹', '半孔加超吹，音准偏紧；初学阶段可以先跳过。'),
    makeNote(5, 'high', '100000', '超吹', '只开第六孔，其余按闭。高音 5 的常用指法。'),
    makeNote(6, 'high', '001001', '超吹', '交叉指法，气息要稳，音准靠耳朵校。')
  ],
  2: [
    makeNote(2, 'low', '000000', '平吹', '六孔全按，筒音唱作低音 2。'),
    makeNote(3, 'low', '000001', '平吹'),
    makeNote(4, 'low', '000021', '平吹', '第一孔开、第二孔半按。求干净，不求快。'),
    makeNote(5, 'low', '000111', '平吹'),
    makeNote(6, 'low', '001111', '平吹'),
    makeNote(7, 'low', '011111', '平吹'),
    makeNote(1, 'mid', '211111', '平吹', '第六孔半按，其余全开。它与低音 2 相隔大七度。'),
    makeNote(2, 'mid', '000000', '急吹', '与低音 2 同指法，急吹升高八度。'),
    makeNote(3, 'mid', '000001', '急吹'),
    makeNote(4, 'mid', '000021', '急吹', '保持半孔位置，气流加速。'),
    makeNote(5, 'mid', '000111', '急吹'),
    makeNote(6, 'mid', '001111', '急吹'),
    makeNote(7, 'mid', '011111', '急吹'),
    makeNote(1, 'high', '211111', '超吹', '半孔加超吹，音色要收紧。'),
    makeNote(2, 'high', '100000', '超吹', '只开第六孔，超吹。'),
    makeNote(3, 'high', '001001', '超吹', '交叉指法，常用于快速经过。')
  ],
  1: [
    makeNote(1, 'low', '000000', '平吹', '六孔全按，筒音即低音 1。'),
    makeNote(2, 'low', '000001', '平吹'),
    makeNote(3, 'low', '000011', '平吹'),
    makeNote(4, 'low', '000111', '平吹'),
    makeNote(5, 'low', '001111', '平吹'),
    makeNote(6, 'low', '011111', '平吹'),
    makeNote(7, 'low', '111111', '平吹', '六孔全开，这就是七级音。'),
    makeNote(1, 'mid', '000000', '急吹', '与低音 1 同指法，急吹升高八度。'),
    makeNote(2, 'mid', '000001', '急吹'),
    makeNote(3, 'mid', '000011', '急吹'),
    makeNote(4, 'mid', '000111', '急吹'),
    makeNote(5, 'mid', '001111', '急吹'),
    makeNote(6, 'mid', '011111', '急吹'),
    makeNote(7, 'mid', '111111', '急吹'),
    makeNote(1, 'high', '100000', '超吹', '开第六孔作超吹，高音 1 的常用指法。'),
    makeNote(2, 'high', '001001', '超吹', '交叉指法，气息集中，音色才不散。')
  ]
};

const STAGES = [
  { numeral: '壹', name: '初识与发声', note: '认识它，再让它响' },
  { numeral: '贰', name: '指法与音阶', note: '让手指记住距离' },
  { numeral: '叁', name: '技巧与乐曲', note: '把练习变成音乐' }
];

const LESSONS = [
  {
    id: 1,
    stage: 0,
    title: '吹响第一声',
    full: '吹响第一声：认识笛子与持笛',
    duration: 10,
    level: '零基础',
    summary: '认清吹孔、膜孔与六个音孔，用最放松的姿势吹响低音 5。',
    intro: '竹笛没有按键，音高全靠手指与气息。今天只做一件事：用最放松的姿势，吹响一个稳定的低音 5。',
    goals: ['认清吹孔、膜孔与六个音孔', '左手在上、右手在下地持笛', '用全按指法吹响低音 5'],
    steps: [
      { t: '从管身认起', b: '吹孔是发声的入口，膜孔贴笛膜，六个音孔改变音高；靠近笛尾的出音孔不参与按孔。音孔从笛尾向吹孔数：第一孔到第六孔。' },
      { t: '选一支入门笛', b: 'D 调曲笛孔距适中、音色温润，最适合入门；G 调梆笛更短更亮，需要更急的气，不必一上来就挑战它。' },
      { t: '把笛子端稳', b: '左手在上，负责第四、五、六孔；右手在下，负责第一、二、三孔。指腹按孔，手腕放平，笛身与身体约 45 度，肩颈放松。' },
      { t: '吹出第一声', b: '嘴角向两边微收，下唇盖住吹孔约四分之一，气流集中吹向吹孔的对侧边缘。六孔全按，先缓吹低音 5，只求稳，不求响。' }
    ],
    tips: ['用指腹按孔，不要用指尖戳。', '肩膀不要随吸气抬起。', '头晕就停下休息，吹笛也要循序渐进。'],
    practice: {
      title: '低音 5 · 起音',
      hint: '每个音 4 拍，吹响即可；先找到最省力的角度。',
      notes: ['低音5', '低音5', '低音5']
    }
  },
  {
    id: 2,
    stage: 0,
    title: '贴膜与保养',
    full: '贴膜与保养：让笛子有自己的声带',
    duration: 9,
    level: '零基础',
    summary: '笛膜的松紧决定音色。学会贴一张有弹性的膜，也学会擦干笛身。',
    intro: '笛膜是竹笛的声带。松紧差一点，音色就完全不同：太松会沙，太紧会闷。',
    goals: ['给笛膜找到合适的松紧', '用正确顺序贴一张膜', '养成吹后清洁、竖放的习惯'],
    steps: [
      { t: '清洁膜孔', b: '先用软布擦净膜孔边缘的旧胶与油污，手也要擦干。膜孔干净，膜才贴得牢。' },
      { t: '涂一层薄胶', b: '用阿胶、白芨或专用笛膜胶，沿膜孔边缘涂薄薄一圈。胶太厚会让膜失去弹性。' },
      { t: '裁膜与贴膜', b: '取一小块苇膜，顺着纤维纹理裁成比膜孔略大的方形。先贴一侧，再由中间向两边轻轻抚平。' },
      { t: '试吹与微调', b: '吹一个低音 5。膜音发沙，就轻轻拉紧一点；声音发闷，就稍微放松。以能随气息振动、又有弹性为准。' },
      { t: '吹后保养', b: '吹完用软布擦干管内水汽，竖放在通风处晾干。不要暴晒，也不要把笛子长期放在潮湿的盒子里。' }
    ],
    tips: ['吹奏前不要用手摸笛膜。', '膜纹要与笛身方向一致。', '出门前多带两片膜，现场贴比事后补救容易。'],
    practice: {
      title: '听膜音',
      hint: '贴好后吹低音 5，听膜是否在气息里自然振动。',
      notes: ['低音5']
    }
  },
  {
    id: 3,
    stage: 0,
    title: '长音与呼吸',
    full: '长音与呼吸：把声音吹长、吹稳',
    duration: 9,
    level: '入门',
    summary: '每天五分钟长音，是笛子最重要的地基。学会腹式吸气与均匀送气。',
    intro: '长音是笛子的地基。每天五分钟，比一次吹两小时更有效；先让声音稳住，技巧才有地方落脚。',
    goals: ['用腹式呼吸吸气', '把低音 5 吹满 8 拍', '保持音头、音身、音尾一样稳'],
    steps: [
      { t: '先吸气，不抬肩', b: '吸气时腹部向外扩张，胸口与肩膀保持放松。可以躺着练，容易感受到腹部起伏。' },
      { t: '轻吐起音', b: '用很轻的“tu”带出音头，不要用喉咙挤气。音头干净，后面的音才容易稳。' },
      { t: '把气送匀', b: '吹奏时保持气压均匀，不要一开始猛、后面虚。节拍器设 60，每个音 8 拍。' },
      { t: '按 5 6 7 1 练', b: '从低音 5 开始，依次吹 5、6、7、中音 1，每个音 8 拍。音与音之间换气，不要憋气。' },
      { t: '录音回听', b: '录一分钟长音，听三件事：音头是否干净、音身是否发抖、音尾是否掉下去。' }
    ],
    tips: ['气不够时缩短拍数，不要硬撑。', '音尾掉下去，多半是气压松了。', '每天从长音开始，别急着吹曲子。'],
    practice: {
      title: '四音长音',
      hint: '各 8 拍，循环 4 次；节拍器 60。',
      notes: ['低音5', '低音6', '低音7', '中音1']
    }
  },
  {
    id: 4,
    stage: 1,
    title: '筒音作 5',
    full: '筒音作 5：第一套完整指法',
    duration: 11,
    level: '入门',
    summary: '全按为 5，依次开孔得到 6 7 1 2 3；六孔全开是 #4，4 要半孔。',
    intro: '全按为 5，是大多数入门曲的指法系统。先记开孔次序，再记手指；理解关系，比死背孔位更牢。',
    goals: ['说出筒音与开孔顺序', '连续吹出低音 5 到中音 3', '知道 4 为什么要半孔'],
    steps: [
      { t: '全按 = 低音 5', b: '六孔全部按闭，吹出的就是筒音，在这套指法里唱作低音 5。' },
      { t: '一次开一孔', b: '开第一孔得低音 6；再开第二孔得低音 7；再开第三孔得中音 1。开孔顺序从笛尾向吹孔。' },
      { t: '继续向上', b: '开第四孔得中音 2，开第五孔得中音 3。右手先开，左手跟上，手指起落要同步。' },
      { t: '4 与 #4', b: '六孔全开得到的是 #4，不是 4。要得到中音 4，需要第六孔半按，或用组合指法。' },
      { t: '把音阶连起来', b: '慢速吹 5 6 7 1 2 3 2 1，先确保每个音干净，再逐步提速。' }
    ],
    tips: ['手指低抬、同步落，不要敲孔。', '筒音吹不稳，先回到长音。', '先慢后快，速度服从清晰度。'],
    practice: {
      title: '筒音作 5 · 音阶',
      hint: '慢速，每个音 2 拍；听每个音是否干净。',
      notes: ['低音5', '低音6', '低音7', '中音1', '中音2', '中音3', '中音2', '中音1']
    }
  },
  {
    id: 5,
    stage: 1,
    title: '音阶与运指',
    full: '音阶与运指：让手指提前到达',
    duration: 10,
    level: '入门',
    summary: '保留指、低抬指、跟节拍。练习不是重复，而是让动作越来越省。',
    intro: '音阶练习不是背手指，而是让手指之间学会“提前到达”。动作越小，速度才越稳。',
    goals: ['用一个八度上下行连奏', '掌握保留指与低抬指', '在 60 到 80 的速度里保持清晰'],
    steps: [
      { t: '保留指', b: '能不动的手指就不要动。相邻音之间，少抬一根手指，连接会更顺。' },
      { t: '低抬指', b: '手指离孔不要太高，落孔要果断。高抬指会让节奏变慢，也容易敲出杂音。' },
      { t: '跟着节拍器', b: '从 60 开始，每个音两拍，确认每个音都到位后，再升到 70、80。' },
      { t: '盯住 7 → 1', b: '低音 7 到中音 1 是半音，手指要更紧凑。单独抽出来练十遍，再放回音阶。' },
      { t: '上下行交替', b: '上行练开孔，下行练落孔。下行往往更难，别只吹上行。' }
    ],
    tips: ['手掌不要上下起伏。', '右手拇指托稳笛身，别让笛子晃。', '宁可慢而干净，不要快而含糊。'],
    practice: {
      title: '上下行音阶',
      hint: '上下行各 4 遍，节拍 60；注意 7 → 1 的半音。',
      notes: ['低音5', '低音6', '低音7', '中音1', '中音2', '中音3', '中音2', '中音1', '低音7', '低音6', '低音5']
    }
  },
  {
    id: 6,
    stage: 1,
    title: '半孔与 4 音',
    full: '半孔与 4 音：一个孔的两种世界',
    duration: 10,
    level: '进阶',
    summary: '4 是筒音作 5 里最特别的音。学会半孔，就打开了半音阶的大门。',
    intro: '4 是筒音作 5 里最特别的一个音。它不在“顺开六孔”的自然音列里，需要半孔或组合指法。',
    goals: ['用半孔吹出干净的中音 4', '理解半孔降低半音的原理', '在 3 4 5 之间切换不滑音'],
    steps: [
      { t: '先找到半孔位置', b: '第六孔只开一半，其余五孔全开。指腹贴着孔边向旁边移，不要抬起来再落下。' },
      { t: '气流稍缓', b: '半孔比全开更“紧”，气息要稍缓、更集中。先吹长音，确认音高稳定。' },
      { t: '比较 3 4 5', b: '从中音 3 到 4 再到 5，听半音与全音的距离。不要用滑音代替换指。' },
      { t: '单独练下行', b: '4 下行到 3 比上行更难。把 4 3 4 3 抽出来慢练，确保落指干净。' },
      { t: '认识替代指法', b: '中音 4 也可以用组合指法（如开第六孔、按闭第四五孔等）。初学先固定一种，别频繁换。' }
    ],
    tips: ['半孔靠触感与听力，不靠眼睛。', '按半孔时手指不要抬起。', '宁可慢，先把音准吹对。'],
    practice: {
      title: '3 4 5 的回环',
      hint: '中音 4 用第六孔半按；每个音 4 拍。',
      notes: ['中音3', '中音4', '中音5', '中音4', '中音3']
    }
  },
  {
    id: 7,
    stage: 2,
    title: '四种装饰音',
    full: '颤音、叠音、打音与滑音',
    duration: 12,
    level: '进阶',
    summary: '装饰音是旋律的标点。轻、快、不抢拍，比“加很多音”更重要。',
    intro: '装饰音让旋律有语气。先把它当“标点”，不要当“炫技”；轻、快、不抢拍，是共同的底线。',
    goals: ['分辨四种常用装饰音', '在中音 1 上练出均匀颤音', '把装饰音放进一个短乐句'],
    steps: [
      { t: '颤音（tr）', b: '主音与上方二度快速交替，手指轻打、手腕放松。先慢速均匀，再逐渐加密。' },
      { t: '叠音', b: '快速按一下上方音孔再回到主音，像给音头加一个很小的“帽”。动作要轻，不要占拍子。' },
      { t: '打音', b: '在本音孔上快速“打”一下，制造短促的装饰。手指落下即起，不要按住。' },
      { t: '滑音', b: '手指抹孔配合气息滑动，让两个音连起来。滑音要唱得出来，才知道滑多远。' },
      { t: '放进乐句', b: '在中音 1 的长音上先加一个颤音，再加一个叠音。每次只加一种，听清楚再加下一种。' }
    ],
    tips: ['装饰音要轻，不能盖过主音。', '手指放松，动作才会快。', '先唱后吹，装饰的位置才自然。'],
    practice: {
      title: '1 上的装饰',
      hint: '先吹平直长音，再加颤音；最后回到平直。',
      notes: ['中音1', '中音2', '中音1', '中音3', '中音2', '中音1']
    }
  },
  {
    id: 8,
    stage: 2,
    title: '第一支曲《小星星》',
    full: '第一支曲：《小星星》',
    duration: 12,
    level: '入门',
    summary: '把音阶变成旋律。慢一点，把每个音吹干净，比吹快更重要。',
    intro: '第一支完整的曲子。慢一点，把每个音吹干净，比吹快更重要；4 的半孔要提前准备。',
    goals: ['唱准《小星星》的简谱', '完整吹奏前两句', '在乐句之间自然换气'],
    steps: [
      { t: '先唱谱', b: '1 1 5 5 | 6 6 5 – | 4 4 3 3 | 2 2 1 –。先唱准，再上手；唱不准的地方，吹也吹不稳。' },
      { t: '分句练', b: '两小节一句，先练第一句，再练第二句。每句结束时换气，不要在一句中间断。' },
      { t: '盯住 4', b: '第二句的 4 用第六孔半按，提前把手指移到半孔位置，不要临时找。' },
      { t: '跟 60 拍完整吹', b: '用节拍器 60，每个音一拍。先不管强弱，只求音准、节奏、换气三件事。' },
      { t: '录音再听', b: '录一遍，听 4 是否偏低、5 是否太尖、换气是否切断旋律。下一次只改一个问题。' }
    ],
    tips: ['先唱后吹，旋律才会走在手指前面。', '4 不要滑过去，半孔要站稳。', '换气记号要提前想，不要等没气了才找。'],
    score: [
      '1 1 5 5 | 6 6 5 –',
      '4 4 3 3 | 2 2 1 –',
      '5 5 4 4 | 3 3 2 –',
      '5 5 4 4 | 3 3 2 –',
      '1 1 5 5 | 6 6 5 –',
      '4 4 3 3 | 2 2 1 –'
    ],
    practice: {
      title: '前两句 · 跟着吹',
      hint: '先练前两句，熟练后再接完整版；4 用半孔。',
      notes: ['中音1', '中音1', '中音5', '中音5', '中音6', '中音6', '中音5', '中音4', '中音4', '中音3', '中音3', '中音2', '中音2', '中音1']
    }
  },
  {
    id: 9,
    stage: 2,
    title: '录音与每日练习',
    full: '录音与每日练习：让进步被听见',
    duration: 8,
    level: '入门',
    summary: '把练习录下来，才知道问题在哪。给你一份可以长期执行的 15 分钟计划。',
    intro: '练琴的进步，发生在你听见问题的那一刻。录音不是评判，而是一面很诚实的镜子。',
    goals: ['录下并回听自己的长音', '用三个指标检查声音', '建立每周五天的练习节奏'],
    steps: [
      { t: '怎么录', b: '手机放在笛身侧前方约 30 厘米，录 1 分钟长音与一小段曲子。不要加混响，越干越能听出问题。' },
      { t: '回听三件事', b: '音头是否干净、音身是否稳定、音尾是否掉下去。再听一遍，找多余的杂音与漏气声。' },
      { t: '每周固定五天', b: '每天 15 分钟：5 分钟长音、5 分钟音阶或半孔、5 分钟乐曲。规律比时长更重要。' },
      { t: '一次只改一个点', b: '这周只盯音头，下周只盯 4 的音准。问题太多会分散注意力，改不动。' },
      { t: '留下记录', b: '把日期、速度、问题写在一行里。一个月后回听，你会听见自己走过的路。' }
    ],
    tips: ['每天从长音开始。', '不要只吹曲子，基础练习是利息。', '录完先听优点，再找一个可改的点。'],
    practice: {
      title: '一周声音样本',
      hint: '录下低音 5、中音 1、中音 5；一周后再录一次对比。',
      notes: ['低音5', '中音1', '中音5']
    }
  }
];

const SCORES = [
  { page: 5, title: '玛丽有只小羔羊', original: '', suggest: 'E/F/G 调 · 作5', level: 'beginner', tip: '初练一口气一个音，熟悉后一口气一小节。' },
  { page: 6, title: '嘎达梅林', original: '', suggest: 'E/F/G 调 · 作5', level: 'beginner', tip: '初练一口气一拍，熟悉后一口气一小节。' },
  { page: 7, title: '千与千寻', original: '', suggest: 'E/F/G 调 · 作5', level: 'beginner', tip: '重点把握附点节奏，建议先单独练节奏。' },
  { page: 8, title: '沧海一声笑', original: '', suggest: 'E/F/G 调 · 作5', level: 'beginner', tip: '' },
  { page: 9, title: '大鱼', original: '', suggest: 'E/F/G 调 · 作5', level: 'beginner', tip: '' },
  { page: 10, title: '荒', original: 'A 调', suggest: 'C/D/E 调 · 作5', level: 'advanced', tip: '打音、叠音运用频繁，建议先学这两项技巧。' },
  { page: 11, title: '小嫦娥', original: 'F 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 12, title: '小城谣', original: 'G 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 13, title: '画中游', original: 'A 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 14, title: '桃花笑', original: 'C 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 15, title: '胭脂妆', original: 'C 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 16, title: '红尘客栈', original: 'C 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 17, title: '哈尼宝贝', original: 'G 调', suggest: '任意调 · 作5', level: 'advanced', tip: '按反复记号重复演奏一次。' },
  { page: 18, title: '如果当时', original: '♭D 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 19, title: '相思遥', original: '♭A 调', suggest: 'E/F/G 调 · 作5', level: 'advanced', tip: '' },
  { page: 20, title: '生生世世爱', original: 'E 调', suggest: 'E/F 调 · 作5', level: 'advanced', tip: '颤音运用频繁，建议先学颤音。' },
  { page: 21, title: '清明雨上', original: '♭D 调', suggest: 'D/E/F 调 · 作5', level: 'advanced', tip: '高八度记谱，低八度演奏。' },
  { page: 22, title: '无羁 I', original: 'G 调', suggest: 'D 调 · 作2', level: 'challenge', tip: '作5指法低音吹不了，需用 D 调作2。' },
  { page: 23, title: '无羁 II', original: 'G 调', suggest: 'D 调 · 作2', level: 'challenge', tip: '用 D 调作2 最合适，其他指法不好听。' },
  { page: 24, title: '雨下一整晚（间奏）', original: '♭B 调', suggest: 'C/D/E 调 · 作5', level: 'advanced', tip: '' },
  { page: 25, title: '烟花易冷', original: 'C 调', suggest: '任意调 · 作5', level: 'advanced', tip: '高八度记谱，低八度演奏。' },
  { page: 26, title: '上春山', original: 'E→F 调', suggest: '任意调 · 作5', level: 'advanced', tip: '开头连续的 5 建议用轻吐或叠音。' },
  { page: 27, title: '美丽的神话', original: 'A 调', suggest: '任意调 · 作5', level: 'advanced', tip: '开头连续的 5 建议用轻吐或叠音。' },
  { page: 28, title: '痴情冢', original: 'F 调', suggest: '需作2 · 新手暂缓', level: 'challenge', tip: '6 前加 5 的倚音，3 前加 2 的倚音。' },
  { page: 29, title: '霜雪千年', original: 'F 调', suggest: '任意调 · 作5', level: 'advanced', tip: '需要气滑音，才有戏腔的味道。' },
  { page: 30, title: '红颜旧', original: 'A 调', suggest: '需作2 · 新手暂缓', level: 'challenge', tip: '必须作2才好听，新手可先放一放。' }
];

const SCORE_LEVELS = { beginner: '入门', advanced: '进阶', challenge: '挑战' };

const DAILY_TASKS = [
  {
    id: 'long',
    title: '长音',
    sub: '低音 5 · 8 拍 × 4',
    minutes: 5,
    notes: ['低音5', '低音5', '低音6', '低音6']
  },
  {
    id: 'scale',
    title: '音阶',
    sub: '筒音作 5 · 上下行',
    minutes: 5,
    notes: ['低音5', '低音6', '低音7', '中音1', '中音2', '中音3', '中音2', '中音1']
  },
  {
    id: 'ear',
    title: '听音',
    sub: '分辨低、中、高音区',
    minutes: 5,
    notes: ['低音5', '中音1', '中音5']
  }
];

const TOPICS = [
  { id: 'fingering', name: '指法识音', desc: '看孔位，认简谱', icon: 'i-fingers' },
  { id: 'pitch', name: '音名定位', desc: '调性 + 指法 = 音高', icon: 'i-note' },
  { id: 'ear', name: '听音辨音', desc: '用耳朵找音级', icon: 'i-quiz' },
  { id: 'theory', name: '乐理常识', desc: '筒音、半孔与气息', icon: 'i-learn' }
];

const TOPIC_NAMES = { fingering: '指法识音', pitch: '音名定位', ear: '听音辨音', theory: '乐理常识' };

const THEORY = [
  {
    level: 'basic',
    q: '“筒音”指的是什么？',
    options: ['六孔全按发出的音', '整支笛子最响的音', '高音区的音', '笛膜振动的声音'],
    answer: '六孔全按发出的音',
    explain: '筒音是六个音孔全部按闭时吹出的音，也是每一种指法体系的起点。'
  },
  {
    level: 'basic',
    q: '六孔竹笛的第一孔通常靠近哪里？',
    options: ['笛尾的出音孔一侧', '吹孔旁边', '膜孔正下方', '笛身正中'],
    answer: '笛尾的出音孔一侧',
    explain: '第一孔最靠近笛尾，由右手无名指负责；第六孔最靠近吹孔。'
  },
  {
    level: 'basic',
    q: '左手在上，通常负责哪三个音孔？',
    options: ['第四、五、六孔', '第一、二、三孔', '第一、三、五孔', '第三、四、五孔'],
    answer: '第四、五、六孔',
    explain: '左手在上，负责第四、五、六孔；右手在下，负责第一、二、三孔。'
  },
  {
    level: 'basic',
    q: '筒音作 5 时，全按六孔对应哪个音？',
    options: ['低音 5', '低音 2', '中音 1', '低音 6'],
    answer: '低音 5',
    explain: '“筒音作 5”就是把这个全按音唱作低音 5，其余音按音阶关系顺推。'
  },
  {
    level: 'basic',
    q: '筒音作 2 时，全按六孔对应哪个音？',
    options: ['低音 2', '低音 5', '中音 1', '低音 7'],
    answer: '低音 2',
    explain: '筒音作 2 时，筒音唱作低音 2；低音 4 与中音 1 会用到半孔或组合指法。'
  },
  {
    level: 'basic',
    q: '筒音作 5 时，中音 4 通常怎么吹？',
    options: ['第六孔半按，其余全开', '六孔全按', '只开第一孔', '只开第六孔'],
    answer: '第六孔半按，其余全开',
    explain: '六孔全开得到的是 #4；中音 4 要用第六孔半孔，或用组合指法。'
  },
  {
    level: 'basic',
    q: '笛膜贴得太松，声音通常会怎样？',
    options: ['发沙、膜音散', '更明亮稳定', '音高升高八度', '完全不出声'],
    answer: '发沙、膜音散',
    explain: '膜太松会沙哑、共鸣散；太紧则发闷。以有弹性、能随气息振动为佳。'
  },
  {
    level: 'basic',
    q: '吹长音时，肩膀应该怎样？',
    options: ['放松不动，腹部扩张', '随气息上下抬起', '用力夹紧', '尽量前倾'],
    answer: '放松不动，腹部扩张',
    explain: '用腹式呼吸，吸气时腹部扩张，肩膀与胸口保持放松。'
  },
  {
    level: 'basic',
    q: '吹高音区时，气息应该怎样变化？',
    options: ['气速加快、口风收紧', '气速变慢、口风放大', '完全不变', '只加大音量'],
    answer: '气速加快、口风收紧',
    explain: '高音靠更急的气流与更集中的口风，而不是单纯用力吹。'
  },
  {
    level: 'basic',
    q: '笛子的“D 调”通常指什么？',
    options: ['开第一至三孔的音高为 D', '筒音一定是 D', '只能吹 D 大调', '笛身长度是 D'],
    answer: '开第一至三孔的音高为 D',
    explain: '笛子的调名通常以第三孔（开一二三孔）的音高为准；D 调笛开三孔为 D。'
  },
  {
    level: 'advanced',
    q: 'D 调笛、筒音作 2 时，简谱 1 对应哪个音？',
    options: ['G', 'D', 'A', 'C'],
    answer: 'G',
    explain: 'D 调笛开三孔为 D；筒音作 2 时开三孔是 5，因此 1 在 D 上方纯四度，即 G。'
  },
  {
    level: 'advanced',
    q: 'D 调笛、筒音作 1 时，中音 1 对应哪个音？',
    options: ['A', 'D', 'G', 'E'],
    answer: 'A',
    explain: '筒音作 1 时，D 调笛的第三孔 D 是低音 4，因此 1 在 D 上方纯五度，即 A。'
  },
  {
    level: 'advanced',
    q: '筒音作 5 时，六孔全开得到的是哪个音？',
    options: ['#4', '4', '5', '3'],
    answer: '#4',
    explain: '六孔全开比中音 3 高一个全音，得到 #4；要得到 4，需要半孔或组合指法。'
  },
  {
    level: 'advanced',
    q: '半孔指法的主要作用是？',
    options: ['把音降低半音', '把音升高八度', '让音色更亮', '替代笛膜'],
    answer: '把音降低半音',
    explain: '将发音孔按闭一部分会降低音高，半孔常用于取得音阶中的半音。'
  },
  {
    level: 'advanced',
    q: '筒音作 2 时，低音 4 常用哪种方式得到？',
    options: ['第二孔半按（或组合指法）', '六孔全开', '只开第六孔', '全按不动'],
    answer: '第二孔半按（或组合指法）',
    explain: '低音 3 到低音 4 只差半音，常用第二孔半按或组合指法。'
  },
  {
    level: 'advanced',
    q: 'D 调笛、筒音作 5 时，中音 5 的实际音高是？',
    options: ['A5', 'D5', 'A4', 'E5'],
    answer: 'A5',
    explain: '常规 D 调曲笛作5的中音 1 实音为 D5；中音 5 为 A5。全按平吹的低音 5 才是 A4。'
  }
];

/* =========================================================
   工具与状态
   ========================================================= */

const STORAGE = {
  lessons: 'zhuyun.lessons.v1',
  daily: 'zhuyun.daily.v1',
  best: 'zhuyun.quiz.v1',
  sound: 'zhuyun.sound.v1'
};

const state = {
  view: 'learn',
  system: 5,
  key: 'D',
  notation: 'number',
  selected: '中音1',
  muted: false,
  quizMode: 'mix',
  quizLevel: 'basic',
  quizTopics: TOPICS.map(t => t.id)
};

const quiz = {
  active: false,
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  selection: null,
  config: null,
  startedAt: 0
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 存储不可用时静默降级，不影响页面使用 */
  }
}

let lessonProgress = readJSON(STORAGE.lessons, {});
if (!lessonProgress || typeof lessonProgress !== 'object') lessonProgress = {};

function todayKey() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function loadDaily() {
  const stored = readJSON(STORAGE.daily, null);
  if (stored && stored.date === todayKey() && stored.done && typeof stored.done === 'object') {
    return stored;
  }
  return { date: todayKey(), done: {} };
}

let daily = loadDaily();

let bestStore = readJSON(STORAGE.best, null);
if (!bestStore || typeof bestStore !== 'object') {
  bestStore = { best: 0, total: 8, attempts: 0, answered: 0, correct: 0, last: 0 };
}

state.muted = readJSON(STORAGE.sound, false) === true;

/* =========================================================
   音高
   ========================================================= */

function nameForMidi(midi) {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return PITCH_NAMES[pc] + octave;
}

function frequencyForMidi(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function midiOf(note, system = state.system, key = state.key) {
  const regOffset = note.reg === 'low' ? -12 : note.reg === 'high' ? 12 : 0;
  return KEYS[key].midi + SYSTEMS[system].tonic + regOffset + SCALE[note.degree];
}

function tonicMidi(system = state.system, key = state.key) {
  return KEYS[key].midi + SYSTEMS[system].tonic;
}

function currentNote() {
  return FINGERINGS[state.system].find(n => n.label === state.selected) || FINGERINGS[state.system][0];
}

function getNote(label, system = 5) {
  return FINGERINGS[system].find(n => n.label === label);
}

function noteTip(note) {
  if (note.tip) return note.tip;
  const open = [];
  const half = [];
  note.holes.split('').forEach((c, i) => {
    const hole = 6 - i;
    if (c === '1') open.push(hole);
    if (c === '2') half.push(hole);
  });
  const parts = [];
  if (open.length) parts.push(`开第${open.join('、')}孔`);
  if (half.length) parts.push(`第${half.join('、')}孔半按`);
  const closed = 6 - open.length - half.length;
  if (closed > 0) parts.push('其余按闭');
  return parts.length ? `${parts.join('，')}。` : '六孔全按（筒音）。';
}

function tonicLabel(system = state.system, key = state.key) {
  return nameForMidi(tonicMidi(system, key));
}

/* =========================================================
   声音
   ========================================================= */

let audioCtx = null;
let masterGain = null;
const activeDiziVoices = new Set();
const pendingDiziVoices = new Set();
let toastTimer = null;
const sequence = { token: 0, timers: [] };

const DIZI_SAMPLE_MANIFEST = [
  {"midi": 67, "file": "assets/samples/dizi/g5.mp3", "source": "Hypnotriod", "hz": 393.0776, "offset": 0, "gain": 0.3841, "sha256": "1023e2f84f7b1a11152bb6ccb27f351c8208ec5e8f58b6fed5ac14c5904e85a1"},
  {"midi": 68, "file": "assets/samples/dizi/gs5.mp3", "source": "Hypnotriod", "hz": 416.658, "offset": 0, "gain": 0.382, "sha256": "5f7feb6e18046141fc167ca4c322f6d39e07f4ce98e7f830777e0480a034ec62"},
  {"midi": 69, "file": "assets/samples/dizi/a5.mp3", "source": "Hypnotriod", "hz": 441.1734, "offset": 0, "gain": 0.4064, "sha256": "8aa7dfe1572eacd6d4cb8039b83bd2c83ec4009f3e80e8bac4aa4ee7447dff4f"},
  {"midi": 70, "file": "assets/samples/dizi/as5.mp3", "source": "Hypnotriod", "hz": 467.2644, "offset": 0, "gain": 0.4103, "sha256": "b56f8578bbc4c20808d74b62d8e7b3a9f60e4cb825fafdd4e3a4472bc6423157"},
  {"midi": 71, "file": "assets/samples/dizi/b5.mp3", "source": "Hypnotriod", "hz": 494.2294, "offset": 0, "gain": 0.4072, "sha256": "1ad18645fce12d4bdf56835878b37238569abc61478e6f53a7dd0f18669f9ad5"},
  {"midi": 72, "file": "assets/samples/dizi/c6.mp3", "source": "Hypnotriod", "hz": 523.6855, "offset": 0, "gain": 0.4428, "sha256": "48c974319601651cbe87adc98b10b6d524a00e841dd2999db483042baf8e5b49"},
  {"midi": 73, "file": "assets/samples/dizi/cs6.mp3", "source": "Hypnotriod", "hz": 554.86, "offset": 0, "gain": 0.4376, "sha256": "c62d2b4997e5febe6835959a8ff15e9d7efc4184e7022037f89c6de329df2592"},
  {"midi": 74, "file": "assets/samples/dizi/d6.mp3", "source": "Hypnotriod", "hz": 588.6546, "offset": 0, "gain": 0.3775, "sha256": "41426b9de510f050f93c2e606c3ffcecbeb6ee12ba9290d626b434526c59704f"},
  {"midi": 75, "file": "assets/samples/dizi/ds6.mp3", "source": "Hypnotriod", "hz": 623.5375, "offset": 0, "gain": 0.379, "sha256": "db36c66078a0099719df2428ae81458b0286463a015c6a8a56dcfcbb16f787af"},
  {"midi": 76, "file": "assets/samples/dizi/e6.mp3", "source": "Hypnotriod", "hz": 663.8817, "offset": 0, "gain": 0.4298, "sha256": "830d3613a698cf4e906394b41c4242785866551bf926537fe9103a78447eeca4"},
  {"midi": 77, "file": "assets/samples/dizi/f6.mp3", "source": "Hypnotriod", "hz": 703.4723, "offset": 0, "gain": 0.4225, "sha256": "e47db3f2f3fe7fb9adee2b257e47909593b0357cb803735747999fcf49da0cb3"},
  {"midi": 78, "file": "assets/samples/dizi/fs6.mp3", "source": "Hypnotriod", "hz": 742.8385, "offset": 0, "gain": 0.3824, "sha256": "f3f0135430571ffd0ee0875dc62e35390ebe2b4b8173a6e4e5c807df57154de4"},
  {"midi": 79, "file": "assets/samples/dizi/g6.mp3", "source": "Hypnotriod", "hz": 785.6452, "offset": 0, "gain": 0.4211, "sha256": "0e1fd9444c855267aa59374d06f537c93948a8a50124f8b2face03395aadd03c"},
  {"midi": 80, "file": "assets/samples/dizi/gs6.mp3", "source": "Hypnotriod", "hz": 832.3687, "offset": 0, "gain": 0.4222, "sha256": "5d93a98071597d7c99b68208a6aae10882abbc7abd5d6ca391174987a4c9c767"},
  {"midi": 81, "file": "assets/samples/dizi/a6.mp3", "source": "Hypnotriod", "hz": 882.4264, "offset": 0, "gain": 0.3431, "sha256": "e840dcedc30adb5c61cd3f0ebe8a51ea1f98e3479948a3f1eb965c9281fdf5c0"},
  {"midi": 82, "file": "assets/samples/dizi/as6.mp3", "source": "Hypnotriod", "hz": 934.9475, "offset": 0, "gain": 0.3433, "sha256": "09793d2e17719a3e361e5b59a89d140cc492519294209679d07e7278a15695b1"},
  {"midi": 83, "file": "assets/samples/dizi/b6.mp3", "source": "Hypnotriod", "hz": 990.9976, "offset": 0, "gain": 0.3, "sha256": "9c95a136ffddc52f9f463a712875ea2d69d6c628f41bc4ef43a6cff05595da20"},
  {"midi": 84, "file": "assets/samples/dizi/c7.mp3", "source": "Hypnotriod", "hz": 1053.788, "offset": 0.005, "gain": 0.3123, "sha256": "5f30d1fa4b43aa0857e46494d83b7f10f5908c6aa76b9ea14f22dc362f10a1f4"},
  {"midi": 85, "file": "assets/samples/dizi/cs7.mp3", "source": "Hypnotriod", "hz": 1116.5022, "offset": 0, "gain": 0.3122, "sha256": "f4c71a45a6f2498695e0d35cff156b0c4b5d6ecb549b8f1256d923e6acdbbebf"},
  {"midi": 86, "file": "assets/samples/dizi/d7.mp3", "source": "Hypnotriod", "hz": 1178.1556, "offset": 0, "gain": 0.3151, "sha256": "9bbd9e738a5174076dfaded1cbd64eb0c345e15771cf4b6912e839ed369e231c"},
  {"midi": 87, "file": "assets/samples/dizi/ds7.mp3", "source": "Hypnotriod", "hz": 1248.1213, "offset": 0, "gain": 0.316, "sha256": "ac7235eca54f12412eeb0851b0854b847e321dbd8466b9c41783d43eaa23334c"},
  {"midi": 88, "file": "assets/samples/dizi/e7.mp3", "source": "Hypnotriod", "hz": 1334.9657, "offset": 0.005, "gain": 0.3, "sha256": "8922c46d96bf47e36b4fe24a4646899743f7522305228bd1b5b26dcea32ea608"},
  {"midi": 89, "file": "assets/samples/dizi/f7.mp3", "source": "Hypnotriod", "hz": 1414.2395, "offset": 0.005, "gain": 0.3, "sha256": "44de63aff7565c468ad239286c02f29ab7829fe8dbc7df648a415f0223d64c32"},
  {"midi": 90, "file": "assets/samples/dizi/fs7.mp3", "source": "Hypnotriod", "hz": 1480.4847, "offset": 0.005, "gain": 0.3462, "sha256": "8ee7677073c3ee82b4e59f79c25b11c56811051003a8a16ef3d3260e248c10eb"},
  {"midi": 91, "file": "assets/samples/dizi/g7.mp3", "source": "Hypnotriod", "hz": 1577.236, "offset": 0.035, "gain": 0.3197, "sha256": "9e7c26e9d0d16a59bb07d5aad79d259800a95b19b96e83767194333b9dc3499f"},
  {"midi": 93, "file": "assets/samples/dizi/sutd/93.mp3", "source": "SUTD", "member": "dizi-repository/A6/A6_with_membrane.wav", "hz": 1783.8387, "offset": 0, "gain": 1.6734, "sha256": "d2dbf1d23b1966b8f8da8aee35bd34987c30af646530282001f6f370205b218a"},
  {"midi": 94, "file": "assets/samples/dizi/sutd/94.mp3", "source": "SUTD", "member": "dizi-repository/A#6/A#6_with_membrane.wav", "hz": 1898.7419, "offset": 0, "gain": 1.7062, "sha256": "e09a561d27d6b50fae30d17a8876e195f932ec17aa279df0aca1ace5daa844d4"},
  {"midi": 95, "file": "assets/samples/dizi/sutd/95.mp3", "source": "SUTD", "member": "dizi-repository/B6/standard/B6_with_membrane.wav", "hz": 1984.2125, "offset": 0, "gain": 1.8194, "sha256": "66aca590aa9369449b4f38f24f5f3a7306009ad8012322065a8b9261777ba589"},
  {"midi": 96, "file": "assets/samples/dizi/sutd/96.mp3", "source": "SUTD", "member": "dizi-repository/C7/standard/C7_with_membrane.wav", "hz": 2104.0267, "offset": 0, "gain": 3.0, "sha256": "9fd832d9a8c4bea1d3e1328a1f33330be111441c55bf9ae2fb99a8003a5ce416"},
  {"midi": 97, "file": "assets/samples/dizi/sutd/97.mp3", "source": "SUTD", "member": "dizi-repository/C#7/alt_2/C#7(alt2)_with_membrane.wav", "hz": 2235.9566, "offset": 0, "gain": 0.9086, "sha256": "8d371a5209239231f88a4f35c9c70e957b620b830e1ca1a532b5ebe509506080"},
  {"midi": 98, "file": "assets/samples/dizi/sutd/98.mp3", "source": "SUTD", "member": "dizi-repository/D7/standard/D7_with_membrane.wav", "hz": 2388.9712, "offset": 0, "gain": 0.7582, "sha256": "09f203245080331219a8051c343e88f3bead7d4d111ed62846b41e490cbb6797"},
  {"midi": 100, "file": "assets/samples/dizi/sutd/100.mp3", "source": "SUTD", "member": "dizi-repository/E7/standard/E7_with_membrane.wav", "hz": 2663.7818, "offset": 0, "gain": 0.6579, "sha256": "f32f28d9c1b5ec1eaf5c366daf9f13fb3c17a3f6209b6e01d419f27263be0b75"}
];

let diziSamples = null;
let diziSamplePromise = null;

function loadDiziSamples() {
  if (diziSamples) return Promise.resolve(diziSamples);
  if (diziSamplePromise) return diziSamplePromise;
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Offline) return Promise.resolve(null);
  const decodeCtx = new Offline(1, 1, 44100);
  diziSamplePromise = Promise.all(DIZI_SAMPLE_MANIFEST.map(async item => {
    const response = await fetch(item.file);
    if (!response.ok) throw new Error(`sample ${item.file}`);
    const buffer = await decodeCtx.decodeAudioData(await response.arrayBuffer());
    return { ...item, buffer, ...prepareDiziLoop(buffer, item.hz) };
  })).then(list => {
    diziSamples = list.sort((a, b) => a.midi - b.midi);
    return diziSamples;
  }).catch(error => {
    console.warn('Dizi samples failed to load', error);
    diziSamples = null;
    diziSamplePromise = null;
    return null;
  });
  return diziSamplePromise;
}

function applyAudioSession() {
  // iOS Safari 默认把 Web Audio 归到 ambient 会话，硬件静音开关会把它静音。
  // 声明 playback 后与媒体播放一致（Safari 16.4+ / iOS 17+）。
  if (!('audioSession' in navigator)) return;
  try { navigator.audioSession.type = 'playback'; } catch { /* 旧实现可能拒绝该值 */ }
}

function createAudioGraph() {
  if (audioCtx) return audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  audioCtx = new AC();
  const comp = audioCtx.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.knee.value = 12;
  comp.ratio.value = 2;
  comp.attack.value = 0.01;
  comp.release.value = 0.15;
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.6;
  masterGain.connect(comp);
  comp.connect(audioCtx.destination);
  return audioCtx;
}

function ensureAudio() {
  applyAudioSession();
  const ctx = createAudioGraph();
  if (!ctx) return null;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// iOS 要求音频在同一个用户手势里解锁；提前建好上下文并播一个空缓冲，
// 避免首次点按后因采样异步加载而错过手势。桌面端不需要，避免多建上下文。
const needsAudioUnlock = /iP(hone|ad|od)/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  const ctx = createAudioGraph();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  try {
    const source = ctx.createBufferSource();
    source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    source.connect(ctx.destination);
    source.start(0);
  } catch { /* 解锁失败时仍由首次播放重试 */ }
}

if (needsAudioUnlock) {
  ['pointerdown', 'touchend', 'keydown'].forEach(type => {
    document.addEventListener(type, unlockAudio, { capture: true, once: true, passive: true });
  });
}

// 接缝末端渐变到循环起点之前的波形，避免长音循环出现爆音。
function prepareDiziLoop(buffer, hz) {
  const rate = buffer.sampleRate;
  const start = Math.round(Math.min(0.65, buffer.duration * 0.2) * rate);
  const periods = Math.floor((Math.min(2.25, buffer.duration - 0.5) * rate - start) / rate * hz);
  const end = start + Math.round(periods / hz * rate);
  const fade = Math.min(Math.round(0.04 * rate), start);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < fade; i += 1) {
      const mix = (i + 1) / fade;
      data[end - fade + i] = data[end - fade + i] * (1 - mix) + data[start - fade + i] * mix;
    }
  }
  return { loopStart: start / rate, loopEnd: end / rate };
}

function diziPlayback(midi, samples = diziSamples) {
  // 本音采样优先；只允许半音以内的邻音，严禁把整八度移调伪装为原生低音。
  const sample = samples.reduce((nearest, item) =>
    Math.abs(item.midi - midi) < Math.abs(nearest.midi - midi) ? item : nearest);
  if (Math.abs(sample.midi - midi) > 1) throw new RangeError(`缺少 ${nameForMidi(midi)} 的合格竹笛采样`);
  // 用实测基频校音，标称 MIDI 不能代表录音真的对准了 A4=440。
  return { sample, rate: frequencyForMidi(midi) / sample.hz };
}

function playDiziSample(ctx, midi, { duration = 1.5, velocity = 0.5, attack = 0.03, legato = false } = {}) {
  if (!diziSamples?.length) return null;
  let playback;
  try { playback = diziPlayback(midi); } catch {
    showToast('这个音尚无合格的竹笛采样，已暂停发声');
    return null;
  }
  const { sample, rate } = playback;
  const t = ctx.currentTime + 0.01;
  const dur = Math.max(0.035, duration);
  const source = ctx.createBufferSource();
  source.buffer = sample.buffer;
  source.playbackRate.value = rate;
  source.loop = true;
  source.loopStart = sample.loopStart;
  source.loopEnd = sample.loopEnd;
  const gain = ctx.createGain();
  const level = Math.min(0.85, velocity * sample.gain);
  const rise = Math.min(Math.max(0.004, attack), dur * 0.2);
  const release = Math.min(0.06, dur * 0.25);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(level, t + rise);
  gain.gain.setValueAtTime(level, t + dur - release);
  gain.gain.linearRampToValueAtTime(0, t + dur);
  source.connect(gain).connect(masterGain);
  source.start(t, legato ? sample.loopStart : sample.offset);
  source.stop(t + dur + 0.02);
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    try { source.stop(); } catch { /* 已自然结束 */ }
    source.disconnect();
    gain.disconnect();
    activeDiziVoices.delete(stop);
  };
  source.onended = stop;
  activeDiziVoices.add(stop);
  return stop;
}

function playMidi(midi, options = {}) {
  if (state.muted) {
    showToast('示范声音已关闭');
    return null;
  }
  const ctx = ensureAudio();
  if (!ctx) return null;
  if (diziSamples) return playDiziSample(ctx, midi, options);
  // 单音可等待录音加载；整段演奏在计时前统一等候，不会先响合成音。
  const token = sequence.token;
  let cancelled = false;
  let stopVoice = null;
  const cancel = () => { cancelled = true; stopVoice?.(); pendingDiziVoices.delete(cancel); };
  pendingDiziVoices.add(cancel);
  loadDiziSamples().then(samples => {
    pendingDiziVoices.delete(cancel);
    if (cancelled || token !== sequence.token || state.muted) return;
    if (!samples) { showToast('笛音加载失败，请重试'); return; }
    stopVoice = playDiziSample(ctx, midi, options);
  });
  return cancel;
}

function stopSequence() {
  sequence.token += 1;
  pendingDiziVoices.forEach(stop => stop());
  activeDiziVoices.forEach(stop => stop());
  sequence.timers.forEach(timer => window.clearTimeout(timer));
  sequence.timers = [];
  $$('.is-sounding').forEach(el => el.classList.remove('is-sounding'));
  $$('.practice-chip.is-playing').forEach(el => el.classList.remove('is-playing'));
}

async function playSequence(midis, { gap = 0.72, duration = 0.62, onStep = null } = {}) {
  stopSequence();
  if (state.muted) {
    showToast('示范声音已关闭');
    return;
  }
  const token = sequence.token;
  ensureAudio();
  if (!diziSamples && !await loadDiziSamples()) { showToast('笛音加载失败，请重试'); return; }
  if (token !== sequence.token || state.muted) return;
  midis.forEach((midi, i) => {
    const timer = window.setTimeout(() => {
      if (token !== sequence.token) return;
      playMidi(midi, { duration });
      if (onStep) onStep(i);
    }, i * gap * 1000 + 20);
    sequence.timers.push(timer);
  });
}

function playLabels(labels, options = {}) {
  const midis = labels
    .map(label => getNote(label, options.system || state.system))
    .filter(Boolean)
    .map(note => midiOf(note, options.system || state.system, options.key || state.key));
  playSequence(midis, options);
}

function showToast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-visible'), 2400);
}

function updateSoundButton() {
  const btn = $('#soundToggle');
  const icon = $('#soundIcon');
  if (!btn || !icon) return;
  btn.setAttribute('aria-pressed', String(!state.muted));
  btn.setAttribute('aria-label', state.muted ? '开启示范声音' : '关闭示范声音');
  icon.innerHTML = `<use href="${state.muted ? '#i-mute' : '#i-sound'}"/>`;
}

/* =========================================================
   视图与底部抽屉
   ========================================================= */

const VIEWS = ['learn', 'fingering', 'quiz'];
const sheetState = { lastFocus: null };

function setView(view, { hash = true } = {}) {
  if (!VIEWS.includes(view)) view = 'learn';
  if (state.view !== view) stopSequence();
  state.view = view;
  $$('.view').forEach(panel => {
    const active = panel.dataset.panel === view;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  $$('.tabbar button').forEach(btn => {
    const active = btn.dataset.nav === view;
    btn.classList.toggle('is-active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  if (hash) history.replaceState(null, '', `#${view}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (view === 'fingering') renderFingering();
  if (view === 'quiz') {
    renderQuizStats();
    if (!quiz.active) {
      $('#quizIntro').hidden = false;
      $('#quizPlay').hidden = true;
      $('#quizResult').hidden = true;
    }
  }
}

function onSheetKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSheet();
    return;
  }
  if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && $('.sheet--score', $('#sheetRoot'))) {
    event.preventDefault();
    stepScore(event.key === 'ArrowLeft' ? -1 : 1);
    return;
  }
  if (event.code === 'Space' && $('.sheet--score', $('#sheetRoot'))) {
    event.preventDefault();
    if (!event.repeat) toggleScorePlayback();
    return;
  }
  if (event.key !== 'Tab') return;
  const sheet = $('.sheet', $('#sheetRoot'));
  if (!sheet) return;
  const focusables = [...sheet.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openSheet(html, { returnFocus = null, variant = '' } = {}) {
  const root = $('#sheetRoot');
  stopSequence();
  sheetState.lastFocus = returnFocus || document.activeElement;
  root.innerHTML = `<div class="sheet-backdrop" data-close-sheet></div>
    <section class="sheet${variant ? ` ${variant}` : ''}" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" tabindex="-1">${html}</section>`;
  root.hidden = false;
  document.body.classList.add('is-locked');
  document.addEventListener('keydown', onSheetKeydown);
  window.setTimeout(() => {
    const close = $('.sheet-close', root);
    const sheet = $('.sheet', root);
    (close || sheet)?.focus({ preventScroll: true });
  }, 40);
}

function closeSheet({ restoreFocus = true } = {}) {
  const root = $('#sheetRoot');
  if (root.hidden) return;
  stopSequence();
  stopScorePlayback();
  root.innerHTML = '';
  root.hidden = true;
  document.body.classList.remove('is-locked');
  document.removeEventListener('keydown', onSheetKeydown);
  if (restoreFocus && sheetState.lastFocus && document.contains(sheetState.lastFocus)) {
    sheetState.lastFocus.focus({ preventScroll: true });
  }
  sheetState.lastFocus = null;
}

/* =========================================================
   学习视图
   ========================================================= */

function lessonDone(id) {
  return !!lessonProgress[id];
}

function updateProgress() {
  const done = LESSONS.filter(lesson => lessonDone(lesson.id)).length;
  const total = LESSONS.length;
  $('#courseProgressText').textContent = `${done} / ${total} 已完成`;
  $('#courseProgressBar').style.width = `${Math.round((done / total) * 100)}%`;
}

function lessonCardHTML(lesson) {
  const done = lessonDone(lesson.id);
  return `<button class="lesson ${done ? 'lesson--done' : ''}" type="button" data-open-lesson="${lesson.id}" aria-label="${lesson.full}${done ? '，已完成' : ''}">
    <span class="lesson-index" aria-hidden="true">${done ? '✓' : String(lesson.id).padStart(2, '0')}</span>
    <span class="lesson-copy"><span class="lesson-title">${lesson.title}</span><span class="lesson-meta">${lesson.duration} 分钟 · ${lesson.level}</span></span>
    <span class="lesson-state" aria-hidden="true"><svg class="icon"><use href="#i-check"/></svg></span>
  </button>`;
}

function renderCourse() {
  const wrapper = $('#courseList');
  wrapper.innerHTML = STAGES.map((stage, index) => {
    const lessons = LESSONS.filter(lesson => lesson.stage === index);
    return `<section class="stage" aria-label="${stage.name}">
      <div class="stage-head">
        <span class="stage-numeral">${stage.numeral}</span>
        <span class="stage-name">${stage.name}</span>
        <span class="stage-note">${stage.note}</span>
        <span class="stage-rule"></span>
      </div>
      <div class="lesson-list">${lessons.map(lessonCardHTML).join('')}</div>
    </section>`;
  }).join('');
  updateProgress();
}

function updateHero() {
  const allDone = LESSONS.every(lesson => lessonDone(lesson.id));
  const next = LESSONS.find(lesson => !lessonDone(lesson.id)) || LESSONS[LESSONS.length - 1];
  $('#heroEyebrow').textContent = allDone ? '全部完成 · 继续打磨' : `入门 · 第 ${next.id} 课`;
  $('#heroTitle').textContent = allDone ? '去吹一首完整的曲子' : next.title;
  $('#heroDesc').textContent = allDone
    ? '九节课已经走完。回到指法实验室，或录一首曲子留作纪念。'
    : next.summary;
  const cta = $('#heroCta');
  const secondary = $('#heroSecondary');
  cta.dataset.openLesson = next.id;
  secondary.dataset.openLesson = next.id;
  cta.innerHTML = `${allDone ? '复习最后一课' : `继续第 ${next.id} 课`} <svg class="icon"><use href="#i-arrow"/></svg>`;
  secondary.textContent = allDone ? '查看课程' : '课程详情';
}

/* =========================================================
   曲谱库
   ========================================================= */

let scoreFilter = 'all';
let scoreKeyMode = 'original';

function scoreCardHTML(score, index) {
  const page = String(score.page).padStart(2, '0');
  const tip = score.tip || '原谱收录 · 点击查看完整谱面';
  return `<button class="score-card" type="button" data-score-index="${index}" aria-label="打开曲谱：${score.title}">
    <span class="score-thumb"><img src="assets/scores/thumbs/p-${page}.jpg" alt="" width="720" height="405" loading="lazy" decoding="async"></span>
    <span class="score-body">
      <span class="score-title">${score.title}</span>
      <span class="score-meta">
        <span class="is-${score.level}">${SCORE_LEVELS[score.level]}</span>
        ${score.original ? `<span>原调 ${score.original}</span>` : ''}
        <span>${score.suggest}</span>
      </span>
      <span class="score-tip">${tip}</span>
    </span>
  </button>`;
}

function renderScores() {
  const grid = $('#scoreGrid');
  if (!grid) return;
  const items = SCORES
    .map((score, index) => ({ score, index }))
    .filter(({ score }) => scoreFilter === 'all' || score.level === scoreFilter);
  grid.innerHTML = items.length
    ? items.map(({ score, index }) => scoreCardHTML(score, index)).join('')
    : '<p class="score-empty">这个难度暂时没有曲目。</p>';
  $$('#scoreFilters [data-score-filter]').forEach(button => {
    const active = button.dataset.scoreFilter === scoreFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function scoreCalibration(page) {
  return window.SCORE_CALIBRATIONS?.[page] || null;
}

function scoreCalibrationErrors(calibration) {
  if (!calibration || !window.ScoreNotation) return ['暂无已核对的曲谱数据'];
  return window.ScoreNotation.validate(calibration);
}

function scoreTuning(score, calibration, mode = scoreKeyMode) {
  const match = /^(♭?[A-G])/.exec(score.original || '');
  if (mode === 'original' && match) {
    const pitchClass = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
      '♭D': 1, '♭A': 8, '♭B': 10 }[match[1]];
    const tonic = 72 + pitchClass;
    const fluteClass = (pitchClass - SYSTEMS[calibration.system].tonic + 12) % 12;
    return { tonic, label: `原调 · 1=${nameForMidi(tonic)} · ${PITCH_NAMES[fluteClass]} 调笛作${calibration.system}` };
  }
  const key = calibration.key || state.key;
  const tonic = tonicMidi(calibration.system, key);
  return { tonic, label: `练习调 · ${key} 调笛作${calibration.system} · 1=${nameForMidi(tonic)}` };
}

function scoreEventMidi(event, tuning) {
  return tuning.tonic + event.octave * 12 + SCALE[event.degree];
}

function scoreStatusLabel(score = null) {
  if (!score) {
    const sheet = $('.sheet--score', $('#sheetRoot'));
    score = sheet ? SCORES[Number(sheet.dataset.scoreIndex)] : null;
  }
  const data = score && scoreCalibration(score.page);
  if (scoreCalibrationErrors(data).length) return '曲谱待核对 · 暂停示范';
  return `${scoreTuning(score, data).label} · ${data.tempo} 拍/分${data.octaveShift === -1 ? ' · 低八度演奏' : ''}${data.incomplete ? ' · 仅本页片段' : ''}`;
}

function scoreCalibrationHTML(data, errors) {
  if (!data) return '';
  const order = window.ScoreNotation.barOrder(data);
  const issues = errors.length ? `<p class="score-note">${errors.map(escapeHTML).join('<br>')}</p>` : '';
  const references = (data.references || []).map(ref => `<a href="${escapeHTML(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(ref.title)}</a>`).join(' · ');
  return `<details class="score-calibration">
    <summary>查看逐小节校准数据 · ${data.bars.length} 小节</summary>
    <p>每行一小节；逗号为低音，单引号为高音；_ / __ / ___ 为八 / 十六 / 三十二分；. 为附点；:n 为拍数；~ 为延音线。练习速度不代表原曲速度。</p>
    <pre>${data.bars.map((bar, i) => `${String(i + 1).padStart(2, '0')} │ ${escapeHTML(bar)}`).join('\n')}</pre>
    <p>演奏顺序：${order.map(i => i + 1).join(' → ')}</p>
    ${issues}${references ? `<p>核对参考：${references}</p>` : ''}
    <p>校准依据：本地第 ${data.source?.page || ''} 页谱面。自动示范保留主干音、节奏与八度；倚音、波音、颤音、滑音及连吐请对照原谱练习。</p>
  </details>`;
}

function scoreSheetHTML(index) {
  const score = SCORES[index];
  const page = String(score.page).padStart(2, '0');
  const calibration = scoreCalibration(score.page);
  const errors = scoreCalibrationErrors(calibration);
  const calibrated = errors.length === 0;
  return `<div class="sheet-head score-viewer-head">
    <div>
      <p class="eyebrow">曲谱 ${String(index + 1).padStart(2, '0')} / ${SCORES.length}</p>
      <h2 id="sheetTitle">${score.title}</h2>
      <div class="sheet-meta">
        <span>${SCORE_LEVELS[score.level]}</span>
        ${score.original ? `<span>原调 ${score.original}</span>` : ''}
        <span>${score.suggest}</span>
        <span class="${calibrated ? 'is-calibrated' : ''}">${calibrated ? '主干音已校对' : '待核对'}</span>
        ${calibration?.incomplete ? '<span>原图缺少后续</span>' : ''}
      </div>
    </div>
    <button class="sheet-close" type="button" data-close-sheet aria-label="关闭曲谱">
      <svg class="icon"><use href="#i-close"/></svg>
    </button>
  </div>
  <div class="score-player" data-score-player>
    <div class="score-mini" data-score-mini aria-hidden="true">
      ${[6, 5, 4, 3, 2, 1].map(hole => `<span class="score-mini-hole is-closed" data-mini-hole="${hole}"></span>`).join('')}
    </div>
    <div class="score-player-info">
      <strong data-score-note>准备</strong>
      <span data-score-status>${scoreStatusLabel(score)}</span>
    </div>
    <button class="score-play" type="button" data-score-play ${calibrated ? '' : 'disabled'}>${calibrated ? '▶ 主干音示范' : '待核对'}</button>
  </div>
  <label class="score-key-choice">演奏调性
    <select data-score-key-mode>
      <option value="original" ${score.original ? '' : 'disabled'} ${scoreKeyMode === 'original' && score.original ? 'selected' : ''}>原调${score.original ? ` · ${score.original}` : ' · 原谱未注明'}</option>
      <option value="practice" ${scoreKeyMode === 'practice' || !score.original ? 'selected' : ''}>练习调 · 随所选笛调</option>
    </select>
  </label>
  <figure class="score-figure" data-score-figure>
    <img src="assets/scores/full/p-${page}.jpg" alt="《${score.title}》简谱" width="2667" height="1500" decoding="async">
  </figure>
  <div class="score-viewer-foot">
    <button class="score-step" type="button" data-score-step="-1">← 上一首</button>
    <button class="score-zoom" type="button" data-score-zoom aria-pressed="false">放大谱面</button>
    <button class="score-step" type="button" data-score-step="1">下一首 →</button>
  </div>
  ${calibration?.note ? `<p class="score-note">${escapeHTML(calibration.note)}</p>` : ''}
  ${score.tip ? `<p class="score-note">${score.tip}</p>` : ''}
  ${scoreCalibrationHTML(calibration, errors)}
  <p class="score-hint">方向键翻页 · Esc 关闭</p>`;
}

function openScore(index, { returnFocus = null } = {}) {
  if (!SCORES[index]) return;
  stopScorePlayback();
  openSheet(scoreSheetHTML(index), { returnFocus, variant: 'sheet--score' });
  const sheet = $('.sheet', $('#sheetRoot'));
  if (sheet) sheet.dataset.scoreIndex = String(index);
}

function stepScore(delta) {
  const sheet = $('.sheet--score', $('#sheetRoot'));
  if (!sheet) return;
  stopScorePlayback();
  const current = Number(sheet.dataset.scoreIndex);
  const next = (current + delta + SCORES.length) % SCORES.length;
  sheet.dataset.scoreIndex = String(next);
  sheet.innerHTML = scoreSheetHTML(next);
  const button = sheet.querySelector(`[data-score-step="${delta}"]`);
  (button || sheet.querySelector('.sheet-close'))?.focus({ preventScroll: true });
}

function toggleScoreZoom() {
  const figure = $('[data-score-figure]', $('#sheetRoot'));
  if (!figure) return;
  const zoomed = figure.classList.toggle('is-zoomed');
  if (zoomed) figure.scrollLeft = 0;
  const button = $('[data-score-zoom]', $('#sheetRoot'));
  if (button) {
    button.setAttribute('aria-pressed', String(zoomed));
    button.textContent = zoomed ? '适应宽度' : '放大谱面';
  }
}

const scorePlay = { token: 0, timers: [], voices: new Set(), playing: false };

function scoreEvents(calibration) {
  const errors = scoreCalibrationErrors(calibration);
  if (errors.length) throw new Error(errors.join('；'));
  return window.ScoreNotation.compile(calibration).map(event => {
    if (event.rest) return event;
    const reg = event.octave === -1 ? 'low' : event.octave === 1 ? 'high' : 'mid';
    const note = getNote(`${REG_LABEL[reg]}${event.degree}`, calibration.system);
    if (!note) throw new Error(`第 ${event.barIndex + 1} 小节的 ${event.token} 缺少指法`);
    return { ...event, note };
  });
}

function updateScoreMiniDizi(note) {
  const mini = $('[data-score-mini]', $('#sheetRoot'));
  if (!mini) return;
  $$('[data-mini-hole]', mini).forEach(el => {
    const hole = Number(el.dataset.miniHole);
    const code = note.holes[6 - hole];
    el.classList.toggle('is-closed', code === '0');
    el.classList.toggle('is-open', code === '1');
    el.classList.toggle('is-half', code === '2');
  });
}

function stopScorePlayback() {
  scorePlay.token += 1;
  scorePlay.timers.forEach(timer => window.clearTimeout(timer));
  scorePlay.timers = [];
  scorePlay.voices.forEach(stop => stop());
  scorePlay.voices.clear();
  scorePlay.playing = false;
  const root = $('#sheetRoot');
  const button = $('[data-score-play]', root);
  if (button) {
    button.textContent = button.disabled ? '待核对' : '▶ 主干音示范';
    button.classList.remove('is-playing');
  }
  const status = $('[data-score-status]', root);
  if (status) status.textContent = scoreStatusLabel();
  $('[data-score-player]', root)?.classList.remove('is-blowing');
}

async function toggleScorePlayback() {
  if (scorePlay.playing) {
    stopScorePlayback();
    return;
  }
  const sheet = $('.sheet--score', $('#sheetRoot'));
  if (!sheet) return;
  const score = SCORES[Number(sheet.dataset.scoreIndex)];
  if (!score) return;
  const calibration = scoreCalibration(score.page);
  let events;
  try { events = scoreEvents(calibration); } catch (error) {
    console.warn('曲谱校验失败', error);
    showToast('这首谱面有待核对的部分，暂不能示范');
    return;
  }
  if (state.muted) {
    showToast('示范声音已关闭');
    return;
  }
  stopScorePlayback();
  const token = scorePlay.token;
  scorePlay.playing = true;
  const button = $('[data-score-play]', sheet);
  const info = $('[data-score-note]', sheet);
  const status = $('[data-score-status]', sheet);
  const player = $('[data-score-player]', sheet);
  if (button) {
    button.textContent = '■ 停止';
    button.classList.add('is-playing');
  }
  ensureAudio();
  if (!diziSamples) {
    if (status) status.textContent = '正在加载竹笛录音…';
    const loaded = await loadDiziSamples();
    if (token !== scorePlay.token || !scorePlay.playing) return;
    if (!loaded || state.muted) {
      stopScorePlayback();
      if (status) status.textContent = loaded ? '示范声音已关闭' : '笛音加载失败，请重试';
      return;
    }
  }
  const totalNotes = events.filter(event => !event.rest).length;
  const unit = 60 / calibration.tempo;
  const tuning = scoreTuning(score, calibration);
  let played = 0;
  let elapsed = 0;
  events.forEach(event => {
    const at = elapsed * unit * 1000;
    const timer = window.setTimeout(() => {
      if (token !== scorePlay.token || !scorePlay.playing) return;
      if (event.rest) {
        if (info) info.textContent = '休止';
        if (status) status.textContent = `第 ${event.barIndex + 1} 小节 · ${played} / ${totalNotes}`;
      } else {
        played += 1;
        updateScoreMiniDizi(event.note);
        const midi = scoreEventMidi(event, tuning);
        if (info) info.textContent = `${event.note.label} · ${nameForMidi(midi)}`;
        const sampleKind = diziPlayback(midi, diziSamples || DIZI_SAMPLE_MANIFEST).sample.midi === midi ? '本音采样' : '半音微调';
        if (status) status.textContent = `第 ${event.barIndex + 1} 小节 · ${tuning.label} · 目标 ${frequencyForMidi(midi).toFixed(1)} Hz · ${sampleKind} · ${played} / ${totalNotes}`;
        const stopVoice = playMidi(midi, {
          duration: event.duration * unit * 0.95,
          velocity: 0.5,
          attack: Math.min(0.03, event.duration * unit * 0.15),
          legato: false
        });
        if (stopVoice) {
          scorePlay.voices.add(stopVoice);
          scorePlay.timers.push(window.setTimeout(() => scorePlay.voices.delete(stopVoice), event.duration * unit * 1000 + 300));
        }
        if (player) {
          player.classList.add('is-blowing');
          scorePlay.timers.push(window.setTimeout(() => player.classList.remove('is-blowing'), Math.min(180, event.duration * unit * 900)));
        }
      }
    }, at);
    scorePlay.timers.push(timer);
    elapsed += event.duration;
  });
  const endTimer = window.setTimeout(() => {
    if (token !== scorePlay.token) return;
    scorePlay.playing = false;
    if (button) {
      button.textContent = '▶ 主干音示范';
      button.classList.remove('is-playing');
    }
    if (status) status.textContent = `演奏结束 · 共 ${totalNotes} 音`;
    scorePlay.voices.clear();
    if (player) player.classList.remove('is-blowing');
  }, elapsed * unit * 1000 + 250);
  scorePlay.timers.push(endTimer);
}

/* =========================================================
   今日练习
   ========================================================= */

function dailyMinutes() {
  return DAILY_TASKS.reduce((sum, task) => sum + (daily.done[task.id] ? task.minutes : 0), 0);
}

function renderDaily() {
  if (daily.date !== todayKey()) daily = { date: todayKey(), done: {} };
  const list = $('#dailyList');
  list.innerHTML = DAILY_TASKS.map(task => {
    const done = !!daily.done[task.id];
    return `<div class="daily-item ${done ? 'is-done' : ''}">
      <button class="daily-check" type="button" data-toggle-task="${task.id}" aria-pressed="${done}" aria-label="${done ? '取消' : '标记'}${task.title}完成">
        <svg class="icon"><use href="#i-check"/></svg>
      </button>
      <div class="daily-copy">
        <div class="daily-title">${task.title}<small>${task.minutes} 分钟</small></div>
        <div class="daily-sub">${task.sub}</div>
      </div>
      <button class="mini-play" type="button" data-play-task="${task.id}" aria-label="试听${task.title}示范">
        <svg class="icon"><use href="#i-play"/></svg>
      </button>
    </div>`;
  }).join('');

  const done = DAILY_TASKS.filter(task => daily.done[task.id]).length;
  const percent = Math.round((done / DAILY_TASKS.length) * 100);
  const ring = $('#dailyRing');
  ring.style.setProperty('--p', percent);
  ring.setAttribute('aria-label', `今日练习完成度 ${percent}%`);
  $('#dailyRingText').textContent = `${percent}%`;

  const minutes = dailyMinutes();
  $('#todayText').textContent = minutes ? `今日 ${minutes} 分钟` : '今日未练习';
  $('#todayChip').classList.toggle('is-active', minutes > 0);
}

function toggleTask(id) {
  const task = DAILY_TASKS.find(item => item.id === id);
  if (!task) return;
  if (daily.date !== todayKey()) daily = { date: todayKey(), done: {} };
  const wasDone = !!daily.done[id];
  if (wasDone) delete daily.done[id];
  else daily.done[id] = true;
  writeJSON(STORAGE.daily, daily);
  renderDaily();
  showToast(wasDone ? `${task.title} · 已取消` : `${task.title} · 完成，休息一下`);
}

function playTask(id) {
  const task = DAILY_TASKS.find(item => item.id === id);
  if (!task) return;
  playLabels(task.notes, { gap: 0.7, duration: 0.6 });
}

/* =========================================================
   指法实验室
   ========================================================= */

let floodTimer = null;

function flashDizi(ms = 900) {
  const stage = $('#diziStage');
  if (!stage) return;
  stage.classList.add('is-sounding');
  window.clearTimeout(floodTimer);
  floodTimer = window.setTimeout(() => stage.classList.remove('is-sounding'), ms);
}

const elec = {
  closed: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
  reg: 'low',
  note: null
};

let elecFlashTimer = null;

function elecPattern() {
  return [6, 5, 4, 3, 2, 1].map(hole => (elec.closed[hole] ? '0' : '1')).join('');
}

function elecCurrentNote() {
  const pattern = elecPattern();
  const matches = FINGERINGS[5].filter(note => note.holes === pattern);
  return matches.find(note => note.reg === elec.reg) || matches[0] || null;
}

function updateElecUI() {
  const tube = $('#elecTube');
  if (!tube) return;
  $$('#elecTube [data-hole]').forEach(button => {
    const hole = Number(button.dataset.hole);
    const closed = !!elec.closed[hole];
    button.classList.toggle('is-closed', closed);
    button.classList.toggle('is-open', !closed);
    button.setAttribute('aria-pressed', String(closed));
    button.setAttribute('aria-label', `第${HOLE_CN[hole]}孔，${closed ? '按闭' : '开放'}`);
  });
  const note = elecCurrentNote();
  elec.note = note;
  if (note) {
    const midi = midiOf(note, 5, state.key);
    $('#elecNote').textContent = note.label;
    $('#elecPitch').textContent = `${nameForMidi(midi)} · ${frequencyForMidi(midi).toFixed(1)} Hz`;
    $('#elecHint').textContent = '点按音孔，或按 1–6；空格吹气';
  } else {
    $('#elecNote').textContent = '未收录指法';
    $('#elecPitch').textContent = elecPattern().split('').map(code => (code === '0' ? '●' : '○')).join(' ');
    $('#elecHint').textContent = '这组孔位不在指法表里，换一个组合试试';
  }
  $('#elecOctave').textContent = { low: '低音区', mid: '中音区', high: '高音区' }[elec.reg];
}

function renderElecDizi() {
  const tube = $('#elecTube');
  if (!tube) return;
  tube.innerHTML = `<span class="elec-blow" aria-hidden="true"></span>
    <span class="elec-membrane" aria-hidden="true"></span>
    ${[6, 5, 4, 3, 2, 1].map(hole => `<button class="elec-hole" type="button" data-hole="${hole}" aria-pressed="true" aria-label="第${HOLE_CN[hole]}孔，按闭"><span>${hole}</span></button>`).join('')}`;
  syncElecToNote(currentNote());
  updateElecUI();
}

function syncElecToNote(note) {
  if (!note || state.system !== 5 || note.holes.includes('2')) return;
  elec.reg = note.reg;
  [6, 5, 4, 3, 2, 1].forEach(hole => {
    elec.closed[hole] = note.holes[6 - hole] === '0';
  });
  updateElecUI();
}

function playElecNote(strong = true) {
  if (!elec.note) {
    showToast('这组孔位还没收录');
    return;
  }
  if (state.muted) {
    showToast('示范声音已关闭');
    return;
  }
  const midi = midiOf(elec.note, 5, state.key);
  playMidi(midi, { duration: strong ? 1.6 : 0.75, velocity: strong ? 0.58 : 0.45 });
  const stage = $('#elecStage');
  if (!stage) return;
  stage.classList.add('is-blowing');
  window.clearTimeout(elecFlashTimer);
  elecFlashTimer = window.setTimeout(() => stage.classList.remove('is-blowing'), strong ? 650 : 320);
}

function toggleElecHole(hole) {
  if (!(hole >= 1 && hole <= 6)) return;
  elec.closed[hole] = !elec.closed[hole];
  updateElecUI();
  if (elec.note && !state.muted) playElecNote(false);
}

function cycleElecReg(delta = 1) {
  const order = ['low', 'mid', 'high'];
  elec.reg = order[(order.indexOf(elec.reg) + delta + order.length) % order.length];
  updateElecUI();
  if (elec.note && !state.muted) playElecNote(false);
}

async function playElecScale() {
  stopSequence();
  if (state.muted) {
    showToast('示范声音已关闭');
    return;
  }
  const labels = ['低音5', '低音6', '低音7', '中音1', '中音2', '中音3', '中音5'];
  const token = sequence.token;
  ensureAudio();
  if (!diziSamples && !await loadDiziSamples()) { showToast('笛音加载失败，请重试'); return; }
  if (token !== sequence.token || state.muted) return;
  labels.forEach((label, index) => {
    const timer = window.setTimeout(() => {
      if (token !== sequence.token) return;
      const note = FINGERINGS[5].find(item => item.label === label);
      if (!note) return;
      elec.reg = note.reg;
      [6, 5, 4, 3, 2, 1].forEach(hole => {
        elec.closed[hole] = note.holes[6 - hole] === '0';
      });
      updateElecUI();
      playMidi(midiOf(note, 5, state.key), { duration: 0.55, velocity: 0.5 });
      const stage = $('#elecStage');
      if (!stage) return;
      stage.classList.add('is-blowing');
      window.setTimeout(() => stage.classList.remove('is-blowing'), 260);
    }, index * 620 + 20);
    sequence.timers.push(timer);
  });
}

function renderSystemPills() {
  $('#systemPills').innerHTML = SYSTEM_ORDER.map(system => `
    <button class="system-pill" type="button" data-system="${system}" aria-pressed="${state.system === system}">
      ${SYSTEMS[system].name}<em>${SYSTEMS[system].tag}</em>
    </button>`).join('');
}

function noteChipHTML(note) {
  const pitch = nameForMidi(midiOf(note));
  const isName = state.notation === 'name';
  const dot = note.reg !== 'mid' ? `<i class="reg-dot ${REG_DOT[note.reg]}"></i>` : '';
  const main = isName ? pitch : `${note.degree}${dot}`;
  const sub = isName ? note.label : pitch;
  const active = state.selected === note.label;
  return `<button class="note-chip ${active ? 'is-active' : ''}" type="button" data-note="${note.label}" aria-pressed="${active}" aria-label="${note.label}，${pitch}">
    <span class="chip-main ${isName ? 'is-name' : ''}">${main}</span>
    <span class="chip-sub">${sub}</span>
  </button>`;
}

function renderNoteGroups() {
  const groups = [
    { reg: 'low', name: '低音区' },
    { reg: 'mid', name: '中音区' },
    { reg: 'high', name: '高音区' }
  ];
  $('#noteGroups').innerHTML = groups.map(group => {
    const notes = FINGERINGS[state.system].filter(note => note.reg === group.reg);
    if (!notes.length) return '';
    return `<div class="note-group">
      <div class="group-label">${group.name}</div>
      <div class="note-chips">${notes.map(noteChipHTML).join('')}</div>
    </div>`;
  }).join('');
}

function renderDizi(note) {
  const stage = $('#diziStage');
  const rows = [...note.holes].map((code, index) => {
    const hole = 6 - index;
    const holeState = code === '1' ? 'open' : code === '2' ? 'half' : 'closed';
    return `<div class="dizi-row dizi-row--hole">
      <div class="side side--left"><strong>第${HOLE_CN[hole]}孔</strong></div>
      <div class="tube-zone"><div class="dizi-hole" data-state="${holeState}"></div></div>
      <div class="side side--right">
        <span class="finger ${hole >= 4 ? 'is-left-hand' : ''}">${HOLE_FINGERS[hole]}</span>
        <span class="hole-number-mobile" aria-hidden="true">${hole}</span>
      </div>
    </div>`;
  }).join('');

  stage.innerHTML = `<div class="dizi-grid">
    <div class="dizi-tube" aria-hidden="true">
      <span class="tube-node" style="top:17%"></span>
      <span class="tube-node" style="top:52%"></span>
      <span class="tube-node" style="top:84%"></span>
    </div>
    <div class="dizi-row dizi-row--mouth">
      <div class="side side--left"><strong>吹孔</strong><small>BLOW</small></div>
      <div class="tube-zone"><div class="mouth-hole"></div></div>
      <div class="side side--right"><span class="finger">气流贴边</span></div>
    </div>
    <div class="dizi-row dizi-row--membrane">
      <div class="side side--left"><strong>膜孔</strong><small>MEMBRANE</small></div>
      <div class="tube-zone"><div class="membrane-hole"></div></div>
      <div class="side side--right"><span class="finger">笛膜</span></div>
    </div>
    ${rows}
  </div>`;
  stage.setAttribute('aria-label', `六孔笛指法：${note.label}。${noteTip(note)}吹法：${note.blow}。`);
}

function renderNow(note) {
  const midi = midiOf(note);
  const pitch = nameForMidi(midi);
  const frequency = frequencyForMidi(midi);
  const isName = state.notation === 'name';
  const dot = note.reg !== 'mid' ? `<i class="reg-dot ${REG_DOT[note.reg]}"></i>` : '';
  const main = isName
    ? `<span class="pitch is-name">${pitch}</span>`
    : `<span class="pitch">${note.degree}${dot}</span>`;

  $('#nowNote').innerHTML = `<div class="now-head">
      <p class="eyebrow">当前音</p>
      <span class="badge">${note.blow}</span>
    </div>
    <div class="now-main">
      ${main}
      <div class="now-info">
        <strong>${isName ? note.label : pitch}</strong>
        <span>${frequency.toFixed(1)} Hz</span>
        <small>1 = ${tonicLabel()}</small>
      </div>
    </div>
    <p class="now-desc">${noteTip(note)} ${BLOW[note.blow]}</p>`;
}

function renderKeys() {
  $('#keyGrid').innerHTML = Object.keys(KEYS).map(key => `
    <button class="key-btn ${state.key === key ? 'is-active' : ''}" type="button" data-key="${key}" aria-pressed="${state.key === key}" aria-label="${KEYS[key].name}${KEYS[key].type}">
      <strong>${key}</strong><span>${KEYS[key].type}</span>
    </button>`).join('');
}

function renderTip() {
  const system = SYSTEMS[state.system];
  $('#fingeringTip').innerHTML = `<div class="tip-title"><svg class="icon"><use href="#i-info"/></svg>${system.name}</div>
    <p>${system.desc}${system.tip}</p>
    <p class="tip-foot">本调：1 = ${tonicLabel()} · ${KEYS[state.key].name}${KEYS[state.key].type}</p>`;
}

function renderFingering() {
  const note = currentNote();
  $$('#notationToggle button').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.notation === state.notation));
  });
  $('#fingeringSystemEyebrow').textContent = `${SYSTEMS[state.system].name} · ${SYSTEMS[state.system].tag}`;
  $('#instrumentTitle').textContent = `${KEYS[state.key].name}${KEYS[state.key].type}`;
  $('#blowBadge').textContent = note.blow;
  renderSystemPills();
  renderDizi(note);
  renderNow(note);
  renderNoteGroups();
  renderKeys();
  renderTip();
  if ($('#elecTube [data-hole]')) updateElecUI();
}

function selectNote(label, { play = true } = {}) {
  const note = getNote(label, state.system);
  if (!note) return;
  stopSequence();
  state.selected = label;
  $$('#noteGroups .note-chip').forEach(chip => {
    const active = chip.dataset.note === label;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
  $('#blowBadge').textContent = note.blow;
  renderDizi(note);
  renderNow(note);
  syncElecToNote(note);
  if (play && !state.muted) {
    playMidi(midiOf(note), { duration: 1.35, velocity: 0.5 });
    flashDizi(1200);
  }
}

function setSystem(system) {
  if (!SYSTEMS[system] || state.system === Number(system)) return;
  stopSequence();
  state.system = Number(system);
  if (!getNote(state.selected, state.system)) state.selected = '中音1';
  renderFingering();
}

function playScale() {
  const notes = FINGERINGS[state.system].slice(0, 8);
  const midis = notes.map(note => midiOf(note));
  playSequence(midis, {
    gap: 0.78,
    duration: 0.66,
    onStep: index => {
      const note = notes[index];
      state.selected = note.label;
      $$('#noteGroups .note-chip').forEach(chip => {
        const active = chip.dataset.note === note.label;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      $('#blowBadge').textContent = note.blow;
      renderDizi(note);
      renderNow(note);
      flashDizi(760);
    }
  });
}

/* =========================================================
   课程抽屉
   ========================================================= */

function degreeHTML(label) {
  const match = label.match(/^(低音|中音|高音)(\d)$/);
  if (!match) return label;
  const reg = match[1] === '低音' ? 'low' : match[1] === '中音' ? 'mid' : 'high';
  const dot = reg !== 'mid' ? `<i class="reg-dot ${REG_DOT[reg]}"></i>` : '';
  return `<span class="degree">${match[2]}${dot}</span>`;
}

function openLesson(id, { returnFocus = null } = {}) {
  const lesson = LESSONS.find(item => item.id === id);
  if (!lesson) return;
  const stage = STAGES[lesson.stage];
  const done = lessonDone(id);
  const next = LESSONS.find(item => item.id === id + 1);
  const practice = lesson.practice;
  const practiceChips = practice.notes.map((label, index) => `
    <button class="practice-chip" type="button" data-practice-note="${label}" aria-label="试听${label}">
      ${degreeHTML(label)}
    </button>`).join('');
  const scoreBlock = lesson.score
    ? `<div class="score-block"><h3>简谱 · 筒音作 5 · 1 = D</h3><pre>${lesson.score.join('\n')}</pre></div>`
    : '';

  const html = `<div class="sheet-head">
      <div>
        <p class="eyebrow">${stage.numeral} · ${stage.name} · 第 ${lesson.id} 课</p>
        <h2 id="sheetTitle">${lesson.full}</h2>
        <div class="sheet-meta">
          <span>${lesson.duration} 分钟</span>
          <span>${lesson.level}</span>
          <span>${lesson.steps.length} 个步骤</span>
        </div>
      </div>
      <button class="sheet-close" type="button" data-close-sheet aria-label="关闭课程详情">
        <svg class="icon"><use href="#i-close"/></svg>
      </button>
    </div>
    <p class="sheet-intro">${lesson.intro}</p>
    <div class="goal-box">
      <h3>本课目标</h3>
      <ul>${lesson.goals.map(goal => `<li>${goal}</li>`).join('')}</ul>
    </div>
    <ol class="steps">
      ${lesson.steps.map(step => `<li class="step"><h4>${step.t}</h4><p>${step.b}</p></li>`).join('')}
    </ol>
    <div class="callout">
      <h3>记住这几点</h3>
      <ul>${lesson.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
    </div>
    ${scoreBlock}
    <div class="practice-box">
      <div class="practice-head"><h3>${practice.title}</h3><span>点击音符试听</span></div>
      <p class="practice-hint">${practice.hint}</p>
      <div class="practice-chips">${practiceChips}</div>
      <div class="practice-actions">
        <button class="btn btn-soft" type="button" data-play-practice>
          <svg class="icon"><use href="#i-play"/></svg>播放整段示范
        </button>
        <button class="btn btn-quiet" type="button" data-open-fingering data-fingering-note="${practice.notes[0]}">去指法页看孔位</button>
      </div>
    </div>
    <div class="sheet-actions">
      <button class="btn btn-primary btn-complete ${done ? 'is-done' : ''}" type="button" data-complete-lesson="${lesson.id}">
        ${done ? '已完成 · 点击撤销' : '标记完成'}
      </button>
      ${next
        ? `<button class="btn btn-quiet" type="button" data-next-lesson="${next.id}">下一课 · ${next.title}<svg class="icon"><use href="#i-arrow"/></svg></button>`
        : `<button class="btn btn-quiet" type="button" data-close-sheet>回到课程</button>`}
    </div>`;

  const fallback = document.querySelector(`[data-open-lesson="${id}"]`);
  openSheet(html, { returnFocus: returnFocus || fallback });
}

function toggleLessonComplete(id) {
  const lesson = LESSONS.find(item => item.id === id);
  if (!lesson) return;
  const nowDone = !lessonDone(id);
  if (nowDone) lessonProgress[id] = true;
  else delete lessonProgress[id];
  writeJSON(STORAGE.lessons, lessonProgress);
  renderCourse();
  updateHero();

  const button = $(`#sheetRoot [data-complete-lesson="${id}"]`);
  if (button) {
    button.classList.toggle('is-done', nowDone);
    button.textContent = nowDone ? '已完成 · 点击撤销' : '标记完成';
  }
  const freshCard = document.querySelector(`[data-open-lesson="${id}"]`);
  if (freshCard) sheetState.lastFocus = freshCard;
  showToast(nowDone ? `第 ${id} 课 · 已完成` : `第 ${id} 课 · 已取消完成`);
}

function playSheetPractice() {
  const chips = $$('#sheetRoot [data-practice-note]');
  if (!chips.length) return;
  const labels = chips.map(chip => chip.dataset.practiceNote);
  const midis = labels
    .map(label => getNote(label, 5))
    .filter(Boolean)
    .map(note => midiOf(note, 5, 'D'));
  playSequence(midis, {
    gap: 0.68,
    duration: 0.55,
    onStep: index => {
      chips.forEach(chip => chip.classList.remove('is-playing'));
      if (chips[index]) chips[index].classList.add('is-playing');
    }
  });
}

function openFingeringInfo() {
  const html = `<div class="sheet-head">
      <div>
        <p class="eyebrow">指法讲义</p>
        <h2 id="sheetTitle">六孔笛的指法底色</h2>
        <div class="sheet-meta"><span>筒音</span><span>音孔编号</span><span>半孔</span></div>
      </div>
      <button class="sheet-close" type="button" data-close-sheet aria-label="关闭指法详情">
        <svg class="icon"><use href="#i-close"/></svg>
      </button>
    </div>
    <p class="sheet-intro">六个音孔加一个筒音，构成竹笛最基本的七声音列。理解“筒音作几”，比死记孔位更重要。</p>
    <div class="info-section">
      <h3>筒音是什么</h3>
      <p>六个音孔全部按闭时吹出的音，叫做筒音。它是整支笛子的最低音，也是指法体系的起点。同一个筒音，可以唱作 5、2 或 1，于是有了不同的“筒音作几”。</p>
    </div>
    <div class="info-section">
      <h3>三种体系怎么选</h3>
      <ul>
        <li><strong>筒音作 5</strong>：最常用。全按为低音 5，入门曲、练习曲大多可用。</li>
        <li><strong>筒音作 2</strong>：全按为低音 2，常见于 G 调乐曲；低音 4 与中音 1 需要半孔或组合指法。</li>
        <li><strong>筒音作 1</strong>：全按为低音 1，音阶与唱名一一对应，唱谱最直观。</li>
      </ul>
    </div>
    <div class="info-section">
      <h3>音孔编号</h3>
      <p>从笛尾向吹孔数：第一孔到第六孔。右手在下，负责第一、二、三孔；左手在上，负责第四、五、六孔。指法图里第六孔在最上，第一孔在最下。</p>
    </div>
    <div class="info-section">
      <h3>半孔怎么做</h3>
      <p>指腹贴着孔边向旁边平移，露出大约一半的孔，不要把手指抬起来再落下。半孔会降低半音，是补齐半音阶的关键；位置靠触感与听力，不靠眼睛。</p>
    </div>
    <div class="tip-card">
      <div class="tip-title"><svg class="icon"><use href="#i-info"/></svg>练习顺序</div>
      <p>先用筒音作 5 把 5 6 7 1 2 3 吹稳，再学 4 的半孔，最后再换其他指法体系。一次只改一个变量。</p>
    </div>
    <div class="sheet-actions">
      <button class="btn btn-primary" type="button" data-close-sheet>知道了</button>
    </div>`;
  openSheet(html, { returnFocus: $('#fingeringDetailBtn') });
}

/* =========================================================
   测验
   ========================================================= */

function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function activeTopics(mode = state.quizMode) {
  if (mode === 'visual') return ['fingering', 'pitch', 'theory'];
  if (mode === 'ear') return ['ear', 'theory'];
  return ['fingering', 'pitch', 'ear', 'theory'];
}

function renderTopics() {
  const allowed = activeTopics();
  $('#topicGrid').innerHTML = TOPICS.map(topic => {
    const disabled = !allowed.includes(topic.id);
    const selected = state.quizTopics.includes(topic.id);
    return `<button class="topic" type="button" data-topic="${topic.id}" aria-pressed="${selected}" ${disabled ? 'disabled aria-disabled="true"' : ''}>
      <span class="topic-icon"><svg class="icon"><use href="#${topic.icon}"/></svg></span>
      <span class="topic-copy">
        <strong>${topic.name}</strong>
        <span>${disabled ? '当前模式不可选' : topic.desc}</span>
      </span>
    </button>`;
  }).join('');
  updateQuizCount();
}

function updateQuizCount() {
  const count = state.quizTopics.length ? 8 : 0;
  $('#quizCount').textContent = count;
  $('#startQuizBtn').disabled = count === 0;
}

function renderQuizStats() {
  const attempts = bestStore.attempts || 0;
  $('#bestScore').textContent = attempts ? bestStore.best : '—';
  $('#bestMeta').textContent = attempts
    ? `已完成 ${attempts} 次 · 最近 ${bestStore.last} / ${bestStore.total}`
    : '还没有测验记录';
  const accuracy = bestStore.answered ? Math.round((bestStore.correct / bestStore.answered) * 100) : null;
  $('#bestList').innerHTML = `
    <div class="best-row"><span>累计答题</span><strong>${bestStore.answered || 0} 题</strong></div>
    <div class="best-row"><span>累计正确率</span><strong>${accuracy === null ? '—' : `${accuracy}%`}</strong></div>
    <div class="best-row"><span>最佳成绩</span><strong>${attempts ? `${bestStore.best} / ${bestStore.total}` : '—'}</strong></div>`;
}

function setQuizMode(mode) {
  if (!['mix', 'visual', 'ear'].includes(mode)) return;
  state.quizMode = mode;
  $$('#quizMode button').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode)));
  state.quizTopics = activeTopics(mode);
  renderTopics();
}

function setQuizLevel(level) {
  if (!['basic', 'advanced'].includes(level)) return;
  state.quizLevel = level;
  $$('#quizLevel button').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.level === level)));
}

function toggleTopic(id) {
  if (!activeTopics().includes(id)) return;
  if (state.quizTopics.includes(id)) {
    if (state.quizTopics.length === 1) {
      showToast('至少保留一个范围');
      return;
    }
    state.quizTopics = state.quizTopics.filter(topic => topic !== id);
  } else {
    state.quizTopics = [...state.quizTopics, id];
  }
  renderTopics();
}

function makeFingeringQuestion(config) {
  const system = pick(SYSTEM_ORDER);
  const key = pick(['D', 'G', 'C']);
  const pool = config.level === 'basic'
    ? FINGERINGS[system].filter(note => note.reg !== 'high')
    : FINGERINGS[system];
  const note = pick(pool);
  const distractors = shuffle(FINGERINGS[system].filter(item => item.label !== note.label)).slice(0, 3);
  const options = shuffle([note.label, ...distractors.map(item => item.label)]);
  const pitch = nameForMidi(midiOf(note, system, key));
  return {
    topic: 'fingering',
    tag: '指法识音',
    prompt: `在 ${KEYS[key].name}笛、${SYSTEMS[system].name} 中，这个指法吹出哪个音？`,
    visual: { type: 'strip', holes: note.holes },
    options,
    correct: note.label,
    explain: `${note.label} · ${pitch}。${noteTip(note)}${BLOW[note.blow]}`,
    listenMidi: midiOf(note, system, key)
  };
}

function makePitchQuestion(config) {
  const system = pick(SYSTEM_ORDER);
  const key = pick(['D', 'G', 'C']);
  const pool = config.level === 'basic'
    ? FINGERINGS[system].filter(note => note.reg !== 'high')
    : FINGERINGS[system];
  const note = pick(pool);
  const correct = nameForMidi(midiOf(note, system, key));
  const allNames = [...new Set(FINGERINGS[system].map(item => nameForMidi(midiOf(item, system, key))))]
    .filter(name => name !== correct);
  const options = shuffle([correct, ...shuffle(allNames).slice(0, 3)]);
  return {
    topic: 'pitch',
    tag: '音名定位',
    prompt: `在 ${KEYS[key].name}笛、${SYSTEMS[system].name} 中，${note.label} 的实际音高是？`,
    visual: { type: 'token', label: note.label },
    options,
    correct,
    explain: `${note.label} = ${correct}（${frequencyForMidi(midiOf(note, system, key)).toFixed(1)} Hz）。这套指法下 1 = ${tonicLabel(system, key)}。`,
    listenMidi: midiOf(note, system, key)
  };
}

function makeEarQuestion(config) {
  const system = pick(SYSTEM_ORDER);
  const key = pick(['D', 'G', 'C']);
  const pool = (config.level === 'basic'
    ? FINGERINGS[system].filter(note => note.reg !== 'high')
    : FINGERINGS[system])
    .filter(note => {
      const midi = midiOf(note, system, key);
      const frequency = frequencyForMidi(midi);
      return frequency >= 190 && frequency <= 1000;
    });
  const playable = pool.length
    ? pool
    : FINGERINGS[system].filter(note => note.reg !== 'high');
  const note = pick(playable);
  const distractors = shuffle(FINGERINGS[system].filter(item => item.label !== note.label)).slice(0, 3);
  const options = shuffle([note.label, ...distractors.map(item => item.label)]);
  const midi = midiOf(note, system, key);
  return {
    topic: 'ear',
    tag: '听音辨音',
    prompt: `在 ${KEYS[key].name}笛、${SYSTEMS[system].name} 中，听一听这是哪个音？`,
    visual: { type: 'listen', midi },
    options,
    correct: note.label,
    explain: `${note.label} · ${nameForMidi(midi)}。${noteTip(note)}`,
    listenMidi: midi
  };
}

function makeTheoryQuestion(config, used, allowRepeat = false) {
  let pool = THEORY.filter(item => item.level === config.level && !used.has(item.q));
  if (!pool.length) pool = THEORY.filter(item => !used.has(item.q));
  if (!pool.length && allowRepeat) pool = THEORY;
  if (!pool.length) return null;
  const item = pick(pool);
  used.add(item.q);
  return {
    topic: 'theory',
    tag: '乐理常识',
    prompt: item.q,
    visual: null,
    options: shuffle(item.options),
    correct: item.answer,
    explain: item.explain
  };
}

function buildQuestions(config) {
  const order = [];
  for (let i = 0; i < config.count; i += 1) order.push(config.topics[i % config.topics.length]);
  shuffle(order);
  const questions = [];
  const usedTheory = new Set();
  const usedPrompts = new Set();
  let guard = 0;
  while (questions.length < config.count && guard < 240) {
    guard += 1;
    const topic = order[questions.length % order.length];
    let question = null;
    if (topic === 'theory') question = makeTheoryQuestion(config, usedTheory);
    else if (topic === 'fingering') question = makeFingeringQuestion(config);
    else if (topic === 'pitch') question = makePitchQuestion(config);
    else if (topic === 'ear') question = makeEarQuestion(config);
    if (!question) {
      question = makeTheoryQuestion(config, usedTheory, true) || makeFingeringQuestion(config);
    }
    if (!question || usedPrompts.has(question.prompt)) continue;
    usedPrompts.add(question.prompt);
    questions.push(question);
  }
  return questions;
}

function stripHTML(holes) {
  const cells = [...holes].map(code => {
    const holeState = code === '1' ? 'open' : code === '2' ? 'half' : 'closed';
    return `<div class="strip-cell"><div class="strip-hole" data-state="${holeState}"></div></div>`;
  }).join('');
  return `<div class="strip">
    <div class="strip-tube">${cells}</div>
    <div class="strip-labels"><span>六</span><span>五</span><span>四</span><span>三</span><span>二</span><span>一</span></div>
  </div>`;
}

function questionVisualHTML(question) {
  if (!question.visual) return '';
  if (question.visual.type === 'strip') {
    return `<div class="q-visual">${stripHTML(question.visual.holes)}<p class="strip-caption">孔序：第六孔 → 第一孔</p></div>`;
  }
  if (question.visual.type === 'token') {
    return `<div class="q-visual"><div class="q-note-token"><strong>${degreeHTML(question.visual.label)}</strong><span>${question.visual.label}</span></div></div>`;
  }
  if (question.visual.type === 'listen') {
    return `<div class="q-visual"><div class="listen-wrap">
      <button class="listen-btn" type="button" data-listen-midi="${question.visual.midi}">
        <span class="play-disc"><svg class="icon"><use href="#i-play"/></svg></span>播放声音
      </button>
      <p class="micro">可重复播放，先听音区，再听音级</p>
    </div></div>`;
  }
  return '';
}

function renderQuestion() {
  const question = quiz.questions[quiz.index];
  if (!question) {
    finishQuiz();
    return;
  }
  quiz.answered = false;
  quiz.selection = null;
  const total = quiz.questions.length;
  const options = question.options.map((option, index) => `
    <button class="option" type="button" data-option="${index}">${option}</button>`).join('');
  $('#quizPlay').innerHTML = `<div class="quiz-top">
      <button class="text-btn" id="quitQuiz" type="button"><svg class="icon"><use href="#i-close"/></svg>退出</button>
      <div class="quiz-progress">
        <div class="progress-meta"><span>第 <strong>${quiz.index + 1}</strong> / ${total} 题</span><span>${question.tag}</span></div>
        <div class="progress-bar"><i style="width:${Math.round(((quiz.index + 1) / total) * 100)}%"></i></div>
      </div>
      <span class="score-chip">得分 ${quiz.score}</span>
    </div>
    <article class="card question-card">
      <span class="q-tag">${question.tag}</span>
      <h2>${question.prompt}</h2>
      ${questionVisualHTML(question)}
      <div class="options ${question.topic === 'theory' ? 'is-long' : ''}" role="group" aria-label="答案选项">${options}</div>
      <div class="feedback" id="quizFeedback" role="status" aria-live="polite" hidden></div>
      <div class="q-actions">
        <button class="btn btn-primary" id="nextQuestion" type="button" hidden>
          下一题 <svg class="icon"><use href="#i-arrow"/></svg>
        </button>
      </div>
    </article>`;
}

function answerQuestion(index) {
  if (!quiz.active || quiz.answered) return;
  const question = quiz.questions[quiz.index];
  const options = $$('#quizPlay .option');
  if (!question || index < 0 || index >= options.length) return;
  quiz.answered = true;
  quiz.selection = index;
  const correctIndex = question.options.indexOf(question.correct);
  const correct = index === correctIndex;
  options.forEach((button, i) => {
    button.disabled = true;
    if (i === correctIndex) button.classList.add('is-correct');
    else if (i === index) button.classList.add('is-wrong');
    else button.classList.add('is-dim');
  });
  if (correct) quiz.score += 1;
  quiz.results.push({ topic: question.topic, correct });
  const feedback = $('#quizFeedback');
  feedback.hidden = false;
  feedback.classList.toggle('is-wrong', !correct);
  feedback.innerHTML = `<strong>${correct ? '答对了' : '再听一遍'}</strong>${question.explain}`;
  const next = $('#nextQuestion');
  next.hidden = false;
  if (quiz.index === quiz.questions.length - 1) {
    next.innerHTML = '查看结果 <svg class="icon"><use href="#i-arrow"/></svg>';
  }
  const chip = $('#quizPlay .score-chip');
  if (chip) chip.textContent = `得分 ${quiz.score}`;
  if (question.listenMidi && !state.muted) {
    playMidi(question.listenMidi, { duration: 1.2, velocity: 0.45 });
  }
}

function nextQuestion() {
  if (!quiz.active || !quiz.answered) return;
  quiz.index += 1;
  if (quiz.index >= quiz.questions.length) finishQuiz();
  else renderQuestion();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function startQuiz() {
  if (!state.quizTopics.length) {
    showToast('先选择一个测验范围');
    return;
  }
  const config = {
    mode: state.quizMode,
    level: state.quizLevel,
    topics: [...state.quizTopics],
    count: 8
  };
  const questions = buildQuestions(config);
  if (!questions.length) {
    showToast('题目生成失败，请重试');
    return;
  }
  quiz.active = true;
  quiz.questions = questions;
  quiz.index = 0;
  quiz.score = 0;
  quiz.answered = false;
  quiz.selection = null;
  quiz.results = [];
  quiz.config = config;
  quiz.startedAt = Date.now();
  $('#quizIntro').hidden = true;
  $('#quizResult').hidden = true;
  $('#quizPlay').hidden = false;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function finishQuiz() {
  quiz.active = false;
  const total = quiz.questions.length;
  const score = quiz.score;
  const percent = total ? Math.round((score / total) * 100) : 0;
  const elapsed = Math.max(1, Math.round((Date.now() - quiz.startedAt) / 60000));

  bestStore.attempts = (bestStore.attempts || 0) + 1;
  bestStore.answered = (bestStore.answered || 0) + total;
  bestStore.correct = (bestStore.correct || 0) + score;
  bestStore.last = score;
  bestStore.total = total;
  bestStore.best = Math.max(bestStore.best || 0, score);
  writeJSON(STORAGE.best, bestStore);
  renderQuizStats();

  const title = percent === 100
    ? '满弓满弦'
    : percent >= 75
      ? '已经找到门道'
      : percent >= 50
        ? '基础正在成形'
        : '再听一遍，答案会自己出现';
  const description = percent === 100
    ? '这一组全部答对。可以换进阶难度，或者去指法实验室看看高音区。'
    : percent >= 50
      ? '指法与音高的关系正在变清楚。把答错的题再听一遍，比刷新题更有效。'
      : '不急着追求速度。先回到指法页，把筒音作 5 的音阶听熟。';

  const topicStats = {};
  quiz.results.forEach(result => {
    if (!topicStats[result.topic]) topicStats[result.topic] = { total: 0, correct: 0 };
    topicStats[result.topic].total += 1;
    if (result.correct) topicStats[result.topic].correct += 1;
  });
  const weak = Object.entries(topicStats)
    .filter(([, stat]) => stat.correct < stat.total)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)[0];
  const weakTip = weak
    ? `错题集中在「${TOPIC_NAMES[weak[0]]}」，可以回到指法实验室再走一遍。`
    : '没有明显短板，换更高的难度试试。';

  $('#quizPlay').hidden = true;
  $('#quizIntro').hidden = true;
  $('#quizResult').hidden = false;
  $('#quizResult').innerHTML = `<article class="card result-card">
    <div class="result-ring" style="--p:${percent}" role="img" aria-label="得分 ${percent}%">
      <div><strong>${score}</strong><span>/ ${total}</span></div>
    </div>
    <h2>${title}</h2>
    <p>${description}</p>
    <div class="result-stats">
      <div class="result-stat"><strong>${percent}%</strong><span>正确率</span></div>
      <div class="result-stat"><strong>${bestStore.best} / ${bestStore.total}</strong><span>本机最好</span></div>
      <div class="result-stat"><strong>约 ${elapsed} 分钟</strong><span>用时</span></div>
    </div>
    <p class="micro" style="margin-bottom:18px">${weakTip}</p>
    <div class="result-actions">
      <button class="btn btn-primary" type="button" data-retry-quiz>再测一次 <svg class="icon"><use href="#i-arrow"/></svg></button>
      <button class="btn btn-quiet" type="button" data-go-learn>回到课程</button>
      <button class="btn btn-quiet" type="button" data-go-fingering>去看指法</button>
    </div>
  </article>`;
}

function resetQuizUI() {
  quiz.active = false;
  quiz.questions = [];
  quiz.index = 0;
  quiz.score = 0;
  quiz.answered = false;
  quiz.selection = null;
  quiz.results = [];
  $('#quizIntro').hidden = false;
  $('#quizPlay').hidden = true;
  $('#quizPlay').innerHTML = '';
  $('#quizResult').hidden = true;
  $('#quizResult').innerHTML = '';
  renderQuizStats();
}

function quitQuiz() {
  if (!quiz.active) return;
  resetQuizUI();
  showToast('已退出本次测验');
}

/* =========================================================
   事件
   ========================================================= */

function handleGlobalClick(event) {
  const nav = event.target.closest('[data-nav]');
  if (nav) {
    event.preventDefault();
    setView(nav.dataset.nav);
    return;
  }
  const openLessonButton = event.target.closest('[data-open-lesson]');
  if (openLessonButton) {
    openLesson(Number(openLessonButton.dataset.openLesson));
    return;
  }
  const toggle = event.target.closest('[data-toggle-task]');
  if (toggle) {
    toggleTask(toggle.dataset.toggleTask);
    return;
  }
  const play = event.target.closest('[data-play-task]');
  if (play) {
    playTask(play.dataset.playTask);
  }
}

function handleSheetClick(event) {
  if (event.target.closest('[data-close-sheet]')) {
    closeSheet();
    return;
  }
  if (event.target.closest('[data-score-play]')) {
    toggleScorePlayback();
    return;
  }
  const scoreStep = event.target.closest('[data-score-step]');
  if (scoreStep) {
    stepScore(Number(scoreStep.dataset.scoreStep));
    return;
  }
  if (event.target.closest('[data-score-zoom]')) {
    toggleScoreZoom();
    return;
  }
  const practiceNote = event.target.closest('[data-practice-note]');
  if (practiceNote) {
    const note = getNote(practiceNote.dataset.practiceNote, 5);
    if (note && !state.muted) {
      playMidi(midiOf(note, 5, 'D'), { duration: 1.15, velocity: 0.5 });
      practiceNote.classList.add('is-playing');
      window.setTimeout(() => practiceNote.classList.remove('is-playing'), 420);
    }
    return;
  }
  if (event.target.closest('[data-play-practice]')) {
    playSheetPractice();
    return;
  }
  const complete = event.target.closest('[data-complete-lesson]');
  if (complete) {
    toggleLessonComplete(Number(complete.dataset.completeLesson));
    return;
  }
  const next = event.target.closest('[data-next-lesson]');
  if (next) {
    const previousFocus = sheetState.lastFocus;
    closeSheet({ restoreFocus: false });
    openLesson(Number(next.dataset.nextLesson), { returnFocus: previousFocus });
    return;
  }
  const fingering = event.target.closest('[data-open-fingering]');
  if (fingering) {
    const label = fingering.dataset.fingeringNote;
    closeSheet({ restoreFocus: false });
    setView('fingering');
    state.system = 5;
    if (label && getNote(label, 5)) state.selected = label;
    renderFingering();
  }
}

function handleQuizClick(event) {
  const option = event.target.closest('[data-option]');
  if (option) {
    answerQuestion(Number(option.dataset.option));
    return;
  }
  const listen = event.target.closest('[data-listen-midi]');
  if (listen) {
    playMidi(Number(listen.dataset.listenMidi), { duration: 1.5, velocity: 0.5 });
    return;
  }
  if (event.target.closest('#quitQuiz')) {
    quitQuiz();
    return;
  }
  if (event.target.closest('#nextQuestion')) {
    nextQuestion();
  }
}

function toggleSound() {
  state.muted = !state.muted;
  writeJSON(STORAGE.sound, state.muted);
  if (state.muted) { stopSequence(); stopScorePlayback(); }
  stopScorePlayback();
  updateSoundButton();
  showToast(state.muted ? '已静音' : '已开启示范声音');
}

function init() {
  document.addEventListener('click', handleGlobalClick);
  $('#sheetRoot').addEventListener('click', handleSheetClick);
  $('#quizPlay').addEventListener('click', handleQuizClick);

  $('#soundToggle').addEventListener('click', toggleSound);

  $('#quizMode').addEventListener('click', event => {
    const button = event.target.closest('[data-mode]');
    if (button) setQuizMode(button.dataset.mode);
  });
  $('#quizLevel').addEventListener('click', event => {
    const button = event.target.closest('[data-level]');
    if (button) setQuizLevel(button.dataset.level);
  });
  $('#topicGrid').addEventListener('click', event => {
    const button = event.target.closest('[data-topic]');
    if (button && !button.disabled) toggleTopic(button.dataset.topic);
  });
  $('#startQuizBtn').addEventListener('click', startQuiz);

  $('#notationToggle').addEventListener('click', event => {
    const button = event.target.closest('[data-notation]');
    if (!button) return;
    state.notation = button.dataset.notation;
    renderFingering();
  });
  $('#systemPills').addEventListener('click', event => {
    const button = event.target.closest('[data-system]');
    if (button) setSystem(button.dataset.system);
  });
  $('#keyGrid').addEventListener('click', event => {
    const button = event.target.closest('[data-key]');
    if (!button) return;
    state.key = button.dataset.key;
    renderFingering();
  });
  $('#noteGroups').addEventListener('click', event => {
    const button = event.target.closest('[data-note]');
    if (button) selectNote(button.dataset.note);
  });
  $('#playNoteBtn').addEventListener('click', () => {
    const note = currentNote();
    playMidi(midiOf(note), { duration: 1.8, velocity: 0.55 });
    flashDizi(1800);
  });
  $('#playScaleBtn').addEventListener('click', playScale);
  $('#fingeringDetailBtn').addEventListener('click', openFingeringInfo);
  $('#elecTube').addEventListener('click', event => {
    const hole = event.target.closest('[data-hole]');
    if (hole) toggleElecHole(Number(hole.dataset.hole));
  });
  $('#elecBlow').addEventListener('click', () => playElecNote(true));
  $('#elecScale').addEventListener('click', playElecScale);
  $('#elecOctave').addEventListener('click', () => cycleElecReg(1));

  $('#scoreGrid').addEventListener('click', event => {
    const card = event.target.closest('[data-score-index]');
    if (card) openScore(Number(card.dataset.scoreIndex), { returnFocus: card });
  });
  $('#scoreFilters').addEventListener('click', event => {
    const button = event.target.closest('[data-score-filter]');
    if (!button) return;
    scoreFilter = button.dataset.scoreFilter;
    renderScores();
  });
  document.addEventListener('change', event => {
    if (!event.target.matches('[data-score-key-mode]')) return;
    stopScorePlayback();
    scoreKeyMode = event.target.value === 'practice' ? 'practice' : 'original';
    const status = $('[data-score-status]', $('#sheetRoot'));
    if (status) status.textContent = scoreStatusLabel();
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-retry-quiz]')) {
      startQuiz();
      return;
    }
    if (event.target.closest('[data-go-learn]')) {
      resetQuizUI();
      setView('learn');
      return;
    }
    if (event.target.closest('[data-go-fingering]')) {
      resetQuizUI();
      setView('fingering');
    }
  });

  document.addEventListener('keydown', event => {
    if (state.view !== 'quiz' || !quiz.active || !$('#sheetRoot').hidden) return;
    if (event.target.closest('input, textarea, select')) return;
    if (['1', '2', '3', '4'].includes(event.key) && !quiz.answered) {
      const index = Number(event.key) - 1;
      const options = $$('#quizPlay .option');
      if (options[index]) {
        event.preventDefault();
        answerQuestion(index);
      }
    } else if (event.key === 'Enter' && quiz.answered) {
      const next = $('#nextQuestion');
      if (next && !next.hidden) {
        event.preventDefault();
        nextQuestion();
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (state.view !== 'fingering' || !$('#sheetRoot').hidden) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target.closest('input, textarea, select')) return;
    if (event.key >= '1' && event.key <= '6') {
      event.preventDefault();
      toggleElecHole(Number(event.key));
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      if (!event.repeat) playElecNote(true);
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      cycleElecReg(event.key === 'ArrowUp' ? 1 : -1);
    }
  });

  window.addEventListener('hashchange', () => {
    const view = location.hash.replace('#', '');
    if (VIEWS.includes(view) && view !== state.view) setView(view, { hash: false });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopSequence(); stopScorePlayback(); }
  });

  const initial = location.hash.replace('#', '');
  setView(VIEWS.includes(initial) ? initial : 'learn', { hash: false });
  renderDaily();
  renderCourse();
  renderScores();
  updateHero();
  renderQuizStats();
  renderTopics();
  renderFingering();
  renderElecDizi();
  loadDiziSamples();
  updateSoundButton();
}

init();
