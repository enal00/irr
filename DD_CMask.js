// Var GLOBAL !!!!
var Ren_BndS2 = ['UBlue','Blue','Green', 'Red','RdE1','RdE2','RdE3','RdE4', 'Nir','Swir1','Swir2','SCL'],
BndS2a = ['B1','B2','B3', 'B4','B5','B6', 'B7','B8A','B8', 'B11','B12','SCL'];
var Ren_BndL8 = ['UBlue','Blue','Green', 'Red','Nir','Swir1','Swir2','T10',"QA_PIXEL"],
BndL8a = ['B1','B2','B3', 'B4','B5','B6', 'B7','B10','B11'],
BndL8b = ['SR_B1','SR_B2','SR_B3', 'SR_B4','SR_B5','SR_B6','SR_B7','ST_B10',"QA_PIXEL"],
Scld=10000,Offs=0,Bnd_Idx = ['NDBI','EVI','NDWI'],Idx_S1 = ['API','RPI','NDPI','VH_Int'];
var BndMod13 = ['sur.*','EVI'],BndSpc=['UBlue','Blue','Green','Red','Nir','Swir1','Swir2'],Bnd1S2 = [],  
BndSpc_Mod13=['Red','Nir','Blue','Mir','EVI'], PilBnd_S1 = ['VV','VH','VV-VH','API','RPI','NDPI'],
Bnd_Optis = JumArr(BndSpc,Bnd_Idx)
; 

exports.RenBndS2 = function(Img) {
  return Img.select(BndS2a,Ren_BndS2);
} 
exports.RenBndL8 = function(Img) {
  return Img.select(BndL8a,Ren_BndL8);
}
exports.RenBndL8b = function(Img) {
  return Img.select(BndL8b,Ren_BndL8);
} 
exports.SelBndSpc = function(Img) {
  return Img.select(BndSpc);
} 
exports.Bnd_S2a = function() {
  return BndS2a;
} 
exports.Bnd_L8a = function() {
  return BndL8a;
}
exports.Bnd_L8b = function() {
  return BndL8b;
}
exports.Bnd_Spc = function() {
  return BndSpc;
}
exports.Bnd_Optis = function() {
  return Bnd_Optis;
}
exports.Bnd_IdxS1 = function() {
  return Idx_S1;
}

//#######################################################
exports.CMask_S2k = function(image) { // untuk S2_SR mengggunakan band SCL (Level 2A)
  var qa = image.select('SCL'); // 4:Veg, 5:Bare, 6:Water; 7 :Unclas
  var mask = qa.expression('(qa <= 3 || qa > 7) ? 0:1',{qa:qa});
  return image.updateMask(mask).divide(Scld).select(BndS2a,Ren_BndS2)
  .copyProperties(image, ["system:index", "system:time_start","system:time_end"]);
}
exports.CMsk_S2K = function(image) { // untuk S2_SR mengggunakan band SCL (Level 2A)
  var qa = image.select('SCL'); // 4:Veg, 5:Bare, 6:Water; 7 :Unclas
  var mask = qa.expression('(qa <= 3 || qa > 7) ? 0:1',{qa:qa});
  return image.updateMask(mask)
  .copyProperties(image, ["system:index", "system:time_start","system:time_end"]);
}
exports.CMsk_S2 = function(image) { // untuk S2 mengggunakan band QA60 (Level 1C)
  var qa = image.select('QA60'); // QA 60 m ; Bayangan awan blm ada
  
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(Scld).select(BndS2a,Ren_BndS2)
  .copyProperties(image, ["system:index", "system:time_start","system:time_end"]);
}


exports.CMsk_L8b=function(image) { // untuk Landsat 8
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask)
  .copyProperties(image, ["system:index","system:time_start","system:time_end"]);
}

exports.CMask_L8=function(image) { // untuk Landsat 8
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select('pixel_qa');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask).divide(Scld).select(BndL8a,Ren_BndL8)
  .copyProperties(image, ["system:index","system:time_start","system:time_end"]);
}

// Index EVI,NDWI,NDBI
exports.AddBands_Idx = function(image){return AddBands_Idx(image); }   
function AddBands_Idx(image){ // Index EVI,NDWI,NDBI   
  var ndvi = image.normalizedDifference(['Nir', 'Red']).rename('NDVI').toFloat();
  var ndwi = image.normalizedDifference(['Green', 'Swir2']).rename('NDWI').toFloat();
  var mndwi = image.normalizedDifference(['Green', 'Swir1']).rename('MNDWI').toFloat();
  var ndbi = image.normalizedDifference(['Swir1', 'Nir']).rename('NDBI').toFloat();
  var evi = image.expression("(RED < NIR || BLUE < RED) ? L*2.5*((NIR-RED)/(L+NIR+6*RED-7.5*BLUE))"+
  ":L*1.5*((NIR-RED)/(L/2+NIR+RED))"
    ,{NIR: image.select('Nir'),RED: image.select('Red'),BLUE: image.select('Blue'),L: 1}).rename('EVI').toFloat();
  var Msk = ndvi.expression('(vi <= -1.0 || vi >= 1.0 || iv <= -1.0 || iv >= 1.0) ? 0:1',{vi:ndvi,iv:evi});
 // var bui = ndbi.subtract(evi).rename('BUI');
  return image.addBands(ndbi).addBands(evi).addBands(ndwi).addBands(ndvi).addBands(mndwi).updateMask(Msk); 
 }
 function JumArr(Arr1,Arr2) {
   return (Arr1 + ',' + Arr2).split(',');
 }
