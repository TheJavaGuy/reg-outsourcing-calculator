const tree = {
  id: 'start',
  step: 'STEP 1 / 7',
  question: 'Does this arrangement involve ICT services — software, cloud, data centres, networks, or IT-based processing?',
  hint: 'YES: SaaS, cloud hosting, data centres, IT security, payment processing, core banking systems.<br>NO: physical security, cleaning, consulting without system access, facility management.',
  answers: [
    {
      label: 'YES — ICT service',
      type: 'yes',
      next: 'q2_ict'
    },
    {
      label: 'NO — Not ICT',
      type: 'no',
      next: 'q_non_ict'
    }
  ]
};

const nodes = {
  'q_reassessment_materiality_change': {
    step: 'REASSESSMENT — STEP 1',
    question: 'Has the materiality of this arrangement changed since the last assessment?',
    hint: '<strong>YES:</strong> scope expanded significantly, new functions added, dependency increased, provider became CTPP.<br><strong>NO:</strong> arrangement unchanged, same scope, same provider, same risk profile.',
    answers: [
      { label: 'YES — materiality or scope has changed', type: 'yes', next: 'start', action: 'setMaterialityTrue' },
      { label: 'NO — same classification as before', type: 'no', next: 'start', action: 'setMaterialityFalse' }
    ]
  },

  'q2_ict': {
    step: 'STEP 2 / 8',
    question: 'Is this service cloud-based (hosted by a third-party cloud provider)?',
    hint: 'YES: public cloud (AWS, Azure, GCP), SaaS on third-party infrastructure, hybrid with external components.<br>NO: on-premise servers, institution-owned data centres.',
    answers: [
      { label: 'YES — cloud-based service', type: 'yes', next: 'q3_cloud_cif' },
      { label: 'NO — not cloud (on-premise or institution-owned)', type: 'no', next: 'q2b_ict' }
    ]
  },

  'q2b_ict': {
    step: 'STEP 3 / 8',
    question: 'Is this an activity the institution would normally perform itself, or would otherwise have to perform?',
    hint: 'YES: core banking, risk systems, AML, payments, IT development, helpdesk.<br>NO: electricity, telecom infrastructure, commodity software licences.',
    answers: [
      { label: 'YES — the institution would do this itself', type: 'yes', next: 'q3_material' },
      { label: 'NO — the institution would not do this itself', type: 'no', next: 'q_professional_services_check' }
    ]
  },

  'q3_cloud_cif': {
    step: 'STEP 3 / 8',
    question: 'Does this cloud service support a critical or important function of the institution (CIF)?',
    hint: 'YES: core banking, payment processing, AML/KYC, fraud detection, risk management, regulatory reporting, trading platforms, customer-facing digital channels, identity and authentication systems, credit decisioning.<br>NO: internal HR tools, payroll, non-critical analytics, internal communication platforms, facility management systems.',
    answers: [
      { label: 'YES — supports a CIF', type: 'yes', next: 'q3b_cloud_ctpp', action: 'setCIF' },
      { label: 'NO — does not support a CIF', type: 'no', next: 'q_cloud_noncif_material' }
    ]
  },

  'q3b_cloud_ctpp': {
    step: 'STEP 4 / 8',
    question: 'Is the provider within the same group (intra-group)?',
    hint: '<strong>Intra-group:</strong> provider belongs to the same group/holding. Full MaRisk/DORA requirements still apply — contract, SLA, audit rights, exit plan required.',
    answers: [
      { label: 'YES — intra-group cloud provider', type: 'yes', next: 'q3d_cloud_intra_sub', action: 'setIntragroup' },
      { label: 'NO — external cloud provider', type: 'no', next: 'q3e_cloud_ctpp_check' }
    ]
  },

  'q3d_cloud_intra_sub': {
    step: 'STEP 5 / 8',
    question: 'Does the intra-group cloud provider use external sub-vendors for the critical function?',
    hint: 'YES: group IT entity running on AWS/Azure.<br>NO: all infrastructure owned and operated within the group.',
    answers: [
      { label: 'YES — sub-outsourcing to external cloud/vendor', type: 'yes', next: 'result_ig2', action: 'setSubOutsourcing' },
      { label: 'NO — pure intra-group cloud', type: 'no', next: 'result_ig2' }
    ]
  },

  'q3e_cloud_ctpp_check': {
    step: 'STEP 5 / 8',
    question: 'Is this a major hyperscaler or potential CTPP (Critical Third-Party Provider)?',
    hint: 'YES: AWS, Microsoft Azure, Google Cloud, Oracle Cloud, IBM Cloud, Salesforce.<br>NO: specialised regional or sector-specific cloud vendors.',
    answers: [
      { label: 'YES / POSSIBLY — major cloud or mega provider', type: 'yes', next: 'result_class4', action: 'setCTPP' },
      { label: 'NO — specialised cloud vendor', type: 'no', next: 'result_class4' }
    ]
  },

  'q_cloud_noncif_material': {
    step: 'STEP 4 / 8',
    question: 'Could an outage or failure of this service materially impact the institution\'s operations or reputation?',
    hint: 'YES: institution depends on it, hard to replace quickly, significant business impact. NO: easily replaceable, limited business impact, low dependency.',
    answers: [
      { label: 'YES — material impact possible', type: 'yes', next: 'q3c_cloud_noncif' },
      { label: 'NO — limited impact, low dependency', type: 'no', next: 'q_cloud_noncif_nonmaterial_data' }
    ]
  },

  'q_cloud_noncif_nonmaterial_data': {
    step: 'STEP 5 / 8',
    question: 'Does the service have access to customer data, employee data, or the institution\'s production systems?',
    hint: 'YES: vendor portal with customer data, SaaS tool processing employee records, read access to production systems. NO: standalone tool, no data access, no system integration.',
    answers: [
      { label: 'YES — data or system access exists', type: 'yes', next: 'result_class3' },
      { label: 'NO — no data access or system integration', type: 'no', next: 'result_class3' }
    ]
  },

  'q3c_cloud_noncif': {
    step: 'STEP 4 / 8',
    question: 'Does the cloud service have access to customer data or production systems?',
    hint: 'YES: customer records, transaction data, production databases.<br>NO: anonymised analytics, internal test data.',
    answers: [
      { label: 'YES — access to customer/production data', type: 'yes', next: 'result_class5' },
      { label: 'NO — internal/non-sensitive data only', type: 'no', next: 'result_class5' }
    ]
  },

  'q3_material': {
    step: 'STEP 4 / 8',
    question: 'Could an outage or poor quality of this service materially harm the institution?',
    hint: 'YES: disruption to client services, regulatory breach risk, financial loss, reputational damage.<br>NO: internal tool, easily replaced, no client or regulatory impact.',
    answers: [
      { label: 'YES — material impact', type: 'yes', next: 'q4_critical_func' },
      { label: 'NO — limited impact', type: 'no', next: 'q_non_material' }
    ]
  },

  'q4_critical_func': {
    step: 'STEP 4 / 7',
    question: 'Does the service support a critical or important function of the institution (CIF)?',
    hint: 'YES: core banking, payment processing, AML/KYC, fraud detection, risk management, regulatory reporting, trading platforms, customer-facing digital channels, identity and authentication systems, credit decisioning.<br>NO: internal HR tools, payroll, non-critical analytics, internal communication platforms, facility management systems.',
    answers: [
      { label: 'YES — supports a CIF', type: 'yes', next: 'q5_intragroup', action: 'setCIF' },
      { label: 'NO — does not support a CIF', type: 'no', next: 'q_ict_only_material' }
    ]
  },

  'q5_intragroup': {
    step: 'STEP 5 / 7',
    question: 'Is the provider within the same group (intra-group)?',
    hint: '<strong>Intra-group:</strong> provider belongs to the same group/holding. Full MaRisk/DORA requirements still apply — contract, SLA, audit rights, exit plan required.',
    answers: [
      { label: 'YES — intra-group provider', type: 'yes', next: 'q6_ctpp_intra', action: 'setIntragroup' },
      { label: 'NO — external provider', type: 'no', next: 'q_non_eu_provider' }
    ]
  },

  'q_non_eu_provider': {
    step: 'STEP 6 / 8',
    question: 'Is the provider located outside the EU?',
    hint: 'YES: provider headquartered or operating outside the EU/EEA.<br>NO: provider located within the EU/EEA.',
    answers: [
      { label: 'YES — provider is outside the EU', type: 'yes', action: 'setNonEuProvider', next: 'q6_ctpp' },
      { label: 'NO — provider is within the EU', type: 'no', next: 'q6_ctpp' }
    ]
  },

  'q6_ctpp': {
    step: 'STEP 6 / 7',
    question: 'Is the provider a potential CTPP (Critical Third-Party Provider)?',
    hint: 'YES: AWS, Microsoft Azure, Google Cloud, Oracle Cloud, IBM, Accenture.<br>NO: specialised providers not serving a systemic share of EU financial institutions.',
    answers: [
      { label: 'YES / POSSIBLY — major cloud or mega provider', type: 'yes', next: 'result_class4', action: 'setCTPP' },
      { label: 'NO — standard external vendor', type: 'no', next: 'result_class4' }
    ]
  },

  'q6_ctpp_intra': {
    step: 'STEP 6 / 7',
    question: 'Does the intra-group provider use external sub-vendors for the critical function?',
    hint: 'YES: intra-group entity subcontracts to an external vendor.<br>NO: all delivery stays within the group with no external dependencies.',
    answers: [
      { label: 'YES — sub-outsourcing to an external vendor exists', type: 'yes', next: 'result_ig2', action: 'setSubOutsourcing' },
      { label: 'NO — everything stays within the group', type: 'no', next: 'result_ig2' }
    ]
  },

  'q_ict_only_material': {
    step: 'STEP 5 / 7',
    question: 'Is this ICT service also outsourcing — would the institution normally perform this activity itself?',
    hint: 'YES: core banking, risk systems, payment processing — institution would do this itself.<br>NO: commodity software licence, infrastructure service, network provider — institution would not do this itself.',
    answers: [
      { label: 'YES — institution would do this itself', type: 'yes', next: 'q_ict_intragroup_noncif' },
      { label: 'NO — pure ICT service only', type: 'no', next: 'result_class3' }
    ]
  },

  'q_ict_intragroup_noncif': {
    step: 'STEP 6 / 7',
    question: 'Is the ICT provider within the same group (intra-group)?',
    hint: 'YES: provider belongs to the same group/holding.<br>NO: external provider.',
    answers: [
      { label: 'YES — intra-group provider', type: 'yes', next: 'result_ig3', action: 'setIntragroup' },
      { label: 'NO — external provider', type: 'no', next: 'result_class5' }
    ]
  },

  'q_non_ict': {
    step: 'STEP 2 / 4',
    question: 'Is this an activity the institution would normally perform itself, or would otherwise have to perform?',
    hint: 'YES: credit analysts, compliance, internal audit, back-office processing, call centre.<br>NO: cleaning, physical security, catering, transport.',
    answers: [
      { label: 'YES — the institution would do this itself', type: 'yes', next: 'q_non_ict_material' },
      { label: 'NO — the institution would not do this', type: 'no', next: 'q_professional_services_check' }
    ]
  },

  'q_professional_services_check': {
    step: 'STEP 3 / 5',
    question: 'Does the service involve access to the institution\'s systems, customer data, or delivery of a regulated function?',
    hint: 'YES: consultancy with system access, marketing agency with CRM access, hiring platform with employee data, interim compliance officer, outsourced internal audit.<br>NO: cleaning, catering, travel management, office supplies, pure strategy consultancy without system access.',
    answers: [
      { label: 'YES — system/data access or regulated function', type: 'yes', next: 'q_professional_services_regulated' },
      { label: 'NO — no access, no regulated function', type: 'no', next: 'result_external_procurement' }
    ]
  },

  'q_professional_services_regulated': {
    step: 'STEP 4 / 5',
    question: 'Does the service deliver or substitute a regulated function of the institution?',
    hint: 'YES: interim compliance officer, outsourced internal audit, outsourced risk management, outsourced AML function.<br>NO: marketing agency with CRM access, recruitment platform, travel tool with employee data, IT consultancy with read-only system access.',
    answers: [
      { label: 'YES — delivers a regulated function', type: 'yes', next: 'q_non_ict_material' },
      { label: 'NO — system access only, no regulated function', type: 'no', next: 'result_external_procurement_data' }
    ]
  },

  'q_non_ict_material': {
    step: 'STEP 3 / 4',
    question: 'Could an outage materially harm the institution?',
    hint: 'YES: service failure would disrupt client services, trigger regulatory breach, or cause financial loss.<br>NO: service can be replaced quickly with no material client or regulatory impact.',
    answers: [
      { label: 'YES — material impact', type: 'yes', next: 'q_non_ict_cif' },
      { label: 'NO — limited impact', type: 'no', next: 'q_non_ict_non_material_intragroup' }
    ]
  },

  'q_non_ict_cif': {
    step: 'STEP 4 / 6',
    question: 'Does the service support a critical or important function of the institution?',
    hint: 'YES: core banking, payment processing, AML/KYC, fraud detection, risk management, regulatory reporting, trading platforms, customer-facing digital channels, identity and authentication systems, credit decisioning.<br>NO: internal HR tools, payroll, non-critical analytics, internal communication platforms, facility management systems.',
    answers: [
      { label: 'YES — supports a critical or important function', type: 'yes', next: 'q_non_ict_cif_intragroup', action: 'setCIF' },
      { label: 'NO — does not support a CIF', type: 'no', next: 'q_non_ict_material_non_cif_intragroup' }
    ]
  },

  'q_non_ict_cif_intragroup': {
    step: 'STEP 5 / 6',
    question: 'Is the provider within the same group (intra-group)?',
    hint: '<strong>Intra-group:</strong> provider belongs to the same group/holding. Full MaRisk AT 9 and EBA GL obligations still apply.',
    answers: [
      { label: 'YES — intra-group provider', type: 'yes', next: 'q_non_ict_intragroup_sub', action: 'setIntragroup' },
      { label: 'NO — external provider', type: 'no', next: 'result_class1' }
    ]
  },

  'q_non_ict_intragroup_sub': {
    step: 'STEP 6 / 6',
    question: 'Does the intra-group provider use external sub-vendors for this function?',
    hint: 'YES: intra-group entity sub-contracts to an external firm.<br>NO: all delivery remains within the group.',
    answers: [
      { label: 'YES — sub-outsourcing to an external vendor exists', type: 'yes', next: 'result_ig1', action: 'setSubOutsourcing' },
      { label: 'NO — everything stays within the group', type: 'no', next: 'result_ig1' }
    ]
  },

  'q_non_ict_material_non_cif_intragroup': {
    step: 'STEP 5 / 6',
    question: 'Is the provider within the same group (intra-group)?',
    hint: '<strong>Intra-group:</strong> provider belongs to the same group/holding. MaRisk AT 9 obligations still apply.',
    answers: [
      { label: 'YES — intra-group provider', type: 'yes', next: 'q_non_ict_non_cif_intragroup_sub', action: 'setIntragroup' },
      { label: 'NO — external provider', type: 'no', next: 'result_class1' }
    ]
  },

  'q_non_ict_non_cif_intragroup_sub': {
    step: 'STEP 6 / 6',
    question: 'Does the intra-group provider use external sub-vendors for this function?',
    hint: 'YES: intra-group entity sub-contracts to an external firm.<br>NO: all delivery remains within the group.',
    answers: [
      { label: 'YES — sub-outsourcing to an external vendor exists', type: 'yes', next: 'result_ig1', action: 'setSubOutsourcing' },
      { label: 'NO — everything stays within the group', type: 'no', next: 'result_ig1' }
    ]
  },

  'q_non_ict_non_material_intragroup': {
    step: 'STEP 4 / 5',
    question: 'Is the provider within the same group (intra-group)?',
    hint: '<strong>Intra-group:</strong> provider belongs to the same group/holding. Document and periodically review even for non-material arrangements.',
    answers: [
      { label: 'YES — intra-group provider', type: 'yes', next: 'result_class2', action: 'setIntragroup' },
      { label: 'NO — external provider', type: 'no', next: 'result_class2' }
    ]
  },

  'q_non_material': {
    step: 'STEP 4 / 5',
    question: "Does the ICT service still have access to the institution's systems or data?",
    hint: 'YES: vendor has read/write access to institution systems or data.<br>NO: standalone service with no integration to institution infrastructure.',
    answers: [
      { label: 'YES — has access to systems/data', type: 'yes', next: 'result_class6' },
      { label: 'NO — no access', type: 'no', next: 'result_class6' }
    ]
  },

};

const results = {
  // ── CLASS 1 — MATERIAL OUTSOURCING, External (non-ICT) ──
  'result_class1': {
    bafin_required: true,
    title: 'MATERIAL OUTSOURCING — External',
    alert: { type: 'warning', text: 'Full MaRisk AT 9 and EBA GL requirements apply. DORA ICT-specific requirements do not apply to this arrangement. Institution-level DORA obligations (Art. 6, Art. 28) apply regardless.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Material outsourcing — full requirements' },
      { type: 'dora', label: 'DORA', value: 'DORA Art. 30 N/A — verify no ICT components exist' },
      { type: 'eba', label: 'EBA GL', value: '_dynamic_' }
    ],
    implications: [
      'Full MaRisk AT 9 contract requirements apply',
      'Unrestricted audit rights must be agreed in the contract',
      'Documented exit strategy required — tested and maintained',
      'Annual management report on this arrangement',
      'Concentration risk assessment required',
      'No DORA Register of Information entry required unless an ICT component exists',
      'Sub-outsourcing must be contractually controlled — vendor must notify the institution and obtain prior approval before engaging any sub-contractors'
    ],
    examples: ['Outsourced compliance function', 'External internal audit', 'Outsourced credit analysis', 'Outsourced back-office operations', 'Administrative support functions'],
    bafin: '<strong>Notification required.</strong> Material outsourcing is subject to BaFin notification under § 25b KWG / MaRisk AT 9.2. Two notifications required: intention to outsource (before contract signing) and go-live notification.',
    timeline: 'Expect 6–10 weeks. Full MaRisk process applies. BaFin notification required before go-live.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Full MaRisk AT 9 compliant contract drafted', tag: 'legal' },
      { text: 'Audit rights agreed in contract', tag: 'legal' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Exit plan documented and approved', tag: 'risk' },
      { text: 'Annual management report process set up', tag: 'risk' },
      { text: 'EBA GL CIF requirements confirmed (non-ICT path)', tag: 'legal' },
      { text: 'Outsourcing Officer sign-off obtained', tag: 'risk' },
      { text: 'BaFin intention notification prepared', tag: 'risk' },
      { text: 'BaFin go-live notification prepared', tag: 'risk' },
      { text: 'Sub-outsourcing clause included in contract — vendor approval required before any sub-contractor engagement', tag: 'legal' }
    ]
  },

  // ── CLASS 2 — NON-MATERIAL OUTSOURCING, non-Critical Function ──
  'result_class2': {
    bafin_required: false,
    title: 'NON-MATERIAL OUTSOURCING — non-Critical Function',
    alert: { type: 'warning', text: 'Standard MaRisk requirements apply. No BaFin notification required. Periodic classification review required.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Non-material outsourcing — standard requirements' },
      { type: 'dora', label: 'DORA', value: 'Institution-level only' },
      { type: 'eba', label: 'EBA GL', value: 'Standard due diligence' }
    ],
    implications: [
      'Standard MaRisk outsourcing contract required',
      'EBA GL standard due diligence required',
      'Sub-outsourcing must be contractually controlled',
      'Periodic classification review required — if materiality changes, re-classify immediately',
      'Institution-level DORA obligations apply regardless'
    ],
    examples: ['Minor outsourced processes', 'Non-critical administrative services', 'Specialised non-critical services', 'Minor intra-group services'],
    bafin: 'No BaFin notification required. Non-material outsourcing is below the notification threshold under § 25b KWG. Document in internal outsourcing register. If classification changes to material, notification obligation arises immediately.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Periodic classification review scheduled', tag: 'risk' }
    ]
  },

  // ── CLASS 3 — ICT SERVICE, External (pure ICT, not outsourcing) ──
  'result_class3': {
    bafin_required: false,
    title: 'ICT SERVICE — External (not outsourcing)',
    alert: { type: 'warning', text: 'This is an ICT service that is not outsourcing under MaRisk AT 9. DORA requirements apply. No BaFin notification required.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'N/A — not outsourcing' },
      { type: 'dora', label: 'DORA', value: 'Art. 28(3), Art. 30(2), Art. 28(2), Art. 28(4)' },
      { type: 'eba', label: 'EBA GL', value: 'N/A — not outsourcing' }
    ],
    implications: [
      'DORA Art. 30(2) minimum contractual clauses required',
      'Register of Information entry required — Art. 28(3)',
      'Substitutability assessment required — Art. 28(2)',
      'Concentration risk assessment required — Art. 28(4)',
      'Sub-outsourcing must be contractually controlled',
      'Periodic classification review required — if arrangement grows into outsourcing, re-classify immediately'
    ],
    examples: ['Standalone ICT tool', 'Infrastructure service without outsourcing component', 'Network service provider', 'Low-risk SaaS tools', 'Non-critical analytics platforms'],
    bafin: 'No BaFin notification required. This arrangement is not outsourcing under MaRisk AT 9 / § 25b KWG. DORA Register of Information entry is required. If the arrangement is later classified as outsourcing, notification obligation arises immediately.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Register of Information entry prepared', tag: 'ops' },
      { text: 'Periodic classification review scheduled', tag: 'risk' }
    ]
  },

  // ── CLASS 4 — MATERIAL OUTSOURCING, ICT, Critical Function ──
  'result_class4': {
    bafin_required: true,
    title: 'MATERIAL OUTSOURCING — ICT, Critical Function',
    alert: { type: 'warning', text: 'Full MaRisk AT 9, EBA GL CIF, and DORA requirements apply. Highest regulatory burden.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Material outsourcing — full requirements' },
      { type: 'dora', label: 'DORA', value: 'Art. 28(3), Art. 30(2), Art. 30(3), Art. 28(2), Art. 28(4), Art. 28(8)' },
      { type: 'eba', label: 'EBA GL', value: 'Critical/Important Function — enhanced requirements' }
    ],
    implications: [
      'Full MaRisk AT 9 contractual requirements apply',
      'DORA Art. 30(2) and Art. 30(3) enhanced clauses required',
      'Register of Information entry required — Art. 28(3)',
      'Exit strategy required — MaRisk AT 9.6 and DORA Art. 28(8)',
      'EBA GL full CIF due diligence required',
      'Sub-outsourcing must be contractually controlled',
      'Concentration risk assessment required',
      'Annual management report required'
    ],
    examples: ['Core banking system', 'Payment processing platform', 'AML/KYC platform', 'Cloud infrastructure for critical operations'],
    bafin: 'Notification required. Material outsourcing of an ICT service supporting a critical function must be notified to BaFin before go-live under § 25b KWG / MaRisk AT 9.2. Two notifications required — intention before contract signing and go-live when operational.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Exit plan documented and approved', tag: 'risk' },
      { text: 'Register of Information entry prepared', tag: 'ops' },
      { text: 'Annual management report process set up', tag: 'risk' },
      { text: 'Outsourcing Officer sign-off obtained', tag: 'risk' },
      { text: 'BaFin intention notification prepared', tag: 'risk' },
      { text: 'BaFin go-live notification prepared', tag: 'risk' }
    ]
  },

  // ── CLASS 5 — MATERIAL OUTSOURCING, ICT, non-Critical Function ──
  'result_class5': {
    bafin_required: true,
    title: 'MATERIAL OUTSOURCING — ICT, non-Critical Function',
    alert: { type: 'warning', text: 'Full MaRisk AT 9 requirements apply. DORA Art. 30(2) applies. Art. 30(3) enhanced clauses do not apply — non-CIF arrangement.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Material outsourcing — full requirements' },
      { type: 'dora', label: 'DORA', value: 'Art. 28(3), Art. 30(2), Art. 28(2), Art. 28(4)' },
      { type: 'eba', label: 'EBA GL', value: 'Standard due diligence' }
    ],
    implications: [
      'Full MaRisk AT 9 contractual requirements apply',
      'DORA Art. 30(2) minimum clauses required',
      'Register of Information entry required — Art. 28(3)',
      'EBA GL standard due diligence required',
      'Sub-outsourcing must be contractually controlled',
      'Concentration risk assessment required',
      'Annual management report required'
    ],
    examples: ['Internal IT helpdesk', 'Non-critical SaaS platform', 'Document management system', 'Secondary data processing'],
    bafin: 'Notification required. Material outsourcing must be notified to BaFin before go-live under § 25b KWG / MaRisk AT 9.2. Two notifications required — intention before contract signing and go-live when operational.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Exit plan documented and approved', tag: 'risk' },
      { text: 'Register of Information entry prepared', tag: 'ops' },
      { text: 'Annual management report process set up', tag: 'risk' },
      { text: 'Outsourcing Officer sign-off obtained', tag: 'risk' },
      { text: 'BaFin intention notification prepared', tag: 'risk' },
      { text: 'BaFin go-live notification prepared', tag: 'risk' }
    ]
  },

  // ── CLASS 6 — NON-MATERIAL ICT SERVICE, non-Critical Function (Outsourcing + ICT) ──
  'result_class6': {
    bafin_required: false,
    title: 'NON-MATERIAL ICT SERVICE — non-Critical Function (Outsourcing + ICT)',
    alert: { type: 'warning', text: 'DORA Art. 30(2) applies regardless of materiality. Register of Information entry required. Periodic classification review required.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Standard requirements' },
      { type: 'dora', label: 'DORA', value: 'Art. 28(3), 30(2), 28(2), 28(4)' },
      { type: 'eba', label: 'EBA GL', value: 'Standard due diligence' }
    ],
    implications: [
      'Standard MaRisk outsourcing contract required',
      'DORA Art. 30(2) minimum clauses required',
      'Register of Information entry required — Art. 28(3)',
      'Sub-outsourcing must be contractually controlled',
      'Concentration risk assessment required',
      'Periodic classification review required'
    ],
    examples: ['Non-critical SaaS with outsourcing component', 'Low-risk IT service the institution would do itself'],
    bafin: 'No BaFin notification required. Non-material ICT service is below the notification threshold. DORA Register of Information entry is required regardless of materiality. If classification changes, notification obligation arises immediately.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Register of Information entry prepared', tag: 'ops' },
      { text: 'Periodic classification review scheduled', tag: 'risk' }
    ]
  },

  // ── IG1 — INTRA-GROUP, Material Outsourcing (non-ICT) ──
  'result_ig1': {
    bafin_required: true,
    title: 'INTRA-GROUP — Material Outsourcing',
    alert: { type: 'warning', text: 'Intra-group status does not exempt this arrangement from MaRisk AT 9 requirements. DORA institution-level obligations apply regardless.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Material outsourcing intra-group — simplified due diligence permitted' },
      { type: 'dora', label: 'DORA', value: 'Institution-level only' },
      { type: 'eba', label: 'EBA GL', value: '_dynamic_' }
    ],
    implications: [
      'Full MaRisk AT 9 requirements apply — simplified due diligence permitted',
      'Intra-group SLA required in writing',
      'No exit plan required — MaRisk AT 9.6 intra-group exemption applies',
      'Sub-outsourcing must be contractually controlled',
      'Concentration risk assessment required',
      'Annual management report required'
    ],
    examples: ['Intra-group compliance function', 'Group internal audit', 'Intra-group credit analysis', 'Intra-group back-office operations', 'Group administrative support'],
    bafin: 'Notification required. Intra-group status does not exempt material outsourcing from BaFin notification under § 25b KWG / MaRisk AT 9.2. Two notifications required — intention before contract signing and go-live when operational.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Annual management report process set up', tag: 'risk' },
      { text: 'Outsourcing Officer sign-off obtained', tag: 'risk' },
      { text: 'BaFin intention notification prepared', tag: 'risk' },
      { text: 'BaFin go-live notification prepared', tag: 'risk' }
    ]
  },

  // ── IG2 — INTRA-GROUP, Material Outsourcing, ICT, Critical Function ──
  'result_ig2': {
    bafin_required: true,
    title: 'INTRA-GROUP — MATERIAL OUTSOURCING, ICT, Critical Function',
    alert: { type: 'warning', text: 'Intra-group status does not exempt this arrangement from DORA requirements. DORA Art. 28(8) exit strategy is required regardless of MaRisk intra-group exemption.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Material outsourcing intra-group — simplified due diligence permitted' },
      { type: 'dora', label: 'DORA', value: 'Art. 28(3), Art. 30(2), Art. 30(3), Art. 28(2), Art. 28(4), Art. 28(8)' },
      { type: 'eba', label: 'EBA GL', value: 'Critical function intra-group — simplified due diligence permitted' }
    ],
    implications: [
      'Full MaRisk AT 9 requirements apply — simplified due diligence permitted',
      'Intra-group SLA required in writing',
      'DORA Art. 30(2) and Art. 30(3) enhanced clauses apply',
      'Register of Information entry required — Art. 28(3)',
      'Exit strategy required under DORA Art. 28(8) — MaRisk intra-group exemption does not override DORA',
      'Sub-outsourcing must be contractually controlled',
      'Concentration risk assessment required',
      'Annual management report required'
    ],
    examples: ['Group IT shared services supporting critical function', 'Intra-group payment hub', 'Group core banking platform'],
    bafin: 'Notification required. Intra-group status does not exempt material outsourcing from BaFin notification under § 25b KWG / MaRisk AT 9.2. Two notifications required — intention before contract signing and go-live when operational.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Exit strategy documented — DORA Art. 28(8)', tag: 'risk' },
      { text: 'Register of Information entry prepared', tag: 'ops' },
      { text: 'Annual management report process set up', tag: 'risk' },
      { text: 'Outsourcing Officer sign-off obtained', tag: 'risk' },
      { text: 'BaFin intention notification prepared', tag: 'risk' },
      { text: 'BaFin go-live notification prepared', tag: 'risk' }
    ]
  },

  // ── IG3 — INTRA-GROUP, Material Outsourcing, ICT, non-Critical Function ──
  'result_ig3': {
    bafin_required: true,
    title: 'INTRA-GROUP — MATERIAL OUTSOURCING, ICT, non-Critical Function',
    alert: { type: 'warning', text: 'Intra-group status does not exempt this arrangement from DORA requirements. MaRisk intra-group exemption applies — no exit plan required.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Material outsourcing intra-group — simplified due diligence permitted' },
      { type: 'dora', label: 'DORA', value: 'Art. 28(3), Art. 30(2), Art. 28(2), Art. 28(4)' },
      { type: 'eba', label: 'EBA GL', value: 'Standard due diligence — simplified permitted for intra-group' }
    ],
    implications: [
      'Full MaRisk AT 9 requirements apply — simplified due diligence permitted',
      'Intra-group SLA required in writing',
      'DORA Art. 30(2) minimum clauses apply',
      'Register of Information entry required — Art. 28(3)',
      'No exit plan required — MaRisk intra-group exemption applies. DORA Art. 28(8) does not apply — non-CIF.',
      'Sub-outsourcing must be contractually controlled',
      'Concentration risk assessment required',
      'Annual management report required'
    ],
    examples: ['Group IT shared services non-critical', 'Intra-group infrastructure non-CIF', 'Group technology platform non-critical'],
    bafin: 'Notification required. Intra-group status does not exempt material outsourcing from BaFin notification under § 25b KWG / MaRisk AT 9.2. Two notifications required — intention before contract signing and go-live when operational.',
    checklist: [
      { text: 'Contract review and approval', tag: 'legal' },
      { text: 'Risk assessment completed and documented', tag: 'risk' },
      { text: 'Sub-contractors reviewed and approved', tag: 'risk' },
      { text: 'Concentration risk assessed', tag: 'risk' },
      { text: 'Register of Information entry prepared', tag: 'ops' },
      { text: 'Annual management report process set up', tag: 'risk' },
      { text: 'Outsourcing Officer sign-off obtained', tag: 'risk' },
      { text: 'BaFin intention notification prepared', tag: 'risk' },
      { text: 'BaFin go-live notification prepared', tag: 'risk' }
    ]
  },

  // ── EXIT NODE — External Procurement ──
  'result_external_procurement': {
    title: 'OTHER EXTERNAL PROCUREMENT — outside outsourcing scope',
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Other external procurement (not outsourcing)' },
      { type: 'dora', label: 'DORA', value: 'DORA Art. 30 N/A — verify no ICT components exist' },
      { type: 'eba', label: 'EBA GL', value: 'Outside outsourcing definition' }
    ],
    implications: [
      'No MaRisk outsourcing requirements',
      'Standard procurement/vendor management process',
      'GDPR obligations apply if personal data is involved',
      'Reassess classification if ICT components or system access are added',
      'Institution-level DORA obligations (Art. 6, Art. 28) apply to the institution regardless'
    ],
    examples: ['Physical security', 'Cleaning', 'Catering', 'Transport', 'Office lease'],
    bafin: '<strong>No BaFin notification required.</strong> This arrangement falls outside the outsourcing definition — no notification obligation under § 25b KWG. If scope changes to include ICT or system access, re-classify and reassess.',
    timeline: 'Standard procurement timeline applies — no regulatory outsourcing process required.',
    checklist: [
      { text: 'Confirm no ICT components or system access are involved', tag: 'ops' },
      { text: 'GDPR obligations checked — if personal data processed, DPA required', tag: 'legal' },
      { text: 'Note: if scope changes to include ICT or system access, re-classify immediately', tag: 'ops' }
    ]
  },

  // ── EXIT NODE — External Procurement with Data Access ──
  'result_external_procurement_data': {
    title: 'EXTERNAL PROCUREMENT — Data Protection Obligations Apply',
    alert: { type: 'warning', text: 'This arrangement is outside the outsourcing scope but involves access to systems, customer data, or personal data. GDPR and data protection obligations apply.' },
    classifications: [
      { type: 'marisk', label: 'MaRisk AT 9', value: 'Outside outsourcing scope' },
      { type: 'dora', label: 'DORA', value: 'DORA Art. 30 N/A — verify no ICT components exist' },
      { type: 'eba', label: 'EBA GL', value: 'Outside outsourcing definition' }
    ],
    implications: [
      'GDPR Data Processing Agreement required if personal data is processed',
      'Information security clauses proportional to the level of system or data access',
      'Access rights must be documented and limited to minimum necessary',
      'Periodic review of access scope recommended',
      'If an ICT component is identified, re-classify via the ICT path',
      'Institution-level DORA obligations (Art. 6, Art. 28) apply regardless'
    ],
    examples: ['Marketing agency with CRM access', 'Recruitment platform', 'Travel management tool', 'IT consultancy with read-only access'],
    bafin: '<strong>No BaFin notification required.</strong> This arrangement falls outside the outsourcing definition. However, GDPR and data protection obligations apply where personal data is processed. If a regulated function or ICT component is identified, re-classify immediately.',
    checklist: [
      { text: 'GDPR DPA drafted and signed if personal data is processed', tag: 'legal' },
      { text: 'Data access scope documented and limited to minimum necessary', tag: 'risk' },
      { text: 'Information security clauses included in contract', tag: 'legal' },
      { text: 'Periodic access review scheduled', tag: 'ops' },
      { text: 'Confirm no regulated function is being delivered — if yes re-classify immediately', tag: 'ops' },
      { text: 'Confirm no ICT component exists — if yes re-classify via ICT path', tag: 'ops' }
    ]
  }
};
