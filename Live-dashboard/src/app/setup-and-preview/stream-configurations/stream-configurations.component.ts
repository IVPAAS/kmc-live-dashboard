import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import * as moment from 'moment';
import Duration = moment.Duration;

import { environment } from "../../../environments/environment"
import { LiveEntryService, LiveEntryStaticConfiguration, LiveEntryDynamicStreamInfo } from "../../live-entry.service";

@Component({
  selector: 'stream-configurations',
  templateUrl: 'stream-configurations.component.html',
  styleUrls: ['stream-configurations.component.scss']
})
export class StreamConfigurationsComponent implements OnInit, OnDestroy{

  public _streamDuration: Duration;
  private _streamDurationSubscription: Subscription;
  public _staticConfiguration: LiveEntryStaticConfiguration;
  public _dynamicInformation: LiveEntryDynamicStreamInfo;
  public _streamHealth: {
    status: 'Good' | 'Fair' | 'Poor',
    resolution?: number
  };

  constructor(private _liveEntryService: LiveEntryService) {
    // Static configuration
    this._staticConfiguration = {
      dvr: false,
      recording: false,
      transcoding: false
    };
    // Dynamic configuration
    this._dynamicInformation = {
      redundancy: false,
      streamStatus: 'Offline'
    };
    this._streamHealth = { status: 'Good' };
  }

  ngOnInit() {
    this._liveEntryService.entryStaticConfiguration$.subscribe(response => {
      if (response) {
        this._staticConfiguration = response;
        this._startCalculatingStreamDurationTime();
      }
    });
    this._liveEntryService.entryDynamicInformation$.subscribe(response => {
      if (response) {
        this._dynamicInformation = response;
      }
    });
    this._liveEntryService.entryDiagnostics$.subscribe(response => {
      if (response) {
        this._streamHealth.status = response.streamHealth.health;
      }
    })
  }

  private _startCalculatingStreamDurationTime() {
    this._streamDurationSubscription = Observable.timer(0, 1000)
      .subscribe(() => {
        if (this._dynamicInformation.streamStatus !== 'Offline'){
          if (this._dynamicInformation.streamCreationTime){
            this._streamDuration = moment.duration(Math.abs(moment().diff(moment(this._dynamicInformation.streamCreationTime))));
          }
          else{
            this._streamDuration = moment.duration(0);
          }
        }
      });
  }

  public _getSourceHeight() {
    if (this._dynamicInformation.allStreams.primary) {
      let sourceStream = this._dynamicInformation.allStreams.primary.find(s => {
        return s.flavorId === environment.flavorsDefinitions.sourceFlavorId
      });

      return sourceStream.height;
    }
    else if (this._dynamicInformation.allStreams.secondary) {
      let sourceStream = this._dynamicInformation.allStreams.secondary.find(s => {
        return s.flavorId === environment.flavorsDefinitions.sourceFlavorId
      });

      return sourceStream.height;
    }
    else
      return "";
  }

  ngOnDestroy(): void {
    this._streamDurationSubscription.unsubscribe();
  }
}
