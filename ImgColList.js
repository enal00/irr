Data_S1=ImgCol(Point,'','S1')
JumLst_S1 = Data_S1.JumLst
S1=Data_S1.Data
print('Jumlah Data S1 = ' + JumLst_S1,S1);



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
