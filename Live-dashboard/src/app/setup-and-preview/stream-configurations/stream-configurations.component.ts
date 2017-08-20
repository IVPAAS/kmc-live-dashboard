import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import * as moment from 'moment';
import Duration = moment.Duration;

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
  public _dynamicConfiguration: LiveEntryDynamicStreamInfo;
  public _streamHealth: 'Good' | 'Fair' | 'Poor';

  constructor(private _liveEntryService: LiveEntryService) {
    // Static configuration
    this._staticConfiguration = {
      dvr: false,
      recording: false,
      transcoding: false
    };
    // Dynamic configuration
    this._dynamicConfiguration = {
      redundancy: false,
      streamStatus: 'Offline'
    };

  }

  ngOnInit() {
    this._liveEntryService.entryStaticConfiguration$.subscribe(response => {
      if (response) {
        this._staticConfiguration = response;
        this._startCalculatingStreamDurationTime();
      }
    });
    this._liveEntryService.entryDynamicConfiguration$.subscribe(response => {
      if (response) {
        this._dynamicConfiguration = response;
      }
    });
    this._liveEntryService.entryDiagnostics$.subscribe(response => {
      if (response) {
        this._streamHealth = response.streamHealth.health;
      }
    })
  }

  private _startCalculatingStreamDurationTime() {
    this._streamDurationSubscription = Observable.timer(0, 1000)
      .subscribe(() => {
        if (this._dynamicConfiguration.streamStatus !== 'Offline'){
          if (this._dynamicConfiguration.streamCreationTime){
            this._streamDuration = moment.duration(moment().diff(moment(this._dynamicConfiguration.streamCreationTime)));
          }
          else{
            this._streamDuration = moment.duration(0);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this._streamDurationSubscription.unsubscribe();
  }
}
