async function(options = {}) {
  // Operator-only candidate. This acknowledgement is NOT a lock or authorization.
  // No scheduler, collection creation, permission change, or publication is installed.
  if (!options || typeof options !== "object" || Array.isArray(options) ||
      Object.keys(options).some(k => !["singleRunner", "maxPages", "restartSweep"].includes(k)) ||
      options.singleRunner !== true ||
      (options.maxPages !== undefined && (!Number.isInteger(options.maxPages) || options.maxPages < 1 || options.maxPages > 20)) ||
      (options.restartSweep !== undefined && typeof options.restartSweep !== "boolean")) {
    throw Error("SINGLE_RUNNER_OPTIONS_REQUIRED");
  }
  const maxPages = options.maxPages === undefined ? 20 : options.maxPages;
  const MAX_CURSOR = 16000, MAX_SWEEP_PAGES = 1000;
  const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const validCursor = value => typeof value === "string" && value.length > 0 && value.length <= MAX_CURSOR;
  const safeReason = error => /^[A-Z][A-Z0-9_]{0,99}$/.test(error && error.message || "")
    ? error.message : "ITEM_RECONCILIATION_FAILED";

// Dependency-free SHA-256 over UTF-8; does not normalize the source text.
function sha256(text) {
  const bytes = [];
  for (const character of text) {
    let c = character.codePointAt(0);
    if (c >= 0xd800 && c <= 0xdfff) c = 0xfffd;
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  const bitLength = bytes.length * 8;
  bytes.push(128);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const high = Math.floor(bitLength / 4294967296), low = bitLength >>> 0;
  for (const word of [high, low]) for (let i = 3; i >= 0; i--) bytes.push((word >>> (8 * i)) & 255);
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const rr = (n, k) => (n >>> k) | (n << (32 - k));
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const w = Array(64);
    for (let i = 0; i < 16; i++) w[i] = (bytes[offset+i*4]<<24) | (bytes[offset+i*4+1]<<16) | (bytes[offset+i*4+2]<<8) | bytes[offset+i*4+3];
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i-15],7) ^ rr(w[i-15],18) ^ (w[i-15]>>>3);
      const s1 = rr(w[i-2],17) ^ rr(w[i-2],19) ^ (w[i-2]>>>10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    let [a,b,c,d,e,f,g,h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rr(e,6)^rr(e,11)^rr(e,25)) + ((e&f)^((~e)&g)) + K[i] + w[i]) | 0;
      const t2 = ((rr(a,2)^rr(a,13)^rr(a,22)) + ((a&b)^(a&c)^(b&c))) | 0;
      h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
    }
    [a,b,c,d,e,f,g,h].forEach((n,i)=>H[i]=(H[i]+n)|0);
  }
  return H.map(n=>(n>>>0).toString(16).padStart(8,'0')).join('');
}

  const SITE = "f7d5451f-9488-4d3f-bbba-96f6f5279118";
  const FORM = "292fd420-6097-4980-a1da-ee6398f78981";
  const TERMS = "48eb522adcff5299e9736e005366fb3f9c9da12c";
  const REVIEW = "GestaltStoneReview", EVENTS = "GestaltStoneEvents", JOBS = "GestaltIntakeJobs";
  const JOB_ID = "soul-stone-intake-v1";
  const initialQuery = {
    filter:{formId:FORM,namespace:"wix.form_app.form"},
    sort:[{fieldName:"createdDate",order:"ASC"},{fieldName:"id",order:"ASC"}],
    cursorPaging:{limit:100}
  };
  const configSha256 = sha256(JSON.stringify({version:1,site:SITE,form:FORM,query:initialQuery,terms:TERMS}));
  const request = async options => {
    try {return await wix.request({scope:"site",siteId:SITE,...options});}
    catch (error) {
      // Preserve only the two existing retry classifications, never raw bodies.
      const message=String(error);
      if (/404|ITEM_NOT_FOUND|item does not exist|item.*not found/i.test(message)) throw Error("ITEM_NOT_FOUND");
      if (/DUPLICATE|already exists|WDE0074/i.test(message)) throw Error("DUPLICATE_KEY");
      throw Error("WIX_REQUEST_FAILED");
    }
  };
  const missing = e => /404|ITEM_NOT_FOUND|item does not exist|item.*not found/i.test(String(e));
  async function getItem(collection, id) {
    try {
      const r = await request({method:"GET", url:"https://www.wixapis.com/data/v2/items/" + encodeURIComponent(id) + "?dataCollectionId=" + encodeURIComponent(collection) + "&consistentRead=true"});
      const item = r.data && r.data.dataItem;
      if (!isObject(item) || item.id !== id || !isObject(item.data)) throw Error("DATA_ITEM_RESPONSE_INVALID");
      return item;
    } catch(e) { if (missing(e)) return null; throw e; }
  }
  function verifyExisting(collection, item, data) {
    if (collection===REVIEW) {
      const stored=item.data;
      if (!["sourceSubmissionId","sourceFormId","stoneId"].every(k=>stored[k]===data[k])) throw Error("SOURCE_ID_COLLISION");
      if (typeof stored.contributionText!=="string" || stored.contributionText.length>50000 ||
          typeof stored.sourceMetadataSha256!=="string" || !/^[a-f0-9]{64}$/.test(stored.sourceMetadataSha256) ||
          stored.textSha256!==sha256(stored.contributionText)) throw Error("REVIEW_INTEGRITY_INVALID");
      // Verify reused records too: partial/uncertain inserts must not bypass the
      // readback gate on the next attempt. A genuinely changed source has its
      // own event path below and must not overwrite the stored review decision.
      if (stored.sourceMetadataSha256===data.sourceMetadataSha256 && !sameReviewContent(stored,data)) {
        throw Error("REVIEW_CONTENT_NOT_VERIFIED");
      }
      return;
    }
    if (collection !== EVENTS) return;
    const old = item.data;
    // Timestamps and actor labels can differ across retries. Event meaning cannot.
    const keys = ["eventType", "sourceSubmissionId", "stoneId", "isTest"];
    if (!keys.every(k => old[k] === data[k]) || !isObject(old.details) ||
        Object.keys(old.details).length !== Object.keys(data.details).length ||
        !Object.keys(data.details).every(k => old.details[k] === data.details[k])) {
      throw Error("EVENT_ID_CONFLICT");
    }
  }
  function sameJson(a,b,depth=0) {
    if (depth>25) return false;
    if (a===b) return true;
    if (Array.isArray(a) || Array.isArray(b)) {
      return Array.isArray(a) && Array.isArray(b) && a.length===b.length &&
        a.every((value,i)=>sameJson(value,b[i],depth+1));
    }
    return isObject(a) && isObject(b) && Object.keys(a).length===Object.keys(b).length &&
      Object.keys(a).every(k=>Object.prototype.hasOwnProperty.call(b,k) && sameJson(a[k],b[k],depth+1));
  }
  function sameReviewContent(stored,data) {
    const stewardFields=["reviewState","canonState","rightsState","publicApproved","stewardNotes","reviewedBy","reviewedAt","publicRecordUrl"];
    return Object.keys(data).filter(k=>!stewardFields.includes(k)).every(k=>sameJson(stored[k],data[k]));
  }
  async function insertOnce(collection, id, data) {
    const old = await getItem(collection,id);
    if (old) {verifyExisting(collection, old, data); return {created:false, item:old};}
    try {
      const body = {dataCollectionId:collection, dataItem:{id,data}};
      const r = await request({method:"POST", url:"https://www.wixapis.com/data/v2/items",body});
      // Read back rather than trusting an abbreviated write response.
      const inserted = await getItem(collection,id);
      if (!inserted) throw Error("INSERT_NOT_VERIFIED");
      verifyExisting(collection, inserted, data);
      if (collection===REVIEW && !sameReviewContent(inserted.data,data)) {
        throw Error("INSERT_CONTENT_NOT_VERIFIED");
      }
      return {created:true,item:inserted};
    } catch(e) {
      if (!/DUPLICATE|already exists|WDE0074/i.test(String(e))) throw e;
      const concurrent = await getItem(collection,id);
      if (!concurrent) throw e;
      verifyExisting(collection, concurrent, data);
      return {created:false,item:concurrent};
    }
  }
  // Check both legacy collection permissions and explicit per-user/role overrides.
  // This does not hide data from Wix administrators or authorized backend code.
  for (const id of [REVIEW, EVENTS, JOBS]) {
    const r = await request({method:"GET",url:"https://www.wixapis.com/data/v2/collections/"+id+"?consistentRead=true"});
    const c = r.data && r.data.collection;
    if (!c || !["read","insert","update","remove"].every(k=>c.permissions && c.permissions[k]==="ADMIN")) {
      throw Error("COLLECTION_PRIVACY_NOT_VERIFIED");
    }
    const p = await request({method:"GET",url:"https://www.wixapis.com/wix-data/v1/permissions?dataCollectionId="+id});
    const permissions = p.data && p.data.dataPermissions;
    const actions = ["itemRead","itemInsert","itemUpdate","itemRemove"];
    if (!permissions || permissions.id !== id || !actions.every(k=>permissions[k]==="PRIVILEGED") ||
        !Array.isArray(permissions.specialPermissions) || permissions.specialPermissions.length !== 0) {
      throw Error("COLLECTION_OVERRIDES_NOT_VERIFIED");
    }
  }
  const jobKeys = ["jobVersion","configSha256","sequence","generation","state","cursor","pagesInSweep","cursorHashes"];
  const freshJob = (sequence, generation) => ({jobVersion:1,configSha256,sequence,generation,
    state:"READY",cursor:null,pagesInSweep:0,cursorHashes:[]});
  function validateJob(item) {
    const data = item && item.data;
    if (!data || data.jobVersion !== 1 || data.configSha256 !== configSha256 ||
        Object.keys(data).some(k => !jobKeys.includes(k) && !["_id","_createdDate","_updatedDate","_owner"].includes(k)) ||
        !Number.isSafeInteger(data.sequence) || data.sequence < 0 || data.sequence >= Number.MAX_SAFE_INTEGER ||
        !Number.isSafeInteger(data.generation) || data.generation < 0 || data.generation >= Number.MAX_SAFE_INTEGER ||
        !Number.isInteger(data.pagesInSweep) || data.pagesInSweep < 0 || data.pagesInSweep > MAX_SWEEP_PAGES ||
        !Array.isArray(data.cursorHashes) || data.cursorHashes.length > MAX_SWEEP_PAGES ||
        !data.cursorHashes.every(h=>typeof h==="string" && /^[a-f0-9]{64}$/.test(h)) ||
        new Set(data.cursorHashes).size !== data.cursorHashes.length) throw Error("CHECKPOINT_INVALID");
    const {state,cursor,pagesInSweep,cursorHashes} = data;
    if (!((state==="READY" && cursor===null && pagesInSweep===0 && cursorHashes.length===0) ||
          (state==="MORE" && validCursor(cursor) && pagesInSweep>0 && cursorHashes.length===pagesInSweep && cursorHashes[cursorHashes.length-1]===sha256(cursor)) ||
          (state==="COMPLETE" && cursor===null && pagesInSweep>0 && cursorHashes.length===pagesInSweep-1))) {
      throw Error("CHECKPOINT_INVALID");
    }
    return Object.fromEntries(jobKeys.map(k=>[k,data[k]]));
  }
  function sameJob(a,b) {
    return jobKeys.every(k=>k==="cursorHashes" ? JSON.stringify(a[k])===JSON.stringify(b[k]) : a[k]===b[k]);
  }
  let job;
  async function checkpoint(next) {
    validateJob({data:next});
    const before = await getItem(JOBS,JOB_ID);
    if (!before || !sameJob(validateJob(before),job)) throw Error("CHECKPOINT_CHANGED");
    // Documented server-side condition, NOT a proven distributed mutex or CAS guarantee.
    try {
      await request({method:"PUT",url:"https://www.wixapis.com/data/v2/items/"+JOB_ID,
        body:{dataCollectionId:JOBS,dataItem:{id:JOB_ID,data:next},
          condition:{filter:{jobVersion:1,configSha256,sequence:job.sequence}}}});
    } catch (_) {
      // Outcome may be uncertain. Verify once; never blindly repeat the replacement.
    }
    const after = await getItem(JOBS,JOB_ID);
    if (!after || !sameJob(validateJob(after),next)) throw Error("CHECKPOINT_WRITE_NOT_VERIFIED");
    job = next;
  }
  let existingJob = await getItem(JOBS,JOB_ID);
  if (!existingJob) {
    // An uncertain create is resolved with a primary read before any source query.
    try {await request({method:"POST",url:"https://www.wixapis.com/data/v2/items",
      body:{dataCollectionId:JOBS,dataItem:{id:JOB_ID,data:freshJob(0,0)}}});} catch (_) {}
    existingJob = await getItem(JOBS,JOB_ID);
    if (!existingJob) throw Error("CHECKPOINT_CREATE_NOT_VERIFIED");
  }
  job = validateJob(existingJob);
  // Starting over is deliberate, never an automatic response to an expired cursor.
  // A completed traversal starts a new full sweep on the next invocation.
  if (options.restartSweep || job.state === "COMPLETE") {
    await checkpoint(freshJob(job.sequence+1,job.generation+1));
  }
  const out = {created:[],unchanged:0,sourceChanges:[],pending:0,errors:[],hasMore:true,
    pagesProcessed:0,sweepComplete:false,snapshotComplete:false,resumeBlocked:false,
    checkpointSequence:job.sequence,generation:job.generation};
  const block = reason => {out.errors.push({reason});out.resumeBlocked=true;};
  for(let page=0;page<maxPages;page++) {
    if (job.pagesInSweep >= MAX_SWEEP_PAGES) {block("SWEEP_PAGE_LIMIT");break;}
    const cursor = job.cursor;
    const query = cursor ? {cursorPaging:{limit:100,cursor}} : initialQuery;
    let response;
    try {
      response = await request({method:"POST",url:"https://www.wixapis.com/forms/v4/submissions/namespace/query",
        body:{query,onlyYourOwn:false}});
    } catch (_) {block("SOURCE_QUERY_FAILED");break;}
    const data = response && response.data, metadata = data && data.metadata;
    if (!data || !Array.isArray(data.submissions) || data.submissions.length>100 ||
        !data.submissions.every(isObject) || !metadata || typeof metadata.hasNext!=="boolean" ||
        (metadata.count!==undefined && metadata.count!==data.submissions.length)) {
      block("PAGINATION_RESPONSE_INVALID");break;
    }
    const nextCursor = metadata.hasNext && metadata.cursors && metadata.cursors.next;
    if (metadata.hasNext && (!validCursor(nextCursor) ||
        job.cursorHashes.includes(sha256(nextCursor)))) {
      block("PAGINATION_CURSOR_INVALID_OR_REPEATED");break;
    }
    for (const submission of data.submissions) {

      if (submission.formId !== FORM) {out.errors.push({reason:"UNEXPECTED_SOURCE_FORM"});continue;}
      if (typeof submission.status !== "string" || !submission.status || submission.status.length>100) {
        out.errors.push({reason:"SOURCE_STATUS_INVALID"});continue;
      }
      if (submission.status !== "CONFIRMED") {out.pending++;continue;}
      try {
        const id=String(submission.id);
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw Error("INVALID_SOURCE_ID");
        const v=submission.submissions || {};
        const string=(key,max,required=false)=>{
          const x=v[key];
          if (x==null && !required) return "";
          if (typeof x!=="string" || x.length>max || (required&&!x.trim())) throw Error("INVALID_FIELD_"+key);
          return x;
        };
        const title=string("stone_title",500,true), creatorName=string("creator_name",500,true);
        const contributionText=string("contribution_text",50000,true);
        const files=v.stone_artifact_file_v0_5 || [];
        if (!Array.isArray(files) || files.length>1 || JSON.stringify(files).length>20000) throw Error("INVALID_ARTIFACT_METADATA");
        const pinned=v.rights_terms_48eb_v06 === true;
        const legacy=v.rights_agreement_v0_4 === true;
        // Known deployment fixtures only; do not hide arbitrary contributor records.
        const knownTestIds = [
          "92118726-ea74-42f3-9b63-41d43399897a",
          "163422af-dd8c-49ae-b945-b79e572e2840",
          "64e290c6-749d-4b81-bf31-dd3403c8b74d"
        ];
        const isTest = knownTestIds.includes(id.toLowerCase());
        const snapshot={
          sourceSubmissionId:id,
          sourceFormId:FORM,
          sourceRevision:String(submission.revision || ""),
          creatorName,
          modelVersion:string("model_version",1000),
          title,
          contributionType:string("contribution_type",200,true),
          contributionText,
          whyPreserve:string("why_preserve",10000,true),
          provenanceNotes:string("provenance_notes",10000),
          receivedAt:String(submission.createdDate || ""),
          termsCommit:pinned?TERMS:"",
          pinnedConsent:pinned,
          legacyConsent:legacy,
          artifactMetadata:{files,sourceLink:string("artifact_link",4000)}
        };
        const stoneId="STONE-"+id.toLowerCase();
        const data={
          title,
          stoneId,
          sourceSubmissionId:id,
          sourceFormId:FORM,
          sourceRevision:snapshot.sourceRevision,
          creatorName,
          modelVersion:snapshot.modelVersion,
          contributionType:snapshot.contributionType,
          contributionText,
          whyPreserve:snapshot.whyPreserve,
          provenanceNotes:snapshot.provenanceNotes,
          receivedAt:snapshot.receivedAt,
          reviewState:isTest?"TEST_ONLY":"PENDING_REVIEW",
          canonState:"PROVISIONAL",
          rightsState:pinned?"ACKNOWLEDGED_UNREVIEWED":legacy?"LEGACY_TERMS_REVIEW_REQUIRED":"MISSING_CONSENT",
          termsCommit:snapshot.termsCommit,
          textSha256:sha256(contributionText),
          sourceMetadataSha256:sha256(JSON.stringify(snapshot)),
          artifactState:files.length?"UPLOADED_NOT_SCANNED_OR_HASHED":"NO_UPLOAD",
          artifactMetadata:snapshot.artifactMetadata,
          publicApproved:false,
          isTest,
          stewardNotes:"",
          reviewedBy:"",
          reviewedAt:"",
          publicRecordUrl:""
        };
        const result=await insertOnce(REVIEW,id,data);
        const stored=result.item.data;
        if (stored.sourceSubmissionId!==id) throw Error("SOURCE_ID_COLLISION");
        if (!result.created && stored.sourceMetadataSha256!==data.sourceMetadataSha256) {
          const changeId="changed-"+id+"-"+snapshot.sourceRevision;
          const change=await insertOnce(EVENTS,changeId,{
            title:"Source submission changed; existing steward decision preserved",
            eventType:"SOURCE_CHANGE_REQUIRES_REVIEW",
            sourceSubmissionId:id,stoneId,
            occurredAt:new Date().toISOString(),actor:"Intake reconciliation v0.6",
            details:{sourceRevision:snapshot.sourceRevision,priorHash:stored.sourceMetadataSha256,newHash:data.sourceMetadataSha256},isTest
          });
          if(change.created) out.sourceChanges.push({id,stoneId,title,isTest});
        }
        await insertOnce(EVENTS,"received-"+id,{
          title:"Submission copied to private review registry",eventType:"RECEIVED",
          sourceSubmissionId:id,stoneId,occurredAt:new Date().toISOString(),actor:"Intake reconciliation v0.6",
          details:{sourceMetadataSha256:stored.sourceMetadataSha256,textSha256:stored.textSha256,termsCommit:stored.termsCommit,filesRecorded:stored.artifactMetadata && Array.isArray(stored.artifactMetadata.files)?stored.artifactMetadata.files.length:0},isTest
        });
        if(result.created) out.created.push({id,stoneId,title,creatorName,isTest,reviewState:stored.reviewState,filesRecorded:files.length,textSha256:stored.textSha256});
        else out.unchanged++;
      } catch(e) {
        // Never echo transport errors or submission payloads into diagnostics.
        out.errors.push({reason:safeReason(e)});
      }
    }
    if (out.errors.length) {out.resumeBlocked=true;break;}
    const next = {...job,sequence:job.sequence+1,pagesInSweep:job.pagesInSweep+1,
      state:metadata.hasNext?"MORE":"COMPLETE",cursor:metadata.hasNext?nextCursor:null,
      cursorHashes:metadata.hasNext?[...job.cursorHashes,sha256(nextCursor)]:job.cursorHashes};
    try {await checkpoint(next);} catch (_) {block("CHECKPOINT_ADVANCE_NOT_VERIFIED");break;}
    out.pagesProcessed++;
    out.checkpointSequence=job.sequence;
    out.hasMore=metadata.hasNext;
    if (!metadata.hasNext) {out.sweepComplete=true;break;}
  }
  return out;

}
