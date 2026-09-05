# ChargeGuard AI

> **AI-Powered Merchant Chargeback Risk Manager & Evidence Organization Platform**

---

## 1. Overview

**ChargeGuard AI** is a defense-only AI risk management system designed to identify potentially chargeback-prone payment transactions in real time and help online merchants proactively assemble and organize supporting dispute documentation.

By evaluating transaction telemetry, customer history, payment authentication signals, and velocity patterns before and after settlement, ChargeGuard AI computes a calibrated chargeback probability and provides explainable risk scoring, actionable risk tiers, and organized evidence defense packets.

> ⚠️ **Important Synthetic Data Disclaimer**  
> The current demonstration and evaluation utilize a **SYNTHETIC dataset** generated for demonstration and research purposes. The data, model weights, and performance metrics reported here are **NOT representative of Razorpay production performance** or live transaction environments.

---

## 2. Problem Statement

Payment fraud and unwarranted chargebacks represent an escalating operational loss for digital merchants. When a dispute is filed:
1. **Financial Loss**: Merchants forfeit the transaction amount along with non-refundable acquirer/gateway dispute fees.
2. **Operational Overhead**: Manually collating delivery receipts, 3-D Secure authentication logs, invoices, and customer communications within strict representation windows is time-consuming and error-prone.
3. **False-Positive Friction**: Overly aggressive blocking mechanisms decline legitimate cardholders, causing customer attrition, cart abandonment, and brand damage.

Merchants require an intelligent, explainable defensive solution that flags potentially high-risk transactions early, recommends balanced operational steps (APPROVE, FLAG_FOR_REVIEW, STEP_UP_AUTH, BLOCK), and automatically structures legitimate fulfillment and authentication evidence without fabricating records or creating customer friction.

---

## 3. Solution

ChargeGuard AI tackles the chargeback lifecycle through a coordinated pipeline:

- **Transaction Data Collection**: Captures 11 core transaction, behavioral, and verification signals upon checkout or review.
- **ML-Based Risk Prediction**: Executes inference against a machine learning model (`HistGradientBoostingClassifier`) hosted via a FastAPI service.
- **Chargeback Probability**: Produces a continuous probability estimate ($p \in [0, 1]$) representing the likelihood of dispute or friendly fraud.
- **Configurable Decision Threshold**: Applies an operationally calibrated decision threshold (set to **0.20** for demonstration) to prioritize risk recall.
- **Risk Classification**: Maps probabilities into actionable tiers: **LOW**, **MEDIUM**, **HIGH**, and **CRITICAL** with an intuitive 0–100 Risk Score.
- **Recommended Action**: Provides instant operational guidance:
  - `APPROVE` — Low dispute probability, seamless processing.
  - `FLAG_FOR_REVIEW` — Borderline velocity or mismatch signals, merchant manual review suggested.
  - `STEP_UP_AUTH` — High risk with weak authentication; enforce biometric/3DS challenge.
  - `BLOCK` — High risk with heavy historical chargebacks or velocity spikes.
- **Transaction History**: Automatically records analyzed transactions into an in-memory / local transaction ledger with instant status filtering, search, and CSV export.
- **Evidence Management**: Generates merchant dispute evidence packages, scoring document completeness, calculating defense strength, and formatting formal rebuttal letters for legitimate fulfillment verification.

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
Risk Score (0–100) / Risk Level (LOW, MEDIUM, HIGH, CRITICAL)
  │
  ▼
Recommended Action (APPROVE, FLAG_FOR_REVIEW, STEP_UP_AUTH, BLOCK)
  │
  ▼
Transaction Ledger (State & Local Storage)
  │
  ▼
Dashboard / Evidence Center
```

### Demonstration vs. Production Architecture Notice

- **Demonstration Setup**: The current demo backend runs on a **Google Colab** GPU/CPU runtime and is exposed via a secure **ngrok tunnel** (`https://clinic-dictate-dolphin.ngrok-free.dev`) serving the FastAPI `/predict` and `/health` endpoints. A local Express proxy (`/api/ml/*`) provides fallback handling and CORS normalization.
- **Production Deployment**: In a production environment, this Colab/ngrok setup would be replaced by a containerized microservice deployed on a persistent, autoscaling cloud service (e.g., Google Cloud Run, AWS ECS/EKS, or Kubernetes) behind an enterprise API gateway with mTLS, rate limiting, and dedicated VPC peering to payment gateways.

---

## 5. Machine Learning Model

### Model Specification

- **Algorithm**: `HistGradientBoostingClassifier` (scikit-learn)
- **Dataset**: Synthetic merchant transaction dataset
- **Total Transactions**: 20,000 synthetic records
- **Training Set**: 16,000 records (80%)
- **Held-Out Test Set**: 4,000 records (20%)
- **Number of Features**: 11 features
- **Decision Threshold**: **0.20**

### 11 Model Features

| # | Feature Name | Description & Data Type |
|---|---|---|
| 1 | `transaction_amount` | Numeric transaction value in INR (₹) |
| 2 | `account_age_days` | Age of customer account in days (maturity signal) |
| 3 | `previous_orders` | Number of successful lifetime purchases |
| 4 | `previous_chargebacks` | Number of previous chargebacks on customer record |
| 5 | `failed_payment_attempts` | Unsuccessful attempts in the last 24 hours |
| 6 | `transactions_last_24h` | Transaction velocity count over previous 24 hours |
| 7 | `device_changed` | Binary flag (`0` = familiar device, `1` = new/unrecognized device) |
| 8 | `billing_shipping_mismatch` | Binary flag (`0` = matched addresses, `1` = mismatched addresses) |
| 9 | `three_ds_friction` | Binary flag (`0` = frictionless/authenticated, `1` = challenge/attempted only) |
| 10 | `customer_age_years` | Customer age in years |
| 11 | `order_value` | Total cart order value in INR (₹) |

> **Integration Note**: In the current frontend integration, `order_value = transaction_amount`.

---

## 6. Held-Out Test Results

The model was evaluated against the 4,000-sample held-out synthetic test set at the selected **0.20** decision threshold.

### SYNTHETIC DEMONSTRATION RESULTS

| Evaluation Metric | Value |
|---|---|
| **Accuracy** | **64.42%** |
| **Precision** | **38.98%** |
| **Recall** | **70.33%** |
| **F1 Score** | **50.16%** |
| **ROC-AUC** | **73.43%** |
| **False Positive Rate (FPR)** | **37.59%** |

> ⚠️ **Notice**: These metrics are **SYNTHETIC DEMONSTRATION RESULTS** obtained on synthetic test distributions. They do **NOT** describe or represent Razorpay production performance or live merchant portfolios.

---

## 7. Threshold Selection

The default decision threshold of **0.20** was chosen based on an empirical evaluation of risk capture versus merchant review volume across threshold candidates:

| Threshold | Recall | Precision | F1 Score | False Positive Rate |
|:---:|:---:|:---:|:---:|:---:|
| **0.10** | 1.00 | 0.26 | 0.41 | 0.98 |
| **0.15** | 0.84 | 0.33 | 0.48 | 0.57 |
| **0.20** | **0.70** | **0.39** | **0.50** | **0.38** |
| **0.25** | 0.61 | 0.44 | 0.51 | 0.27 |
| **0.30** | 0.53 | 0.48 | 0.50 | 0.19 |

### Why Threshold 0.20 Was Selected

In payment chargeback defense, the operational cost of missing a fraudulent chargeback (direct loss of product value, chargeback fees, and card scheme violation penalties) significantly outweighs the cost of secondary review or step-up authentication. 

- At **0.10**, recall is 100%, but the 98% false-positive rate overwhelms operations and frustrates customers.
- At **0.30**, precision improves to 48%, but recall drops to 53%, missing nearly half of potential chargebacks.
- **Threshold 0.20 represents the optimal operational trade-off**: it captures **70.33%** of all chargebacks while controlling false positives to 37.59% and delivering a balanced F1 score of **50.16%**.

---

## 8. False Positive Cost

To quantify the economic impact of decision boundaries during review, the demonstration incorporates a merchant friction model:

### Demonstration Cost Parameters
- **False-Positive Cost Assumption**: **₹150** per false positive (estimated cost of manual agent review, SMS/challenge dispatch, and minor checkout friction).

### Impact at Threshold 0.20 (4,000 Test Transactions)
- **False Positives**: 1,121 transactions
- **Estimated Friction Cost**: $1,121 \times ₹150 =$ **₹168,150**

> ⚠️ **Assumption Notice**: The ₹150 friction cost is an **ASSUMPTION used strictly for demonstration modeling** and does not reflect actual Razorpay pricing, merchant fee schedules, or dispute arbitration costs.

---

## 9. Feature Groups & Risk Rationale

The 11 model features map directly into 8 critical fraud detection dimensions:

1. **Transaction Amount & Order Value**: High-ticket purchases represent disproportionate loss exposure and attract card-not-present (CNP) fraudsters testing stolen limits.
2. **Account Maturity (`account_age_days`)**: New accounts (< 7 days) exhibit exponentially higher chargeback rates compared to tenured profiles.
3. **Customer History (`previous_orders`, `previous_chargebacks`)**: Prior chargebacks are the single strongest indicator of friendly-fraud recidivism; frequent successful orders indicate verified buyer trust.
4. **Payment Authentication (`three_ds_friction`)**: Successful 3-D Secure authentication shifts chargeback liability to the issuing bank; attempted-only or non-3DS transactions leave merchants unprotected.
5. **Failed Attempts (`failed_payment_attempts`)**: Multiple payment failures within 24 hours signal card testing, brute-force CVV guessing, or bank declines.
6. **Transaction Velocity (`transactions_last_24h`)**: Sudden bursts of transactions indicate account takeover (ATO) or rapid extraction of stolen card credentials.
7. **Device Changes (`device_changed`)**: Unrecognized browser fingerprint, OS, or hardware switches signal session hijacking or proxy farming.
8. **Billing / Shipping Mismatch (`billing_shipping_mismatch`)**: Differing delivery destinations frequently indicate goods redirection to unauthorized drop points.

---

## 10. Application Features

ChargeGuard AI delivers a comprehensive, interactive merchant risk console:

- **Real-Time Transaction Analysis**: Interactive form allowing merchants to input transaction attributes, evaluate risk on demand, or test scenarios.
- **Live ML Prediction**: Direct network integration with the FastAPI `/predict` endpoint, displaying server latency, model name, and inference status.
- **Risk Score (0–100)**: Visual speedometer gauge indicating overall transaction risk severity.
- **Chargeback Probability**: Exact model probability output displayed alongside decision thresholds.
- **Risk Level**: Clear visual badges (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Recommended Action**: Deterministic decision recommendation (`APPROVE`, `FLAG_FOR_REVIEW`, `STEP_UP_AUTH`, `BLOCK`).
- **Risk Factors**: Transparent breakdown of top contributing risk features with severity indicators.
- **AI Risk Explanation**: Context-aware natural language summary explaining the reasoning behind the risk score.
- **Transaction Ledger**: Searchable, filterable real-time ledger supporting client-side pagination, status filters, and instant evidence access.
- **Dynamic Dashboard**: High-level risk distribution charts, chargeback rates, fraud velocity trends, and volume aggregations.
- **Evidence Center**: Structured dispute package manager tracking 6 core representation document types.
- **Evidence Strength**: Quantitative completeness score (0–100%) and defense strength rating (WEAK, MODERATE, STRONG, COMPLETE).
- **CSV Export**: One-click download of transaction records and risk metrics for acquirer audits.
- **Model Performance Dashboard**: Real-time visualization of model test results, confusion matrices, ROC-AUC, threshold curves, and economic cost trade-offs.

---

## 11. Defense-Only Design

ChargeGuard AI adheres to strict **ethical defense principles** for merchant dispute defense:

- **Legitimate Documentation Only**: Focuses exclusively on organizing authentic merchant records (receipts, delivery confirmations, 3DS logs, and buyer correspondence).
- **Zero Fabrication**: **DOES NOT** fabricate, synthesize, alter, or falsify customer records, delivery signatures, or bank authorization codes.
- **Zero Impersonation**: **DOES NOT** impersonate customers or cardholders under any circumstances.
- **No Deceptive Automation**: **DOES NOT** generate fraudulent or misleading dispute representations.
- **Security Compliance**: Respects payment gateway integrity and **DOES NOT** bypass payment network protections or card scheme rules.

---

## 12. Synthetic Data Disclaimer

> ### ⚠️ Mandatory Notice
> **This project uses synthetic transaction data for demonstration and evaluation. The reported model metrics do not represent Razorpay production performance.**
>
> All customer names, card details, transaction amounts, and dispute histories in this repository and application are synthetically generated for educational, hackathon, and prototype evaluation.

---

## 13. Demo Flow

Follow this step-by-step workflow during evaluation:

1. **Navigate to "Real-Time ML Analysis"** in the navigation bar.
2. **Enter a Transaction**: Fill in the transaction amount, customer details, velocity counters, and authentication flags (or utilize standard test inputs).
3. **Click "Analyze Transaction"**: Trigger the live ML evaluation.
4. **Data Transmission**: The React frontend packages the **11 features** into a JSON payload and sends it via HTTP POST to the FastAPI `/predict` endpoint.
5. **ML Calculation**: `HistGradientBoostingClassifier` calculates the continuous chargeback probability.
6. **Apply Decision Threshold**: The system applies the **0.20 threshold** to categorize the transaction.
7. **Display Risk Results**: The UI renders the **Risk Score (0–100)**, **Chargeback Probability**, **Risk Level**, **Recommended Action**, and **Risk Factors**.
8. **Ledger Update**: The analyzed transaction is immediately prepended to the **Transaction Ledger**.
9. **Dashboard & Metrics Refresh**: The **Dashboard** metrics, charts, and exposure calculations dynamically update to reflect the new record.
10. **Evidence Case Review**: Click **"Open Evidence Case"** to inspect document completeness, verify carrier tracking, and generate a formal merchant rebuttal package in the **Evidence Center**.

---

## 14. Example Demonstration Transactions

The following scenarios illustrate how varying risk factors influence the model's prediction:

| Scenario | Sample Inputs | Expected Outcome* |
|---|---|---|
| **Scenario A: Low Risk** | Amount: ₹1,500, Account Age: 180 days, Past Orders: 12, Chargebacks: 0, Failed Attempts: 0, Velocity: 1, Device: Unchanged, Address: Match, 3DS: Authenticated | **LOW RISK / APPROVE**<br>Low chargeback probability (< 0.10), high customer trust score. |
| **Scenario B: Medium Risk** | Amount: ₹18,500, Account Age: 25 days, Past Orders: 2, Chargebacks: 0, Failed Attempts: 1, Velocity: 3, Device: Changed, Address: Match, 3DS: Authenticated | **MEDIUM RISK / FLAG_FOR_REVIEW**<br>Moderate probability (~0.15–0.25), borderline review recommended due to velocity. |
| **Scenario C: High Risk** | Amount: ₹85,000, Account Age: 1 day, Past Orders: 0, Chargebacks: 1, Failed Attempts: 4, Velocity: 7, Device: Changed, Address: Mismatch, 3DS: Attempted Only | **HIGH / CRITICAL / BLOCK**<br>High chargeback probability (> 0.45), multiple compounding risk signals. |

*\*Note: Exact probabilities and risk scores are dynamically computed at runtime by the trained `HistGradientBoostingClassifier`.*

---

## 15. Technology Stack

- **Frontend Application**:
  - React 19
  - TypeScript
  - Vite 6
  - Tailwind CSS 4
  - Lucide React (Icons)
  - Recharts (Data Visualizations & Performance Curves)
  - Motion (Interface Transitions)
- **AI / Prototype Platform**:
  - Google AI Studio
  - Antigravity Developer Platform
- **Backend & Inference Engine**:
  - Python 3.10+
  - FastAPI (REST API framework)
  - scikit-learn (`HistGradientBoostingClassifier`)
  - pandas & NumPy
  - joblib (Model serialization)
- **Deployment & Networking (Demo)**:
  - Google Colab (Demonstration ML host runtime)
  - ngrok (Secure reverse tunneling to Colab)
  - Express.js / Node.js (Vite server & proxy fallback layer)
  - GitHub (Version control & repository hosting)

---

## 16. Future Improvements

Key enhancements planned for production readiness:

- **Real Merchant Data Training**: Retrain and benchmark using production card-not-present (CNP) and UPI merchant transaction datasets.
- **Persistent Cloud Deployment**: Migrate the ML model from Colab/ngrok to managed, autoscaling infrastructure (e.g., Google Cloud Run, AWS SageMaker, or Kubernetes).
- **Real-Time Model Monitoring & Drift Detection**: Continuous tracking of feature drift, concept drift, and performance decay across payment rails.
- **Probability Calibration**: Implement Isotonic Regression or Platt Scaling to improve raw probability calibration across rare dispute classes.
- **Model Explainability**: Integrate SHAP (SHapley Additive exPlanations) or TreeSHAP for exact local feature attribution per transaction.
- **Cost-Sensitive Threshold Optimization**: Dynamically adjust thresholds based on individual merchant operating margins, product categories, and interchange costs.
- **Enterprise Authentication & RBAC**: Implement OAuth 2.0 / JWT role-based access controls for risk analysts, compliance officers, and finance admins.
- **Production Relational Database**: Transition from browser localStorage to PostgreSQL / Cloud Spanner with full audit logging and encryption at rest.
- **Automated Carrier & Acquirer Integrations**: Direct API webhooks into shipping carriers (FedEx, Blue Dart, Delhivery) and payment gateway dispute APIs for zero-touch representation.

---

## 17. Disclaimer

This software is developed strictly as a **hackathon demonstration and proof-of-concept prototype**. It is **NOT** a certified production payment-risk system, credit scoring service, or banking software. 

The software is provided "as is", without warranty of any kind, express or implied. Users and evaluators should not rely on this application for financial, legal, or commercial transaction processing without independent evaluation, security audits, and production infrastructure.

---

**ChargeGuard AI Team** — Built for evaluators and modern digital commerce defense.
