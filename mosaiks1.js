S1.mean().select(BndRGB_S1),VisRGB_NCC_S1)

#S1
S1=Data_S1.Data;

#Data_S1
Data_S1=ImgCol(Point,'','S1');
Data_S1=ImgCol(Point,TglR,'S1')


#ImgCol
ex Data_S2=ImgCol(Point,'','S2k');Data_S2=ImgCol(Point,TglR,'S2k');
ex Data_L8=ImgCol(Point,'','L8');Data_L8=ImgCol(Point,TglR,'L8');

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

//ImgCol diubah jadi List sepanjang kolom si ImgCol
function Lst_Imgs(ImgCol) { 
return ImgCol.toList(ImgCol.size()); // tinggal tambah : ee.Image
}

//ImgCol diubah jadi String dari nama scene ex LANDSAT/LC08/C02/T1_L2/LC08_122064_20210916
function LstImgCol_SIdx(ImgCol) { 
var imageList = ImgCol.toList(ImgCol.size());
  var id_list = imageList.map(function(item) {
  return (ee.Image(item).get('system:index')); });
return id_list.getInfo();
  }

'system:index' S1 kayak gimana? suka out of memory

#Point
Point = Point_Gab[Idx];

#Point_Gab
Point_Gab = [Lap_Brigif_Point,SH_Sri_Point,Swt_Asahan,Swt_Tandun,DI_Rentang,Indo10_Prv]

#Idx
Point_Gab_Nam = ['Lap_Brigif','SH_Sri','Sawit Asahan','Sawit Tandun','DI Rentang','Admin Prov','Current Bound']
Pil_Bound.onChange(function(Cek)
Idx = Point_Gab_Nam.indexOf(Cek); //kalo dipilih 'SH_Sri' Idx = 1

#TglR
TglR=[];
Btn_Repro.onClick(function(){
  TglR = (TB_SD.getValue()).split(','); print('Cek',TglR);}





Data_S1.Data =  // ImageCollection yang intersect sama bound; difilter sama TglR (Range tanggal) or setahun terakhir
Data_S1.JumLst //jumalh Image
JumLst.LstImgs // List image berisikan 'system:index'

proses S1 .filterDate .mean() .select(BndRGB_S1)
BndRGB_S1 = ['VV','VH','DP','API','RPI','NDPI','VH_Int']

#S1_Indo
S1_Indo = Radar.S1_Indo(); 
exports.S1_Indo = function() {return S1; }
#S1
var S1 = Pilih_S1('','',Bnd_S1,'','');













NCCSAR_S1 = VisPar([-16,-24,1], [0,-7,24],['VV','VH','DP']);
function VisPar(Mins,Maxs,Bands,Palet) { // Par Mins dll dlm Array
  var Vis = {min:Mins,max:Maxs};
  if (Bands !== 0 || Bands !== '') Vis = {min:Mins,max:Maxs,bands:Bands };
  if (Palet !== 0 || Palet !== '') Vis = {min:Mins,max:Maxs,bands:Bands,palette:Palet };
return Vis;
  }

