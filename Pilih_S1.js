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
