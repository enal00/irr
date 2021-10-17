Set_Map(2,S2.map(CMsk.CMsk_S2K).median().select(CMsk.Bnd_Optis()).clip(rect_di_rentang),VisRGB_NCC_Mos,'RGB NCC S2 Mosaik ' + TglS_S2 + ' to ' + TglE_S2);

#S2
S2=Data_S2.Data

#Data_S2
Data_S2=ImgCol(Point,TglR,'S2k')
Point = ee.Geometry.Point([108.2871,-6.4691]);//rect_di_rentang
TglR = [2020-10-15,2021-10-15]//input GUI long lat] //.filterDate(Tgl_R[0],Tgl_R[1])
Img_Id='COPERNICUS/S2_SR';

#CMsk.CMsk_S2K //SCL yang nilainya di luar 4:Veg, 5:Bare, 6:Water; 7 :Unclas jadi nol  (mask) 4-7 >> 1
exports.CMsk_S2K = function(image) { // untuk S2_SR mengggunakan band SCL (Level 2A)
  var qa = image.select('SCL'); // 4:Veg, 5:Bare, 6:Water; 7 :Unclas
  var mask = qa.expression('(qa <= 3 || qa > 7) ? 0:1',{qa:qa});
  return image.updateMask(mask)  
  .copyProperties(image, ["system:index", "system:time_start","system:time_end"]);

exports.CMsk_S2 = function(image) { // untuk S2 mengggunakan band QA60 (Level 1C)
  var qa = image.select('QA60'); // QA 60 m ; Bayangan awan blm ada
  
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(Scld).select(BndS2a,Ren_BndS2)
  .copyProperties(image, ["system:index", "system:time_start","system:time_end"]);
}

#Div10K_S2k
function Div10K_S2k(image) {
  var opticalBands = image.select('B.*').divide(10000).toFloat();
  return image.addBands(opticalBands, null, true)

#RenBndS2
exports.RenBndS2 = function(Img) {
  return Img.select(BndS2a,Ren_BndS2);
BndS2a = ['B1','B2','B3', 'B4','B5','B6', 'B7','B8A','B8', 'B11','B12','SCL'];
Ren_BndS2 = ['UBlue','Blue','Green', 'Red','RdE1','RdE2','RdE3','RdE4', 'Nir','Swir1','Swir2','SCL']

#AddBands_Idx
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


#Median
ee.ImageCollection.median()
#CMsk.Bnd_Optis()
Bnd_Optis = JumArr(BndSpc,Bnd_Idx);
 function JumArr(Arr1,Arr2) {
   return (Arr1 + ',' + Arr2).split(',');
BndSpc=['UBlue','Blue','Green','Red','Nir','Swir1','Swir2']
Bnd_Idx = ['NDBI','EVI','NDWI']

#Clipping
Img.clip(rect_di_rentang)
#VisRGB_NCC_Mos
VisRGB_NCC_Mos = {min:[0.05,0.03,0.05],max:[0.28,0.34,0.14],bands:['Swir1','Nir','Green'] };

#ImgCol
function ImgCol(Bounds,Tgl_R,Opsi) {
  var JumLst,LstImgs,LstTgl,Data,Img_Id;
  if(Opsi=='S2k')Img_Id='COPERNICUS/S2_SR';
  else if(Opsi=='L8')Img_Id='LANDSAT/LC08/C02/T1_L2';
  else if(Opsi=='S1')Img_Id='COPERNICUS/S1_GRD';
  else Img_Id = Opsi;
  Data= ee.ImageCollection(Img_Id).filterBounds(Bounds);
  if(Opsi=='S2k') Data=Data.map(Div10K_S2k).map(CMsk.RenBndS2).map(CMsk.AddBands_Idx);
  if(Opsi=='L8') Data=Data.map(applyScaleFactors).map(CMsk.RenBndL8b).map(CMsk.AddBands_Idx);
  if(Opsi=='S1') Data=S1_Indo.filterBounds(Bounds);
  if(Tgl_R !=='' || Tgl_R  > 0 ) Data = Data.filterDate(Tgl_R[0],Tgl_R[1]);  else Data = Data;
  Data = Data.sort('system:time_start') ; JumLst = JumEl(Data); LstImgs = Lst_Imgs(Data);
  return {Data:Data,JumLst:JumLst,LstImgs:LstImgs};
}

#Div10K_S2k
function Div10K_S2k(image) {
  var opticalBands = image.select('B.*').divide(10000).toFloat();
  return image.addBands(opticalBands, null, true)

#RenBndS2
exports.RenBndS2 = function(Img) {
  return Img.select(BndS2a,Ren_BndS2);

#BndS2a, Ren_BndS2 
BndS2a = ['B1','B2','B3', 'B4','B5','B6', 'B7','B8A','B8', 'B11','B12','SCL'];
Ren_BndS2 = ['UBlue','Blue','Green', 'Red','RdE1','RdE2','RdE3','RdE4', 'Nir','Swir1','Swir2','SCL'],

#AddBands_Idx
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


#Point
Point = SH_Sri_Point;
Point = ee.Geometry.Point([107.6352944,-6.31700999]);

#SH_Sri_Point
SH_Sri_Point = Kords2Geom(SH_Sri_Kord,'Point');
SH_Sri_Point = ee.Geometry.Point([107.6352944,-6.31700999]);

#Kords2Geom
function Kords2Geom(Kord,Opsi,Rad) {
    var Feat; if(Opsi== 'Point')Feat = ee.Geometry.Point(Kord);
    if(Opsi=='Rec')Feat = ee.Geometry.Rectangle(Kord);
    if(Opsi=='Buf')Feat = (ee.Geometry.Point(Kord)).buffer(Rad);
    return Feat;
  }

#SH_Sri_Kord
SH_Sri_Kord=[107.6352944,-6.31700999]

#TglR
TglR = (TB_SD.getValue()).split(',');

#TB_SD
TB_SD = TB_SD = ui.Textbox


function Set_Map(No,Obj,Vis,Ket,Opsi,Opac) {
return Map.layers().set(No, ui.Map.Layer(Obj, Vis,Ket,Opsi,Opac));

#CMsk.CMsk_S2K //SCL yang nilainya di luar 4:Veg, 5:Bare, 6:Water; 7 :Unclas jadi nol  (mask) 4-7 >> 1
exports.CMsk_S2K = function(image) { // untuk S2_SR mengggunakan band SCL (Level 2A)
  var qa = image.select('SCL'); // 4:Veg, 5:Bare, 6:Water; 7 :Unclas
  var mask = qa.expression('(qa <= 3 || qa > 7) ? 0:1',{qa:qa});
  return image.updateMask(mask)  
  .copyProperties(image, ["system:index", "system:time_start","system:time_end"]);
}

#CMsk.Bnd_Optis()
Bnd_Optis = JumArr(BndSpc,Bnd_Idx);
 function JumArr(Arr1,Arr2) {
   return (Arr1 + ',' + Arr2).split(',');
BndSpc=['UBlue','Blue','Green','Red','Nir','Swir1','Swir2']
Bnd_Idx = ['NDBI','EVI','NDWI']

//kok ada band optis di 'COPERNICUS/S2_SR'

#VisRGB_NCC_Mos
VisRGB_NCC_Mos = {min:[0.05,0.03,0.05],max:[0.28,0.34,0.14],bands:['Swir1','Nir','Green'] };