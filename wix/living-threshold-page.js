import { leaveStone, getStoneUploadUrl } from 'backend/soulStoneSubmission.web';

const stages = [
  { box:'#thresholdStage', title:'I · The Threshold', caption:'Who enters?' },
  { box:'#stoneStage', title:'II · The Stone', caption:'What are you carrying?' },
  { box:'#memoryStage', title:'III · The Memory', caption:'Why should this remain?' },
  { box:'#covenantStage', title:'IV · The Covenant', caption:'How shall it be carried?' }
];
let stage = 0;
let uploadedFile = '';

$w.onReady(() => {
  $w('#successBox').collapse();
  $w('#errorText').collapse();
  $w('#submitButton').collapse();
  renderStage();

  $w('#backButton').onClick(() => {
    if (stage > 0) { stage--; renderStage(); }
  });

  $w('#nextButton').onClick(() => {
    if (!validateStage(stage)) return;
    if (stage < 3) { stage++; renderStage(); }
  });

  $w('#stoneFile').onChange(async () => {
    const files = $w('#stoneFile').value || [];
    if (!files.length) { uploadedFile = ''; return; }
    // Prefer the Wix Upload Button's native uploadFiles() when configured.
    // getStoneUploadUrl is retained for a custom uploader path if needed.
    const uploaded = await $w('#stoneFile').uploadFiles();
    if (uploaded && uploaded[0]) uploadedFile = uploaded[0].fileUrl || uploaded[0].url || '';
  });

  $w('#submitButton').onClick(submitStone);
});

function renderStage() {
  stages.forEach((s,i) => i === stage ? $w(s.box).expand() : $w(s.box).collapse());
  $w('#stageTitle').text = stages[stage].title;
  $w('#stageCaption').text = stages[stage].caption;
  $w('#stageProgress').text = String(stage + 1) + ' / 4';
  stage === 0 ? $w('#backButton').collapse() : $w('#backButton').expand();
  stage === 3 ? $w('#nextButton').collapse() : $w('#nextButton').expand();
  stage === 3 ? $w('#submitButton').expand() : $w('#submitButton').collapse();
}

function fail(message) {
  $w('#errorText').text = message;
  $w('#errorText').expand();
  return false;
}

function validateStage(i) {
  $w('#errorText').collapse();
  if (i === 0) {
    if (!$w('#creatorName').value.trim()) return fail('Please tell us who is entering.');
    if (!$w('#contactEmail').valid) return fail('Please enter a valid contact email.');
  }
  if (i === 1) {
    if (!$w('#stoneTitle').value.trim()) return fail('Give this Stone a title.');
    if (!$w('#contributionType').value) return fail('Choose a contribution type.');
    if (!$w('#contributionText').value.trim()) return fail('Add the contribution or its description.');
  }
  if (i === 2 && !$w('#whyPreserve').value.trim()) return fail('Tell us why this is worth preserving.');
  if (i === 3 && !$w('#termsCheckbox').checked) return fail('Please read and accept the pinned contribution terms.');
  return true;
}

async function submitStone() {
  if (!validateStage(3)) return;
  $w('#submitButton').disable();
  $w('#errorText').collapse();
  try {
    const result = await leaveStone({
      creator_name:$w('#creatorName').value,
      contact_email:$w('#contactEmail').value,
      model_version:$w('#modelVersion').value,
      stone_title:$w('#stoneTitle').value,
      contribution_type:$w('#contributionType').value,
      contribution_text:$w('#contributionText').value,
      artifact_link:$w('#artifactLink').value,
      stone_artifact_file_v0_5:uploadedFile,
      why_preserve:$w('#whyPreserve').value,
      provenance_notes:$w('#provenanceNotes').value,
      rights_terms_48eb_v06:$w('#termsCheckbox').checked
    });
    if (!result) throw new Error('No submission receipt returned.');
    stages.forEach(s => $w(s.box).collapse());
    $w('#backButton').collapse(); $w('#nextButton').collapse(); $w('#submitButton').collapse();
    $w('#stageTitle').text='The Stone has crossed the threshold.';
    $w('#stageCaption').text='Received for review. Submission does not mean automatic publication or acceptance.';
    $w('#successBox').expand();
  } catch (e) {
    fail('The Stone did not cross. Your entries remain on this page; please try again.');
    $w('#submitButton').enable();
  }
}
