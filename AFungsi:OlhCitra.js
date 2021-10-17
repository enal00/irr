// Fungsi2 Olah Citra
// created by Dr Ir Dede Dirgahayu; Pusfatja; LAPAN
// List Fungsi :

exports.FiltData = function(Sat,TglRange,AOI) {return FiltData(Sat,TglRange,AOI); } 
function FiltData(Sat,TglRange,AOI) { 
var Id,ImgCol,Tgl2 ;
if (Sat == 'L8k') Id = 'LANDSAT/LC08/C01/T1_SR/' ;
if (Sat == 'S2t') Id = 'COPERNICUS/S2/' ;
if (Sat == 'S2k') Id = "COPERNICUS/S2_SR/";
if (Sat == 'S1k') Id = "COPERNICUS/S1_GRD/"; 
if (Sat == 'MOD09GQ') Id = "MODIS/006/MOD09GQ/";
if (Sat == 'MOD09GA') Id = "MODIS/006/MOD09GA/";
if (Sat == 'MOD09Q') Id = "MODIS/006/MOD09Q/";
if (Sat == 'MOD09A') Id = "MODIS/006/MOD09A/";
if (Sat == 'CHRP1')Id = 'UCSB-CHG/CHIRPS/DAILY/' ;
if (Sat == 'GSMAP')Id = 'JAXA/GPM_L3/GSMaP/v6/operational/';
ImgCol = ee.ImageCollection(Id);
if (AOI != 't' || AOI != 'T' || AOI !== '' ) ImgCol = ImgCol.filterBounds(AOI);
if (TglRange != 't' || TglRange != 'T' || TglRange !== '' ) ImgCol = ImgCol.filterDate(TglRange[0],TglRange[1]+'T15:00');
return ImgCol;
}
exports.GetImgCol=function(Img_Col,Idx){
  return Get_ImgCol(Img_Col,Idx);
}
function Get_ImgCol(Img_Col,Idx) {
  var List_Imgs = List_ImgCol(Img_Col);
  return ee.Image(List_Imgs.get(Idx))
  .copyProperties(List_Imgs.get(Idx),
  ['system:index','system:time_start','system:time_end']);
}
exports.ListImgCol = function(Img_Col) {
  return List_ImgCol(Img_Col);
}
function List_ImgCol(Img_Col) {
  var Jum = Jum_Dat(Img_Col,1);
  return Img_Col.toList(Jum);
}
exports.JumDat = function(Img_Arr,Opsi) {
return Jum_Dat(Img_Arr,Opsi);
  }
function Jum_Dat(Img_Arr,Opsi) {
  // Opsi : Array [ ] atw Object
  var Jum;
  if(Opsi == 'Arr' || Opsi ===0) Jum=ee.List(Img_Arr).length().getInfo();
  else Jum = Img_Arr.size().getInfo();
  return Jum;
}

// List Id Image Koleksi yg dipilih : ImggCol = LinkImg.filterDate()
function List_ImgCol(ImgCol) {
  return ImgCol.toList(ImgCol.size());
}
exports.ListImgId = function(ImgCol) { // Id Data
  var imageList = List_ImgCol(ImgCol);
  var id_list = imageList.map(function(item) {
  return (ee.Image(item).id());
});
return id_list;
};
exports.ListImgTgl = function(ImgCol) { // Id Data
  var imageList = List_ImgCol(ImgCol);
  var id_list = imageList.map(function(item) {
  return (ee.Image(item).date().format('YYYY-MM-dd HH:MM'));
});
return id_list;
}
exports.ImgToVis = function (Img,VisPar) {
  // Hasil Img dg Band : 'vis-red','vis-green','vis-blue'
  return Img.visualize(VisPar);
}
exports.GetImgId = function(Sat,ListImg,Idx) { // Get Img sesuai Id/Tgl stlh dilist dg Fungsi ListImg
if (Sat == 'MOD09GQ') Id = "MODIS/006/MOD09GQ/" + ListImg.get(Idx).getInfo();
if (Sat == 'MOD09GA') Id = "MODIS/006/MOD09GA/" + ListImg.get(Idx).getInfo();
if (Sat == 'MOD09Q') Id = "MODIS/006/MOD09Q/" + ListImg.get(Idx).getInfo();
if (Sat == 'MOD09A') Id = "MODIS/006/MOD09A/" + ListImg.get(Idx).getInfo();
if (Sat == 'L8k') Id = 'LANDSAT/LC08/C01/T1_SR/' + ListImg.get(Idx).getInfo();
if (Sat == 'S2') Id = 'COPERNICUS/S2/' + ListImg.get(Idx).getInfo();
if (Sat == 'S2k') Id = 'COPERNICUS/S2_SR/' + ListImg.get(Idx).getInfo();
if (Sat == 'S1') Id = 'COPERNICUS/S1_GRD/' + ListImg.get(Idx).getInfo();
if (Sat == 'CHRP1')Id = 'UCSB-CHG/CHIRPS/DAILY/' + ListImg.get(Idx).getInfo();
if (Sat == 'GSMAP')Id = 'JAXA/GPM_L3/GSMaP/v6/operational/' + ListImg.get(Idx).getInfo();
var Img = ee.Image(Id);
return Img;
};
exports.Pilih_S1 = function(date_range,PilBnd,AscDsc,Komp,Nama,Bound) {  
 // var L8_SR = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
   var S1 = ee.ImageCollection("COPERNICUS/S1_GRD")
  // .filter(date_range)
    .filterDate(date_range[0],date_range[1])
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
   // remove noise border
    .map(function(Img) { // Hilangkan Border Noise, biasanya nilai minimum
          var edge = Img.lt(-30.0);
          var maskedImage = Img.mask().and(edge.not());
          return Img.updateMask(maskedImage)
           .copyProperties(Img,['system:time_start','system:time_end']);
        })
    .map(function(img){
    // Koreksi Sudut Incd Angle
    var VV_Corr = img.select('VV').subtract(img.select('angle').multiply(Math.PI/180.0).cos().
    log10().multiply(10.0)).rename('VV').toFloat();
    var VH_Corr = img.select('VH').subtract(img.select('angle').multiply(Math.PI/180.0).cos().
    log10().multiply(10.0)).rename('VH').toFloat() ;
    var VV_VH = VV_Corr.select('VV').subtract(VH_Corr.select('VH')).rename('VV-VH');
    var VV_Int = VV_Corr.expression('10**(VV/10)',{VV : VV_Corr.select('VV')}).rename('VV_Int').toFloat();
    var VH_Int = VH_Corr.expression('10**(VH/10)',{VH : VH_Corr.select('VH')}).rename('VH_Int').toFloat();
    var RVH_VV = VH_Int.divide(VV_Int).toFloat().rename('RPI');
  //  var MVVVH = (VV_Corr.pow(2)+VH_Corr.pow(2)).sqrt().rename('MeanBS')  
   var MVVVH = (VV_Corr.add(VH_Corr)).divide(2).rename('API');
//    var MVVVH = (VV_Corr.multiply(VV_Corr).add(VH_Corr.multiply(VH_Corr))).pow(0.5).divide(2).rename('MeanBS');
      var NDPI = ((VV_Int.subtract(VH_Int)).divide((VV_Int.add(VH_Int)))).toFloat().rename('NDPI');
      return VV_Corr.addBands(VH_Corr).addBands(VV_VH).addBands(NDPI).addBands(RVH_VV).addBands(MVVVH)
       .copyProperties(img,['system:time_start','system:time_end']);
    })
    .select(PilBnd);
  if (AscDsc == 'ASC') S1.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
  else if (AscDsc == 'DSC') S1.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));
  else S1=S1; 
  if (Bound !== '' || Bound > 0 ) S1=S1.filterBounds(Bound); else S1=S1.filterBounds(Bts_Indo);
if (Komp !== '') {
if (Komp == 'MeanMed') S1 = S1.mean().focal_median();
else if (Komp == 'MedMed') S1 = S1.median().focal_median(); 
else if (Komp == 'MeanMod') S1 = S1.mean().focal_mode();
else if (Komp == 'MedMean') S1 = S1.median().focal_mean();  
else S1 = S1.mean().focal_mean();
}
  if (Nama !== '') S1 = S1.set('name',Nama);
  return S1.set('system:time_start',date_range[0]).set('system:time_end',date_range[1]);
};

// Temporal & Spatial Komposit . Utk temporal dimask awan dulu
exports.Komposit = function(Img,Komp,Filt_Spas,Tgl_R) { 
return Komp_ImgCol(Img,Komp,Filt_Spas,Tgl_R);
  }
function Komp_ImgCol(Img,Komp,Filt_Spas,Tgl_R) {
if (Komp !=='') {
      if (Komp == 'Mean')Img = Img.mean();
      else if (Komp == 'Med')Img = Img.median();
      else if (Komp == 'Max')Img = Img.max();
      else if (Komp == 'Min')Img = Img.min();
      else if (Komp == 'Qual')Img = Img.qualityMosaic('EVI'); // NDVI, NDWI, NDWI.etc
      else Img = Img.qualityMosaic('NDVI');
  }
if (Filt_Spas !=='') { // in kernel 3x3
      if (Filt_Spas == 'Mean')Img = Img.focal_mean();
      else if (Filt_Spas == 'Med')Img = Img.focal_median();
      else if (Filt_Spas == 'Max')Img = Img.focal_max();
      else if (Filt_Spas == 'Min')Img = Img.focal_min();
      else if (Filt_Spas == 'Mod')Img = Img.focal_mode();
      else Img = Img.focal_mode(); 
  }
var Tgls = ee.Date(Tgl_R[0]).format('YYYY-MM-dd'),
Tgle = ee.Date(Tgl_R[1] +'T15:00').format('YYYY-MM-dd HH:MM');
return Img.set('system:time_start',Tgls).set('system:time_end',Tgle);
  }
exports.Pilih_S1_Komp=function(S1,Komp) {
var S1_Kom = S1;
if (Komp !== '') {  
if (Komp == 'MeanMed') S1_Kom = S1.mean().focal_median();
else if (Komp == 'MedMed') S1_Kom = S1.median().focal_median();  
else if (Komp == 'MedMean') S1_Kom = S1.median().focal_mean();  
else S1_Kom = S1.mean().focal_mean();
}
return S1_Kom;
}
exports.RemNoBord = function(Img) {
var edge = Img.lt(-30.0);
var maskedImage = Img.mask().and(edge.not());
return Img.updateMask(maskedImage);
}
//Rename Bands
exports.Renbands = function(Img,Sat) {
var modisBands = ['sur_refl_b03','sur_refl_b04','sur_refl_b01',
                  'sur_refl_b02','sur_refl_b05','sur_refl_b06','sur_refl_b07'];
var SpecBands = ['Ublue','Blue','Green','Red','Nir','Mir','Swir1','Swir2']; // Untuk ganti nama band / Spektrum

var modBands500Pil = ['sur_refl_b03','sur_refl_b04','sur_refl_b05','sur_refl_b06','sur_refl_b07'];
var lsBands2 = ['blue','green','mir','swir1','swir2'];
var ModBands250 = ['sur_refl_b01','sur_refl_b02'];
var ModBands250_Nam = ['red','nir']; 
return Img.rename(SpecBands);
  
}

// CLOUD MASKING
// helper function to extract the QA bits
exports.getQABits = function(image, start, end, newName) {
 // Compute the bits we need to extract.
 var pattern = 0;
 for (var i = start; i <= end; i++) {
 pattern += Math.pow(2, i); // 8bit : 0000 0011 = 1*(2^0) + 1*(2^1) + 0*(2^2) + ...  
 }
 // Return a single band image of the extracted QA bits, giving the band
 // a new name.
 return image.select([0], [newName])
 .bitwiseAnd(pattern)
 .rightShift(start);
}
 
// A function to mask out cloudy pixels. -.> Deteksi Pixel Berawan Ref Modis 500m
exports.maskQuality = function(image) {
 // Select the QA band.
  var QA = image.select('StateQA');
 // Get the internal_cloud_algorithm_flag bit. 8-13 : Awan
 var internalQuality = getQABits(QA,8, 13, 'internal_quality_flag');
 // Return an image masking out cloudy areas.
 return image.updateMask(internalQuality.eq(0))
 //.select(modBands500Pil)
  ;
}
exports.maskQuality_250 = function(image) {
 // Select the QA 250m.
  var QA = image.select('State');
 // Get the internal_cloud_algorithm_flag bit. 8-13 : Awan
 var internalQuality = getQABits(QA,8, 13, 'internal_quality_flag').eq(0);
 // Return an image masking out cloudy areas.
 return image.updateMask(internalQuality); //Mask Awan 
}

exports.MskAwan_S2 = function(image) {
  var qa = image.select('QA60')

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0));

  // Return the masked and scaled data, without the QA bands.
  return image.updateMask(mask).divide(10000).toFloat()
      .select("B.*").addBands(qa)
      .copyProperties(image, ["system:time_start"]);
}
exports. MskAwan_S2k = function(image) {
  var qa = image.select('SCL');
/*
 1	ff0004	Saturated or defective
 2	868686	Dark Area Pixels
 3	774b0a	Cloud Shadows
 4	10d22c	Vegetation
 5	ffff52	Bare Soils
 6	0000ff	Water
 7	818181	Clouds Low Probability / Unclassified
 8	c0c0c0	Clouds Medium Probability
 9	f1f1f1	Clouds High Probability
10	bac5eb	Cirrus
11	52fff9	Snow / Ice  
*/  
  var mask = qa.expression("(q <= 3 || q >= 7) ? 0:1",{q : qa});
  qa = qa.updateMask(mask);
  return image.updateMask(mask).divide(10000).toFloat()
      .select("B.*")
      .addBands(qa)
      .copyProperties(image, ["system:time_start"]);
}
exports.PilSCL = function(S2,Lc) {
  // Lc : 4,5,6 Veg,Bare,Water
var Img= S2.select('SCL');
var Mask = Img.expression("(q == Lc) ? Lc:0",{q : Img,Lc:Lc});
Img = Img.mask(Mask);
  return Img;
}
exports.NoPilSCL = function(S2,Lc) {
  // Lc : 4,5,6 Veg,Bare,Water
var Img= S2.select('SCL');
var Mask = Img.expression("(q == Lc) ? 0:q",{q : Img,Lc:Lc});
 Img = Img.mask(Mask);
  return Img;
}
// AddIdx 
 exports.AddIdx_S2=function(Img) {
  var ndbi = Img.normalizedDifference(['B11', 'B8']).rename('NDBI').toFloat();
  var ndvi = Img.normalizedDifference(['B8', 'B4']).rename('NDVI').toFloat();
   var evi = Img.expression("(RED < NIR || BLUE < RED) ? 2.5*((NIR-RED)/(L+NIR+6*RED-7.5*BLUE))" + 
  ":1.5*((NIR-RED)/(L/2+NIR+RED))"
  ,{NIR: Img.select('B8'),RED: Img.select('B4'),BLUE: Img.select('B2'),L : 1}).rename('EVI').toFloat();
 var ndwi = Img.normalizedDifference(['B3', 'B12']).rename('NDWI').toFloat();
  var Msk = evi.expression("(IV >= 1.0 || IV <= -1.0 || VI >= 1.0 || VI <= -1.0) ? 0:1",{IV : evi,VI : ndvi});
  ndbi = ndbi.updateMask(Msk); ndvi = ndvi.updateMask(Msk);
  ndwi = ndwi.updateMask(Msk); evi = evi.updateMask(Msk);
  return Img.addBands(ndbi).addBands(evi).addBands(ndwi).addBands(ndvi);
}
exports.AddIdx_S2_Scld=function(Img) {
  var ndbi = Img.normalizedDifference(['B11', 'B8']).rename('NDBI').toFloat();
  var ndvi = Img.normalizedDifference(['B8', 'B4']).rename('NDVI').toFloat();
   var evi = Img.expression("(RED < NIR || BLUE < RED) ? 2.5*((NIR-RED)/(L+NIR+6*RED-7.5*BLUE))" + 
  ":1.5*((NIR-RED)/(L/2+NIR+RED))"
  ,{NIR: Img.select('B8'),RED: Img.select('B4'),BLUE: Img.select('B2'),L : 10000}).rename('EVI').toFloat();
 var ndwi = Img.normalizedDifference(['B3', 'B12']).rename('NDWI').toFloat();
  var Msk = evi.expression("(IV >= 1.0 || IV <= -1.0) ? 0:1",{IV : evi});
  ndbi = ndbi.updateMask(Msk); ndvi = ndvi.updateMask(Msk);
  ndwi = ndwi.updateMask(Msk); evi = evi.updateMask(Msk);
  return Img.addBands(ndbi).addBands(evi).addBands(ndvi).addBands(ndwi);
}
 exports.addBands_Idx = function(image){ // Index EVI,NDWI,NDBI x 10000 dijadikan Int16Bit
  var ndvi = image.normalizedDifference(['nir', 'red']).multiply(10000).rename('NDVI');
  var ndwi = image.normalizedDifference(['green', 'swir2']).multiply(10000).rename('NDWI');
  var ndbi = image.normalizedDifference(['swir1', 'nir']).multiply(10000).rename('NDBI');
  var evi = image.expression("(RED < NIR || BLUE < RED) ? L*2.5*((NIR-RED)/(L+NIR+6*RED-7.5*BLUE))"+
  ":L*1.5*((NIR-RED)/(L/2+NIR+RED))"
    ,{NIR: image.select('nir'),RED: image.select('red'),BLUE: image.select('blue'),L: 10000}).rename('EVI');
  var Msk = ndvi.expression('(vi <= -1.0 || vi >= 1.0) ? 0:1');
  return image.addBands(ndbi).addBands(evi).addBands(ndvi).addBands(ndwi).updateMask(Msk).toInt16(); 
 }

exports.Resampling = function(Img,Metod,EPSG,Sc) { // resampling Res 500m jdi 250m 
   if (EPSG === '') EPSG = 'EPSG:4326'; 
   if (Metod === '') Metod = 'bilinear' ; // 'cubic'   
   if (Metod === 'cub') Metod = 'bicubic' ;
   Img.resample(Metod).reproject({
  crs: ee.Projection(EPSG),scale: Sc}); 
    return Img; }
exports.ReProjImg = function(Img,EPSG,Sc) {
 if (EPSG === '') EPSG = 'EPSG:4326';    
 return Img.reproject(ee.Projection(EPSG),null,Sc);
}
exports.GetRectPoly=function(Poly) {
// utk import shp blm bisa
  var listCoords = ee.Array.cat(Poly.coordinates(), 1); 

// get the X-coordinates
var xCoords = listCoords.slice(1, 0, 1); print('xCoords', xCoords);
var yCoords = listCoords.slice(1, 1, 2); print('yCoords', yCoords);

// reduce the arrays to find the max (or min) value
var xMin = xCoords.reduce('min', [0]).get([0,0]); print('xMin',xMin);
var xMax = xCoords.reduce('max', [0]).get([0,0]); print('xMax',xMax);
var yMin = yCoords.reduce('min', [0]).get([0,0]); print('yMin',yMin);
var yMax = yCoords.reduce('max', [0]).get([0,0]); print('yMax',yMax);
var Rect = ee.Geometry.Rectangle([xMin,yMin,xMax,yMax]);
var Cent = Rect.centroid();
return Rect;
}
exports.DetFase1_S2=function(Img,BI,EVI,WI,dIV,Tgl) {
  // Deteksi Fase berdasarkan EVI,perunahan EVI,NDBI & NDWI
  var Fase = Img.expression (
    "(iv == 0) ? 0 :" + // Mask
    "(iv <=0.12 && wi >=0) ? 1 : " + // Air
    "(iv > 0.12 && iv <= 0.33 && bi >=0) ? 6 : "  + // Bera
    "( iv <= 0.33 && wi < 0) ? 7 : "  + // Pemukiman
    "(iv > 0.12 && div >= 0 && div <=0.11 ) ? 2 : " +
    "(iv > 0.12 && div > 0.11 ) ? 3 : " +
    "(iv > 0.12 && div >= -0.11 && div < 0) ? 4 :" +
    "(iv > 0.12 && div < -0.11 ) ? 5 : 8",
    {iv : Img.select(EVI),wi : Img.select(WI),
    bi : Img.select(BI),div : Img.select(dIV),
      }
    );
    return Fase.toByte().rename('Fase_' + Tgl);
}
exports.DetFase_S1=function(Img,VH,RPI,MBS,dPI,Tgl) {
  // Deteksi Fase berdasarkan EVI,perunahan EVI,NDBI & NDWI
  var Fase = Img.expression (
    "(iv <=0.14 && (wi >=11 || vh <= -24)) ? 1 : " + // Air
    "(iv > 0.14 && iv <= 0.21 && (wi < 11 or vh > -13)) ? 6 : "  + // Bera
    "( iv > 0.14 && (wi < 6 || vh > -11)) ? 6 : "  + // Pemukiman (7)
    "(iv > 0.15 && div >= 0 && div <=0.11 && vh > -24 ) ? 2 : " + // Veg 1
    "(iv > 0.15 && div > 0.11 && vh > -24 ) ? 3 : " + // Veg 2
    "(iv > 0.15 && div >= -0.05 && div < 0) ? 4 :" + // Gen1
    "(iv > 0.25 && div >= 0 && wi <11) ? 4 :" + // Gen 1 yg RPI tinggi
    "(iv > 0.25 && div < 0 && wi < 11) ? 5 : 7",
    {iv : Img.select(RPI),wi : Img.select(MBS),
    div : Img.select(dPI),vh : Img.select(VH)
      }
    );
    return Fase.toByte().rename('Fase_' + Tgl);
}

exports.TS_StkIdx = function(Th1,Th2,Satelit,PilBnd) {
  /* Buat time series (TS) utk hit Statistik EVI S2 atw RPI S1 
  atw band lain pd par PilBnd Multitemporal
  Statistik yg dihitung : Mean,Max,Min,Median,Range,Std (Metrik) utk Deteksi tanaman
  Periode yg dihitung : Padi/Jagung 5-6 bln sblmnya, Tebu 12 bln
  */
 var S2_SR = ee.ImageCollection("COPERNICUS/S2_SR"),
 S2 = ee.ImageCollection("COPERNICUS/S2");
  var TS_Stk,Tgl1,Tgl2,Cek,IdxBnd,Tgl_Range ;
  Tgl1 = Th1; Tgl2=Th2;
 // Cek = Th1.split('-'); // Cek apakah filter waktu hy th aj atw lengkap dg bulan & tgl
 // if ((Cek.size().getInfo()) == 1) { Tgl1 = Th1 + '-01-01' ; Tgl2 = Th2 + '-12-31' }  
//  else { Tgl1 = Th1; Tgl2=Th2; }
  Tgl_Range = ee.Filter.date(Tgl1,Tgl2);
  if (Satelit == 'S2') {
  IdxBnd = S2_SR.filter(Tgl_Range).map(MskAwan_S2k).map(AddIdx_S2).select(PilBnd);
  }
  if (Satelit == 'S2k') {
  IdxBnd = S2_SR.filter(Tgl_Range).map(MskAwan_S2k).map(AddIdx_S2).select(PilBnd);
  }
  if (Satelit == 'S1') {
  IdxBnd = Pilih_S1_Komp(Pilih_S1(Tgl_Range,'VH/VV','DSC'),'MeanMed');
  }
  TS_Stk = ee.Image.cat(
    IdxBnd.select(PilBnd).mean().rename('Mean'), IdxBnd.select(PilBnd).max().rename('Max'), 
    IdxBnd.select(PilBnd).min().rename('Min'),IdxBnd.select(PilBnd).median().rename('Med'),
    IdxBnd.select(PilBnd).max().subtract(IdxBnd.select(PilBnd).min()).rename('Range')
    );
  
return TS_Stk; 
}

// Tan Padi: EVI Mean :0.203-0.295,Max > 0.4,Min < 0.042, Med:0.2-0.73,Range : 0.35 -0.54
//           RPI Mean :0.169-0.236,Max:0.188-0.253,Min: 0.137-0.237,Med:0.167-0.237,Range : 0.04 - 0.085    
exports.DetPadi_S2 = function(Img) { // Sawah Tadah Hujan EVI_Min Irigasi: 0.188, 0.31
var Padi = Img.expression (
  "(EVI_Min <= 0.31 && EVI_Max >= 0.35 && EVI_Range >= 0.15 && EVI_Mean > 0.203 && EVI_Mean <= 0.8) ? 1:0"
 ,{EVI_Min : Img.select('EVI_Min'),EVI_Max : Img.select('EVI_Max'), 
   EVI_Mean : Img.select('EVI_Mean'),EVI_Range : Img.select('EVI_Range')
 }
  );
  return Padi.rename('Padi').toByte();
}
exports.DetPadi_S1 = function(Img) {
var Padi = Img.expression (
  "(Min <= 0.187 && Max >= 0.221 && Range >= 0.06 && Mean > 0.169  && Mean <= 0.236) ? 1:0"
 ,{EVI_Min : Img.select('RPI_Min'),EVI_Max : Img.select('RPI_Max'), 
   EVI_Mean : Img.select('RPI_Mean'),EVI_Range : Img.select('RPI_Range')
 }
  );
  return Padi.rename('Padi').toByte();
}
exports.Reklas = function (Img,Itv,Bb) {// Reklas umur dg interval Itv (3-5 th)
  var Kls1 = (Img.subtract(Bb)).divide(Itv).ceil().add(1).rename('EVI_Max_Kls').toByte();
  var Kls = Img.expression(
    "(IV <= Bb)? 1:Kls1",{IV:Img.select('EVI_Max'),Kls1:Kls1,Bb:Bb}
  );
  return Kls;
}
// Tan Padi: EVI Mean :0.203-0.295,Max > 0.4,Min < 0.042, Med:0.2-0.73,Range : 0.35 -0.54
//           RPI Mean :0.169-0.236,Max:0.188-0.253,Min: 0.137-0.237,Med:0.167-0.237,Range : 0.04 - 0.085    

exports.DetPadi_S2 = function (Img,Mean,Max,Min,Range,Tgl) { // Sawah Tadah Hujan EVI_Min Irigasi: 0.188, 0.31
// S2 TOA
var Padi = Img.expression (
  // Batas Min dilebihkan agar Sawah yg non Irigasi & non padi terdeteksi
  "(EVI_Min <= 0.31 && EVI_Max >= 0.35 && EVI_Range >= 0.15 && EVI_Mean > 0.203 && EVI_Mean <= 0.8) ? 1:0"
 ,{EVI_Min : Img.select(Min),EVI_Max : Img.select(Max), 
   EVI_Mean : Img.select(Mean),EVI_Range : Img.select(Range)
 }
  );
  return Padi.rename('Padi_' + Tgl).toByte();
}


  exports. MskAwan_L8 = function(image) { // Utk Landsat 8
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = 1 << 3;
  var cloudsBitMask = 1 << 5;

  // Get the pixel QA band.
  var qa = image.select('pixel_qa');

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));

  // Return the masked image, scaled to TOA reflectance, without the QA bands.
   return image.updateMask(mask).divide(10000) // Reflektan dijadikan 0-1
  //   return image.updateMask(mask)  // Scaled Reflektan 0-10000
      .select("B[0-9]*") // Pilih Band Reflektan 1-7, and Suhu Brightness B10,B11 (dlm K, dikali 10)
      .copyProperties(image, ["system:time_start"]);
}
exports.AddIdx_L8 = function(image){ // LS 8
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  var ndwi = image.normalizedDifference(['B3', 'B7']).rename('NDWI');
  var ndbi = image.normalizedDifference(['B6', 'B5']).rename('NDBI');
  var ILT =  image.select('B6').divide(image.select('B5')).rename('ILT'); // Indeks Lahan Terbuka
  var evi = image.expression("(RED < NIR || BLUE < RED) ? 2.5*((NIR-RED)/(L+NIR+6*RED-7.5*BLUE))"+
  ": 1.5*((NIR-RED)/(L/2+NIR+RED))"
    ,{NIR: image.select('B5'),RED: image.select('B4'),BLUE: image.select('B2'),L : 1}).rename('EVI');
  var msavi2 = image.expression(
  '(2 * NIR + 1 - sqrt(pow((2 * NIR + 1), 2) - 8 * (NIR - RED)) ) / 2', 
  {'NIR': image.select('B5'), 'RED': image.select('B4')
  }).rename('MSAVI');  
    var Msk = evi.expression("(vi <= -1.0 || vi >= 1.0) ? 0:1",{vi : evi.select('EVI')});
    evi = evi.updateMask(Msk); ndwi = ndwi.updateMask(Msk);
    ndbi = ndbi.updateMask(Msk); ILT = ILT.updateMask(Msk);
    ndvi = ndvi.updateMask(Msk); msavi2=msavi2.updateMask(Msk);
    return image.addBands(ndvi).addBands(ndbi).addBands(evi).addBands(ndwi)
            .addBands(msavi2).addBands(ILT).toFloat(); 
 
}
// Daftar Image Koleksi yg dipilih
exports.ListImgId = function(ImgCol) { // Id Data
  var imageList = ImgCol.toList(ImgCol.size());
  var id_list = imageList.map(function(item) {
  return ee.Image(item).id();
});
return id_list;
}
exports.KorIncAngl = function(Img){
var VV_Corr = Img.select('VV').subtract(Img.select('angle').multiply(Math.PI/180.0).cos().
    log10().multiply(10.0)).rename('VV_Cor').toFloat();
var VH_Corr = Img.select('VH').subtract(Img.select('angle').multiply(Math.PI/180.0).cos().
    log10().multiply(10.0)).rename('VH_Cor').toFloat() ;
 return Img.addBands(VH_Corr).addBands(VV_Corr);
 };

exports.RefinedLee = function(img) {
  // img must be in natural units, i.e. not in dB!
  // Set up 3x3 kernels 
//var NmBnd = img.get('bandNames').getInfo();
  // convert to natural.. do not apply function on dB!
//  var myimg = toNatural(img);
 var myimg = ee.Image(10).pow(img.divide(10));
// var myimg2 = toNatural(img.select('VH'));
  var weights3 = ee.List.repeat(ee.List.repeat(1,3),3);
  var kernel3 = ee.Kernel.fixed(3,3, weights3, 1, 1, false);

  var mean3 = myimg.reduceNeighborhood(ee.Reducer.mean(), kernel3);
  var variance3 = myimg.reduceNeighborhood(ee.Reducer.variance(), kernel3);

  // Use a sample of the 3x3 windows inside a 7x7 windows to determine gradients and directions
  var sample_weights = ee.List([[0,0,0,0,0,0,0], [0,1,0,1,0,1,0],[0,0,0,0,0,0,0], [0,1,0,1,0,1,0], [0,0,0,0,0,0,0], [0,1,0,1,0,1,0],[0,0,0,0,0,0,0]]);

  var sample_kernel = ee.Kernel.fixed(7,7, sample_weights, 3,3, false);

  // Calculate mean and variance for the sampled windows and store as 9 bands
  var sample_mean = mean3.neighborhoodToBands(sample_kernel); 
  var sample_var = variance3.neighborhoodToBands(sample_kernel);

  // Determine the 4 gradients for the sampled windows
  var gradients = sample_mean.select(1).subtract(sample_mean.select(7)).abs();
  gradients = gradients.addBands(sample_mean.select(6).subtract(sample_mean.select(2)).abs());
  gradients = gradients.addBands(sample_mean.select(3).subtract(sample_mean.select(5)).abs());
  gradients = gradients.addBands(sample_mean.select(0).subtract(sample_mean.select(8)).abs());

  // And find the maximum gradient amongst gradient bands
  var max_gradient = gradients.reduce(ee.Reducer.max());

  // Create a mask for band pixels that are the maximum gradient
  var gradmask = gradients.eq(max_gradient);

  // duplicate gradmask bands: each gradient represents 2 directions
  gradmask = gradmask.addBands(gradmask);

  // Determine the 8 directions
  var directions = sample_mean.select(1).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(7))).multiply(1);
  directions = directions.addBands(sample_mean.select(6).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(2))).multiply(2));
  directions = directions.addBands(sample_mean.select(3).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(5))).multiply(3));
  directions = directions.addBands(sample_mean.select(0).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(8))).multiply(4));
  // The next 4 are the not() of the previous 4
  directions = directions.addBands(directions.select(0).not().multiply(5));
  directions = directions.addBands(directions.select(1).not().multiply(6));
  directions = directions.addBands(directions.select(2).not().multiply(7));
  directions = directions.addBands(directions.select(3).not().multiply(8));

  // Mask all values that are not 1-8
  directions = directions.updateMask(gradmask);

  // "collapse" the stack into a singe band image (due to masking, each pixel has just one value (1-8) in it's directional band, and is otherwise masked)
  directions = directions.reduce(ee.Reducer.sum());  

  var sample_stats = sample_var.divide(sample_mean.multiply(sample_mean));

  // Calculate localNoiseVariance
  var sigmaV = sample_stats.toArray().arraySort().arraySlice(0,0,5).arrayReduce(ee.Reducer.mean(), [0]);

  // Set up the 7*7 kernels for directional statistics
  var rect_weights = ee.List.repeat(ee.List.repeat(0,7),3).cat(ee.List.repeat(ee.List.repeat(1,7),4));

  var diag_weights = ee.List([[1,0,0,0,0,0,0], [1,1,0,0,0,0,0], [1,1,1,0,0,0,0], 
    [1,1,1,1,0,0,0], [1,1,1,1,1,0,0], [1,1,1,1,1,1,0], [1,1,1,1,1,1,1]]);

  var rect_kernel = ee.Kernel.fixed(7,7, rect_weights, 3, 3, false);
  var diag_kernel = ee.Kernel.fixed(7,7, diag_weights, 3, 3, false);

  // Create stacks for mean and variance using the original kernels. Mask with relevant direction.
  var dir_mean = myimg.reduceNeighborhood(ee.Reducer.mean(), rect_kernel).updateMask(directions.eq(1));
  var dir_var = myimg.reduceNeighborhood(ee.Reducer.variance(), rect_kernel).updateMask(directions.eq(1));
  dir_mean = dir_mean.addBands(myimg.reduceNeighborhood(ee.Reducer.mean(), diag_kernel).updateMask(directions.eq(2)));
  dir_var = dir_var.addBands(myimg.reduceNeighborhood(ee.Reducer.variance(), diag_kernel).updateMask(directions.eq(2)));

  for (var i=1; i<4; i++) {
    dir_mean = dir_mean.addBands(myimg.reduceNeighborhood(ee.Reducer.mean(), rect_kernel.rotate(i)).updateMask(directions.eq(2*i+1)));
    dir_var = dir_var.addBands(myimg.reduceNeighborhood(ee.Reducer.variance(), rect_kernel.rotate(i)).updateMask(directions.eq(2*i+1)));
    dir_mean = dir_mean.addBands(myimg.reduceNeighborhood(ee.Reducer.mean(), diag_kernel.rotate(i)).updateMask(directions.eq(2*i+2)));
    dir_var = dir_var.addBands(myimg.reduceNeighborhood(ee.Reducer.variance(), diag_kernel.rotate(i)).updateMask(directions.eq(2*i+2)));
  
  }

  // "collapse" the stack into a single band image (due to masking, each pixel has just one value in it's directional band, and is otherwise masked)
  dir_mean = dir_mean.reduce(ee.Reducer.sum());
  dir_var = dir_var.reduce(ee.Reducer.sum());

  // A finally generate the filtered value
  var varX = dir_var.subtract(dir_mean.multiply(dir_mean).multiply(sigmaV)).divide(sigmaV.add(1.0));
//var varX2 = dir_var2.subtract(dir_mean2.multiply(dir_mean2).multiply(sigmaV)).divide(sigmaV.add(1.0));
  var b = varX.divide(dir_var); // b2 = varX2.divide(dir_var2);

  var result = dir_mean.add(b.multiply(myimg.subtract(dir_mean)));
//  var Lee_VV = ee.Image(toDB(result.arrayGet(0))).rename('Img_Lee').toFloat();
var Lee = ee.Image(((result.arrayGet(0)).log10()).multiply(10.0)).rename('Img_Lee').toFloat();
 return((Lee));
};
exports.AddIdx_S1 = function(Img){
  var VH_VV = Img.select('VH_Cor').subtract(Img.select('VV_Cor')).rename('VH-VV');
  var VV_VH = Img.select('VV_Cor').subtract(Img.select('VH_Cor').multiply(0.75).toFloat()).rename('VV-VH');
var MeanVHVV = (Img.select('VH_Cor').add(Img.select('VV_Cor'))).divide(2.0).rename('MeanBS');
var NDPI = Img.expression("(10**(VV/10)-10**(VH/10))/(10**(VV/10)+10**(VH/10))",
{VV:Img.select('VV_Cor'),VH:Img.select('VH_Cor') }).toFloat().rename('NDPI');
NDPI = (NDPI.log10()).multiply(10).toFloat(); // NDPI dlm DB
var RPI = Img.expression("10**(VH/10)/(10**(VV/10))",
{VV:Img.select('VV_Cor'),VH:Img.select('VH_Cor') }).toFloat().rename('RPI');
return Img.addBands(VH_VV).addBands(VV_VH).addBands(MeanVHVV).addBands(NDPI).addBands(RPI);
};

exports.AddIdx_S1_lee = function(Img){
  var VH_VV = Img.select('VH_Lee').subtract(Img.select('VV_Lee')).rename('VH-VV');
  var VV_VH = Img.select('VV_Lee').subtract(Img.select('VH_Lee').multiply(0.75).toFloat()).rename('VV-VH');
var MeanVHVV = (Img.select('VH_Lee').add(Img.select('VV_Lee'))).divide(2.0).rename('MeanBS');
var NDPI = Img.expression("(10**(VV/10)-10**(VH/10))/(10**(VV/10)+10**(VH/10))",
{VV:Img.select('VV_Lee'),VH:Img.select('VH_Lee') }).toFloat().rename('NDPI');
NDPI = (NDPI.log10()).multiply(10); // NDPI dlm DB
var RPI = Img.expression("10**(VH/10)/(10**(VV/10))",
{VV:Img.select('VV_Lee'),VH:Img.select('VH_Lee') }).toFloat().rename('RPI');
return Img.addBands(VH_VV).addBands(VV_VH).addBands(MeanVHVV).addBands(NDPI).addBands(RPI);
};

exports.Slop3 = function(Img,Add) {
var Bnd = ee.List(Img.bandNames().getInfo()),BndNm=[];
var i,JumBnd = Bnd.length().getInfo();
for(i=0; i < JumBnd; i++) {
  BndNm[i]= Bnd.get(i).getInfo();
}
  var Jum = Img.select( BndNm[0]).add(Img.select( BndNm[1])).add(Img.select( BndNm[2]));
  var KovXY = Img.select(BndNm[0]).add(Img.select(BndNm[1]).multiply(2))
  .add(Img.select(BndNm[2]).multiply(3));
  var Slop = (KovXY.divide(2)).subtract(Jum).toFloat().rename('Slope');
  if(Add=='y') return Img.addBands(Slop); else return Slop;
};
exports.AddSlop3 = function(Img) {
var Bnd = ee.List(Img.bandNames().getInfo()),BndNm=[];
var i,JumBnd = Bnd.length().getInfo();
for(i=0; i < JumBnd; i++) {
  BndNm[i]= Bnd.get(i).getInfo();
}
  var Jum = Img.select( BndNm[0]).add(Img.select( BndNm[1])).add(Img.select( BndNm[2]));
  var KovXY = Img.select(BndNm[0]).add(Img.select(BndNm[1]).multiply(2))
  .add(Img.select(BndNm[2]).multiply(3));
  return Img.addBands((KovXY.divide(2)).subtract(Jum).toFloat().rename('Slope'));
};
exports.RePrj = function(Img,Sc) {
var proj = ee.Projection('EPSG:4326');
return  Img.reproject({
//crs: Img.projection(j).crs(),
crs: proj,
scale: Sc
});
};
exports.DetFase_S1 = function(Img,AirTh,BeraTh){
//Img : RPI=VH/VV dlm dB & Trend/Slop
var Fase = Img.expression(
  "(RPI <= AirTh) ? 1 : (RPI >= BeraTh) ? 6 :" +
  "(Slp >= 0 && Slp <= 0.1) ? 2 : (Slp > 0.1 && RPI <= 0.3 )?3" +
  "(Slp > 0.1 && RPI > 0.3) ? 4 : (Slp <= 0 && RPI <= 0.3 )?3" 
  
  )
  return Fase.rename('Fase').toByte();
}
exports.Det1Fase_S1 = function(Img,BSlp,Air,Bera){
//Img : RPI=VH/VV dlm dB & BSlp : Band Trend/Slop atw dPI
// Air : RPI < -6.82, VH < -20 ; Bera : RPI > -5, VV > -10
var VH = Img.select('VH-VV').add(Img.select('VV_Cor'));
var Fase = Img.expression(
  "(VH <= Air) ? 1 : (VH >= Bera) ? 6 :" +
 // "(Slp >= 0 & RPI >-14.64  && RPI <= -8.13) ? 2 :"+
  "(Slp >= 0 & VH > Air  && RPI <= -8.13) ? 2 :"+
  "(Slp >= 0 & RPI > -8.13 && RPI <= -6.46) ? 3 :"+
  "(Slp >= 0 && RPI > -6.46) ? 4 :"+
  "(Slp < 0 && RPI > -7.56)? 5 : " +
  "(Slp < 0 && RPI <= -8.43)? 1 : " +
  "(Slp < 0 && RPI > -8.43 && RPI <= -7.56)? 2 : 7", 
  {RPI : Img.select('VH-VV'),Air:Air,Bera:Bera, Slp:Img.select(BSlp),
    VH : VH} 
   )
  return Fase.rename('Fase').toByte();
}
exports.Det2Fase_S1 = function(Img,BSlp,Air,Bera){
//Img : RPI=VH/VV dlm dB & BSlp : Band Trend/Slop atw dPI
// Air : RPI < -6.82, VH < -20 ; Bera : RPI > -5, VV > -10
//var VH = Img.select('VH-VV').add(Img.select('VV_Lee'))
var Fase = Img.expression(
  "(VH <= Air) ? 1 : (VH >= Bera) ? 6 :" +
  "(Slp >= 0 & RPI > -3.98 && RPI <= -8.13) ? 2 :"+
  "(Slp >= 0 & RPI > -8.13 && RPI <= -6.46) ? 3 :"+
  "(Slp >= 0 && RPI > -6.46) ? 4 :"+
  "(Slp < 0 && RPI > -6.1)? 5 : 7", {
    RPI : Img.select('VH-VV'),Air:Air,Bera:Bera, Slp:Img.select(BSlp),
    VH : Img.select('VH_Cor')} 
   )
  return Fase.rename('Fase').toByte();
}
exports.AddTime = function(Img) {
  return Img.addBands(Img.metadata('system:time_start')
    .divide(1000 * 60 * 60 * 24 * 365));
}
exports.Trend3 = function(Img,BndY) { // BndY : 'EVI'
 return Img.select(['system:time_start', BndY])
   .reduce(ee.Reducer.linearFit());
}
exports.TrendRek = function(Trend) {
var Fase = Trend.expression('(sc > 0) ? 1 : (sc < 0) ? 2 : 3 ',
            {sc : Trend.select('scale')}).rename('Fase');
return Fase;
}
exports.DetFase_S2 = function(Img) {
 var Fase = Img.expression(
  "(VI == 0)? 0 : (Lc == 6 ) ? 1 :(Lc == 5 ) ? 6 :(Lc == 7 && VI <= 0.188 && WI >= 0 ) ? 1 :" +
"(Lc == 4 && Slp >=0 && Slp <= 0.1 ) ? 2 :(Lc == 4 && Slp > 0.1) ? 3 :" +
 "(Lc == 7 && BI >= 0 && VI > 0.188 ) ? 6 : (Lc == 7 && BI < 0 && VI > 0.188 ) ? 2 : " +
  "(Lc == 4 && Slp >=0 && Slp <= 0.1 ) ? 2 :(Lc == 4 && Slp > 0.1) ? 3 :" +
  "(Lc == 4 && Slp < 0 && Slp >= -0.1 ) ? 4 :(Lc == 4 && Slp < -0.1) ? 5 :7",
  {Lc : Img.select('SCL'),Slp:Img.select('Slope'),VI : Img.select('EVI'), 
    BI : Img.select('NDBI'),WI : Img.select('NDWI')
  }
    );
    return Fase.rename('Fase').toByte();
}
exports.Tab2Map_OutL=function(Tab,Tebal,Warna,KetLyr) {
  Map.addLayer(ee.Image().toByte().paint(Tab, 0, Tebal), {palette : Warna},KetLyr);
}

// STATISTIK IMAGE
exports.StkImg = function(Img,Sc,Reg) {
return Stk_Img(Img,Sc,Reg);
  
};
 function Stk_Img(Img,Sc,Reg) {
 var Redu_Mean = ee.Reducer.mean(),Redu_Std = ee.Reducer.stdDev(),
 Redu_MinMax = ee.Reducer.minMax();
 var Red_MeanStd = Redu_Mean.combine(
   ); 
  var Mean = Img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: Reg.geometry(),
      scale: Sc,
      maxPixels: 1e13
    });
 var Std = Img.reduceRegion({
      reducer: ee.Reducer.stdDev(),
      geometry: Reg.geometry(),
      scale: Sc,
      maxPixels: 1e13
    });
 var Min = Img.reduceRegion({
      reducer: ee.Reducer.min(),
      geometry: Reg.geometry(),
      scale: Sc,
      maxPixels: 1e13
    });
 var Max = Img.reduceRegion({
      reducer: ee.Reducer.max(),
      geometry: Reg.geometry(),
      scale: Sc,
      maxPixels: 1e13
    });
  var Med = Img.reduceRegion({
      reducer: ee.Reducer.median(),
      geometry: Reg.geometry(),
      scale: Sc,
      maxPixels: 1e13
    });
 var Stk = [Min,Max,Mean,Std,Med ];
 return Stk;   
}
exports.RedGab = function(Opsi){
  return Red_Gab(Opsi);
} 
exports.Red_Gab = function(Opsi) {
var minmaxReducer = ee.Reducer.minMax(),medReducer = ee.Reducer.median(),
sigmaReducer = ee.Reducer.stdDev(), meanReducer = ee.Reducer.mean(),
countReducer = ee.Reducer.count(),sumReducer = ee.Reducer.sum()
;
var MinMaxMed = minmaxReducer.combine({reducer2:medReducer,sharedInputs: true});
var MeanStd = meanReducer.combine({reducer2:sigmaReducer,sharedInputs: true});
var StkImgGab = MinMaxMed.combine({reducer2:MeanStd,sharedInputs: true});
var SumCountRed = sumReducer.combine({reducer2:countReducer,sharedInputs: true} );
if(Opsi==1) Stk_Redu = meanReducer; else if(Opsi==2) Stk_Redu = sigmaReducer;
else if(Opsi==3) Stk_Redu = sigmaReducer;
return StkImgGab;
}
exports.StkImgReg = function(Img,Sc,Reg) {
var minmaxReducer = ee.Reducer.minMax(),medReducer = ee.Reducer.median(),
sigmaReducer = ee.Reducer.stdDev(), meanReducer = ee.Reducer.mean(),
countReducer = ee.Reducer.count(),sumReducer = ee.Reducer.sum()
;
var MinMaxMed = minmaxReducer.combine({reducer2:medReducer,sharedInputs: true});
var MeanStd = meanReducer.combine({reducer2:sigmaReducer,sharedInputs: true});
var StkImgRed = MinMaxMed.combine({reducer2:MeanStd,sharedInputs: true});
var SumCount = sumReducer.combine({reducer2:countReducer,sharedInputs: true} );
var StkImg = Img.reduceRegions({
  collection:Reg,reducer: StkImgRed,scale:Sc
});
var Min = StkImg.get('constant_min').getInfo(),
Max = StkImg.get('constant_max').getInfo(),
Med = StkImg.get('constant_median').getInfo(),
Mean = StkImg.get('constant_mean').getInfo(),
Std =  StkImg.get('constant_stdDev').getInfo();
var ImgStk = [Min,Max,Med,Mean,Std];
return ImgStk;
};
exports.StkImgGeom=function(Img,Sc,Geom) {
var minmaxReducer = ee.Reducer.minMax(),medReducer = ee.Reducer.median(),
sigmaReducer = ee.Reducer.stdDev(), meanReducer = ee.Reducer.mean(),
countReducer = ee.Reducer.count(),sumReducer = ee.Reducer.sum()
;
var MinMaxMed = minmaxReducer.combine({reducer2:medReducer,sharedInputs: true});
var MeanStd = meanReducer.combine({reducer2:sigmaReducer,sharedInputs: true});
var StkImgGab = MinMaxMed.combine({reducer2:MeanStd,sharedInputs: true});
var SumCountRed = sumReducer.combine({reducer2:countReducer,sharedInputs: true} );

var StkImg = Img.reduceRegion({
  reducer: StkImgGab,bestEffort:true,scale:Sc, geometry:Geom
}); return StkImg;
}
exports.SumCountImg = function(Img,Sc) {
var countReducer = ee.Reducer.count(),sumReducer = ee.Reducer.sum();
var SumCount = sumReducer.combine({reducer2:countReducer,sharedInputs: true} );
var StkImg = Img.reduceRegion({
  reducer: SumCount,bestEffort: true,scale:Sc
});
var Sum = StkImg.get('constant_sum').getInfo(),
Count = StkImg.get('constant_count').getInfo();
var ImgStk = [Sum,Count];
return ImgStk;
};

exports.EktrakImgColPoint = function(ImgCol,TabPoint,Geom,RadBuf,Sc,Reducer) {
var Stk_Mean = TabPoint.map(function(f) {
  return ee.ImageCollection(ImgCol).map(function(i) {
    var mean = i.reduceRegion({
      geometry: f.geometry().buffer(RadBuf),
      //reducer: ee.Reducer.mean(),
      reducer: Reducer,scale: Sc,
    });
   // return f.setMulti(mean).set({date: i.date()})
    return f.setMulti(mean);
  });
});
};
exports.ParFase = function() {
// Parameter Fase
// Batas atas kelas Vegetatif 1 (40 HST) & Gen2 (96 HST)
// utk Landsat 8
var Ba1 = [0.285,0.271],Ba2 = [0.387,0.376],Ba3 = [0.394,0.297],
	Ba4 = [0.419,0.321],Ba5 = [0.430,0.398],Ba6 = [0.457,0.459],Ba7 = [0.465,0.505],
	Air = 0.167, Bera = 0.194, VIMx = [],VM1=0.45,VM2=0.5,VM3=0.55,VM4=0.6,
	VM5=0.65,VM6=0.7,VM7=0.99, Sat ;
Sat = 'S2' ; // Pilihan data : 'L8'= Landsat8 ; 'S2' = Sentinel2
// Batas utk Sentinel-2
var Sa1=[],Sa2=[],Sa3=[],Sa4=[],Sa5=[],Sa6=[],Sa7=[],Sa=[],Air2 = 0.18, Bera2=0.2;
// Kalibrasi EVI S2 jdi EVI LS8
for (i=0; i < 2; i++) {
Sa1[i]= (Ba1[i]-0.0545)/0.7743; Sa2[i]= (Ba2[i]-0.0545)/0.7743; Sa3[i]= (Ba2[i]-0.0545)/0.7743;
Sa4[i]= (Ba4[i]-0.0545)/0.7743; Sa5[i]= (Ba5[i]-0.0545)/0.7743; Sa6[i]= (Ba6[i]-0.0545)/0.7743;
Sa7[i]= (Ba7[i]-0.0545)/0.7743;
}
Sa = [Sa1,Sa2,Sa3,Sa4,Sa5,Sa6,Sa7]; // print(Sa);  print(Sa[6]);
var EVIMx = [],EVIMx2 = [] ;
for (i=0; i < 7; i++) {EVIMx[i]=0.45 +0.05*i } 
EVIMx[6] = 0.99;
for (i=0; i < 7; i++) {EVIMx2[i]= (EVIMx[i]-0.0545)/0.7743 } 
EVIMx2[6] = 0.99;print(EVIMx,EVIMx2); VIMx = EVIMx;
if (Sat == 'S2') {
  Ba1 = Sa1; Ba2 = Sa2; Ba3 = Sa3; Ba4 = Sa4;
  Ba5 = Sa5; Ba6 = Sa6; Ba7 = Sa7; VIMx = EVIMx2 ;
  
}
VM1=VIMx[0],VM2=VIMx[1],VM3=VIMx[2],VM4=VIMx[3],VM5=VIMx[4],VM6=VIMx[5],VM7=VIMx[6];
return Sa; 
}
exports.FaseOptik=function(Sat) {
  function RekFase(Img,Vi1,Vi2,LBS) {
// Img : stack(LBS,EVIMult4bln)
var Kls = Img.expression(
"(Vi2 <= Air ) ? 1 :" +
"(Vi2 > Air && Vi2 <= Bera) ? 6 :" +
"(Lbs == 1 && (Vi2-Vi1) >=0 && Vi2 > Bera && Vi2 <= V1_1 ) ? 2 :" +
"(Lbs == 1 && (Vi2-Vi1) >=0 && Vi2 > V1_1 && Vi2 <= Vm1 ) ? 3 :" +
"(Lbs == 1 && (Vi2-Vi1) < 0 && Vi2 > G2_1 && Vi2 < Vm1 ) ? 4 :" +
"(Lbs == 1 && (Vi2-Vi1) < 0 && Vi2 > Bera && Vi2 <= G2_1 ) ? 5 :" +
"(Lbs == 2 && (Vi2-Vi1) >=0 && Vi2 > Bera && Vi2 <= V1_2 ) ? 2 :" +
"(Lbs == 2 && (Vi2-Vi1) >=0 && Vi2 > V1_2 && Vi2 <= Vm2 ) ? 3:" +
"(Lbs == 2 && (Vi2-Vi1) < 0 && Vi2 > G2_2 && Vi2 < Vm2 ) ? 4:" +
"(Lbs == 2 && (Vi2-Vi1) < 0 && Vi2 > Bera && Vi2 <= G2_2 ) ? 5 :" + 
"(Lbs == 3 && (Vi2-Vi1) >=0 && Vi2 > Bera && Vi2 <= V1_3 ) ? 2 :" +
"(Lbs == 3 && (Vi2-Vi1) >=0 && Vi2 > V1_3 && Vi2 <= Vm3 ) ? 3:" +
"(Lbs == 3 && (Vi2-Vi1) < 0 && Vi2 > G2_3 && Vi2 < Vm3 ) ? 4:" +
"(Lbs == 3 && (Vi2-Vi1) < 0 && Vi2 > Bera && Vi2 <= G2_3 ) ? 5 :" + 
"(Lbs == 4 && (Vi2-Vi1) >=0 && Vi2 > Bera && Vi2 <= V1_4 ) ? 2 :" +
"(Lbs == 4 && (Vi2-Vi1) >=0 && Vi2 > V1_4 && Vi2 <=Vm4 ) ? 3:" +
"(Lbs == 4 && (Vi2-Vi1) < 0 && Vi2 > G2_4 && Vi2 < Vm4 ) ? 4:" +
"(Lbs == 4 && (Vi2-Vi1) < 0 && Vi2 > Bera && Vi2 <= G2_4 ) ? 5 :" + 
"(Lbs == 5 && (Vi2-Vi1) >=0 && Vi2 > Bera && Vi2 <= V1_5 ) ? 2 :" +
"(Lbs == 5 && (Vi2-Vi1) >=0 && Vi2 > V1_5 && Vi2 <= Vm5 ) ? 3:" +
"(Lbs == 5 && (Vi2-Vi1) < 0 && Vi2 > G2_5 && Vi2 < Vm5 ) ? 4:" +
"(Lbs == 5 && (Vi2-Vi1) < 0 && Vi2 > Bera && Vi2 <= G2_5 ) ? 5 :" + 
"(Lbs == 6 && (Vi2-Vi1) >=0 && Vi2 > Bera && Vi2 <= V1_6 ) ? 2 :" +
"(Lbs == 6 && (Vi2-Vi1) >=0 && Vi2 > V1_6 && Vi2 <= Vm6 ) ? 3:" +
"(Lbs == 6 && (Vi2-Vi1) < 0 && Vi2 > G2_6 && Vi2 < Vm6 ) ? 4:" +
"(Lbs == 6 && (Vi2-Vi1) < 0 && Vi2 > Bera && Vi2 <= G2_6 ) ? 5 :" + 
"(Lbs == 7 && (Vi2-Vi1) >=0 && Vi2 > Bera && Vi2 <= V1_7 ) ? 2 :" +
"(Lbs == 7 && (Vi2-Vi1) >=0 && Vi2 > V1_7 && Vi2 <= Vm7 ) ? 3:" +
"(Lbs == 7 && (Vi2-Vi1) < 0 && Vi2 > G2_7 && Vi2 < Vm7 ) ? 4:" +
"(Lbs == 7 && (Vi2-Vi1) < 0 && Vi2 > Bera && Vi2 <= G2_7 ) ? 5 : 7",  
{Vi1 : Img.select(Vi1),Vi2 : Img.select(Vi2),Lbs : Img.select(LBS),Air : 0.167, Bera : 0.194,
  V1_1 : Ba1[0],V1_2 : Ba2[0],V1_3 : Ba3[0],V1_4 : Ba4[0],V1_5 : Ba5[0],V1_6 : Ba6[0],V1_7 : Ba7[0],
  G2_1 : Ba1[1],G2_2 : Ba2[1],G2_3 : Ba3[1],G2_4 : Ba4[1],G2_5 : Ba5[1],G2_6 : Ba6[1],G2_7 : Ba7[1],
  Vm1 : VM1,Vm2 : VM2,Vm3 : VM3,Vm4 : VM4,Vm5 : VM5,Vm6 : VM6,Vm7 : VM7
  }
);
return Kls.rename('Fase_' + Vi2).toByte();  
}
}
exports.KlsLhnS2_2 = function(S2,Mean,Std,JumKls) {
  // Reklas berdasrkan Nilai Mean & Std, sebanyak 3,5,7 kelas
  var BtsEVI =[],ImgKls,Ba1,Ba2,Ba3,Ba4,Ba5,Ba6,Ba7;
  if(JumKls == 7) { Ba1 = Mean-2.5*Std;Ba2 = Mean-1.5*Std; Ba3 = Mean-0.5*Std; 
  Ba4 = Mean+0.5*Std;Ba5 = Mean+1.5*Std; Ba6 = Mean+2.5*Std
ImgKls = S2.expression("(Lc == 4 && IV <= Ba1) ? 1:(Lc == 4 && IV > Ba1 && IV <= Ba2) ? 2:(Lc == 4 && IV > Ba2 && IV <= Ba3) ? 3:" +
  "(Lc == 4 && IV > Ba3 && IV <= Ba4) ? 4:(Lc == 4 && IV > Ba4 && IV <= Ba5) ? 5:(Lc == 4 && IV > Ba5 && IV <= Ba6) ? 6:" +
  "(Lc == 4 && IV > Ba6) ? 7:(Lc == 6) ? 8:(Lc == 5) ? 9",
  {Lc : S2.select('SCL'),IV:S2.select('EVI'),Ba1:Ba1,Ba2:Ba2,Ba3:Ba3,Ba4:Ba4,Ba5:Ba5,Ba6:Ba6}
  )
  }
  if(JumKls == 5) { Ba1 = Mean-1.5*Std;Ba2 = Mean-0.75*Std; Ba3 = Mean+0.75*Std; 
  Ba4 = Mean+1.5*Std;
ImgKls = S2.expression("(Lc == 4 && IV <= Ba1) ? 1:(Lc == 4 && IV > Ba1 && IV <= Ba2) ? 2:(Lc == 4 && IV > Ba2 && IV <= Ba3) ? 3:" +
  "(Lc == 4 && IV > Ba3 && IV <= Ba4) ? 4:(Lc == 4 && IV > Ba4) ? 5:(Lc == 6) ? 6:(Lc == 5) ? 7",
  {Lc : S2.select('SCL'),IV:S2.select('EVI'),Ba1:Ba1,Ba2:Ba2,Ba3:Ba3,Ba4:Ba4}
  )
  }
 if(JumKls == 3) { Ba1 = Mean-1.5*Std;Ba2 = Mean+1.5*Std; 
ImgKls = S2.expression("(Lc == 4 && IV <= Ba1) ? 1:(Lc == 4 && IV > Ba1 && IV <= Ba2) ? 2:(Lc == 4 && IV > Ba2) ? 3:" +
  "(Lc == 6) ? 6:(Lc == 5) ? 7",
  {Lc : S2.select('SCL'),IV:S2.select('EVI'),Ba1:Ba1,Ba2:Ba2}
  )
  }
return ImgKls.rename('Land_Cover').focal_mode();
}
exports.VisLC = function(JumKls) {
  var Vis;
  if (JumKls == 5) Vis = {palette:['ffff00','00ff00','00aa00','blue','red'] };
  if (JumKls == 7) Vis = {palette:['ffff00','aaaa00','00ff00','008e00','008800','blue','red'] };
  if (JumKls == 9) Vis = {palette:['ff00ff', 'ffff00','aaaa00','88ff00','00ff00','008e00','008800','blue','red'] };
  return Vis;
}
exports.SegImg = function(Img,Siz,Cmpt,Conn,NBS,Sed) {
  //SegImg(S2,32,6 ,8,256,36)
var snic = ee.Algorithms.Image.Segmentation.SNIC({
  image: Img, 
  size: Siz, // 32
  compactness: Cmpt, //6
  connectivity: Conn, // 8
  neighborhoodSize: NBS, // 256
  seeds: ee.Algorithms.Image.Segmentation.seedGrid(Sed) //36
});
return snic;
}
// CHARTS
exports.GrafImgColTab = function(ImgCol,Bands,Tab,TabPro,Reducer,Sc,Typ_Graf,Judul_Graf,Judul_Y) {
var Typ_Grf = 'ScatterChart'; if (Typ_Grf !== '')Typ_Grf = Typ_Graf;
var Graf_TS = ui.Chart.image.seriesByRegion({
  imageCollection: ImCol,
  band: Bands,xProperty: 'system:time_start',
  regions: Tab,seriesProperty: TabPro, // 'PROV_ID'
  reducer: Reducer , //ee.Reducer.mean(),
  scale: Sc 
});
 Graf_TS.setOptions({
  ChartType : Typ_Grf, // 'ScatterChart',
  title: Judul_Graf,
  vAxis: {
    title: Judul_Y
  },
  lineWidth: 1,pointSize: 4,
/*
  series: {
    0: {color: COLOR.CITY},
    1: {color: COLOR.FOREST},
    2: {color: COLOR.DESERT}
  }
*/
});
return Graf_TS;
}

exports.Pilih_Modis = function(waktu,AOI){
      var image1 = MOD09Q1
                    .filterDate(waktu[0],waktu[1])
                    .filterBounds(AOI)
                    .map(maskMOD09Q1)
                    .select('sur_refl_b01','sur_refl_b02','mask')
                    .max()
                    .reproject({
          crs: ee.Projection('EPSG:4326'),scale: 250.0});
      var image2 = MOD09A1
                    .filterDate(waktu[0],waktu[1])
                    .filterBounds(AOI)
                    .map(maskMOD09A1)
                    .select('sur_refl_b03','sur_refl_b04','sur_refl_b05','sur_refl_b06','sur_refl_b07','mask')
                    .max();

      image2= image2.resample('bilinear').reproject({
          crs: ee.Projection('EPSG:4326'),scale: 250.0});
      var mask = (image1.select('mask')).min(image2.select('mask')).rename('mask');    
      image = image1.select('sur_refl_b01','sur_refl_b02')
              .addBands(image2.select('sur_refl_b03','sur_refl_b04','sur_refl_b05','sur_refl_b06','sur_refl_b07'))
              .multiply(0.0001).toFloat()
              .addBands(mask);
      image = AddIdx_MODIS(image)
       .set('system:time_start',waktu[0]).set('system:time_end',waktu[1]);
return image;
}
exports.StkImgTS = function(imcol){
  var i, img;
  var xrata, yrata,Jum1X,Jum1Y,Jum2X,Jum2Y,n,count,atas,bawah;
  //var listOfImages = imcol.toList(imcol.size());
  var Bnd = ee.List(imcol.bandNames().getInfo()),BndNm=[];
var i,Img1,JumBnd = Bnd.length().getInfo();
for(i=0; i < JumBnd; i++) {
  BndNm[i]= Bnd.get(i).getInfo();
}
  xrata =yrata=atas=bawah=Jum1Y=Jum2Y=ee.Image(0);
  n=0;
  //for (i=periode; i>=0 && count!==0 ; i-- ){
   for (i=0; i < JumBnd ; i++ ){  
    Img1 = imcol.select(BndNm[i]);
    xrata += xrata.add(ee.Image(i));
    //Jum1Y += Jum1Y.add(ee.Image(listOfImages.get(i)).select("EVI"));
    Jum1Y += Jum1Y.add(Img1);
    Jum1Y += Jum1Y.add(Img1.multiply(Img1));
    n += 1;
  }
  xrata = xrata.divide(ee.Image(n));
  yrata = yrata.divide(ee.Image(n));
  
  count = n;
  for (i=periode; i>=0 && count!==0 ; i-- ){
    atas = atas.add((ee.Image(i).subtract(xrata)).multiply((ee.Image(listOfImages.get(i)).select("EVI")).subtract(yrata)));
    bawah = bawah.add((ee.Image(i).subtract(xrata)).pow(ee.Image(2)));
    count = count-1;
  }
  
  img = ee.Image(listOfImages.get(i)).addBands(atas.divide(bawah).rename("Slope"));

  return img;
}
exports.Luas = function(Img,Sc,Reg) {
  var areas = Img
  //  .select(['thres1', 'thres2', 'thres3', 'thres4'])
    .multiply(ee.Image.pixelArea())
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: Reg,  // a geometry
      scale: Sc,   // scale = 10 for sentinel-2 'red' band
      maxPixels: 1e13  
    }); 
    return areas.getInfo() ;
}
exports.AddTime = function(ImgCol) {
  return ImgCol.addBands(ImgCol.metadata('system:time_start')
    .divide(1000 * 60 * 60 * 24 * 365));
}   
exports.LineFit = function(ImgCol,BndY) {
  // Ektrak koef Regresi Linier Y = b0 + b1*X
  // BndY , misal EVI; X : time dr fungsi AddTime
var Ren = [["scale","offset"],["Sc","Of"]];
var Trend = ImgCol.select(['system:time_start', BndY])
  // Compute the linear trend over time.
  .reduce(ee.Reducer.linearFit()).toFloat()
  .select(Ren[0],Ren[1]);
return Trend;
}

exports.Regresi = function(imcol,BndX,BndY,p1,p2) {
 
  var Jum1,Jum2,xrata, yrata, count, atas, bawah,JumDat,listOfImages,i,n,AT,
  img,ymn,ymx,PosMin,PosMax,ImgRange,J1x,J2x,Jxy,ImgStd,k,ImgX,Bnd,BndNm=[],IV0,IVTnm,
  VarXY,VarX,Trend,VarY,Itc,r,ImgMed,IVe,ImgKV;

JumDat = imcol.size().getInfo(); listOfImages = imcol.toList(JumDat); n=JumDat;
IV0 = ee.Image(listOfImages.get(0)).select(NamBnd).unmask();
IVe = ee.Image(listOfImages.get(n-1)).select(NamBnd).unmask();
ImgMed = GetImgColTS(listOfImages,NamBnd,p1,p2).median().rename(NamBnd + '_Med').toFloat();
 
/*
Bnd = ee.List(imcol.bandNames().getInfo());
JumDat = Bnd.length().getInfo(); 
for(i=0; i < JumDat; i++) {
  BndNm[i]= Bnd.get(i).getInfo();}
  */
  if (p1 >=0 || p2 >=0) n = p2-p1+1; else p1=0 ;
  Jum1 = J1x = Jum2 =J2x= Jxy= ImgRange = xrata =count = ImgX = ee.Image(0);
  ymn = ee.Image(1.0); ymx = ee.Image(-1.0); PosMin = PosMax = ee.Image(1).toInt16();
  yrata = ee.Image(0.01); ImgStd = ee.Image(0.01); Trend = ee.Image(0.01); 
  Itc = ee.Image(0.01); r = ee.Image(0.01); 

  for (i=0; i < n ; i++ ){ k=i+p1;
  ImgX = ee.Image(listOfImages.get(k)).select(BndX).unmask();
  img = ee.Image(listOfImages.get(k)).select(BndY).unmask();
  //img = imcol.select(BndNm[k]).unmask();
  if (ImgX !== 0 || img != 0 ) {
  Jum1 = Jum1.add(img) ; Jum2 = Jum2.add(img.multiply(img));
  J1x = J1x.add(ImgX); J2x = J2x.add(ImgX.multiply(ImgX));
  Jxy = Jxy.add(img.multiply(ImgX));
  count = count.add(1)
    }  
  }
Xr = J1x.divide(count).rename(BndX + '_Mean').toFloat();
yrata = Jum1.divide(count).rename(BndY + '_Mean').toFloat();
ImgStd = (Jum2.subtract(count.multiply(yrata))).divide(count.subtract(1));
ImgStd = ImgStd.sqrt().rename(NamBnd + '_Std').toFloat(); 
ImgKV = ImgStd.divide(yrata).rename(NamBnd + '_KV').toFloat();

// Koef Regresi : Trend/Slope (Slp),intercep(Itc),korelasi(r)
VarX = J2x.subtract(J1x.multiply(J1x).divide(count));
VarY = Jum2.subtract((Jum1.multiply(Jum1).divide(count)));
VarXY = Jxy.subtract(yrata.multiply(J1x));  
Trend = VarXY.divide(VarX).rename('Slope').toFloat() ; 
Itc= yrata.subtract(Trend.multiply(J1x.divide(count))).rename('Intcp').toFloat();
r = VarXY.divide((VarX.multiply(VarY)).sqrt()).rename('Korelasi').toFloat();

  return yrata.addBands(ImgKV).addBands(Trend).addBands(Itc).addBands(r);
}
// String to Nume
exports.Str2Num=function(Str,TyDt) {
  return Str2_Num(Str,TyDt)
} 
exports.Str2NumArr=function(Str,Pemisah) {
  return Str2Num_Arr(Str,Pemisah);
}
function Str2_Num(Str,TyDt) {
  var Num = parseFloat(Str);
  if(TyDt == 'I16') Num = parseInt(Str,10);
    else Num = parseFloat(Str);
  return Num ;
}
function Str2Num_Arr(Str,Pemisah) {
  var StrPlt = Str.split(Pemisah),JumStr,k,NumArr=[];
  JumStr = ee.List(StrPlt).length().getInfo();
  for (k=0;k < JumStr;k++) {NumArr[k]= Str2Num(StrPlt[k],'flt');}
  return NumArr ;
}

// SET Image
exports.SetImg2TimeFac = function(Img,Tgl_R,KoefKon) {
  return SetImg2_TimeScF(Img,Tgl_R,KoefKon);
}
function SetImg2_TimeScF(Img,Tgl_R,KoefKon) {
  var Tgl_s = ee.Date(Tgl_R[0]), Tgl_e = ee.Date(Tgl_R[1]+'T15:00:00');
  return Img.set('system:time_start',Tgl_s.format('YYYY-MM-dd'))
  .set('system:time_end',Tgl_e.format('YYYY-MM-dd HH:MM'))
  .set('Scaled_Factor',KoefKon[1]).set('Add_Factor',KoefKon[0]);
}

// Simpan Img ke Asset
exports.SaveImg2Ast=function(ImgIn,ImgOut,Sc,Bts,Clip,KoefKon,TypOut,Fld,Tgl_R) {
return SaveImg2_Ast(ImgIn,ImgOut,Sc,Bts,Clip,KoefKon,TypOut,Fld,Tgl_R); 
}
function SaveImg2_Ast(ImgIn,ImgOut,Sc,Bts,Clip,KoefKon,TypOut,Fld,Tgl_R) {
var Tgl_s,Tgl_e; 
if (Tgl_R ==='') {
Tgl_s = ee.Date(ImgIn.get('system:time_start'));
Tgl_e = ee.Date(ImgIn.get('system:time_end')); }
else {Tgl_s = ee.Date(Tgl_R[0]); Tgl_e = ee.Date(Tgl_R[1]+'T15:00:00');  }
//print('Cek Tgl',Tgl,Tgl2);
var ImgIn2 = ImgIn,Task_ImgOut = ImgOut;  
if(Fld !=='0') ImgOut=Fld + '/' +ImgOut; 
if (Clip !== '') ImgIn2 = ImgIn.clip(Clip);
if (KoefKon !== '') { if (KoefKon == 'Vis') ImgIn2 = ImgIn2.visualize(VisPar); 
else ImgIn2 = ImgIn2.multiply(KoefKon[1]).add(KoefKon[0]); 
  if (TypOut == 'U16') ImgIn2 = ImgIn2.toUint16(); 
  else if (TypOut == 'S16') ImgIn2 = ImgIn2.toInt16(); else ImgIn2 = ImgIn2.toByte();  
}
//ImgIn2=ImgIn2.copyProperties(ImgIn,['system:time_start','system:time_end']);
ImgIn2=ImgIn2.set('system:time_start',Tgl_s.format('YYYY-MM-dd'))
  .set('system:time_end',Tgl_e.format('YYYY-MM-dd HH:MM'))
  .set('Scaled_Factor',KoefKon[1]).set('Add_Factor',KoefKon[0]);
Export.image.toAsset({
  image:ImgIn2,
  description: Task_ImgOut,
  assetId: ImgOut,
  scale: Sc,
  maxPixels: 1e13,
  region: Bts,
 });
 }
exports.SaveImg2Drv=function(ImgIn,ImgOut,Sc,Bts,Clip,KoefKon,TypOut,VisPar,Fld) {
return SaveImg2_Drv(ImgIn,ImgOut,Sc,Bts,Clip,KoefKon,TypOut,VisPar); 
} 
function SaveImg2_Drv(ImgIn,ImgOut,Sc,Bts,Clip,KoefKon,TypOut,VisPAr) {
var ImgIn2 = ImgIn;
if (Clip !== '') ImgIn2 = ImgIn.clip(Clip);
if (KoefKon !== '') { if (KoefKon == 'Vis') ImgIn2 = ImgIn2.visualize(VisPar); 
else ImgIn2 = ImgIn2.multiply(KoefKon[1]).add(KoefKon[0]); 
  if (TypOut == 'U16') ImgIn2 = ImgIn2.toUint16(); 
  else if (TypOut == 'S16') ImgIn2 = ImgIn2.toInt16(); else ImgIn2 = ImgIn2.toByte();  
} 
  Export.image.toDrive({ 
  image:ImgIn2,
  description:ImgOut,
  scale: Sc, 
  maxPixels: 1e13,
  region: Bts});
}

function Buat_Rect(RectArr,Label) {
  var Rect = ee.Feature(ee.Geometry.Rectangle(RectArr),{Label:Label});
  return Rect;
}
exports.Feat2Img=function(Feat,Val,Tebal) {
  return Feat2_Img(Feat,Val,Tebal)
}
function Feat2_Img(Feat,Val,Tebal) { // Fill = value ; OutLine aj
  return ee.Image().toByte().paint(Feat, Val, Tebal);
}

exports.DisplayImg=function(ImgCol,Year,Unit,Komp,VisRGB) {
  return Display_Img(ImgCol,Year,Unit,Komp,VisRGB);
} 
function Display_Img(ImgCol,Year,Unit,Komp,VisRGB) {
  // Pilihan dg Silder
  Map.layers().reset();
  var date = ee.Date.fromYMD(Year, 1, 1);
  var dateRange = ee.DateRange(date, date.advance(1, Unit));
  //var image = ImgCol.filterDate(dateRange).median();
  var image = Komp_ImgCol(ImgCol,Komp,'Mod',dateRange);
  Map.addLayer({eeObject: ee.Image(image),visParams:VisRGB, 
  //  {  min: 0,max: 63,palette:['000000', 'FFFF00', 'FFA500', 'FF4500', 'FF0000']},
    name: String('Komposit ' + Komp + ' ' + Year)
  });
return Image;
};

function Eks_Stk_Point(Tab_Point,Img_Col,Rad,Sc) {
//***** Coba export jdi CSV
var Redu_Mean = ee.Reducer.mean(),Redu_Std = ee.Reducer.stdDev();
//var Redu_MeanStd = Redu_Mean.combine() 
var Stk_Mean = Tab_Point.map(function(f) {
  return ee.ImageCollection(Img_Col).map(function(i) {
    var mean = i.reduceRegion({
      geometry: f.geometry().buffer(15),
      reducer: ee.Reducer.mean(),
      //reducer: Redu,
      scale: Sc,
    });
   // return f.setMulti(mean).set({date: i.date()})
    return f.setMulti(mean);
  });
});

// flatten
Stk_Mean = Stk_Mean.flatten(); 
print('Stk Mean : ',Stk_Mean.limit(20));
/*
Stk_Std = Stk_Std.flatten();
print('Stk Std : ',Stk_Std.limit(20));
*/
Export.table.toDrive({
  collection: Stk_Mean,
  description: Out_Name,
  folder: Fld,
  fileFormat: 'CSV'
  });
}
