import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-map',
  templateUrl: 'map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit {
  @ViewChild('mapViewElement') private mapViewElement: ElementRef;
  @Output() public layersFormGroup: FormGroup;
  public layers: any[];
  public populacaoLayer: any;
  public idhmLayer: any;
  public pibLayer: any;
  public arcgisPortal: any;
  public portalMap: any;
  public mapView: any;

  constructor() {}

  public ngOnInit(): void {
    this.loadEsriModules().then(
      ([EsriWebMap, EsriMapView, ArcGisPortal]) => {
        this.arcgisPortal = this.loadArcgisPortal(ArcGisPortal);

        this.arcgisPortal.load().then(() => {this.renderEsriMap(EsriWebMap, EsriMapView)});
      }
    );
  }

  public loadEsriModules(): Promise<any> {
    return loadModules([
      'esri/WebMap',
      'esri/views/MapView',
      'esri/portal/Portal',
    ]);
  }

  public initLayersFormGroup(): void {
    this.layersFormGroup = new FormGroup({
      populacao: new FormControl(true),
      idhm: new FormControl(true),
      pib: new FormControl(true),
    });
  }

  public loadArcgisPortal(
    ArcGisPortalClass: any,
  ): any {
    const arcgisPortal = new ArcGisPortalClass();
    arcgisPortal.authMode = "immediate";

    return arcgisPortal;
  }

  public renderEsriMap(MapClass: any, MapViewClass: any): void {
     this.portalMap = new MapClass({
      portalItem: {
        id: '4cecdda8e94a4e48bbc2e75bedbee3ef',
      }
    });

    this.portalMap.when(() => {
      this.registerLayers();
      this.initLayersFormGroup();
      this.registerCheckboxListeners();
      this.registerViewClickListeners();
    });

    this.mapView = new MapViewClass({
      container: this.mapViewElement.nativeElement,
      map: this.portalMap,
      zoom: 6,
    });
  }

  public registerLayers(): void {
    this.populacaoLayer = this.portalMap.layers.items[0];
    this.pibLayer = this.portalMap.layers.items[1];
    this.idhmLayer = this.portalMap.layers.items[2];
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

    this.mapView.on('click', (event) => {
      this.clickEventListener(event);
    });
  }

  public clickEventListener(event: any): void {
    this.mapView.popup.open({
      title: 'Hello World',
      content: 'Cidade fulaninha',
      location: event.mapPoint
    });
  }
}
