Map.addLayer(Komposit_Img, visParams,'Komposit S1 Temporal Median',0);
visParams: {gamma: 1.3, min: 0, max: [0.37*Scld,0.53*Scld,0.17*Scld]
Komposit_Img = filtered.median();

filtered = S1

var S1 = ee.ImageCollection("COPERNICUS/S1_GRD")
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));

S1=S1.map(Koreksi_IncA).map(AddBands_S1);

function Koreksi_IncA(Img){
// Koreksi Sudut Inc Angle, utk Konversi Sigma -> GammaNut
var VV_Corr = Img.select('VV').subtract(Img.select('angle').multiply(Math.PI/180.0).cos().
log10().multiply(10.0)).rename('VVc').toFloat();
var VH_Corr = Img.select('VH').subtract(Img.select('angle').multiply(Math.PI/180.0).cos().
log10().multiply(10.0)).rename('VHc').toFloat() ;  
//var DP = VV_Corr.subtract(VH_Corr).rename('DP'); // Diff Polarization
return Img.addBands(VV_Corr).addBands(VH_Corr) ; 
}

function AddBands_S1(Img) { // API,RPI,NDPI
var DP = Img.expression('(v-h)',{v:Img.select('VVc'),h:Img.select('VHc')}).rename('DP'); // Diff Polarization
Img=Img.addBands(DP) ; Img=Img.select(['VVc','VHc','DP'],['VV','VH','DP']);
var VV_Int = Img.expression('10**(v/10)',{v:Img.select('VV')}).rename('VV_Int').toFloat();
var VH_Int = Img.expression('10**(h/10)',{h:Img.select('VH')}).rename('VH_Int').toFloat();
var RPI = VH_Int.divide(VV_Int).toFloat().rename('RPI');
// Average of Radar Polarization : API
//  var API = (VV_Int.pow(2)+VH_Int.pow(2)).sqrt().rename('API')  
//  var API = (VV_Int.multiply(VV_Corr).add(VH_Int.multiply(VH_Iny))).pow(0.5).divide(2).rename('API');
var API = (VV_Int.add(VH_Int)).divide(2).rename('API');   
// Normalize Diff -> Water / Moist detection 
var NDPI = ((VV_Int.subtract(VH_Int)).divide((VV_Int.add(VH_Int)))).toFloat().rename('NDPI');
return Img.addBands(API).addBands(RPI).addBands(NDPI);
}
