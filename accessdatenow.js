// Selected Date
var Fmt='YYYY-MM-dd',Fmt2='YYYY-DDD',Fmt1='YYYY-MM-dd HH:MM';
var Today = ee.Date(Date.now()).format(); TglE=ee.Date(Today).format(Fmt).getInfo(); 
TglS=(ee.Date(Today).advance(-1,'year')).format(Fmt).getInfo(); print ('Harini',Today); 
var TglS_S1,TglE_S1,TglS_S2,TglE_S2,TglS_L8,TglE_L8;
