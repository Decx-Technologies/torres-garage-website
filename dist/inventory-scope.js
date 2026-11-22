export function matchesInventoryScope(vehicle,scope='active'){return scope==='active'?vehicle.status!=='sold':vehicle.status===scope;}
