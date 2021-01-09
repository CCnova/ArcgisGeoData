import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-map',
  templateUrl: 'map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit {
  @ViewChild('mapViewElement') private mapViewElement: ElementRef;

  constructor() {}

  public ngOnInit(): void {
    this.loadEsriModules().then(([EsriMap, EsriMapView]) => this.renderEsriMap(EsriMap, EsriMapView));
  }

  public loadEsriModules(): Promise<any> {
    return loadModules([
      'esri/WebMap',
      'esri/views/MapView',
    ]);
  }

  public renderEsriMap(MapClass: any, MapViewClass: any): void {
    const map = new MapClass({
      // basemap: 'streets',
      portalItem: {
        id: '4cecdda8e94a4e48bbc2e75bedbee3ef',
      }
    });

    const mapView = new MapViewClass({
      container: this.mapViewElement.nativeElement,
      map: map,
    });
  }
}
