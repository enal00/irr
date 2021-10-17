// cek jumlah data di Indonesia
print(ui.Label('Cek ketersediaan data di Indonesia'))
var data = mod13.filterBounds(INA).filterDate('2020-01-01','2021-10-12');
var datahujan = hujandaily.filterBounds(INA).filterDate('2020-01-01','2021-10-12');
var list_data = ListObj_Pro (data,'system:index');
var list_datahujan = ListObj_Pro (datahujan,'system:index');
var jum_list_datahujan = ee.List(list_datahujan).length().getInfo();
var jum_list = ee.List(list_data).length().getInfo();
print ('Jumlah Data MODIS= '+ jum_list);
print ('List Data MODIS', list_data);
print ('Jumlah Data CHIRPS= '+ jum_list_datahujan);
print ('List Data CHIRPS', list_datahujan);
var datacomp = data.median().select(['sur_refl_b07','sur_refl_b02','sur_refl_b01']);
var ncct = {'min':[287,2151,136], 'max':[1064,4206,965]};
// cek list provinsi di sort agar prov_id sama index lsit equivalent
var item_prov = ListObj_Pro(prov.sort('PRV_ID'),'NAMA_PROV');
print ('item_prov',item_prov);
// Define a UI widget and add it to the map.
var pilih_idx, pilih_prv,prv_id;
var pilihlokasi = ui.Select({
  placeholder : 'Select Lokasi',
  items: item_prov,
  style: {width: '235px'},
});
pilihlokasi.onChange(function(){Map.clear();
  var self = pilihlokasi.getValue();
  pilih_idx = item_prov.indexOf(self); //!!!!!!
  prv_id = pilih_idx + 1; //index list == prov_id di properties shp
  print('terpilih', prv_id + ':' + self); //cek prov yg terpilih
  pilih_prv = prov.filter(ee.Filter.eq('PRV_ID',prv_id)); //filter shp
  Map.centerObject(pilih_prv,9);
  
  Map.addLayer(datacomp.clip(pilih_prv),ncct,'RGBNCC ' + item_prov[pilih_idx]);
  Map.addLayer(Feat2_Img(pilih_prv, 11, 2,''),{palette:'red'},'Batas Admin ' + item_prov[pilih_idx]);
  Map.addLayer(pilih_prv,{color:'red'},'Polygon Admin ' + item_prov[pilih_idx],0); //nol gak tampil d layer
}
  );

var checkB = ui.Checkbox('DI Rentang');
checkB.onChange(function(){Map.clear();
  var self = checkB.getValue();
  if (self === true)
  Map.centerObject(RENTANG,12);
  Map.addLayer(datacomp.clip(RENTANG),ncct,'RGBNCC DI Rentang');
  if (self === false)Map.clear();
});


  
// Create a panel to hold the chart.
var panel = ui.Panel(); 
panel.style().set({
  width: '250px',//height:'350px',
  position: 'middle-right'
});ui.root.add(panel);
panel.widgets().set(0,pilihlokasi)
panel.widgets().set(1,checkB)


// List berdasrkan Properties, al : System:index,time_start, ID (column features)dll
function ListObj_Pro(Obj,Pro) { 
var List = Obj.reduceColumns(ee.Reducer.toList(),[Pro]).get('list').getInfo();
return List;
  }
// dari feature menjadi outline raster
function Feat2_Img(FC,Val,Tebal,ProName) {
  var Img = ee.Image()
//    .paint(FC, ProName) // Get color from property named 'fill'
    .paint(FC, Val, Tebal) // Outline using color 3, width 5.
    .toByte();
  if (ProName !=='')Img = Img.paint(FC, ProName); // Isi
  return Img;
}
