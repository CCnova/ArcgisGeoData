import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { loadModules } from 'esri-loader';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Portal from '@arcgis/core/portal/Portal';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import Popup from '@arcgis/core/widgets/Popup';

@Component({
  selector: 'app-map',
  templateUrl: 'map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit {
  @ViewChild('mapViewElement') private mapViewElement: ElementRef;
  @Output() public layersFormGroup: FormGroup;
  public layers: any[];
  public populacaoLayer: FeatureLayer;
  public idhmLayer: any;
  public pibLayer: any;
  public arcgisPortal: Portal;
  public portalMap: WebMap;
  public mapView: MapView;

  constructor() {}

  public ngOnInit(): void {
    this.loadArcgisPortal().then(() => this.renderEsriMap());
  }

  public loadEsriModules(): Promise<any> {
    return loadModules([
      'esri/WebMap',
      'esri/views/MapView',
      'esri/portal/Portal',
    ]);
  }

  public loadArcgisPortal(): Promise<any> {
   this.arcgisPortal = new Portal();
    this.arcgisPortal.authMode = "immediate";

    return this.arcgisPortal.load();
  }

  public initLayersFormGroup(): void {
    this.layersFormGroup = new FormGroup({
      populacao: new FormControl(true),
      idhm: new FormControl(true),
      pib: new FormControl(true),
    });
  }

  public renderEsriMap(): void {
     this.portalMap = new WebMap({
      portalItem: {
        id: '4cecdda8e94a4e48bbc2e75bedbee3ef',
      }
    });

    this.portalMap.when(() => {
      this.setupLayers();
      this.initLayersFormGroup();
      this.registerCheckboxListeners();
      this.registerViewClickListeners();
    });

    this.mapView = new MapView({
      container: this.mapViewElement.nativeElement,
      map: this.portalMap,
      zoom: 6,
    });
  }

  public setupLayers(): void {
    this.populacaoLayer = this.portalMap.layers.get('items')[0];
    this.pibLayer = this.portalMap.layers.get('items')[1];
    this.idhmLayer = this.portalMap.layers.get('items')[2];
  }

  public registerCheckboxListeners(): void {
    this.layersFormGroup.get('populacao').valueChanges.subscribe(
      ( layerIsVisible ) => {
        this.populacaoLayer.visible = layerIsVisible;
      }
    );

    this.layersFormGroup.get('idhm').valueChanges.subscribe(
      ( layerIsVisible ) => {
        this.idhmLayer.visible = layerIsVisible;
      }
    );

    this.layersFormGroup.get('pib').valueChanges.subscribe(
      ( layerIsVisible ) => {
        this.pibLayer.visible = layerIsVisible;
      }
    );
  }

  public registerViewClickListeners(): void {
    this.mapView.popup.autoOpenEnabled = false;

    this.mapView.on('click', (event: __esri.MapViewClickEvent) => {
      this.clickEventListener(event);
    });
  }

  public clickEventListener(event: __esri.MapViewClickEvent): void {
    this.mapView.popup.open({
      title: `x: ${event.x}, y: ${event.y}`,
      location: event.mapPoint,
    });
  }

  public buildPopUpContent(target: any): Promise<any> {
    console.log('target: ', target);
    return this.queryCityData(target).then((result) => {
      console.log('flag');
      console.log(result);
    });
  }

  public queryCityData(target: any): Promise<any> {
    return new Promise((resolve, rejects) => {
      loadModules(['esri/tasks/QueryTask', 'esri/tasks/support/Query']).then(
        ([QueryTask, Query]) => {
          const query = new Query({
            geometry: target.graphic.geometry,
            outFields: ["*"],
            spatialRelationship: "intersects",
          });

          QueryTask.execute(query).then((result) => {
            resolve(result);
          });
        }
      );
    });
  }
}
