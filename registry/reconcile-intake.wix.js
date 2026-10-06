async function() {
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
  const REVIEW = "GestaltStoneReview", EVENTS = "GestaltStoneEvents";
  const request = options => wix.request({scope:"site", siteId:SITE, ...options});
  const missing = e => /404|ITEM_NOT_FOUND|item does not exist|item.*not found/i.test(String(e));
  async function getItem(collection, id) {
    try {
      const r = await request({method:"GET", url:"https://www.wixapis.com/wix-data/v2/items/" + encodeURIComponent(id) + "?dataCollectionId=" + collection});
      return r.data.dataItem;
    } catch(e) { if (missing(e)) return null; throw e; }
  }
  async function insertOnce(collection, id, data) {
    const old = await getItem(collection,id);
    if (old) return {created:false, item:old};
    try {
      const body = {dataCollectionId:collection, dataItem:{id,data}};
      const r = await request({method:"POST", url:"https://www.wixapis.com/data/v2/items",body});
      return {created:true,item:r.data.dataItem};
    } catch(e) {
      if (!/DUPLICATE|already exists|WDE0074/i.test(String(e))) throw e;
      const concurrent = await getItem(collection,id);
      if (!concurrent) throw e;
      return {created:false,item:concurrent};
    }
  }
  for (const id of [REVIEW, EVENTS]) {
    const r = await request({method:"GET",url:"https://www.wixapis.com/wix-data/v2/collections/"+id});
    const c = r.data.collection;
    if (!["read","insert","update","remove"].every(k=>c.permissions && c.permissions[k]==="ADMIN")) throw Error("Registry is not admin-only: "+id);
  }
  const out = {created:[], unchanged:0, sourceChanges:[], pending:0, errors:[], hasMore:false};
  let cursor = null;
  for(let page=0;page<20;page++) {
    const query = cursor
      ? {cursorPaging:{limit:100,cursor}}
      : {filter:{formId:FORM,namespace:"wix.form_app.form"},sort:[{fieldName:"createdDate",order:"ASC"}],cursorPaging:{limit:100}};
    const body = {query,onlyYourOwn:false};
    const r = await request({method:"POST",url:"https://www.wixapis.com/forms/v4/submissions/namespace/query",body});
    for (const submission of r.data.submissions || []) {
      if (submission.formId !== FORM) {out.errors.push({reason:"UNEXPECTED_SOURCE_FORM"});continue;}
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
          details:{sourceMetadataSha256:stored.sourceMetadataSha256,textSha256:stored.textSha256,termsCommit:stored.termsCommit,filesRecorded:files.length},isTest
        });
        if(result.created) out.created.push({id,stoneId,title,creatorName,isTest,reviewState:stored.reviewState,filesRecorded:files.length,textSha256:stored.textSha256});
        else out.unchanged++;
      } catch(e) {out.errors.push({id:submission.id,reason:String(e).slice(0,220)});}
    }
    if (!r.data.metadata || !r.data.metadata.hasNext) break;
    cursor=r.data.metadata.cursors && r.data.metadata.cursors.next;
    if (!cursor) {out.errors.push({reason:"PAGINATION_CURSOR_MISSING"});break;}
    if(page===19) out.hasMore=true;
  }
  return out;

}
