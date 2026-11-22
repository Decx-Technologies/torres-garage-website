import assert from 'node:assert/strict';
import {matchesInventoryScope} from './dist/inventory-scope.js';
import {vehicleProfile,buildVehicleMesh} from './dist/vehicle-3d.js';
const inventory=[{status:'available'},{status:'draft'},{status:'sold'}];
assert.deepEqual(inventory.filter(v=>matchesInventoryScope(v)).map(v=>v.status),['available','draft']);
assert.deepEqual(inventory.filter(v=>matchesInventoryScope(v,'sold')).map(v=>v.status),['sold']);
assert.equal(inventory.filter(v=>matchesInventoryScope(v,'available')).length,1);
for(const [vehicle,kind]of [[{name:'Hilux',type:'Camioneta',color:'Rojo'},'pickup'],[{name:'Corolla',type:'Sedán',color:'Azul'},'sedan'],[{name:'4Runner SR5',type:'SUV',color:'Blanco'},'suv']]){
 const profile=vehicleProfile(vehicle);assert.equal(profile.kind,kind);const mesh=buildVehicleMesh(profile);assert.ok(mesh.length>100&&mesh.length<500);assert.ok(mesh.every(face=>face.points.length>=3&&/^#[a-f0-9]{6}$/i.test(face.color)&&face.points.every(point=>point.length===3&&point.every(Number.isFinite))));
}
assert.equal(vehicleProfile({color:'Rojo'}).paint,'#bd1934');assert.equal(vehicleProfile({}).colorConfirmed,false);
console.log('PASS: sold inventory isolation and finite 3D meshes for SUV, sedan and pickup bodies.');
