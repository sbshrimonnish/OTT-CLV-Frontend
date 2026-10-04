export const platformData = [
  { name: 'Netflix', clv: 28400, customers: 6200, fee: 649, lifetime: 28.4, churn: 9.8, watch: 42.5 },
  { name: 'Prime Video', clv: 22100, customers: 5100, fee: 299, lifetime: 24.2, churn: 13.5, watch: 35.8 },
  { name: 'JioHotstar', clv: 18900, customers: 3700, fee: 299, lifetime: 20.6, churn: 16.2, watch: 29.4 },
];

export const clvTrend = {
  months: ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26'],
  values: [18.2, 19.5, 21.0, 22.4, 23.8, 25.1, 26.5, 28.0, 29.4, 31.2, 33.5, 35.61],
};

export const mrrMonthly = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  values: [4.2, 4.4, 4.8, 4.9, 5.1, 5.3, 5.5, 5.8, 6.0, 6.2, 6.5, 6.8],
};

export const clvDistribution = {
  labels: ['<₹5k', '₹5–10k', '₹10–20k', '₹20–30k', '₹30–40k', '₹40–50k', '>₹50k'],
  values: [1250, 2400, 4100, 3800, 2100, 950, 400],
};

export const planCLV = {
  labels: ['Basic', 'Standard', 'Premium'],
  values: [14200, 22800, 34500],
};

export const churnByPlan = {
  labels: ['Basic', 'Standard', 'Premium'],
  values: [18.4, 11.2, 7.6],
};

export const models = [
  { name: 'Linear Regression', mae: 4250, rmse: 6180, r2: 0.685, status: 'Evaluated' },
  { name: 'Ridge Regression', mae: 4120, rmse: 5990, r2: 0.702, status: 'Evaluated' },
  { name: 'Decision Tree', mae: 3480, rmse: 5120, r2: 0.774, status: 'Evaluated' },
  { name: 'Random Forest', mae: 2980, rmse: 4350, r2: 0.825, status: 'Evaluated' },
  { name: 'Gradient Boosting Regressor', mae: 2840, rmse: 4120, r2: 0.842, status: 'Demo deployment' },
];

export const featureImportance = [
  { name: 'Subscription Plan Level', score: 94, top: true },
  { name: 'Monthly Watch Hours', score: 88, top: true },
  { name: 'Account Age (Months)', score: 81, top: true },
  { name: 'Active Login Days / Month', score: 72, top: false },
  { name: 'Concurrent Streams', score: 65, top: false },
  { name: 'Payment Method Type', score: 54, top: false },
  { name: 'Content Diversity Score', score: 48, top: false },
  { name: 'Support Ticket Count', score: 36, top: false },
  { name: 'Discount / Promo Usage', score: 29, top: false },
  { name: 'Primary Device Type', score: 22, top: false },
];

export const DATASET_STATS = {
  total: 15000,
  training: 12000,
  testing: 3000,
};

export const predictionHistory = [
  { date: '2026-10-01', customerId: 'OTT-10482', platform: 'Netflix', currentCLV: 18400, predictedCLV: 26500, future6m: 21200, future12m: 26500 },
  { date: '2026-10-01', customerId: 'OTT-10483', platform: 'Prime Video', currentCLV: 12200, predictedCLV: 18900, future6m: 15400, future12m: 18900 },
  { date: '2026-09-30', customerId: 'OTT-10484', platform: 'JioHotstar', currentCLV: 9800, predictedCLV: 14200, future6m: 11800, future12m: 14200 },
  { date: '2026-09-30', customerId: 'OTT-10485', platform: 'Netflix', currentCLV: 31000, predictedCLV: 42500, future6m: 36200, future12m: 42500 },
  { date: '2026-09-29', customerId: 'OTT-10486', platform: 'Prime Video', currentCLV: 24500, predictedCLV: 31800, future6m: 27900, future12m: 31800 },
  { date: '2026-09-28', customerId: 'OTT-10487', platform: 'JioHotstar', currentCLV: 15600, predictedCLV: 21400, future6m: 18200, future12m: 21400 },
  { date: '2026-09-28', customerId: 'OTT-10488', platform: 'Netflix', currentCLV: 22800, predictedCLV: 30200, future6m: 26100, future12m: 30200 },
  { date: '2026-09-27', customerId: 'OTT-10489', platform: 'Prime Video', currentCLV: 8900, predictedCLV: 13500, future6m: 11100, future12m: 13500 },
];
