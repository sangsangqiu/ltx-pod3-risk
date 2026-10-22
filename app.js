(function () {
  'use strict';
  const model = globalThis.LTX_MODEL;
  const engine = globalThis.LTxEngine;
  let lang = 'zh', lastResult = null, demoActive = false;
  const fields = [
    ['age',1,'年龄','Age','岁','years'],['sex_male',1,'性别','Sex','',''],['BMI',1,'体质指数','Body mass index','kg/m²','kg/m²'],
    ['COPD',1,'慢性阻塞性肺疾病','Chronic obstructive pulmonary disease','',''],['ILD',1,'间质性肺疾病','Interstitial lung disease','',''],['PAH',1,'肺动脉高压','Pulmonary arterial hypertension','',''],
    ['bronchiectasis',1,'支气管扩张','Bronchiectasis','',''],['pneumoconiosis',1,'尘肺病','Pneumoconiosis','',''],['diabetes',1,'糖尿病','Diabetes','',''],
    ['cardiac_disease',1,'心脏疾病','Cardiac disease','',''],['CKD',1,'慢性肾脏病','Chronic kidney disease','',''],['preop_infection',1,'术前感染','Preoperative infection','',''],
    ['double_lung',2,'移植类型','Transplant type','',''],['ECMO_intraop',2,'术中ECMO','Intraoperative ECMO','',''],['cold_ischemia_h',2,'冷缺血时间','Cold ischemia time','小时','hours'],['op_duration_h',2,'手术时长','Operative duration','小时','hours'],['blood_loss_ml',2,'出血量','Blood loss','mL','mL'],
    ['PFR_72h_mean',3,'PaO₂/FiO₂均值','Mean PaO₂/FiO₂','mm Hg','mm Hg'],['pH_72h_mean',3,'动脉pH均值','Mean arterial pH','',''],['PCT_72h_mean',3,'降钙素原均值','Mean procalcitonin','ng/mL','ng/mL'],['CRP_72h_mean',3,'C反应蛋白均值','Mean C-reactive protein','mg/L','mg/L'],['Alb_72h_mean',3,'白蛋白均值','Mean albumin','g/L','g/L'],['PLT_72h_mean',3,'血小板计数均值','Mean platelet count','×10⁹/L','×10⁹/L'],['PGD_grade',3,'72小时PGD分级','PGD grade at 72 hours','','']
  ];
  const binary = new Set(['sex_male','COPD','ILD','PAH','bronchiectasis','pneumoconiosis','diabetes','cardiac_disease','CKD','preop_infection','double_lung','ECMO_intraop']);
  const text = {
    zh:{aboutLink:'模型说明',title:'肺移植术后死亡风险预测',intro:'适用于成人首次肺移植且术后72小时仍存活的受者。预测时点从移植日计算。',adultBadge:'成人首次肺移植',landmarkBadge:'术后72小时仍存活',completeBadge:'24项完整输入',demo:'载入演示数据',demoNote:'正在使用人工设定的演示数值；这不是患者记录。',calculate:'计算风险',reset:'清空',privacyShort:'计算在本浏览器完成，不上传输入内容。',resultEyebrow:'M3 模型估计',resultTitle:'预测结果',empty:'填写全部24项后，计算三个时间点的死亡风险。',stale:'输入已修改，请重新计算。',researchNote:'仅供研究使用，不作为治疗或资源分配决策的唯一依据。',beforeTitle:'使用前请确认',beforeText:'适用于成年首次肺移植、术后72小时仍存活的受者。所有结局时点均从移植日计算。',meansText:'术后化验输入0–72小时内均值；PGD输入72小时分级。',aboutTitle:'模型说明',aboutText:'模型基于2016–2022年单中心队列开发，并在2023–2024年受者中进行时间验证。三个结局分别使用10套插补模型的预测概率平均值。本版要求全部变量实测填写，不执行缺失值插补。',calibrationNote:'时间验证中模型存在平均风险高估，尚需进一步验证并评估再校准。标准化系数不代表因果效应。',methodDetails:'查看计算与分组方法',methodText:'出血量和降钙素原先做自然对数log(1+x)转换，再代入每套模型的原始尺度系数计算概率，最后取10个概率的平均值。风险组使用开发队列第20和80百分位的完整精度切点：预测风险≤下切点为低风险，>下切点且≤上切点为中风险，>上切点为高风险。各结局切点不同。',footer:'仅供研究使用 · 输入数据不上传或保存',stages:['术前信息','术中信息','术后前72小时'],stageSub:['12项 · 病史与一般情况','5项 · 手术记录','7项 · 六项化验均值与PGD分级'],yes:'是',no:'否',female:'女',male:'男',single:'单肺',double:'双肺',select:'请选择',completed:'已填写',of:'项',checkFields:'请检查以下标记项，再计算风险。',errors:{required:'请填写或选择此项。',binary:'请选择有效的二分类值。',pgd:'请选择0–3级。',adult:'本模型仅适用于18岁及以上受者。',positive:'请输入大于0的数值。',nonnegative:'请输入0或正数。',ph:'pH须在6.5–8.0范围内，请核对原始记录。'},softWarning:'数值较特殊，请核对单位及原始记录；系统不会自动更改。',outcomes:{'90d':'90天全因死亡风险','1y':'1年全因死亡风险','2y':'2年全因死亡风险'},groups:{low:'低风险组',intermediate:'中风险组',high:'高风险组'},groupNote:'分组依据开发队列风险切点，不代表临床干预阈值。结果尚未再校准。',cutTitle:['结局','低风险上限','高风险切点']},
    en:{aboutLink:'About the model',title:'Mortality risk after lung transplantation',intro:'For adult first-time lung transplant recipients alive at 72 hours. Outcome horizons are measured from transplantation.',adultBadge:'Adult first-time recipients',landmarkBadge:'Alive at 72 hours',completeBadge:'24 complete inputs',demo:'Load demonstration',demoNote:'Artificial demonstration values are in use. This is not a patient record.',calculate:'Calculate risk',reset:'Clear',privacyShort:'Calculations stay in this browser. Input values are not uploaded.',resultEyebrow:'M3 MODEL ESTIMATES',resultTitle:'Predicted risk',empty:'Complete all 24 inputs to estimate mortality at three time points.',stale:'Inputs have changed. Please calculate again.',researchNote:'For research use only. Do not use as the sole basis for treatment or resource-allocation decisions.',beforeTitle:'Before you calculate',beforeText:'For adult first-time recipients alive 72 hours after transplantation. All outcome horizons are measured from the transplant date.',meansText:'Enter mean laboratory values over 0–72 hours and PGD grade at 72 hours.',aboutTitle:'Model information',aboutText:'Developed in a single-center 2016–2022 cohort and temporally validated in 2023–2024 recipients. For each outcome, predictions average the probabilities from 10 imputation-specific models. This version requires complete measured inputs and performs no missing-value imputation.',calibrationNote:'Average mortality risk was overestimated in temporal validation. Further validation and assessment of recalibration are needed. Standardized coefficients do not represent causal effects.',methodDetails:'Calculation and risk groups',methodText:'Blood loss and procalcitonin are transformed using the natural logarithm log(1+x). Each original-scale model produces a probability; the 10 probabilities are then averaged. Risk groups use full-precision development-cohort cutoffs: risk at or below the lower cutoff is low; above the lower and at or below the upper cutoff is intermediate; above the upper cutoff is high. Cutoffs differ by outcome.',footer:'Research use only · Inputs are not uploaded or stored',stages:['Before transplantation','During surgery','First 72 postoperative hours'],stageSub:['12 inputs · Recipient characteristics','5 inputs · Operative records','7 inputs · Six laboratory means and PGD'],yes:'Yes',no:'No',female:'Female',male:'Male',single:'Single lung',double:'Double lung',select:'Select',completed:'Completed',of:'inputs',checkFields:'Please review the marked inputs before calculating.',errors:{required:'Complete this input.',binary:'Select a valid binary value.',pgd:'Select a grade from 0 to 3.',adult:'This model is for adults aged 18 years or older.',positive:'Enter a value greater than zero.',nonnegative:'Enter zero or a positive value.',ph:'Enter a pH from 6.5 to 8.0; check the source record.'},softWarning:'Unusual value: check units and the source record. Values are not automatically changed.',outcomes:{'90d':'90-day all-cause mortality','1y':'1-year all-cause mortality','2y':'2-year all-cause mortality'},groups:{low:'Low-risk group',intermediate:'Intermediate-risk group',high:'High-risk group'},groupNote:'Groups use development-cohort cutoffs, not clinical intervention thresholds. Estimates have not been recalibrated.',cutTitle:['Outcome','Low-risk upper limit','High-risk cutoff']}
  };
  const $ = id => document.getElementById(id);
  const t = () => text[lang];
  function readInput() {
    const v = {};
    for (const [name] of fields) {
      const el = binary.has(name) ? document.querySelector(`input[name="${name}"]:checked`) : $(name);
      v[name] = !el || el.value === '' ? null : Number(el.value);
    }
    return v;
  }
  function choices(name) {
    if (name === 'sex_male') return [t().female,t().male];
    if (name === 'double_lung') return [t().single,t().double];
    return [t().no,t().yes];
  }
  function fieldMarkup(f) {
    const [name,,,en] = f, label = lang === 'zh' ? f[2] : en, unit = lang === 'zh' ? f[4] : f[5];
    const title = `${label}${unit ? `<span class="unit">${unit}</span>` : ''}`;
    if (binary.has(name)) return `<fieldset class="field binary" id="field-${name}"><legend class="field-label">${title}</legend><div class="binary-options">${choices(name).map((s,i)=>`<label><input type="radio" name="${name}" value="${i}" required aria-describedby="error-${name}"><span>${s}</span></label>`).join('')}</div><span class="field-error" id="error-${name}"></span></fieldset>`;
    const control = name === 'PGD_grade' ? `<select class="select-input" id="${name}" name="${name}" required aria-describedby="error-${name}"><option value="">${t().select}</option>${[0,1,2,3].map(x=>`<option value="${x}">${x}</option>`).join('')}</select>` : `<input class="numeric-input" type="number" step="any" inputmode="decimal" id="${name}" name="${name}" required autocomplete="off" aria-describedby="error-${name} warning-${name}"><p class="soft-warning" id="warning-${name}" hidden></p>`;
    return `<div class="field" id="field-${name}"><label class="field-label" for="${name}">${title}</label>${control}<span class="field-error" id="error-${name}"></span></div>`;
  }
  function setValues(v) {
    for (const [name] of fields) {
      if (v[name] === null || v[name] === undefined) continue;
      if (binary.has(name)) { const el = document.querySelector(`input[name="${name}"][value="${v[name]}"]`); if(el) el.checked=true; }
      else $(name).value=v[name];
    }
    updateProgress();
  }
  function updateProgress() {
    const v = readInput(), n = model.variables.filter(k=>v[k]!==null && Number.isFinite(v[k])).length;
    $('progress').textContent = `${t().completed} ${n} / 24 ${t().of}`;
  }
  function renderErrors(errors) {
    for (const [name] of fields) {
      const msg = errors[name] ? t().errors[errors[name]] : '';
      $(`error-${name}`).textContent=msg;
      $(`field-${name}`).classList.toggle('has-error',Boolean(msg));
      document.querySelectorAll(`[name="${name}"]`).forEach(el=>el.setAttribute('aria-invalid',String(Boolean(msg))));
    }
    $('error-summary').hidden=!Object.keys(errors).length;
    $('error-summary').textContent=t().checkFields;
  }
  function warnings() {
    const v = readInput();
    const ranges={age:[18,100],BMI:[10,50],cold_ischemia_h:[0,24],op_duration_h:[0,24],blood_loss_ml:[0,30000],PFR_72h_mean:[0,800],pH_72h_mean:[6.8,7.8],PCT_72h_mean:[0,200],CRP_72h_mean:[0,500],Alb_72h_mean:[10,60],PLT_72h_mean:[0,1500]};
    for(const [name,[lo,hi]] of Object.entries(ranges)){
      const show=v[name]!==null && (v[name]<lo || v[name]>hi);
      $(`warning-${name}`).hidden=!show;$(`warning-${name}`).textContent=show?t().softWarning:'';
    }
  }
  function renderResults(result) {
    $('empty-result').hidden=Boolean(result);$('result-content').hidden=!result;
    if(!result)return;
    $('result-content').innerHTML=['90d','1y','2y'].map(oc=>{
      const r=result.results[oc];
      return `<div class="result-card outcome-${oc} ${oc==='1y'?'primary-result':''}"><p class="result-label">${t().outcomes[oc]}</p><div class="result-value">${(r.probability*100).toFixed(1)}<span>%</span></div><div><span class="risk-tag risk-${r.group}">${t().groups[r.group]}</span></div></div>`;
    }).join('')+`<p class="risk-explanation">${t().groupNote}</p>`;
  }
  function render() {
    const current=readInput();
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    document.title=lang==='zh'?'POD3 肺移植风险计算器':'LTx POD3 mortality calculator';
    document.querySelectorAll('[data-text]').forEach(el=>el.textContent=t()[el.dataset.text]);
    $('language').textContent=lang==='zh'?'English':'中文';
    $('stages').innerHTML=[1,2,3].map(n=>`<section class="stage" aria-labelledby="stage-${n}"><div class="stage-heading"><span class="stage-number">0${n}</span><div><h2 id="stage-${n}">${t().stages[n-1]}</h2><p class="stage-subtitle">${t().stageSub[n-1]}</p></div></div><div class="field-grid">${fields.filter(f=>f[1]===n).map(fieldMarkup).join('')}</div></section>`).join('');
    setValues(current);warnings();renderResults(lastResult);
    $('demo-note').hidden=!demoActive;
    $('version').textContent='v0.1.5';
    $('cutoff-table').innerHTML=`<table class="cutoff-table"><thead><tr>${t().cutTitle.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${['90d','1y','2y'].map(oc=>`<tr><td>${t().outcomes[oc]}</td><td>${(model.outcomes[oc].cuts[0]*100).toFixed(3)}%</td><td>${(model.outcomes[oc].cuts[1]*100).toFixed(3)}%</td></tr>`).join('')}</tbody></table>`;
  }
  $('calculator').addEventListener('input',()=>{
    updateProgress();warnings();
    if(lastResult)$('stale-result').hidden=false;
    if(!$('error-summary').hidden)renderErrors(engine.validate(readInput(),model));
  });
  $('calculator').addEventListener('submit',event=>{
    event.preventDefault();const result=engine.calculate(readInput(),model);
    if(!result.ok){renderErrors(result.errors);const name=Object.keys(result.errors)[0];document.querySelector(`[name="${name}"]`).focus();return;}
    renderErrors({});lastResult=result;renderResults(result);$('stale-result').hidden=true;
    if(matchMedia('(max-width: 760px)').matches)$('result-panel').scrollIntoView({behavior:'smooth',block:'start'});
  });
  $('language').addEventListener('click',()=>{lang=lang==='zh'?'en':'zh';render();});
  $('clear-form').addEventListener('click',()=>{lastResult=null;HTMLFormElement.prototype.reset.call($('calculator'));demoActive=false;$('demo-note').hidden=true;$('stale-result').hidden=true;renderErrors({});renderResults(null);warnings();updateProgress();});
  $('demo').addEventListener('click',()=>{
    const demo={age:55,sex_male:1,BMI:22,COPD:0,ILD:1,PAH:0,bronchiectasis:0,pneumoconiosis:0,diabetes:0,cardiac_disease:0,CKD:0,preop_infection:0,double_lung:1,ECMO_intraop:1,cold_ischemia_h:7,op_duration_h:6,blood_loss_ml:1000,PFR_72h_mean:300,pH_72h_mean:7.4,PCT_72h_mean:1,CRP_72h_mean:75,Alb_72h_mean:39,PLT_72h_mean:120,PGD_grade:0};
    setValues(demo);demoActive=true;$('demo-note').hidden=false;renderErrors({});warnings();
    if(lastResult)$('stale-result').hidden=false;
  });
  render();
})();
