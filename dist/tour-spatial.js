export const direction=(yaw,pitch)=>({x:Math.cos(pitch)*Math.sin(yaw),y:Math.sin(pitch),z:Math.cos(pitch)*Math.cos(yaw)});
export function pointAngles(point){return{yaw:Number.isFinite(point.yaw)?point.yaw:-Math.PI/2+(point.x-50)*.014,pitch:Number.isFinite(point.pitch)?point.pitch:(50-point.y)*.012};}
