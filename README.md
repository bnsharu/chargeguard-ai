# ChargeGuard AI

> **AI-Powered Merchant Chargeback Risk Manager & Evidence Organization Platform**

---

## 1. Overview

**ChargeGuard AI** is a defense-only AI risk manager designed to identify potentially chargeback-prone payment transactions in real time and help online merchants organize supporting evidence.

`HistGradientBoostingClassifier` produces a chargeback-risk probability estimate based on transaction telemetry, customer history, payment authentication signals, and velocity patterns. ChargeGuard AI helps merchants organize legitimate transaction and dispute-supporting records for review.

> ⚠️ **Important Synthetic Data Disclaimer**  
> **This project uses synthetic transaction data for demonstration and evaluation. The reported model metrics do not represent Razorpay production performance.**

---

## 2. Problem Statement

Digital merchants face ongoing challenges in identifying potentially risky transactions and reducing chargeback-related loss while considering false-positive customer friction:

1. **Chargeback Losses**: Unidentified fraudulent transactions lead to lost merchandise and dispute processing costs.
2. **Review Overhead**: Collation of delivery confirmations, payment authentication logs, invoices, and customer correspondence for dispute review can be manual and fragmented.
3. **False-Positive Friction**: Overly aggressive blocking mechanisms decline legitimate cardholders, causing customer drop-off and cart abandonment.

Merchants need an explainable, defensive review solution that flags potentially high-risk transactions early, recommends operational next steps, and helps organize legitimate transaction documentation without creating unnecessary customer friction.

---

## 3. Solution

ChargeGuard AI provides a structured workflow for merchant transaction review:

- **Transaction Data Collection**: Collects 11 core transaction, customer, and verification fields.
- **ML-Based Risk Prediction**: Sends feature inputs to a FastAPI inference service running a trained `HistGradientBoostingClassifier`.
- **Chargeback Probability**: Produces a chargeback-risk probability estimate between 0.00 and 1.00.
- **Configurable Decision Threshold**: Applies a decision threshold (set to **0.20** for demonstration) to evaluate potential chargeback risk.
- **Risk Classification**: Classifies transactions into 3 implemented risk levels:
  - **LOW**
  - **MEDIUM**
  - **HIGH**
- **Recommended Action**: Provides the 3 implemented operational actions:
  - **LOW** → `APPROVE`
  - **MEDIUM** → `MONITOR`
  - **HIGH** → `MANUAL_VERIFICATION`
- **Transaction History**: Automatically records analyzed transactions in a searchable ledger with filtering and CSV export.
- **Evidence Management**: Helps merchants organize and summarize evidence across **7 evidence categories** based strictly on records that are actually available or explicitly marked by the merchant. The system does not automatically create evidence that does not exist.

---

## 4. Architecture

The end-to-end data flow operates as follows:

```
Transaction Input
  │
  ▼
ChargeGuard AI Frontend (React + TypeScript)
  │
  ▼  HTTP POST /predict  (or proxy via Express server.ts)
FastAPI ML API
  │
  ▼
HistGradientBoostingClassifier (scikit-learn)
  │
  ▼
Chargeback Probability (0.00 – 1.00)
  │
  ▼
Threshold 0.20 Evaluation
  │
  ▼
Risk Score / Risk Level (LOW, MEDIUM, HIGH)
  │
  ▼
Recommended Action (APPROVE, MONITOR, MANUAL_VERIFICATION)
  │
  ▼
Transaction Ledger (State & Local Storage)
  │
  ▼
Dashboard / Evidence Center
```

### Demonstration vs. Production Architecture Notice

- **Demonstration Setup**: The current development and demonstration backend runs via **Google Colab** and is temporarily exposed through an **ngrok** tunnel to serve the FastAPI `/health` and `/predict` endpoints. The ngrok URL is a temporary demonstration tunnel and is not a permanent production endpoint.
- **Production Deployment**: A production deployment would use a persistent, secure cloud service (such as containerized cloud microservices) behind an API gateway with authentication, rate limiting, and secure VPC routing.

---

## 5. Machine Learning Model

### Model Specification

- **Algorithm**: `HistGradientBoostingClassifier` (scikit-learn)
- **Dataset**: Synthetic
- **Total Transactions**: 20,000 synthetic records
- **Training Set**: 16,000 records (80%)
- **Held-Out Test Set**: 4,000 records (20%)
- **Number of Features**: 11 features
- **Decision Threshold**: 0.20

`HistGradientBoostingClassifier` produces a chargeback-risk probability estimate based on the input features.

### 11 Model Features

| # | Feature Name | Description |
|---|---|---|
| 1 | `transaction_amount` | Numeric transaction value in INR (₹) |
| 2 | `account_age_days` | Age of customer account in days |
| 3 | `previous_orders` | Number of previous completed orders |
| 4 | `previous_chargebacks` | Number of prior recorded chargebacks |
| 5 | `failed_payment_attempts` | Failed payment attempts in the last 24 hours |
| 6 | `transactions_last_24h` | Transaction count in the last 24 hours |
| 7 | `device_changed` | Binary indicator (0 = unchanged device, 1 = changed device) |
| 8 | `billing_shipping_mismatch` | Binary indicator (0 = matching addresses, 1 = mismatch) |
| 9 | `three_ds_friction` | Binary indicator (0 = frictionless/authenticated, 1 = challenge or attempted) |
| 10 | `customer_age_years` | Customer age in years |
| 11 | `order_value` | Order value in INR (₹) |

> **Integration Note**: `order_value = transaction_amount` in the current frontend integration.

---

## 6. Held-Out Test Results

The model was evaluated on the 4,000 held-out synthetic test records at threshold 0.20:

### SYNTHETIC DEMONSTRATION RESULTS

| Metric | Value |
|---|---|
| **Accuracy** | **64.42%** |
| **Precision** | **38.98%** |
| **Recall** | **70.33%** |
| **F1 Score** | **50.16%** |
| **ROC-AUC** | **73.43%** |
| **False Positive Rate** | **37.59%** |

> ⚠️ **Notice**: These metrics are **SYNTHETIC DEMONSTRATION RESULTS** evaluated on a synthetic dataset and are **NOT representative of Razorpay production performance**.

---

## 7. Threshold Selection

The decision threshold was set to **0.20** based on the synthetic held-out test evaluation:

| Threshold | Recall | Precision | F1 Score | False Positive Rate |
|:---:|:---:|:---:|:---:|:---:|
| **0.10** | 1.00 | 0.26 | 0.41 | 0.98 |
| **0.15** | 0.84 | 0.33 | 0.48 | 0.57 |
| **0.20** | **0.70** | **0.39** | **0.50** | **0.38** |
| **0.25** | 0.61 | 0.44 | 0.51 | 0.27 |
| **0.30** | 0.53 | 0.48 | 0.50 | 0.19 |

### Threshold Trade-off

The decision threshold represents an operational trade-off between catching more potentially risky transactions (recall) and reducing false-positive customer review volume (precision and false positive rate). Threshold 0.20 was selected for demonstration purposes to demonstrate balanced recall and review volume on the synthetic dataset, and is not claimed to be an industry-standard or universally optimal threshold.

---

## 8. False Positive Cost

To illustrate review volume trade-offs, the demonstration includes a cost estimation assumption:

- **Demonstration assumption: ₹150 per false positive** (illustrative estimate representing potential manual review time and customer verification steps).

### Demonstration Test Impact (4,000 Test Records at Threshold 0.20)
- **False Positives**: 1,121
- **Estimated demonstration friction cost**: **₹168,150** ($1,121 \times ₹150$)

> ⚠️ **Notice**: This friction cost is an **illustrative assumption** used for demonstration and is **NOT actual Razorpay pricing or cost**.

---

## 9. Features

The 11 input features correspond to common risk analysis dimensions:

- **Transaction Amount & Order Value**: Reflects the monetary exposure associated with the order.
- **Account Maturity (`account_age_days`)**: Tracks account age in days to distinguish newly created accounts from older accounts.
- **Customer History (`previous_orders`, `previous_chargebacks`)**: Incorporates the customer's prior order count and historical chargeback frequency.
- **Payment Authentication (`three_ds_friction`)**: Indicates whether 3-D Secure authentication encountered challenge steps or was attempted only.
- **Failed Attempts (`failed_payment_attempts`)**: Monitors multiple failed payment attempts within a 24-hour window.
- **Transaction Velocity (`transactions_last_24h`)**: Measures rapid purchasing activity by counting orders placed in the last 24 hours.
- **Device Changes (`device_changed`)**: Indicates whether a change in device or browser session was detected.
- **Billing / Shipping Mismatch (`billing_shipping_mismatch`)**: Checks whether the billing address differs from the shipping destination.

---

## 10. Application Features

ChargeGuard AI provides the following user-facing features:

- **Real-Time Transaction Analysis**: Interactive form to input transaction parameters and trigger evaluation.
- **Live ML Prediction**: Connects to the live FastAPI `/predict` endpoint to compute inference in real time.
- **Risk Score**: Displays a 0–100 risk score based on the model's probability estimate.
- **Chargeback Probability**: Displays the estimated chargeback risk probability from the model.
- **Risk Level**: Categorizes transactions into implemented tiers: **LOW**, **MEDIUM**, and **HIGH**.
- **Recommended Action**: Provides operational guidance matching the current implementation:
  - LOW → `APPROVE`
  - MEDIUM → `MONITOR`
  - HIGH → `MANUAL_VERIFICATION`
- **Risk Factors**: Identifies key contributing risk parameters.
- **AI Risk Explanation**: Generates an explanatory summary of the identified risk signals.
- **Transaction Ledger**: Searchable table of analyzed transactions with status filters.
- **Dynamic Dashboard**: Visualizations of risk distributions, transaction volumes, and status breakdowns.
- **Evidence Center**: Helps organize and review dispute documentation across **7 evidence categories**:
  1. Transaction Information
  2. Customer Verification
  3. Payment Authentication
  4. Order Information
  5. Fulfillment Information
  6. Customer Communication
  7. Merchant Information
- **Evidence Strength**: Calculates evidence completeness percentage based only on items marked as available.
- **CSV Export**: Allows downloading transaction ledger records to a CSV file.
- **Model Performance Dashboard**: Presents the synthetic held-out test evaluation metrics, confusion matrix, ROC-AUC, and threshold trade-off table.

---

## 11. Defense-Only Design

ChargeGuard AI is built exclusively as a defensive risk management and evidence organization tool.

**What ChargeGuard AI does:**
- Detects potentially risky transactions using machine learning.
- Supports merchant review and decision-making.
- Organizes legitimate merchant records and documentation.
- Summarizes available transaction evidence for dispute review.

**What ChargeGuard AI does NOT do:**
- It does **NOT** fabricate evidence.
- It does **NOT** alter evidence or create fake documents.
- It does **NOT** impersonate customers.
- It does **NOT** deceive banks or card issuers.
- It does **NOT** automate deceptive chargeback responses.
- It does **NOT** bypass payment network protections.

---

## 12. Synthetic Data Disclaimer

> ### ⚠️ Mandatory Notice
> **This project uses synthetic transaction data for demonstration and evaluation. The reported model metrics do not represent Razorpay production performance.**
>
> All customer profiles, transaction records, and dispute data in this application are synthetic records generated for demonstration purposes.

---

## 13. Demo Flow

The live demonstration follows this exact end-to-end workflow:

1. **Transaction Input**: User enters transaction parameters in the Real-Time Analysis view.
2. **Live FastAPI `/predict`**: Frontend sends the 11 features via HTTP POST.
3. **HistGradientBoostingClassifier**: Model processes features and generates inference output.
4. **Chargeback Probability**: Raw model probability is returned.
5. **Threshold 0.20**: Evaluated against the decision threshold.
6. **Risk Score**: Scaled to an intuitive 0–100 score.
7. **Risk Level**: Assigned as LOW, MEDIUM, or HIGH.
8. **Recommended Action**: Selected as APPROVE, MONITOR, or MANUAL_VERIFICATION.
9. **Risk Factors**: Contributing attributes are highlighted.
10. **AI Risk Explanation**: Contextual narrative explains the risk factors.
11. **Transaction Ledger**: Analyzed record is added to the ledger.
12. **Dashboard**: Charts and summary statistics update automatically.
13. **Evidence Center**: Transaction documentation can be reviewed across the 7 evidence categories.

---

## 14. Example Demonstration Transactions

The following scenarios illustrate typical input combinations and expected directions:

| Scenario | Sample Inputs | Expected Direction* |
|---|---|---|
| **Scenario A: Low Risk** | Amount: ₹1,500, Account Age: 180 days, Past Orders: 12, Chargebacks: 0, Failed Attempts: 0, Velocity: 1, Device: Unchanged, Address: Match, 3DS: Authenticated | **LOW / APPROVE**<br>Low chargeback probability estimate. |
| **Scenario B: Medium Risk** | Amount: ₹18,500, Account Age: 25 days, Past Orders: 2, Chargebacks: 0, Failed Attempts: 1, Velocity: 3, Device: Changed, Address: Match, 3DS: Authenticated | **MEDIUM / MONITOR**<br>Moderate probability estimate; secondary monitoring indicated. |
| **Scenario C: High Risk** | Amount: ₹85,000, Account Age: 1 day, Past Orders: 0, Chargebacks: 1, Failed Attempts: 4, Velocity: 7, Device: Changed, Address: Mismatch, 3DS: Attempted Only | **HIGH / MANUAL_VERIFICATION**<br>Elevated probability estimate; manual verification recommended. |

*\*Note: Exact probabilities, risk scores, and actions are dynamically computed at runtime by the trained machine learning model.*

---

## 15. Technology Stack

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **FastAPI**
- **Python**
- **scikit-learn** (`HistGradientBoostingClassifier`)
- **pandas**
- **NumPy**
- **joblib**
- **Google AI Studio**
- **Google Colab** (demonstration backend host)
- **ngrok** (demonstration API tunnel)
- **GitHub**

---

## 16. Future Improvements

Future enhancements planned for production readiness include:

- **Real Merchant Data**: Training and evaluation on real card-not-present merchant transaction datasets.
- **Persistent Backend Deployment**: Deploying containerized services on cloud infrastructure.
- **Model Monitoring**: Continuous tracking of data and prediction distributions over time.
- **Probability Calibration**: Evaluating calibration techniques such as Isotonic Regression or Platt Scaling.
- **Explainability**: Implementing feature attribution frameworks such as SHAP.
- **Threshold Optimization**: Incorporating empirical business costs and merchant margins to tune operating thresholds.
- **Authentication & Authorization**: Implementing role-based access control (RBAC).
- **Secure API Deployment**: Enforcing mTLS, API keys, and rate limiting.
- **Production Database**: Storing records in a persistent relational database.
- **Evidence Integrations**: Direct API connections to shipping carriers and gateway dispute endpoints.

---

## 17. Disclaimer

This project is a **hackathon demonstration and proof-of-concept system**, not a production payment-risk or commercial banking platform. It is provided for evaluation and research purposes only.

---

**ChargeGuard AI** — Hackathon Demonstration Project.
