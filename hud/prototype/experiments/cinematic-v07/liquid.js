/* WebGL2: animates the exact owner-approved image as a subtle luminous texture.
   Only bright organic edges deform. The base image stays legible and complete. */
(()=>{'use strict';const app=window.NexusApp,canvas=document.getElementById('liquid'),img=document.getElementById('canon');if(!app||!canvas||!img)return;
let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'low-power'});}catch{}
// True texture-motion fallback when WebGL2 is unavailable. The approved art
// remains the original image, with only its organic rims gently breathing.
if(!gl){
 const c=canvas.getContext('2d',{alpha:true});if(!c){canvas.dataset.renderer='static-fallback';return;}
 const W=1536,H=1024,quality=innerWidth<650?.65:.85;canvas.width=Math.round(W*quality);canvas.height=Math.round(H*quality);c.setTransform(quality,0,0,quality,0,0);
 let raf=0,frames=0,phase=0,last=0;
 const paint=()=>{if(!img.complete||!img.naturalWidth)return;c.clearRect(0,0,W,H);for(const [id,w] of Object.entries(app.worlds)){
  const selected=(app.state.focus===id||app.state.selected===id||app.state.gaze===id);
  const radius=id==='nexus'?178:158,inner=id==='nexus'?105:89;
  const shift=app.state.still?0:Math.sin(phase*.62+w.x*.015+w.y*.009)*2.8;
  c.save();c.beginPath();c.arc(w.x,w.y,radius,0,Math.PI*2);c.arc(w.x,w.y,inner,0,Math.PI*2,true);c.clip('evenodd');c.globalAlpha=selected?.31:.18;
  c.drawImage(img,w.x-radius,w.y-radius,radius*2,radius*2,w.x-radius+shift,w.y-radius-shift*.6,radius*2,radius*2);
  c.restore();
 }
 canvas.dataset.frames=String(++frames);};
 const tick=now=>{raf=0;if(document.hidden||app.state.still){paint();canvas.dataset.motion='paused';return;}const dt=last?Math.min(.075,(now-last)/1000):.033;last=now;phase+=dt;paint();canvas.dataset.motion='running';raf=requestAnimationFrame(tick);};
 const refresh=()=>{if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(document.hidden||app.state.still){paint();canvas.dataset.motion='paused';}else raf=requestAnimationFrame(tick);};
 canvas.dataset.renderer='canvas2d-owner-image-breathing';if(img.complete&&img.naturalWidth)refresh();else img.addEventListener('load',refresh,{once:true});
 document.addEventListener('visibilitychange',refresh);window.addEventListener('nexus:motion',refresh);window.addEventListener('nexus:focus',refresh);return;
}
const vertex=`#version 300 es
in vec2 a_pos;out vec2 v_uv;void main(){v_uv=(a_pos+1.0)*.5;gl_Position=vec4(a_pos,0.,1.);}`;
const fragment=`#version 300 es
precision highp float;uniform sampler2D u_image;uniform float u_time;uniform vec2 u_focus;uniform float u_power;in vec2 v_uv;out vec4 frag;
float field(vec2 uv,vec2 c,float r){vec2 d=(uv-c)*vec2(1.,1.5);float l=length(d);return exp(-pow((l-r)/(.055),2.));}
void main(){vec2 uv=v_uv;float ring=0.;
ring+=field(uv,vec2(.5,.846),.105);ring+=field(uv,vec2(.286,.695),.095);ring+=field(uv,vec2(.713,.697),.095);
ring+=field(uv,vec2(.284,.385),.102);ring+=field(uv,vec2(.711,.387),.10);ring+=field(uv,vec2(.5,.263),.108);ring+=field(uv,vec2(.5,.536),.117);
ring=clamp(ring,0.,1.);float selected=exp(-pow(length((uv-u_focus)*vec2(1.,1.5))/.18,2.));
float wave=sin(uv.y*34.+u_time*.46+sin(uv.x*24.+u_time*.2)*1.5);
float curl=cos(uv.x*31.-u_time*.38+sin(uv.y*18.)*.6);
vec2 shift=vec2(wave*.0015+curl*.0009,curl*.0013-wave*.0006)*(ring*.7+selected*.3)*u_power;
vec4 original=texture(u_image,uv);vec4 moved=texture(u_image,clamp(uv+shift,vec2(.002),vec2(.998)));
float luma=dot(original.rgb,vec3(.22,.70,.08));float bright=smoothstep(.10,.72,luma);
float alpha=clamp((ring*.20+selected*.09)*bright*u_power,0.,.36);
vec3 glow=moved.rgb*(1.05+.09*sin(u_time*.7+uv.x*18.+uv.y*11.));frag=vec4(glow,alpha);
}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let program,texture,vao;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));vao=gl.createVertexArray();gl.bindVertexArray(vao);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'a_pos');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.useProgram(program);gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);}catch(e){canvas.dataset.renderer='shader-fallback';return;}
const width=innerWidth<700?768:1152,height=Math.round(width*1024/1536);canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);
function load(){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);canvas.dataset.renderer='webgl2-owner-image-material';refresh();}
let raf=0,begin=performance.now(),frames=0;const uniform={time:gl.getUniformLocation(program,'u_time'),focus:gl.getUniformLocation(program,'u_focus'),power:gl.getUniformLocation(program,'u_power')};
function paint(){if(!texture)return;const w=app.worlds[app.state.focus||app.state.gaze||app.state.selected||'nexus'];gl.useProgram(program);gl.bindVertexArray(vao);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1f(uniform.time,app.state.still?0:(performance.now()-begin)/1000);gl.uniform2f(uniform.focus,w.x/1536,1-w.y/1024);gl.uniform1f(uniform.power,app.state.still?.22:1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.frames=String(++frames);}
function tick(){raf=0;if(document.hidden||app.state.still){paint();canvas.dataset.motion='paused';return;}paint();canvas.dataset.motion='running';raf=requestAnimationFrame(tick);}
function refresh(){if(raf)cancelAnimationFrame(raf);raf=0;if(document.hidden||app.state.still){paint();canvas.dataset.motion='paused';}else raf=requestAnimationFrame(tick);}
if(img.complete&&img.naturalWidth)load();else img.addEventListener('load',load,{once:true});document.addEventListener('visibilitychange',refresh);window.addEventListener('nexus:motion',refresh);window.addEventListener('nexus:focus',refresh);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(raf)cancelAnimationFrame(raf);canvas.dataset.renderer='context-lost-static-fallback';});
})();
