var S1_GRD = ee.ImageCollection("COPERNICUS/S1_GRD"),
    SHSri_Geo = ee.FeatureCollection("users/salmanddd14/shp/SHSri_Geo"),
    Sri_Bts = ee.FeatureCollection("users/salmanddd14/shp/Sri_Poly");
    
// Special functions for SAR Data
var i,j,k, Bts_JwBl = ee.Geometry.Rectangle(105,-5.5,116,-9);
var Bts_Indo = ee.Geometry.Rectangle(92,8,141,-11);
//var Sri_Cent = Sri_Bts.geometry().centroid(); print(Sri_Cent);
var Tgl_Cek = [['2021-07-16','2021-07-31'],['2021-08-01','2021-08-16'],['2021-08-16','2021-08-31']];
var BndIdxSAR = ['API','RPI','NDPI','VH_Int'],Bnd_S1 = ['VV','VH','DP','API','RPI','NDPI','VH_Int'];
var NCCSAR_S1_2 = VisPar([-20.1,-28.5,3.8],[0.05,-6.8,11.2],['VV','VH','DP']),
NCCSAR_S1 = VisPar([-16,-24,1], [0,-7,24],['VV','VH','DP']);
exports.VisNCC_S1 = function() { return NCCSAR_S1; }
//var S1_Agu=TS_S1(Tgl_Cek,0,BndIdxSAR); print ('S1',S1_Agu);
var S1 = Pilih_S1('','',Bnd_S1,'','');
exports.S1_Indo = function() {return S1; }
/* 
var S1_Sri = S1.filterBounds(Sri_Cent);
print ('S1_Sri',S1_Sri.limit(5000));
var S1_Mean=S1_Sri.mean().focal_median();
print('Mean S1',S1_Mean);
var S1Sri_RGB = RGBS1_Int(S1_Mean);
print('Mean S1',S1_Mean);
Map.centerObject(Sri_Cent,12);
Map.addLayer(S1Sri_RGB,NCCSAR_S1,'RGB S1');
*/
exports.RGBS1_dB=function(ImgS1){return RGBS1_dB(ImgS1); }
function RGBS1_dB(ImgS1) {
  var VV = ImgS1.select('VH_Int').divide(ImgS1.select('RPI')).toFloat().rename('VV_Int');
var VV_dB = (VV.log10()).multiply(10).rename('VV'),VH_dB = (ImgS1.select('VH_Int').log10()).multiply(10).rename('VH'),
DP = VV_dB.subtract(VH_dB).rename('DP');
// print('RPI2',VV.divide(ImgS1.select('VH_Int')));

//var RPI2 = VV.divide(ImgS1.select('VH_Int')).rename('RPI2'); 
  var Img_Gab = VV_dB.addBands(VH_dB).addBands(DP).addBands(ImgS1);
  return Img_Gab;
}
//<<<<<<<<<
function JumEl(ArrObj,Opsi) {
  if (Opsi > 0)return ArrObj.size().getInfo();
  else return ee.List(ArrObj).length().getInfo();
}
function AddBnd_No(Img) {
  var No,ImgIdx ; 
  ImgIdx = ee.Image(parseFloat(Img.metadata('system:index').toString())).rename('Sys_Idx').toInt16(); 
  return Img.addBands(ImgIdx);
}
function Add_SysIdx(ImgC) {
  var Idx = ee.String(ImgC.get('system:index')),ImgIdx=ee.Image(parseFloat(Idx)).toInt16()
  .rename('Sys_Idx');
  return ImgC.addBands(ImgIdx);
}
exports.TS_ImgC=function(ImgC,LstTgl,Komp,BndQual,Opsi){return TS_ImgC(ImgC,LstTgl,Komp,BndQual,Opsi); }
function TS_ImgC(ImgC,LstTgl,Komp,BndQual,Opsi) {
  var i,Img_Arr=[],JumLst,Tgl_Range,Nama,JumNms,Img1,NmBnds,BndIdx;
  NmBnds = ImgC.first().bandNames().getInfo(); 
  JumLst = JumEl(LstTgl,0); Nama = NmBnds[0]; 
  for (i=0; i <JumLst; i++ ) { Tgl_Range = LstTgl[i];
  Img1 = ImgC.filterDate(Tgl_Range[0],Tgl_Range[1]);
  if(Komp=='Qual')Img1=Img1.qualityMosaic(BndQual);
  else if (Komp=='Med')Img1=Img1.median(); else if (Komp=='Max')Img1=Img1.max();  
  else if (Komp=='Min')Img1=Img1.min(); else if (Komp=='Std')Img1=Img1.reduce(ee.Reducer.stdDev());
  else Img1=Img1.mean();
    if(Opsi >  0) Img1 = Img1.rename(Nama+ '_' + Tgl_Range[0] );
    Img_Arr[i] = Img1.set('system:time_start',Tgl_Range[0])
    .set('system:time_end',Tgl_Range[1])
    ;
    }
if (Opsi < 1) return ee.ImageCollection(Img_Arr); else  return ee.Image.cat(Img_Arr); 
  }
exports.TS_S1 = function(LstTgl,Opsi,Names){return TS_S1(LstTgl,Opsi,Names); }

function TS_S1(LstTgl,Opsi,Names) {
  var i,Img_Arr=[],JumLst,Tgl_Range,Nama,JumNms,Img1,Img_Idx;
  JumLst = JumEl(LstTgl,0);
  if(Names !== '') JumNms = ee.List(Names).length().getInfo();
  for (i=0; i <JumLst; i++ ) { Tgl_Range = LstTgl[i];
  if(Opsi < 1) Nama = 'IdxS1_' + Tgl_Range[0]; else  
  Nama = [Names[0] + '_' + Tgl_Range[0],Names[1] + '_' + Tgl_Range[0],Names[2] + '_' + Tgl_Range[0]];
    Img1 = Pilih_S1(Tgl_Range,'',BndIdxSAR,'MeanMed',Nama);
    if(Opsi >  0) Img1 = Img1.rename(Nama);
    else { Img_Idx=ee.Image(i+1).toInt16().rename('Sys_Idx'); Img1=Img1.addBands(Img_Idx) }
    Img_Arr[i] = Img1; 
    }
if (Opsi < 1) return ee.ImageCollection(Img_Arr); 
else  return ee.Image.cat(Img_Arr).set('system:time_start',LstTgl[0])
.set('system:time_end',LstTgl[1]); 
  }
exports.Pilih_S1 = function(date_range,AscDsc,PilBnd,Komp,Nama) {  return Pilih_S1(date_range,AscDsc,PilBnd,Komp,Nama,Bound); } 
 function Pilih_S1(date_range,AscDsc,PilBnd,Komp,Nama) {
 // var L8_SR = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
   var S1 = ee.ImageCollection("COPERNICUS/S1_GRD")
   .filterBounds(Bts_Indo);
   if (date_range !=='' || date_range > 0) S1=S1.filterDate(date_range[0],date_range[1]);
   S1=S1.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
    .select('VV','VH','angle')
   // remove noise border
    .map(function(Img) { // Hilangkan Border Noise, biasanya nilai minimum
          var edge = Img.lt(-30.0);
          var maskedImage = Img.mask().and(edge.not());
          return Img.updateMask(maskedImage)
           .copyProperties(Img,['system:index','system:time_start','system:time_end']);
        })
    .map(function(img){
    // Koreksi Sudut Incd Angle
    var VV_Corr = img.select('VV').subtract(img.select('angle').multiply(Math.PI/180.0).cos().
    log10().multiply(10.0)).rename('VV').toFloat();
    var VH_Corr = img.select('VH').subtract(img.select('angle').multiply(Math.PI/180.0).cos().
    log10().multiply(10.0)).rename('VH').toFloat() ;
    var VV_VH = VV_Corr.select('VV').subtract(VH_Corr.select('VH')).rename('DP');
    var VV_Int = VV_Corr.expression('10**(VV/10)',{VV : VV_Corr.select('VV')}).rename('VV_Int').toFloat();
    var VH_Int = VH_Corr.expression('10**(VH/10)',{VH : VH_Corr.select('VH')}).rename('VH_Int').toFloat();
    var RPI = VH_Int.divide(VV_Int).toFloat().rename('RPI');
  //  var MVVVH = (VV_Corr.pow(2)+VH_Corr.pow(2)).sqrt().rename('MeanBS')  
   var MVVVH = (VV_Corr.add(VH_Corr)).divide(2).rename('MeanBS');
var API = (VV_Int.add(VH_Int)).divide(2.0).toFloat().rename('API');
//    var MVVVH = (VV_Corr.multiply(VV_Corr).add(VH_Corr.multiply(VH_Corr))).pow(0.5).divide(2).rename('MeanBS');
      var NDPI = ((VV_Int.subtract(VH_Int)).divide((VV_Int.add(VH_Int))).divide(2)).toFloat().rename('NDPI'); // NDPI / 2 agr grafik seimbang
  //VH > VV -> Noise, mk dijadikan mask jk RPI >= 1     
  var Mask = RPI.expression('(v >=1.0) ?0:1',{v:RPI});
  return VV_Corr.addBands(VH_Corr).addBands(VV_VH).addBands(VH_Int).addBands(API).addBands(RPI).addBands(NDPI).addBands(MVVVH)
       .updateMask(Mask).copyProperties(img,['system:index','system:time_start','system:time_end']);
    })
    .select(PilBnd);
  if (AscDsc == 'ASC') S1.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
  else if (AscDsc == 'DSC') S1.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));
  else S1=S1; 
 // if (Bound !== '' || Bound > 0 ) S1=S1.filterBounds(Bound);
if (Komp !== '') {
if (Komp == 'MeanMed') S1 = S1.mean().focal_median();
else if (Komp == 'MedMed') S1 = S1.median().focal_median(); 
else if (Komp == 'MeanMod') S1 = S1.mean().focal_mode();
else if (Komp == 'MedMean') S1 = S1.median().focal_mean();  
else S1 = S1.mean().focal_mean();
}
  if (Nama !== '') S1 = S1.set('name',Nama);
  if((date_range !=='' || date_range !==0) && (Komp !=='' || Komp !== 0 )) S1 = S1.set('system:time_start',date_range[0]).set('system:time_end',date_range[1]);
  return S1;
}
exports.Komposit = function(Img,Komp,Filt_Spas,Tgl_R) {
return Komp_ImgCol(Img,Komp,Filt_Spas,Tgl_R);
  }
function Komp_ImgCol(Img,Komp,Filt_Spas,Tgl_R) {
if (Komp !=='') {
      if (Komp == 'Mean')Img = Img.mean();
      else if (Komp == 'Med')Img = Img.median();
      else if (Komp == 'Max')Img = Img.max();
      else if (Komp == 'Min')Img = Img.min();
      else if (Komp == 'Qual')Img = Img.qualityMosaic('NDVI');
      else Img = Img.qualityMosaic('NDVI');
  }
if (Filt_Spas !=='') {
      if (Filt_Spas == 'Mean')Img = Img.focal_mean();
      else if (Filt_Spas == 'Med')Img = Img.focal_median();
      else if (Filt_Spas == 'Max')Img = Img.focal_max();
      else if (Filt_Spas == 'Min')Img = Img.focal_min();
      else if (Filt_Spas == 'Mod')Img = Img.focal_mode();
      else Img = Img.focal_mode(); // kernel
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
function List_Img(ImgC) {
  return ImgC.toList(ImgC.size());
}
function GetImg_Idx(LstImg,Idx) {
  return ee.Image(LstImg.get(Idx));
}
function LstImg2Arr(LstImg){
  var i,Lst=[];
  for(i=0; i < LstImg.size(); i++ ) {
    Lst[i] = GetImg_Idx(LstImg,Idx);
  }
return Lst; 
  }
function ImgC2Arr(ImgC) {
  return LstImg2Arr(List_Img(ImgC));
}
exports.ImgCol2Stc=function(ImgCol,LstTgl) {return ArrImg2_Stc(ImgC2Arr(ImgCol),LstTgl)  }
exports.ArrImg2Stc=function(ImgArr,LstTgl) {return ArrImg2_Stc(ImgArr,LstTgl);  }
function ArrImg2_Stc(ImgArr,LstTgl) {
  var NmBnds,JumBnd,JmLst,No_Id,Tgl,Img1,NmBnd1,ImgStc=[];
  JmLst=JumEl(ImgArr,0);
  NmBnds=ImgArr[0].bandNames().getInfo();
  print(NmBnds);
  JumBnd=JumEl(NmBnds,0);
  for(i=0; i < JmLst; i++ ) { if(JumLst <10)No_Id = (i+1);
  else if(JumLst <100 && i < 9)No_Id = '0' + (i+1);
   else if(JumLst <100 && i > 8)No_Id = (i+1);
   else if(JumLst <1000 && i < 9)No_Id = '00'+ (i+1);
   else if(JumLst <1000 && i > 8)No_Id = '0'+ (i+1);
   else No_Id = (i+1);
   if(LstTgl !=='' || LstTgl > 0 ) Tgl = LstTgl[i];
    else Tgl= No_Id;
    for (j=0; j <JumBnd; j++) { NmBnd1 = Tgl + '_' + NmBnds[j];
    Img1=ImgArr[i].select(NmBnds[j]).rename(NmBnd1); k = j+i*JumBnd;
    ImgStc[k]=Img1;}}
    return ee.Image.cat(ImgStc);
}  
// Isi data yg kosong, krn awan atw tdk ada, sekalian smoothing
function IsiImg(Img3Arr,Opsi) {
  var Imgs, Img1=Img3Arr[0].unmask(),Img2=Img3Arr[1].unmask(),Img3=Img3Arr[2].unmask();
  Imgs=Img2; if(Opsi == 'Mean') Imgs = ee.ImageCollection(Img3Arr).mean();
  else if(Opsi == 'Med') Imgs = ee.ImageCollection(Img3Arr).median();
  else { Imgs=Img1.expression('( v2 == 0 && v1 != 0 && v3 != 0)?(v1+v3)/2:v2',
  {v1:Img1,v2:Img2,v3:Img3}) }
return Imgs;
}
function Isi_ImgCol(ImgCol) {
  var Lst_Imgs = ImgC2Arr(ImgCol);
  return Lst_Imgs;
}
function VisPar(Mins,Maxs,Bands,Palet) { // Par Mins dll dlm Array
  var Vis = {min:Mins,max:Maxs};
  if (Bands !== 0 || Bands !== '') Vis = {min:Mins,max:Maxs,bands:Bands };
  if (Palet !== 0 || Palet !== '') Vis = {min:Mins,max:Maxs,bands:Bands,palette:Palet };
return Vis;
  }
function Bound2Rect() {
  var Rect = ee.Geometry.Rectangle(Map.getBounds());
  return Rect;
}
