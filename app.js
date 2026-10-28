// State
let history = [];
let currentNode = null;
let arrangementType = null; // 'new' or 'reassess'
let materialityChanged = true; // true/false — only for reassess path; defaults to true (BaFin shown unless explicitly no change)
let _ctppProvider = false;
let _subOutsourcing = false;
let _isIntragroup = false;
let _isCIF = false;
let nonEuProvider = false; // true if ICT CIF external provider is outside the EU
let isReassessment = false; // true if user selected Reassessment path
let checkboxCounter = 0;

const LANDING = '__landing__';

function getNode(id) {
  if (id === 'start') return tree;
  return nodes[id] || null;
}

function getResult(id) {
  return results[id] || null;
}

function isResult(id) {
  return id && id.startsWith('result_');
}

function render() {
  const container = document.getElementById('treeContainer');

  if (!currentNode || currentNode === LANDING) {
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('breadcrumb').innerHTML = '';
    document.getElementById('breadcrumb').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'none';
    renderLanding(container);
    return;
  }

  document.getElementById('breadcrumb').style.display = '';
  document.getElementById('backBtn').style.display = '';
  document.querySelector('.progress-bar').style.display = '';

  const totalSteps = 9;
  const progress = Math.min((history.length / totalSteps) * 100, 90);
  document.getElementById('progressFill').style.width = progress + '%';

  const bc = document.getElementById('breadcrumb');
  const items = [arrangementType === 'reassess' ? 'Reassessment' : 'New arrangement'];
  history.forEach(h => { if (h.answerLabel) items.push(h.answerLabel); });
  bc.innerHTML = items.map((item, i) => {
    const isLast = i === items.length - 1;
    return `<span class="breadcrumb-item ${isLast ? 'active' : ''}">${item}</span>${!isLast ? '<span class="breadcrumb-sep">›</span>' : ''}`;
  }).join('');

  document.getElementById('backBtn').disabled = history.length === 0;

  if (isResult(currentNode)) {
    renderResult(container, getResult(currentNode));
  } else {
    const node = getNode(currentNode);
    if (node) renderQuestion(container, node);
  }
}

function renderLanding(container) {
  container.innerHTML = `
    <div class="landing-screen">
      <div class="landing-intro">
        <div class="landing-intro-label">Before you start</div>
        <div class="landing-intro-text">
          All external arrangements and intra-group agreements require formal classification under the institution's outsourcing policy and applicable regulatory frameworks.<br><br>
          The classification determines contractual requirements, risk assessment scope, and ongoing monitoring obligations. Intra-group status may reduce procedural burden in limited areas but does not remove contractual, audit, or notification obligations.
        </div>
      </div>
      <div class="landing-question-label">What type of classification is this?</div>
      <div class="landing-choice-grid">
        <button class="landing-choice-btn" onclick="setArrangementType('new')">
          <span class="landing-choice-icon">🆕</span>
          <div class="landing-choice-title">New arrangement</div>
          <div class="landing-choice-desc">First-time classification of a vendor or service not previously assessed under the institution's outsourcing framework. Applies to external and intra-group arrangements.</div>
        </button>
        <button class="landing-choice-btn reassess" onclick="setArrangementType('reassess')">
          <span class="landing-choice-icon">🔄</span>
          <div class="landing-choice-title">Reassessment</div>
          <div class="landing-choice-desc">Periodic review or re-classification of an existing arrangement following a scope change, contract renewal, or material change in risk profile. Applies to external and intra-group arrangements.</div>
        </button>
      </div>
    </div>
  `;
}

function setArrangementType(type) {
  arrangementType = type;
  isReassessment = (type === 'reassess');
  materialityChanged = true;
  history = [];
  currentNode = isReassessment ? 'q_reassessment_materiality_change' : 'start';
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getBafinHtml(result) {
  if (!result.bafin_required) {
    return `
      <div class="bafin-flag">
        <div class="bafin-flag-icon">🏛</div>
        <div class="bafin-flag-body">
          <div class="bafin-flag-title">BaFin Notification</div>
          <div class="bafin-flag-text">${result.bafin}</div>
        </div>
      </div>`;
  }

  if (arrangementType === 'reassess') {
    if (!materialityChanged) {
      return `
        <div class="bafin-flag">
          <div class="bafin-flag-icon">🏛</div>
          <div class="bafin-flag-body">
            <div class="bafin-flag-title">BaFin Notification — Reassessment</div>
            <div class="bafin-flag-text">
              <strong>No BaFin notification required.</strong> The materiality classification has not changed.
              Document the reassessment outcome in your internal outsourcing register and update the Register of Information if any details changed.
            </div>
          </div>
        </div>`;
    } else {
      return `
        <div class="bafin-flag">
          <div class="bafin-flag-icon">🏛</div>
          <div class="bafin-flag-body">
            <div class="bafin-flag-title">BaFin Notification — Materiality Change</div>
            <div class="bafin-flag-text">
              <strong>Notification required — materiality has changed.</strong>
              <div class="bafin-steps">
                <div class="bafin-step">
                  <div class="bafin-step-num">1</div>
                  <div class="bafin-step-text"><strong>Reclassification notification</strong> — notify BaFin of the materiality change, the reason, and the updated classification. Include the updated risk assessment. Submit via BaFin reporting portal.</div>
                </div>
              </div>
              <div style="margin-top:10px; font-size:12px; color:var(--text-dim);">Legal basis: § 25b KWG / MaRisk AT 9.2</div>
            </div>
          </div>
        </div>`;
    }
  }

  // New arrangement — 2 notifications
  return `
    <div class="bafin-flag">
      <div class="bafin-flag-icon">🏛</div>
      <div class="bafin-flag-body">
        <div class="bafin-flag-title">BaFin Notification — New Material Arrangement</div>
        <div class="bafin-flag-text">
          <strong>Two notifications required.</strong> Submit via BaFin reporting portal. Outsourcing Officer sign-off required before each submission.
          <div class="bafin-steps">
            <div class="bafin-step">
              <div class="bafin-step-num">1</div>
              <div class="bafin-step-text"><strong>Intention to Outsource</strong> — notify BaFin <em>before contract signing</em>. Include vendor name, service description, materiality rationale, and planned go-live date.</div>
            </div>
            <div class="bafin-step">
              <div class="bafin-step-num">2</div>
              <div class="bafin-step-text"><strong>Go-Live notification</strong> — notify BaFin <em>when the arrangement becomes operational</em>. Confirm contract date, actual go-live, and any deviations from the Intention notification.</div>
            </div>
          </div>
          <div style="margin-top:10px; font-size:12px; color:var(--text-dim);">Legal basis: § 25b KWG / MaRisk AT 9.2</div>
        </div>
      </div>
    </div>`;
}

function renderQuestion(container, node) {
  container.innerHTML = `
    <div class="question-card">
      <div class="step-label">${node.step || ''}</div>
      <div class="question-text">${node.question}</div>
      ${node.hint ? `<div class="question-hint">${node.hint}</div>` : ''}
      <div class="answers">
        ${node.answers.map(a => `
          <button class="answer-btn ${a.type}" onclick="answer('${a.next}', '${a.label.replace(/'/g, "\\'")}', '${a.action || ''}')">
            <div class="answer-icon">${a.type === 'yes' ? 'YES' : a.type === 'no' ? 'NO' : '?'}</div>
            <div>
              <div class="answer-label">${a.label}</div>
              ${a.sublabel ? `<div class="answer-sublabel">${a.sublabel}</div>` : ''}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderResult(container, result) {
  // Deep-clone result for dynamic modifications
  const r = JSON.parse(JSON.stringify(result));

  // Dynamic EBA GL + implications for result_class1
  if (currentNode === 'result_class1') {
    const eba = r.classifications.find(c => c.type === 'eba');
    if (_isCIF) {
      eba.value = 'Critical/Important Function — enhanced requirements';
      r.implications.push('EBA GL full CIF due diligence required');
      r.implications.push('EBA GL enhanced contractual requirements for CIF apply');
    } else {
      eba.value = 'Standard due diligence';
      r.implications.push('EBA GL standard due diligence required');
    }
  }

  // Dynamic EBA GL + implications for result_ig1
  if (currentNode === 'result_ig1') {
    const eba = r.classifications.find(c => c.type === 'eba');
    if (_isCIF) {
      eba.value = 'Critical/Important Function intra-group — simplified due diligence permitted';
      r.implications.push('EBA GL full CIF requirements apply — simplified due diligence permitted');
    } else {
      eba.value = 'Standard due diligence — simplified permitted for intra-group';
      r.implications.push('EBA GL standard due diligence required — simplified permitted');
    }
  }

  // Dynamic intragroup implication for result_class2
  if (currentNode === 'result_class2' && _isIntragroup) {
    r.implications.push('Simplified due diligence permitted — intra-group arrangement');
  }

  const alertHtml = r.alert ? `
    <div class="alert alert-${r.alert.type}">
      <div class="alert-icon">${r.alert.type === 'critical' ? '⚠' : '!'}</div>
      <div>${r.alert.text}</div>
    </div>` : '';

  const nonEuHtml = nonEuProvider ? `
    <div class="non-eu-flag">
      <div class="non-eu-flag-icon">🌐</div>
      <div class="non-eu-flag-body">
        <div class="non-eu-flag-title">NON-EU PROVIDER — Additional Requirements</div>
        <div class="non-eu-flag-text">The provider is located outside the EU. <strong>DORA Art. 28(4)(g)</strong> requires the contract to address: data location and applicable data protection law, governing law and jurisdiction, enforceability of audit rights across borders, and the ability of competent authorities to effectively supervise the arrangement. Verify that BaFin and relevant EU regulators can exercise their supervisory rights under the contract.</div>
      </div>
    </div>` : '';

  const ctppHtml = (r.classifications && r.classifications.some(c => c.type === 'dora' && c.value.includes('Art.'))) && _ctppProvider ? `
    <div class="ctpp-flag">
      <div class="ctpp-flag-icon">⚡</div>
      <div class="ctpp-flag-body">
        <div class="ctpp-flag-title">CTPP — Additional Requirements Apply</div>
        <div class="ctpp-flag-text">
          This provider is designated or potential <strong>Critical Third-Party Provider (CTPP)</strong> under DORA Art. 31-44.
          Additional obligations apply:
          <ul style="margin-top:8px;padding-left:16px;display:flex;flex-direction:column;gap:4px;">
            <li>ESA Lead Overseer oversight applies — monitor recommendations and binding measures</li>
            <li>Concentration risk must account for sector-wide dependency across EU financial sector</li>
            <li>Exit plan must identify genuinely alternative providers outside the CTPP group</li>
            <li>Sub-outsourcing chain must be reported to ESA Lead Overseer</li>
            <li>Monitor ESA CTPP designation list published by EBA/ESMA/EIOPA</li>
          </ul>
        </div>
      </div>
    </div>` : r.ctpp ? `
    <div class="ctpp-flag">
      <div class="ctpp-flag-icon">⚡</div>
      <div class="ctpp-flag-body">
        <div class="ctpp-flag-title">CTPP — Concentration Risk Check Required</div>
        <div class="ctpp-flag-text">${r.ctpp}</div>
      </div>
    </div>` : '';

  const subOutsourcingHtml = (_subOutsourcing && r.bafin_required) ? `
    <div class="ctpp-flag">
      <div class="ctpp-flag-icon">⛓</div>
      <div class="ctpp-flag-body">
        <div class="ctpp-flag-title">SUB-OUTSOURCING — Additional Requirements Apply</div>
        <div class="ctpp-flag-text">
          <ul style="margin-top:8px;padding-left:16px;display:flex;flex-direction:column;gap:4px;">
            <li>Full sub-outsourcing chain must be mapped and documented</li>
            <li>External sub-vendor must be formally approved before engagement</li>
            <li>Sub-outsourcing clause required in the primary contract</li>
            <li>Equivalent contractual requirements must flow down to sub-vendor</li>
            <li>Exit plan must cover failure of the external sub-vendor</li>
            <li>Audit rights must extend to the external sub-vendor</li>
            <li>Register of Information must show the full sub-outsourcing chain</li>
            <li>Concentration risk assessment must cover the full chain</li>
            <li>Annual management report must cover the full sub-outsourcing chain</li>
            <li>BaFin notification must disclose the sub-outsourcing chain</li>
          </ul>
        </div>
      </div>
    </div>` : '';

  const bafinHtml = (isReassessment && materialityChanged === false) ? '' : getBafinHtml(r);

  const reassessmentChecklist = [
    { text: 'Previous classification reviewed and confirmed as still valid', tag: 'ops' },
    { text: 'Rationale for no change in materiality documented', tag: 'risk' },
    { text: 'No new ICT components identified since last assessment', tag: 'ops' },
    { text: 'No change in scope, volume, or service description confirmed', tag: 'ops' },
    { text: 'Provider CTPP status checked — no new designation since last assessment', tag: 'ops' },
    { text: 'Sub-outsourcing arrangements reviewed — no changes identified', tag: 'ops' },
    { text: 'GDPR DPA reviewed and confirmed as current', tag: 'legal' },
    { text: 'Outsourcing register updated with reassessment date', tag: 'ops' },
    { text: 'Outsourcing Officer sign-off on reassessment outcome obtained', tag: 'risk' },
    { text: 'No BaFin notification required — confirmed and documented in writing', tag: 'risk' }
  ];
  const activeChecklist = (isReassessment && materialityChanged === false) ? reassessmentChecklist : r.checklist;
  const checklistTitle = (isReassessment && materialityChanged === false) ? 'REASSESSMENT CHECKLIST' : 'What to prepare before contracting';

  const checklistHtml = activeChecklist ? `
    <div class="checklist-section">
      <div class="checklist-title">${checklistTitle}</div>
      <div class="checklist">
        ${activeChecklist.map((item, i) => {
          const id = 'cb_' + (++checkboxCounter) + '_' + i;
          return `
          <div class="checklist-item">
            <input type="checkbox" id="${id}">
            <label for="${id}">${item.text}</label>
            <span class="ci-tag ${item.tag}">${item.tag}</span>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  container.innerHTML = `
    <div class="result-card">
      <div class="result-title">✓ Classification determined</div>
      <h2 style="font-size:20px;font-weight:700;color:#fff;margin-bottom:20px;">${r.title}</h2>
      ${alertHtml}
      ${nonEuHtml}
      ${ctppHtml}
      ${subOutsourcingHtml}
      ${bafinHtml}
      <div class="classification-grid">
        ${r.classifications.map(c => `
          <div class="class-badge ${c.type}">
            <div class="class-badge-label">${c.label}</div>
            <div class="class-badge-value">${c.value}</div>
          </div>
        `).join('')}
      </div>
      <div class="implications-title">What this means for you</div>
      <ul class="implication-list">
        ${r.implications.map(i => `<li>${i}</li>`).join('')}
      </ul>
      ${checklistHtml}
      ${r.examples ? `
        <div class="examples-box">
          <div class="examples-title">Examples</div>
          <div class="examples-list">
            ${r.examples.map(e => `<span class="example-tag">${e}</span>`).join('')}
          </div>
        </div>` : ''}
      <div class="restart-area">
        <div class="btn-group">
          <button class="btn btn-primary" onclick="restart()">Classify a new service</button>
          <button class="btn btn-secondary" onclick="goBack()">← Change answer</button>
        </div>
      </div>
    </div>
  `;
}

function answer(nextId, label, action) {
  if (action === 'setNonEuProvider') nonEuProvider = true;
  if (action === 'setMaterialityTrue') materialityChanged = true;
  if (action === 'setMaterialityFalse') materialityChanged = false;
  if (action === 'setCTPP') _ctppProvider = true;
  if (action === 'setSubOutsourcing') _subOutsourcing = true;
  if (action === 'setIntragroup') _isIntragroup = true;
  if (action === 'setCIF') _isCIF = true;
  history.push({ node: currentNode, answerLabel: label });
  currentNode = nextId;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  if (history.length === 0) {
    currentNode = LANDING;
    arrangementType = null;
    isReassessment = false;
    materialityChanged = true;
    nonEuProvider = false;
    _ctppProvider = false;
    _subOutsourcing = false;
    _isIntragroup = false;
    _isCIF = false;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const prev = history.pop();
  if (prev.node === 'q_reassessment_materiality_change') materialityChanged = true;
  if (prev.node === 'q_non_eu_provider') nonEuProvider = false;
  if (prev.node === 'q3e_cloud_ctpp_check' || prev.node === 'q6_ctpp') _ctppProvider = false;
  if (prev.node === 'q6_ctpp_intra' || prev.node === 'q_non_ict_intragroup_sub' || prev.node === 'q_non_ict_non_cif_intragroup_sub' || prev.node === 'q3d_cloud_intra_sub') _subOutsourcing = false;
  if (prev.node === 'q5_intragroup' || prev.node === 'q3b_cloud_ctpp' || prev.node === 'q_non_ict_cif_intragroup' || prev.node === 'q_non_ict_material_non_cif_intragroup' || prev.node === 'q_non_ict_non_material_intragroup' || prev.node === 'q_ict_intragroup_noncif') _isIntragroup = false;
  if (prev.node === 'q_non_ict_cif' || prev.node === 'q4_critical_func' || prev.node === 'q3_cloud_cif') _isCIF = false;
  currentNode = prev.node;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restart() {
  history = [];
  currentNode = LANDING;
  arrangementType = null;
  isReassessment = false;
  materialityChanged = true;
  nonEuProvider = false;
  _ctppProvider = false;
  _subOutsourcing = false;
  _isIntragroup = false;
  _isCIF = false;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

render();
