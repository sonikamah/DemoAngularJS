(function(){
	var app = angular.module('dimap', []);

	var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
	var map;
	var layers = []; //An array to keep refrence of layers added to the map
	var GEO_SERVER_URL = "https://app.dev.drillinginfo.com/ogc/di_intl/wfs";
	app.controller('LoadMapController', function(){

		map = new OpenLayers.Map("map");
    
	    map.addControl(new OpenLayers.Control.LayerSwitcher(),new OpenLayers.Control.ZoomToMaxExtent());

	    var road = new OpenLayers.Layer.Bing({
	        name: "Road",
	        key: apiKey,
	        type: "Road"
	    });
	    var hybrid = new OpenLayers.Layer.Bing({
	        name: "Hybrid",
	        key: apiKey,
	        type: "AerialWithLabels"
	    });
	    var aerial = new OpenLayers.Layer.Bing({
	        name: "Aerial",
	        key: apiKey,
	        type: "Aerial"
	    });

	    map.addLayers([road, hybrid, aerial]);

	    map.setCenter(new OpenLayers.LonLat(-110, 45), 3);
	});

	app.controller('LoadLayersController', function(){
		this.loadWells = function(){
  			var el = document.getElementById("wells");
  			this.loadLayer(el.id,'di_intl:wells',el.checked,null);
  		};

  		this.loadContracts = function(){
  			var el = document.getElementById("contracts");
  			this.loadLayer(el.id,'di_intl:contracts',el.checked,null);
		}

  		this.loadLayer = function(layerName,wmsLayer,isChecked,filter){
	  		var layer = this.getLayer(layerName);
	  		var layerExists =layer?(layerName.indexOf(layer.name)>-1):false;
	  		//Load wells/contracts if it is not added already
	  		if(isChecked && !layerExists){
	    		var wms = this.createWMSLayer(layerName,wmsLayer);
	    		map.addLayer(wms);
	    		map.zoomToExtent();
	    		map.setCenter(new OpenLayers.LonLat(-110, 45), 3);
	    		wms.setOpacity(1);

	    		if(filter){
	      			this.addFilterToWms(wms,filter);
	    		}
	    		layers.push(wms);
	  		}
	  		//show wells - the wells/contratcs layer exists but layer is hidden
	  		else if(isChecked && layerExists){
	    		this.showHideLayer(layer,true);
	  		}
	  		//hide wells - the wells/contracts layer exists but should be hidden on un-checking selection
	  		else if(!isChecked && layerExists){
	    		this.showHideLayer(layer,false);
	  		}
		};

		this.addFilterToWms = function(wms,filter){
			var filter = new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "country",
			   value: filter
			});
			var parser = new OpenLayers.Format.Filter.v1_1_0();
			var filterAsXml = parser.write(filter);
			var xml = new OpenLayers.Format.XML();
			var filterAsString = xml.write(filterAsXml);

			wms.params["FILTER"] = filterAsString;
		};

		this.createWMSLayer = function(layerName,wfsLayer){
  			var wms = new OpenLayers.Layer.WMS(
        		layerName,
        		GEO_SERVER_URL,
        		{
            		'layers': wfsLayer,
             		TRANSPARENT: true,
             		tiled:true
        		},
        		{
            		isBaseLayer: false,
            		projection: 'EPSG:3857'
        		}
    		);
    		return wms;
		};

		this.getLayer = function(layerName){
  			if(layerName === null || layerName.length === 0){
    			return null;
  			}
  			for(var i=0;i<layers.length;i++){
    			if(layerName.indexOf(layers[i].name) > -1){
      				return layers[i];
    			}
  			}
  			return null;
		};

		this.showHideLayer = function(layer,value){
  			if(value){
    			layer.setVisibility(true);
  			}else{
    			layer.setVisibility(false);
  			}
		};

	});
}());