line 275, 70
Map.addLayer(Feat2Img(Indo_Kc, 8, 1), {min:8,max:8,palette : '000000'},'Batas Kecamatan',false);
Map.addLayer(Feat2Img(Shp_Kab, 8, 2), {min:8,max:8,palette : '880088'},'Batas Kabupaten',false);

Line 225
Map.centerObject(Bts1Prv,9);

Line 324
.addBands(Feat2Img(ft, 9, 3))

Line 298
Map.addLayer(Feat2Img(ft, 9, 3), {min:9,max:9,palette : 'red'},'Batas Provinsi');

Line 266
.addBands(Feat2Img(ft, 9, 2))

Line 273

+10	

kalo ft = diganti sama shp DI Rentang fungsi Feat2Img error
function Feat2Img(Feat,Val,Tebal) {
  return ee.Image().toByte().paint(Feat, Val, Tebal);




Map.addLayer(Fase_S1.mask(Mask),VisFase,'Fase S1 '+ TglFase,Tampil2); 
Fase_S1 = Citra.Det1Fase_S1(S1,'Slope',Air_Th,Bera_Th).focal_mode();
S1 = S1.addBands(Trend)


var Fase_S2 = Fase1_S2(SCL).clip(ft).mask(Mask); print('Fase_S2',Fase_S2);
