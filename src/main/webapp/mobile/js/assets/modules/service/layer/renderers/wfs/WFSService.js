/**
 * WFSService handles rendering of all wfs layers onto the map
 * @module map
 * @class WFSService
 * 
 */
allModules.service('WFSService',['$rootScope','GoogleMapService','LayerManagerService','Constants','GetWFSRelatedService','GMLParserService','QuerierPanelService','RenderStatusService','UtilitiesService',
                                 function ($rootScope,GoogleMapService,LayerManagerService,Constants,GetWFSRelatedService,GMLParserService,QuerierPanelService,RenderStatusService,UtilitiesService) {
   
      /**
        * Render a point data to the map 
        * @method renderPoint
        * @param point - the point to render
        * @param map - The map where the point is to be rendered
        */  
       this.renderPoint = function(point,map){                     
           var marker = new google.maps.Marker({
               position:point.coords,
               map: map,
               title: point.name
            });    
            marker.addListener('click', function() {
                QuerierPanelService.setQueryPoint(point);
                QuerierPanelService.openPanel(true);

            });
           return marker;
       };
       
       /**
        * Render a LINESTRING data to the map 
        * @method renderLineString
        * @param linestring - the linestring to render
        * @param map - The map where the point is to be rendered
        */  
       this.renderLineString = function(linestring,map){
           
       };
       
       /**
        * Render a POLYGON data to the map 
        * @method renderPolygon
        * @param polygon - the polygon to render
        * @param map - The map where the point is to be rendered
        */
       this.renderPolygon = function(polygon,map){
           
       };   
 
        /**
         * Method to decide how the wms layer should be rendered and add the wms to the map 
         * @method renderLayer
         * @param layer - The layer containing the wms to be rendered
         */
        this.renderLayer = function(layer,param){   
            var map =  GoogleMapService.getMap();            
            var me = this;
            var onlineResources = LayerManagerService.getWFS(layer);
            RenderStatusService.setMaxValue(layer,onlineResources.length);
            for(var index in onlineResources){
                
                if(UtilitiesService.filterProviderSkip(param.optionalFilters, onlineResources[index].url)){
                    RenderStatusService.updateCompleteStatus(layer,onlineResources[index],Constants.statusProgress.SKIPPED);
                    continue;
                }
                
                RenderStatusService.updateCompleteStatus(layer,onlineResources[index],Constants.statusProgress.RUNNING);
                
                GetWFSRelatedService.getFeature(layer, onlineResources[index],param).then(function(response){
                    try{
                        var rootNode = GMLParserService.getRootNode(response.data.gml);
                        var primitives = GMLParserService.makePrimitives(rootNode);
                        
                        RenderStatusService.updateCompleteStatus(layer,response.resource,Constants.statusProgress.COMPLETED);
                        
                        for(var key in primitives){
                            switch(primitives[key].geometryType){
                                case Constants.geometryType.POINT:
                                    GoogleMapService.addMarkerToActive(layer.id,me.renderPoint(primitives[key],map));
                                    break;
                                case Constants.geometryType.LINESTRING:
                                    me.renderLineString(primitives[key],map);
                                    break;
                                case Constants.geometryType.POLYGON:
                                    me.renderPolygon(primitives[key],map);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }catch(err){
                        RenderStatusService.updateCompleteStatus(layer,response.resource,Constants.statusProgress.ERROR); 
                    }
                   

                },function(error){
                    RenderStatusService.updateCompleteStatus(layer,onlineResources[index],Constants.statusProgress.ERROR);
                });
          
            }
            
        };
        
        /**
         * Method to decide how the wms resource should be rendered and add the wms to the map 
         * @method renderResource
         * @param resource - The resource containing the wms to be rendered
         */
        this.renderCSWRecord = function(layer,cswRecord){   
            var map =  GoogleMapService.getMap();            
            var me = this;
            var onlineResources = LayerManagerService.getWFSFromCSW(cswRecord);
            RenderStatusService.setMaxValue(layer,onlineResources.length);
                        
            
            for(var index in onlineResources){
                RenderStatusService.updateCompleteStatus(layer,onlineResources[index],Constants.statusProgress.RUNNING);
                GetWFSRelatedService.getFeature(layer.proxyUrl, onlineResources[index]).then(function(response){
                    try{
                        var rootNode = GMLParserService.getRootNode(response.data.gml);
                        var primitives = GMLParserService.makePrimitives(rootNode);
                        
                        RenderStatusService.updateCompleteStatus(layer,response.resource,Constants.statusProgress.COMPLETED);
                        
                        for(var key in primitives){
                            switch(primitives[key].geometryType){
                                case Constants.geometryType.POINT:
                                    GoogleMapService.addMarkerToActive(layer.id,me.renderPoint(primitives[key],map));
                                    break;
                                case Constants.geometryType.LINESTRING:
                                    me.renderLineString(primitives[key],map);
                                    break;
                                case Constants.geometryType.POLYGON:
                                    me.renderPolygon(primitives[key],map);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }catch(err){
                        RenderStatusService.updateCompleteStatus(layer,response.resource,Constants.statusProgress.ERROR); 
                    }
                    
                },function(error){
                    RenderStatusService.updateCompleteStatus(layer,onlineResources[index],Constants.statusProgress.ERROR);
                });
            }
            
        };
    
     
}]);