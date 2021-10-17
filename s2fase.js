jadi banyak abu2, kelas fase di sentinel-2 cuma 1-5 aja ya?! gara2 itu kali
landsat juga bisa untuk cari fase? aku cek cuma ada visRGB. dan gak bisa ditampilin. L8 nya belom ada


#NYARI S2
S2 = ee.Image(Pilih_S2k(Tgl_Fase,Bnd_S2k,'Qual','S2',Bts_Indo));

// SENTINEL-2 SURFACE REFLECTANCE
function Pilih_S2k(TglRange,PilBnd,Komp,Nama) {
  var S2 = S2_SR.filterDate(TglRange[0],TglRange[1]).map(Citra.MskAwan_S2k).map(Citra.AddIdx_S2);
if (Komp !== '')  S2 = Citra.Komposit(S2,Komp);
if (Nama !== '') S2 = S2.set({name:Nama + '_' + TglRange[0]}).set("system:time_start",TglRange[0])
.set("system:time_end",TglRange[1]); 
return S2.select(PilBnd);
}

//input dari gui
Tgl_Fase = Tgl_Prd[Pil];
Tgl_Fase = PrdList[IdxPrd];

Bnd_S2k = ['B.*','NDBI','EVI','NDWI','SCL'], // SR terkoreksi atmosfir

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
Nama = 'S2'

Bts_Indo
Bts_Indo = ee.Geometry.Rectangle([92,8, 142,-11])

#LANDSAT8
S2 = ee.Image(Pilih_S2k(Tgl_Fase,Bnd_S2k,'Qual','S2',Bts_Indo));
Pilih_S2k ---> Pilih_L8

function Pilih_L8(TglRange,PilBnd,Komp,Nama) {
    var Tgl1 = ee.Date(TglRange[0]),Tgl2 = ee.Date(TglRange[1]);
    var L8 = L8_SR
    .filterDate(TglRange[0],TglRange[1])
    .map(Citra.MskAwan_L8).map(Citra.AddIdx_L8)
   .set("system:time_start",Tgl1).set("system:time_end",Tgl2)
    ;
    L8 = Citra.Komposit(L8,Komp);
    if (Nama !=='')L8 =L8.set('name',Nama+ '_' + TglRange[0]);
    return L8.select(PilBnd)//.copyProperties(L8_SR, ["system:time_start","system:time_end"])
    ;
  }
  
var Bnd_S2 = ['B.*','NDBI','EVI','NDWI'],Bnd_L8 = Bnd_S2,
L8 = ee.Image(Pilih_L8(Tgl_Fase,Bnd_L8,'Qual','L8',Bts_Indo));
 
kenapa gak ke clip. ke clipnya sama Bts_Indo.
belom bisa lanjut ke Map.addLayer(Fase_L8.mask(Mask),VisFase,'Fase L8 '+ Tgl_Fase[1],0);

#NYARI FASE_S2
Map.addLayer(Fase_S2,VisFase4,'Fase S2 '+ TglFase,Tampil);

Fase_S2
var Fase_S2 = Fase1_S2(SCL).clip(ft).mask(Mask); //int ∈ [0, 5]

function Fase1_S2(SCL) {
var Fase = SCL.expression('(Lc==0) ? 0:(iv <= 0.188 && Lc== 6) ? 1:( iv > 0 && Slp > 0 && Lc==4)?2:(iv >  0 && Slp < 0 && Lc==4)?3:' + 
'(Lc==5) ? 4:5 ',{iv : SCL.select('EVI_3'),Lc : SCL.select('SCL'),Slp :SCL.select('Slope') }).rename('Fase');  
Fase = (Fase.updateMask(Fase));return Fase.focal_mode();
}


 
 
 
 
 
 
