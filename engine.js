/* The same prediction engine is used in the browser and numerical checks. */
(function (root) {
  'use strict';
  const binary = ['sex_male','COPD','ILD','PAH','bronchiectasis','pneumoconiosis','diabetes','cardiac_disease','CKD','preop_infection','double_lung','ECMO_intraop'];
  const positive = ['BMI','cold_ischemia_h','op_duration_h','PFR_72h_mean','pH_72h_mean','Alb_72h_mean'];
  const nonnegative = ['blood_loss_ml','PCT_72h_mean','CRP_72h_mean','PLT_72h_mean'];
  function validate(input, model) {
    const errors = {};
    for (const name of model.variables) {
      const v = input[name];
      if (v === '' || v === null || v === undefined || typeof v !== 'number' || !Number.isFinite(v)) errors[name] = 'required';
    }
    for (const name of binary) if (!(name in errors) && ![0,1].includes(input[name])) errors[name] = 'binary';
    if (!('PGD_grade' in errors) && ![0,1,2,3].includes(input.PGD_grade)) errors.PGD_grade = 'pgd';
    if (!('age' in errors) && input.age < 18) errors.age = 'adult';
    for (const name of positive) if (!(name in errors) && input[name] <= 0) errors[name] = 'positive';
    for (const name of nonnegative) if (!(name in errors) && input[name] < 0) errors[name] = 'nonnegative';
    if (!('pH_72h_mean' in errors) && (input.pH_72h_mean < 6.5 || input.pH_72h_mean > 8.0)) errors.pH_72h_mean = 'ph';
    return errors;
  }
  function sigmoid(x) { return x >= 0 ? 1/(1+Math.exp(-x)) : Math.exp(x)/(1+Math.exp(x)); }
  function group(probability, cuts) { return probability <= cuts[0] ? 'low' : probability <= cuts[1] ? 'intermediate' : 'high'; }
  function calculate(input, model) {
    const errors = validate(input, model);
    if (Object.keys(errors).length) return {ok:false, errors};
    const x = model.variables.map(name => ['blood_loss_ml','PCT_72h_mean'].includes(name) ? Math.log1p(input[name]) : input[name]);
    const results = {};
    for (const [outcome, spec] of Object.entries(model.outcomes)) {
      const individual = spec.models.map(fit => sigmoid(fit.coefficients.reduce((lp,b,j) => lp+b*x[j],fit.intercept)));
      const probability = individual.reduce((a,b) => a+b,0)/individual.length;
      results[outcome] = {probability,group:group(probability,spec.cuts)};
    }
    return {ok:true,results};
  }
  const api = {validate,calculate,group,sigmoid};
  root.LTxEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
