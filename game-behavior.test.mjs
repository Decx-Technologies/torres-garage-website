import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('./dist/garage-game.js',import.meta.url),'utf8');
function session(){
 const raf=new Map(),created=[],storage=new Map();let next=0,time=0,playerX=240;
 const drawing=new Proxy({createLinearGradient:()=>({addColorStop(){}}),translate(x,y){if(y===592)playerX=x;}},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
 class Element{
  constructor(tag='div'){this.tag=tag;this.children=new Map();this.events=new Map();this.style={setProperty(){}};this.classList={add(){}};this.hidden=false;this.open=false;this.clientWidth=360;this._text='';}
  set textContent(value){this._text=String(value);}get textContent(){return this._text;}
  querySelector(key){if(!this.children.has(key))this.children.set(key,new Element(key==='canvas'?'canvas':key.includes('game-')?'button':'div'));return this.children.get(key);}
  setAttribute(){}append(){}before(){}focus(){}setPointerCapture(){}
  getContext(){return drawing;}getBoundingClientRect(){return{width:360,height:540};}
  addEventListener(name,callback){if(!this.events.has(name))this.events.set(name,[]);this.events.get(name).push(callback);}
  emit(name,event={}){for(const cb of this.events.get(name)||[])cb({target:this,preventDefault(){},...event});}
  showModal(){this.open=true;}close(){this.open=false;this.emit('close');}closest(){return this.tag==='button'?this:null;}
 }
 const doc=new Element(),win=new Element();doc.body=new Element();doc.documentElement={scrollHeight:3000};doc.createElement=tag=>{const el=new Element(tag);created.push(el);return el;};doc.hidden=false;
 const sandbox={document:doc,window:win,innerHeight:900,scrollY:0,devicePixelRatio:2,Math:Object.assign(Object.create(Math),{random:()=>.01}),localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}disconnect(){}},requestAnimationFrame:cb=>{raf.set(++next,cb);return next;},cancelAnimationFrame:id=>raf.delete(id)};
 vm.runInNewContext(source.replace('export function','function')+'\ninitGarageGame();',sandbox);
 const section=created.find(e=>e.id==='garage-run'),dialog=created.find(e=>e.className==='game-dialog'),canvas=dialog.querySelector('canvas');
 function run(seconds,fps=60){for(let i=0;i<Math.round(seconds*fps);i++){time+=1000/fps;const callbacks=[...raf.values()];raf.clear();callbacks.forEach(cb=>cb(time));}}
 const click=selector=>dialog.querySelector(selector).onclick();section.querySelector('#open-garage-game').onclick();click('#game-start');
 return{run,click,dialog,canvas,doc,get x(){return playerX;},get score(){return Number(dialog.querySelector('#game-score').textContent);}};
}
const slow=session(),fast=session();slow.run(4,20);fast.run(4,120);assert.ok(Math.abs(slow.score-fast.score)<=1,'Score should match across frame rates');
const paused=session();paused.run(1);paused.click('.game-pause');const before=paused.score;paused.run(4);assert.equal(paused.score,before,'Pause freezes simulation');paused.click('#game-start');paused.run(1);assert.ok(paused.score>before,'Resume continues');
const collision=session();collision.click('#game-left');collision.run(6);assert.equal(collision.dialog.querySelector('#game-title').textContent,'Una curva más.','Collision ends run');assert.ok(Number(collision.dialog.querySelector('#game-best').textContent)>0,'Record stored');collision.click('#game-start');assert.equal(collision.score,0,'Restart resets score');
const touch=session();touch.canvas.emit('pointerdown',{button:0,pointerId:1,clientX:200,clientY:200});touch.canvas.emit('pointermove',{pointerId:1,clientX:100,clientY:202});touch.run(.4);assert.ok(touch.x<150,'Swipe changes lane before release');touch.doc.hidden=true;touch.doc.emit('visibilitychange');assert.equal(touch.dialog.querySelector('.game-status').textContent,'Partida en pausa.','Hidden tab pauses');
console.log('PASS: frame-rate consistency, pause/resume, collisions, record, restart, swipe and hidden-tab pause');
