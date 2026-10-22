# Lung transplantation POD3 mortality calculator

Calculator v0.1.6 · Model parameters 2026-10-19

Research calculator: https://sangsangqiu.github.io/ltx-pod3-risk/

Interface version and model parameter version are tracked separately. The parameter file retains version 0.1.2 and modelDate 2026-10-19; this interface update does not change coefficients, transformations or risk cutoffs.

Predicted risks for 90 days, 1 year and 2 years are averages of 10 imputation-specific model probabilities. All 24 inputs are required. Risk groups use full-precision development-cohort cutoffs (low: p ≤ lower; intermediate: lower < p ≤ upper; high: p > upper).

Developed in 2016–2022 recipients and temporally validated in 2023–2024 recipients at one center. For research use. Further validation and assessment of recalibration are needed.

Deployment: keep index.html and its accompanying assets at the repository root. Remove the obsolete LTx_POD3_GitHub上传文件_v0.1.2 folder from the repository to avoid serving a second copy.
